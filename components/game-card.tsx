"use client"
import { useState, useEffect } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gamepad2, Play, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-context"

interface Game {
    id: string
    name: string
    gameId: string
    playerCount: number
    imageUrl?: string | null
}




export function GameCard({ game }: { game: Game }) {
    const { streamerMode } = useTheme()
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(game.imageUrl || null)

    useEffect(() => {
        // Use our Deno proxy to bypass CORS and save Vercel requests
        // https://fat-crab-33.deno.dev
        const proxyUrl = `https://fat-crab-33.deno.dev/?placeId=${game.gameId}`
        setThumbnailUrl(proxyUrl)
    }, [game.gameId])

    return (
        <Card className="group overflow-hidden border-white/10 bg-black/40 backdrop-blur-md hover:border-cyber/50 hover:shadow-[0_0_30px_rgba(0,112,243,0.15)] transition-all duration-500">
            <div className="aspect-video w-full bg-muted/20 relative overflow-hidden">
                {!streamerMode && thumbnailUrl ? (
                    <img
                        src={thumbnailUrl}
                        alt={game.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                        <Gamepad2 className="h-12 w-12 text-white/20 group-hover:text-cyber group-hover:scale-110 transition-all duration-500" />
                    </div>
                )}

                {/* Live Indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur border border-white/10">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-medium text-white">{game.playerCount.toLocaleString()} Playing</span>
                </div>
            </div>

            <CardHeader className="pb-3">
                <CardTitle className="text-xl text-white group-hover:text-cyber transition-colors duration-300">
                    {streamerMode ? "Game Name Censored" : game.name}
                </CardTitle>
                <CardDescription className="font-mono text-xs opacity-70">
                    ID: {streamerMode ? "HIDDEN" : game.gameId}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
                <Link href={`roblox://placeId=${game.gameId}`} className="block">
                    <Button className="w-full gap-2 group/btn" variant="glow">
                        <Play className="h-4 w-4 fill-current transition-transform group-hover/btn:translate-x-0.5" />
                        Launch Game
                    </Button>
                </Link>

                <Link href={`https://www.roblox.com/games/${game.gameId}`} target="_blank" className="block">
                    <Button className="w-full gap-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5" variant="outline">
                        <ExternalLink className="h-4 w-4" />
                        See on Roblox
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
