# Vercel Edge & Roblox Setup

This system uses your Next.js API (connected to Prisma via Accelerate) as the backend. The whitelist check endpoint runs on the Vercel Edge Runtime for low latency globally.

## 1. Environment Configuration

Ensure your Vercel project has the following Environment Variables set:
```env
API_SECRET=your_super_secure_secret_password
DATABASE_URL="prisma://accelerate.prisma-data.net/..." # Must be an Accelerate connection string for Edge
```
*Redeploy your application after setting these variables.*

## 2. API Endpoint

Everything is hosted directly on your Vercel domain. No separate Worker is needed.

- **Check Whitelist**: `https://your-domain.vercel.app/api/whitelist/check?username=PlayerName`
- **Redeem Key**: `https://your-domain.vercel.app/api/keys/redeem` (Standard Node.js Runtime)

The `/api/whitelist/check` endpoint receives the request, connects to your database via Prisma Accelerate from the edge, and returns the result immediately.

## 3. Roblox Lua Script

In your Serverside Script, simply point directly to your Vercel domain.

```lua
local HttpService = game:GetService("HttpService")
-- Replace with your actual Vercel domain
local API_URL = "https://your-project.vercel.app/api" 
local API_KEY = "your_super_secure_secret_password" -- Must match API_SECRET env var

local function checkWhitelist(player)
    local headers = {
        ["x-api-key"] = API_KEY
    }
    
    local success, response = pcall(function()
        return HttpService:RequestAsync({
            Url = API_URL .. "/whitelist/check?username=" .. player.Name,
            Method = "GET",
            Headers = headers
        })
    end)

    if success then
        if response.StatusCode == 200 then
            local data = HttpService:JSONDecode(response.Body)
            if data.whitelisted then
                print(player.Name .. " is whitelisted! Plan: " .. data.plan)
                return true, data.plan
            else
                print(player.Name .. " is NOT whitelisted.")
                return false
            end
        else
            warn("API Error: " .. tostring(response.StatusCode) .. " " .. response.Body)
            return false
        end
    else
        warn("Failed to connect to API: " .. tostring(response))
        return false
    end
end

-- Example Usage
game.Players.PlayerAdded:Connect(function(player)
    checkWhitelist(player)
end)
```

## 4. Testing locally
You can still run `node test_whitelist_flow.js` locally.
