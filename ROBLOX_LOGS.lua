--[[
    CRYLLIX GAME LOGS
    
    Captures console output and sends to Cryllix Dashboard.
    Place in ServerScriptService.
    
    Sends: gameId, playerCount, jobId, logs
]]

-- ============================================================================
-- SERVICES
-- ============================================================================

local HttpService = game:GetService("HttpService")
local LogService = game:GetService("LogService")
local Players = game:GetService("Players")

-- ============================================================================
-- CONFIGURATION
-- ============================================================================

local CONFIG = {
    DASHBOARD_URL = "https://cryllixv2.vercel.app",
    SEND_INTERVAL = 5,      -- Seconds between sending batches
    MAX_BATCH_SIZE = 50,    -- Max logs per request
    RETRY_DELAY = 2,        -- Seconds to wait before retry on failure
    MAX_RETRIES = 3,        -- Max retry attempts
}

local API_ENDPOINT = CONFIG.DASHBOARD_URL .. "/api/webhooks/logs"

-- ============================================================================
-- STATE
-- ============================================================================

local logQueue = {}

-- ============================================================================
-- UTILITIES
-- ============================================================================

local function getLogType(messageType)
    if messageType == Enum.MessageType.MessageWarning then
        return "Warn"
    elseif messageType == Enum.MessageType.MessageError then
        return "Error"
    end
    return "Info"
end

local function buildPayload(logs)
    return {
        gameId = tostring(game.PlaceId),
        playerCount = #Players:GetPlayers(),
        jobId = game.JobId,
        logs = logs
    }
end

-- ============================================================================
-- CORE FUNCTIONS
-- ============================================================================

local function sendBatch(batch, retryCount)
    retryCount = retryCount or 0
    
    local payload = buildPayload(batch)
    
    local success, result = pcall(function()
        local json = HttpService:JSONEncode(payload)
        return HttpService:PostAsync(
            API_ENDPOINT,
            json,
            Enum.HttpContentType.ApplicationJson,
            false
        )
    end)
    
    if success then
        print("[Cryllix] Sent " .. #batch .. " logs successfully")
        return true
    else
        warn("[Cryllix] Failed to send logs: " .. tostring(result))
        
        -- Retry logic
        if retryCount < CONFIG.MAX_RETRIES then
            wait(CONFIG.RETRY_DELAY)
            return sendBatch(batch, retryCount + 1)
        end
        
        return false
    end
end

local function processQueue()
    if #logQueue == 0 then return end
    
    -- Extract batch from queue
    local batch = {}
    while #logQueue > 0 and #batch < CONFIG.MAX_BATCH_SIZE do
        table.insert(batch, table.remove(logQueue, 1))
    end
    
    sendBatch(batch)
end

local function onLogMessage(message, messageType)
    table.insert(logQueue, {
        content = message,
        type = getLogType(messageType),
        timestamp = os.time()
    })
end

-- ============================================================================
-- INITIALIZATION
-- ============================================================================

-- Connect to log service
LogService.MessageOut:Connect(onLogMessage)

-- Periodic sender
spawn(function()
    while true do
        wait(CONFIG.SEND_INTERVAL)
        processQueue()
    end
end)

-- Send remaining on server close
game:BindToClose(function()
    processQueue()
end)

print("[Cryllix] Game Logs initialized for PlaceId: " .. tostring(game.PlaceId))
