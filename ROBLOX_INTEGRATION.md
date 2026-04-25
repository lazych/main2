# Roblox Integration Guide

This guide explains how to integrate your Cryllix Dashboard with your Roblox game.

## API Endpoint

**URL**: `https://your-domain.com/api/roblox/check-user`
**Method**: `GET`
**Query Parameter**: `username` (The player's Roblox username)

### Response Format

```json
{
  "success": true,
  "exists": true,
  "username": "RobloxPlayer123",
  "isBanned": false,
  "isModerator": false,
  "tier": "premium"
}
```

If the user does not exist:
```json
{
  "success": true,
  "exists": false,
  "username": "UnknownPlayer"
}
```

---

## Roblox Lua Script

Create a `ModuleScript` in `ServerScriptService` (or wherever you keep your server logic) and paste this code:

```lua
local HttpService = game:GetService("HttpService")

local Cryllix = {}

-- CONFIGURATION
-- Replace with your actual deployed domain (e.g., https://cryllix-dashboard.vercel.app)
-- DO NOT include a trailing slash
local API_URL = "http://localhost:3000" 
local API_KEY = "" -- If you add API key authentication later

function Cryllix.CheckUser(player)
	local username = player.Name
	local url = string.format("%s/api/roblox/check-user?username=%s", API_URL, username)
	
	local success, response = pcall(function()
		return HttpService:GetAsync(url)
	end)
	
	if success then
		local data = HttpService:JSONDecode(response)
		if data.success and data.exists then
			return {
				exists = true,
				isBanned = data.isBanned,
				isModerator = data.isModerator,
				tier = data.tier
			}
		else
			return { exists = false }
		end
	else
		warn("Cryllix API Error: " .. tostring(response))
		return nil
	end
end

return Cryllix
```

### Example Usage (Server Script)

```lua
local Cryllix = require(game.ServerScriptService.Cryllix)

game.Players.PlayerAdded:Connect(function(player)
	print("Checking user: " .. player.Name)
	
	local userData = Cryllix.CheckUser(player)
	
	if userData then
		if userData.exists then
			print("User found!")
			print("Tier: " .. userData.tier)
			
			if userData.isBanned then
				player:Kick("You are banned from this service.")
			elseif userData.isModerator then
				print("Welcome, Moderator!")
				-- Give moderator tools
			else
				print("Welcome back!")
			end
		else
			print("User does not have a dashboard account.")
			-- Prompt them to register?
		end
	else
		warn("Failed to check user status.")
	end
end)
```

## Important Notes

1. **Enable HTTP Requests**: In Roblox Studio, go to **Game Settings > Security** and enable **Allow HTTP Requests**.
2. **Localhost**: `localhost` will not work from Roblox Studio if you are running the server on your computer. You need to use a tunneling service like **ngrok** or deploy your dashboard to Vercel/Netlify.
   - If using ngrok: `ngrok http 3000` -> use the https URL provided.

## Example: "Cryllix Loaded" UI Notification

This script will automatically check every player who joins. If they have a Cryllix account, it will display a cool "Cryllix Loaded" notification on their screen.

**Instructions:**
1. Create a **Script** in `ServerScriptService`.
2. Paste the code below.
3. Ensure you have the `Cryllix` ModuleScript set up as described above.

```lua
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

-- Require the Cryllix Module (assuming it's in ServerScriptService)
local Cryllix = require(game.ServerScriptService.Cryllix)

-- Function to create the UI
local function createNotification(player)
	-- 1. Create ScreenGui
	local screenGui = Instance.new("ScreenGui")
	screenGui.Name = "CryllixNotification"
	screenGui.ResetOnSpawn = false
	screenGui.Parent = player:WaitForChild("PlayerGui")

	-- 2. Create Main Frame (Glass look)
	local frame = Instance.new("Frame")
	frame.Name = "NotificationFrame"
	frame.Size = UDim2.new(0, 200, 0, 50)
	frame.Position = UDim2.new(0.5, -100, 0, -100) -- Start off-screen (top)
	frame.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
	frame.BackgroundTransparency = 0.3
	frame.BorderSizePixel = 0
	frame.Parent = screenGui

	-- Add rounded corners
	local uiCorner = Instance.new("UICorner")
	uiCorner.CornerRadius = UDim.new(0, 8)
	uiCorner.Parent = frame
	
	-- Add stroke (border)
	local uiStroke = Instance.new("UIStroke")
	uiStroke.Color = Color3.fromRGB(0, 112, 243) -- Electric Blue
	uiStroke.Thickness = 1.5
	uiStroke.Transparency = 0.5
	uiStroke.Parent = frame

	-- 3. Create Text Label
	local textLabel = Instance.new("TextLabel")
	textLabel.Size = UDim2.new(1, 0, 1, 0)
	textLabel.BackgroundTransparency = 1
	textLabel.Text = "Cryllix Loaded"
	textLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
	textLabel.Font = Enum.Font.GothamBold
	textLabel.TextSize = 16
	textLabel.Parent = frame
	
	-- 4. Add Glow Image (Optional, using a simple shadow here)
	local shadow = Instance.new("ImageLabel")
	shadow.AnchorPoint = Vector2.new(0.5, 0.5)
	shadow.Position = UDim2.new(0.5, 0, 0.5, 0)
	shadow.Size = UDim2.new(1, 40, 1, 40)
	shadow.BackgroundTransparency = 1
	shadow.Image = "rbxassetid://6015897843" -- Generic shadow/glow
	shadow.ImageColor3 = Color3.fromRGB(0, 112, 243)
	shadow.ImageTransparency = 0.6
	shadow.ZIndex = 0
	shadow.Parent = frame

	-- Animation: Slide Down
	local targetPosition = UDim2.new(0.5, -100, 0, 20) -- Top center, slightly down
	local tweenInfo = TweenInfo.new(0.8, Enum.EasingStyle.Quint, Enum.EasingDirection.Out)
	local tween = TweenService:Create(frame, tweenInfo, {Position = targetPosition})
	tween:Play()

	-- Remove after 5 seconds
	task.delay(5, function()
		local exitTween = TweenService:Create(frame, tweenInfo, {Position = UDim2.new(0.5, -100, 0, -100)})
		exitTween:Play()
		exitTween.Completed:Wait()
		screenGui:Destroy()
	end)
end

-- Main Logic
Players.PlayerAdded:Connect(function(player)
	print("Checking user: " .. player.Name)
	
	-- Run asynchronously so we don't block other code
	task.spawn(function()
		local userData = Cryllix.CheckUser(player)
		
		if userData and userData.exists then
			print("User verified! Showing notification.")
			createNotification(player)
		end
	end)
end)
```
