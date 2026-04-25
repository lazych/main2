"use client"

import { GameEntry } from "@/lib/redis"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { toggleGameHidden } from "@/app/actions/moderator"
import { useToast } from "@/components/ui/use-toast"

interface GameManagementProps {
    games: GameEntry[];
    hiddenGameIds: string[];
}

export function GameManagement({ games, hiddenGameIds: initialHiddenIds }: GameManagementProps) {
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set(initialHiddenIds));
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const { toast } = useToast();

    const handleToggle = async (gameId: string) => {
        setIsLoading(gameId);
        try {
            await toggleGameHidden(gameId);
            setHiddenIds(prev => {
                const next = new Set(prev);
                if (next.has(gameId)) {
                    next.delete(gameId);
                } else {
                    next.add(gameId);
                }
                return next;
            });

            toast({
                title: "Success",
                description: "Game visibility updated",
            });

        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update game visibility",
                variant: "destructive"
            });
        } finally {
            setIsLoading(null);
        }
    };

    if (games.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 border border-dashed border-white/10 rounded-xl bg-white/5">
                <Gamepad2 className="h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No active games found.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => {
                const isHidden = hiddenIds.has(game.gameId);
                return (
                    <Card key={game.id} className={`group overflow-hidden border-white/10 bg-black/40 backdrop-blur-md transition-all duration-300 ${isHidden ? 'opacity-70 grayscale' : ''}`}>
                        <div className="aspect-video w-full bg-muted/20 relative overflow-hidden">
                            {game.imageUrl ? (
                                <img
                                    src={game.imageUrl}
                                    alt={game.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                                    <Gamepad2 className="h-12 w-12 text-white/20" />
                                </div>
                            )}

                            {/* Status Overlay */}
                            {isHidden && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-semibold backdrop-blur-sm">
                                        <EyeOff className="h-4 w-4" />
                                        Hidden from Users
                                    </div>
                                </div>
                            )}

                            {/* Live Indicator (only if not hidden, or maybe always show raw stats?) */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10">
                                <span className="text-xs font-medium text-white">{game.playerCount.toLocaleString()} Players</span>
                            </div>
                        </div>

                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-white truncate">{game.name}</CardTitle>
                            <CardDescription className="font-mono text-xs opacity-70 truncate">ID: {game.gameId}</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <Button
                                variant={isHidden ? "outline" : "secondary"}
                                className={`w-full gap-2 ${isHidden ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300'}`}
                                onClick={() => handleToggle(game.gameId)}
                                disabled={isLoading === game.gameId}
                            >
                                {isLoading === game.gameId ? (
                                    <span className="animate-spin mr-2">⏳</span>
                                ) : isHidden ? (
                                    <Eye className="h-4 w-4" />
                                ) : (
                                    <EyeOff className="h-4 w-4" />
                                )}
                                {isHidden ? "Unhide Game" : "Hide from Users"}
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    )
}
