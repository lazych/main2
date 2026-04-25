'use server'

import { getGameLogs as getRedisGameLogs, getAllGames, GameLogEntry } from "@/lib/redis"

export async function getGameLogs(gameId?: string) {
    try {
        // Fetch logs from Redis
        const logs = await getRedisGameLogs(gameId, 100);

        // Transform to match the expected format
        const formattedLogs = logs.map(log => ({
            id: log.id,
            content: log.content,
            type: log.type,
            timestamp: new Date(log.timestamp),
            gameId: log.gameId,
            game: {
                name: log.gameName
            }
        }));

        return { success: true, logs: formattedLogs };
    } catch (error) {
        console.error("Failed to fetch logs:", error);
        return { success: false, error: "Failed to fetch logs" };
    }
}

export async function getActiveGames() {
    try {
        const games = await getAllGames();

        // Transform to match expected format
        const formattedGames = games.map(game => ({
            id: game.id,
            name: game.name,
            gameId: game.gameId,
            description: game.description,
            imageUrl: game.imageUrl,
            playerCount: game.playerCount,
            lastPing: new Date(game.lastPing),
            createdAt: new Date(game.createdAt),
        }));

        return { success: true, games: formattedGames };
    } catch (error) {
        console.error("Failed to fetch games:", error);
        return { success: false, error: "Failed to fetch games" };
    }
}
