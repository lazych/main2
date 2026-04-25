local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local MarketplaceService = game:GetService("MarketplaceService")

--[[
    CRYLLIX DASHBOARD INTEGRATION
    Place this script in ServerScriptService.
    
    Make sure "Allow HTTP Requests" is enabled in Game Settings > Security.
]]

-- CONFIGURATION
local DASHBOARD_URL = "https://cryllixv2.vercel.app" -- Replace with your actual Vercel URL if different
local API_KEY = "OPTIONAL_SECRET_KEY_IF_ADDED" -- Not currently used but good practice for future
local HEARTBEAT_INTERVAL = 60 -- Seconds between updates

local API_ENDPOINT = DASHBOARD_URL .. "/api/webhooks/games"

local function sendHeartbeat()
    local success, result = pcall(function()
        -- Get the actual game info from MarketplaceService
        local marketplaceService = game:GetService("MarketplaceService")
        local productInfo = marketplaceService:GetProductInfo(game.PlaceId)
        
        local payload = {
            gameId = tostring(game.PlaceId),
            name = productInfo.Name,
            playerCount = #Players:GetPlayers(),
            jobId = game.JobId,
            description = productInfo.Description or "No description",
            imageUrl = nil 
        }

        local jsonData = HttpService:JSONEncode(payload)

        local response = HttpService:PostAsync(
            API_ENDPOINT,
            jsonData,
            Enum.HttpContentType.ApplicationJson,
            false
        )
        return response
    end)

    if success then
        print("[Cryllix] Heartbeat sent successfully.")
    else
        warn("[Cryllix] Failed to send heartbeat: " .. tostring(result))
    end
end

-- Initial heartbeat
spawn(sendHeartbeat)

-- Event Listeners for immediate updates
Players.PlayerAdded:Connect(function()
    sendHeartbeat()
end)

Players.PlayerRemoving:Connect(function()
    sendHeartbeat()
end)

game:BindToClose(function()
    -- Send final heartbeat, potentially with 0 players if server is shutting down empty
    -- But typically BindToClose happens when the server shuts down.
    -- We'll just send the current state.
    sendHeartbeat()
end)

-- Periodic Loop
while true do
    wait(HEARTBEAT_INTERVAL)
    sendHeartbeat()
end
