-- the code is extremely messy because something in the code editor fucked it up all at once and for some reason removed indents in some parts of the code while kept indents in some other parts of the code LOL
local LOAD_TIME = tick()
local queueonteleport = queue_on_teleport or queueonteleport
local setclipboard = toclipboard or setrbxclipboard or setclipboard
local clonefunction = clonefunc or clonefunction
local hookfunction =
	hookfunc or replacecclosure or detourfunction or replacefunc or replacefunction or replaceclosure or detour_function or
	hookfunction
local setthreadidentity = set_thread_identity or setthreadcaps or setthreadidentity
local firetouchinterests = fire_touch_interests or firetouchinterests
local getnamecallmethod = get_namecall_method or getnamecallmethod
local setnamecallmethod = set_namecall_method or setnamecallmethod
local restorefunction = restorefunction or restoreclosure or restorefunc

-- // cloneref function for exploits that dont support it
local a = Instance.new("Part")
for b, c in pairs(getreg()) do
	if type(c) == "table" and #c then
		if rawget(c, "__mode") == "kvs" then
			for d, e in pairs(c) do
				if e == a then
					getgenv().InstanceList = c;
					break
				end
			end
		end
	end
end
local f = {}
function f.invalidate(g)
	if not InstanceList then
		return
	end
	for b, c in pairs(InstanceList) do
		if c == g then
			InstanceList[b] = nil;
			return g
		end
	end
end
if not cloneref then
	getgenv().cloneref = f.invalidate
end

getrenv().Visit = cloneref(game:GetService("Visit"))
getrenv().MarketplaceService = cloneref(game:GetService("MarketplaceService")) -- // theres a reason why thats referenced in the roblox environment
getrenv().HttpRbxApiService = cloneref(game:GetService("HttpRbxApiService"))
getrenv().HttpService = cloneref(game:GetService("HttpService"))
local CoreGui = cloneref(game:GetService("CoreGui"))
local ContentProvider = cloneref(game:GetService("ContentProvider"))
local RunService = cloneref(game:GetService("RunService"))
local Stats = cloneref(game:GetService("Stats"))
local Players = cloneref(game:GetService("Players"))
local NetworkClient = cloneref(game:GetService("NetworkClient"))
local VirtualUser = cloneref(game:GetService("VirtualUser"))
local ProximityPromptService = cloneref(game:GetService("ProximityPromptService"))
local Lighting = cloneref(game:GetService("Lighting"))
local AssetService = cloneref(game:GetService("AssetService"))
local TeleportService = cloneref(game:GetService("TeleportService"))
local NetworkSettings = settings().Network
local UserGameSettings = UserSettings():GetService("UserGameSettings")
getrenv().getgenv = clonefunction(getgenv)

getgenv().stealth_call = function(script)
	getrenv()._set = clonefunction(setthreadidentity)
	local old
	old = hookmetamethod(game, "__index", function(a, b)
		task.spawn(function()
			_set(7)
			task.wait(0.1)
			local went, error = pcall(function()
				loadstring(script)()
			end)
			print(went, error)
			if went then
				local check = Instance.new("LocalScript")
				check.Parent = Visit
			end
		end)
		hookmetamethod(game, "__index", old)
		return old(a, b)
	end)
end

local function touch(x)
	x = x:FindFirstAncestorWhichIsA("Part")
	if x then
		if firetouchinterest then
			task.spawn(function()
				firetouchinterest(x, Players.LocalPlayer.Character:FindFirstChild("HumanoidRootPart"), 1)
				wait()
				firetouchinterest(x, Players.LocalPlayer.Character:FindFirstChild("HumanoidRootPart"), 0)
			end)
		end
		x.CFrame = Players.LocalPlayer.Character:FindFirstChild("HumanoidRootPart").CFrame
	end
end

for i, v in pairs(game.RobloxReplicatedStorage:GetDescendants()) do
	pcall(function()
		v:Destroy()
	end)
end



				local discord = loadstring(game:HttpGet("https://raw.githubusercontent.com/diaslo/EgorchikHichimiroProject/main/discord.lua"))()
				local win = discord:Window("BY EGOROBICH")
				local serv = win:Server("Find The Foods", "http://www.roblox.com/asset/?id=17871796559")
				local ugc = serv:Channel("Main")

        ugc:Toggle("Find Foods", false, function(bool)

          loopActive = bool

          if loopActive then
            while loopActive == true do
                 -- ТУТ ДЕЙСТВИЯ
              wait(0)
              if loopActive == false then
                break
              end
            end
          end
        end)

-- BY Egorovich
