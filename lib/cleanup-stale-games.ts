import { cleanupStaleGames as redisCleanupStaleGames, getStaleGamesCount as redisGetStaleGamesCount } from '@/lib/redis';

/**
 * Clean up stale games that haven't sent a heartbeat in the specified time
 * @param minutesThreshold - Number of minutes of inactivity before considering a game stale (default: 5)
 * @returns Number of games deleted
 */
export async function cleanupStaleGames(minutesThreshold: number = 5): Promise<number> {
    return redisCleanupStaleGames(minutesThreshold);
}

/**
 * Get count of stale games without deleting them
 * @param minutesThreshold - Number of minutes of inactivity before considering a game stale (default: 5)
 * @returns Number of stale games
 */
export async function getStaleGamesCount(minutesThreshold: number = 5): Promise<number> {
    return redisGetStaleGamesCount(minutesThreshold);
}
