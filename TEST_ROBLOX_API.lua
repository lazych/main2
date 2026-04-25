local HttpService = game:GetService("HttpService")

-- CONFIGURATION
local API_URL = "https://your-vercel-project.vercel.app/api/webhooks/games" -- REPLACE WITH YOUR VERCEL URL
-- OR use "http://localhost:3000/api/games/heartbeat" if testing locally (requires HttpService to allow localhost)

local function testHeartbeat()
	print("Testing Game Heartbeat Endpoint...")
	
	-- Get the actual game info from MarketplaceService
	local marketplaceService = game:GetService("MarketplaceService")
	local productInfo = marketplaceService:GetProductInfo(game.PlaceId)

	local payload = {
		gameId = tostring(game.PlaceId), -- Uses the actual place ID
		name = productInfo.Name, -- Use the actual game name from MarketplaceService
		playerCount = #game.Players:GetPlayers(),
		description = productInfo.Description or "Test description from Roblox Studio",
		imageUrl = "https://tr.rbxcdn.com/test-image-url" -- Optional
	}

	local success, response = pcall(function()
		return HttpService:PostAsync(
			API_URL,
			HttpService:JSONEncode(payload),
			Enum.HttpContentType.ApplicationJson,
			false -- compress
		)
	end)

	if success then
		print("✅ Success! Response:")
		print(response)
	else
		warn("❌ Failed to send heartbeat:")
		warn(response)
	end
end

-- Run the test
testHeartbeat()
