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
				
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(82.17300415039062, 2.97890567779541, -150.95266723632812))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(5.58357048034668, 22.362707138061523, 32.056819915771484))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(303.5705871582031, 6.904573917388916,-63.028709411621094))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(154.99603271484375, 2.9788765907287598, 98.88473510742188))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(-72.9425277709961, 3.3192129135131836, 21.646303176879883))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(136.5418701171875, 4.439518928527832, 0.526432991027832))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(-3.8388731479644775, 2.978902816772461, -166.21710205078125))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(318.44012451171875, 27.9870662689209, 78.0367431640625))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(324.0698547363281, 3.6834402084350586, 14.733240127563477))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(259.9947814941406, 2.978902816772461, -109.34613800048828))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(428.1787109375, 2.978902816772461, 34.46916961669922))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(-37.09513473510742, 52.334068298339844, 387.3539123535156))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(386.146484375, 113.63788604736328, 291.2287292480469))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(677.497802734375, 7.555759429931641, 115.36023712158203))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(74.7658462524414, 73.38834381103516, 501.0633544921875))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(734.6984252929688, 2.978895664215088, 111.54851531982422))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(292.48834228515625, -63.829795837402344, 84.16974639892578))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(227.0535125732422, 54.546531677246094, -343.92132568359375))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(472.2378234863281, 56.85895538330078, -358.9659423828125))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(677.2584838867188, 2.9788951873779297, 182.5718231201172))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(402.7220153808594, 2.860520362854004, 298.70159912109375))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(403.23126220703125, 101.84061431884766, -585.5245971679688))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(-45.44879150390625, 3.9789047241210938, -28.691551208496094))
wait(5)
game.Players.LocalPlayer.Character:PivotTo(CFrame.new(-20.366374969482422, 2.978902816772461, 93.93418884277344))


              wait(0)
              if loopActive == false then
                break
              end
            end
          end
        end)

-- BY Egorovich
