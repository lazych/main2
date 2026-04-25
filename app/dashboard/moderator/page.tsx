import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Hammer, Shield, ShieldAlert, Users, Database, Ghost, Activity, Server, EyeOff, Key, UserPlus, CheckCircle2, XCircle, HardDrive, Gamepad2, TriangleAlert } from "lucide-react"
import { BanButton, UnbanButton, ShadowbanButton, FakeMaintenanceButton } from "./ban-buttons"
import { MaintenanceTab } from "./maintenance-tab"
import { KeyGenerator } from "./key-generator"
import { LicenseKeyList } from "./license-key-list"
import { GameManagement } from "./game-management"
import { BadgeManager } from "@/components/admin/badge-manager"
import { PasswordReset } from "@/components/admin/password-reset"
import { getActiveGames, getHiddenGameIds, getAllGames, getRedisStatus } from "@/lib/redis"

export default async function ModeratorPage() {
    const session = await getSession()

    // Check if user is a moderator
    const currentUser = await prisma.user.findUnique({
        where: { id: session?.userId },
        select: { isModerator: true }
    })

    if (!currentUser?.isModerator) {
        redirect('/dashboard')
    }

    // --- Data Fetching ---

    // 1. Prisma Data
    const users = await prisma.user.findMany({
        include: { licenseKey: true, badges: true },
        orderBy: { createdAt: 'desc' }
    })

    const licenseKeys = await prisma.licenseKey.findMany({
        include: { user: { select: { username: true } } },
        orderBy: { createdAt: 'desc' }
    })

    // 2. Redis Data
    const games = await getActiveGames(10); // Active in last 10 mins
    const allGames = await getAllGames();
    const hiddenGameIds = await getHiddenGameIds();

    // --- Health Checks ---
    let isPostgresUp = false;
    try {
        await prisma.$queryRaw`SELECT 1`;
        isPostgresUp = true;
    } catch {
        isPostgresUp = false;
    }

    const isRedisUp = await getRedisStatus();

    // --- User Stats Calculation ---
    const userStats = {
        total: users.length,
        banned: users.filter((u: any) => u.isBanned).length,
        moderators: users.filter((u: any) => u.isModerator).length,
        newUsers24h: users.filter((u: any) => new Date(u.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000).length,
        totalKeys: licenseKeys.length,
        redeemedKeys: licenseKeys.filter((k: any) => k.isUsed).length,
    }

    // --- Game Stats Calculation ---
    const gameStats = {
        totalTracked: allGames.length,
        activeNow: games.filter(g => (Date.now() - g.lastPing) < 2 * 60 * 1000).length, // < 2 mins active
        stale: allGames.length - games.length,
        totalPlayers: games.reduce((acc, g) => acc + g.playerCount, 0),
        hiddenCount: hiddenGameIds.size
    }

    // Serialize keys for client component
    const serializedKeys = licenseKeys.map((key: any) => ({
        ...key,
        createdAt: key.createdAt.toISOString(),
        expiresAt: key.expiresAt?.toISOString() ?? null,
        lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
    }))

    return (
        <div className="space-y-12">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
                        <Hammer className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Moderator Panel</h2>
                        <p className="text-lg text-muted-foreground">Manage users and enforce community guidelines</p>
                    </div>
                </div>
            </div>

            {/* Quick Overview Stats */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-base font-semibold">Total Users</CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-400">{userStats.total}</div>
                        <p className="text-sm text-muted-foreground">Registered accounts</p>
                    </CardContent>
                </Card>

                <Card className="group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-base font-semibold">Banned Users</CardTitle>
                        <ShieldAlert className="h-5 w-5 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-400">{userStats.banned}</div>
                        <p className="text-sm text-muted-foreground">Currently suspended</p>
                    </CardContent>
                </Card>

                <Card className="group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-base font-semibold">Moderators</CardTitle>
                        <Shield className="h-5 w-5 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-400">{userStats.moderators}</div>
                        <p className="text-sm text-muted-foreground">Staff members</p>
                    </CardContent>
                </Card>
            </div>

            {/* License Key Generator and Lists with Tabs */}
            <Tabs defaultValue="keys" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-8">
                    <TabsTrigger value="keys" className="gap-2"><Key className="h-4 w-4" /> Keys</TabsTrigger>
                    <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Users</TabsTrigger>
                    <TabsTrigger value="games" className="gap-2"><Gamepad2 className="h-4 w-4" /> Games</TabsTrigger>
                    <TabsTrigger value="stats" className="gap-2"><Activity className="h-4 w-4" /> Stats</TabsTrigger>
                    <TabsTrigger value="maintenance" className="gap-2"><TriangleAlert className="h-4 w-4" /> Management</TabsTrigger>
                </TabsList>

                <TabsContent value="keys" className="space-y-8">
                    <KeyGenerator />
                    <LicenseKeyList keys={serializedKeys} />
                </TabsContent>

                <TabsContent value="users">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold">All Users</h3>
                        </div>
                        <div className="grid gap-4">
                            {users.map((user: any) => (
                                <Card key={user.id} className={`group ${user.isBanned ? 'border-red-500/30' : ''}`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${user.isBanned
                                                    ? 'bg-red-500/20 text-red-400 border-2 border-red-500/30'
                                                    : user.isModerator
                                                        ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/30'
                                                        : 'bg-primary/20 text-primary border-2 border-primary/30'
                                                    }`}>
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-semibold text-lg">{user.username}</h4>
                                                        {user.isModerator && (
                                                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">
                                                                Moderator
                                                            </span>
                                                        )}
                                                        {user.isBanned && (
                                                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30">
                                                                Banned
                                                            </span>
                                                        )}
                                                        {user.isShadowBanned && (
                                                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-semibold border border-purple-500/30">
                                                                Shadowbanned
                                                            </span>
                                                        )}
                                                        {user.isFakeMaintenance && (
                                                            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold border border-orange-500/30">
                                                                Maintained
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        Roblox: <span className="font-medium text-foreground">{user.robloxUsername || 'Not Linked'}</span>
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        Discord: <span className="font-medium text-[#5865F2]">{user.discordUsername || 'Not Linked'}</span>
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        License: <span className="font-mono text-xs">{user.licenseKey?.key || 'None'}</span>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground/60">
                                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {!user.isModerator && (
                                                <div className="flex items-center gap-2">
                                                    <BadgeManager
                                                        userId={user.id}
                                                        username={user.username}
                                                        currentBadges={user.badges}
                                                    />
                                                    <PasswordReset
                                                        userId={user.id}
                                                        username={user.username}
                                                    />
                                                    <FakeMaintenanceButton userId={user.id} username={user.username} isFakeMaintenance={!!user.isFakeMaintenance} />
                                                    <ShadowbanButton userId={user.id} username={user.username} isShadowBanned={!!user.isShadowBanned} />
                                                    {user.isBanned ? (
                                                        <UnbanButton userId={user.id} username={user.username} />
                                                    ) : (
                                                        <BanButton userId={user.id} username={user.username} />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="games">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold">Active Games Management</h3>
                            <p className="text-sm text-muted-foreground">Hide games from the public dashboard without stopping them.</p>
                        </div>
                        <GameManagement games={games} hiddenGameIds={Array.from(hiddenGameIds)} />
                    </div>
                </TabsContent>

                <TabsContent value="stats">
                    <div className="space-y-12">

                        {/* Section 1: Prisma DB Stats */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div>
                                    <h3 className="text-2xl font-bold flex items-center gap-3">
                                        <Database className="h-6 w-6 text-blue-400" />
                                        User Database
                                    </h3>
                                    <p className="text-sm text-muted-foreground">PostgreSQL • System of Record</p>
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isPostgresUp ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                    {isPostgresUp ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    <span className="font-semibold text-sm">{isPostgresUp ? 'Healthy' : 'Unreachable'}</span>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <Card className="bg-slate-900/50 border-blue-500/10">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                                        <Users className="h-4 w-4 text-blue-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">{userStats.total}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/50 border-blue-500/10">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">New (24h)</CardTitle>
                                        <UserPlus className="h-4 w-4 text-green-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">+{userStats.newUsers24h}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Growth today</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/50 border-blue-500/10">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Keys Redeemed</CardTitle>
                                        <Key className="h-4 w-4 text-amber-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">{userStats.redeemedKeys} <span className="text-muted-foreground text-sm font-normal">/ {userStats.totalKeys}</span></div>
                                        <p className="text-xs text-muted-foreground mt-1">Total activation rate</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/50 border-blue-500/10">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Banned</CardTitle>
                                        <ShieldAlert className="h-4 w-4 text-red-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">{userStats.banned}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Accounts suspended</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Section 2: Game DB Stats */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div>
                                    <h3 className="text-2xl font-bold flex items-center gap-3">
                                        <HardDrive className="h-6 w-6 text-indigo-400" />
                                        Game Database
                                    </h3>
                                    <p className="text-sm text-muted-foreground">Valkey / Redis • Real-time State</p>
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isRedisUp ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                    {isRedisUp ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    <span className="font-semibold text-sm">{isRedisUp ? 'Healthy' : 'Unreachable'}</span>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <Card className="bg-slate-900/50 border-indigo-500/10">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Games</CardTitle>
                                        <Server className="h-4 w-4 text-indigo-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">{gameStats.totalTracked}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Unique Game IDs</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/50 border-indigo-500/10">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
                                        <Activity className="h-4 w-4 text-green-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">{gameStats.activeNow}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Pinged &lt; 2m ago</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/50 border-indigo-500/10">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Players</CardTitle>
                                        <Users className="h-4 w-4 text-blue-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">{gameStats.totalPlayers}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Across active games</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/50 border-indigo-500/10">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Hidden</CardTitle>
                                        <EyeOff className="h-4 w-4 text-purple-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">{gameStats.hiddenCount}</div>
                                        <p className="text-xs text-muted-foreground mt-1">Hidden from dash</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="maintenance">
                    <MaintenanceTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
