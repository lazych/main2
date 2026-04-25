import Redis from 'ioredis';

// Redis connection singleton
const globalForRedis = globalThis as unknown as { redis: Redis };

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.warn('[Redis] REDIS_URL not set, using default connection');
}

// Create Redis connection with TLS support for Upstash
function createRedisClient(): Redis {
    if (!redisUrl) {
        return new Redis('redis://localhost:6379');
    }

    // Upstash uses rediss:// for TLS connections
    // Convert redis:// to rediss:// if needed for Upstash
    const url = redisUrl.includes('upstash.io') && redisUrl.startsWith('redis://')
        ? redisUrl.replace('redis://', 'rediss://')
        : redisUrl;

    return new Redis(url, {
        tls: url.startsWith('rediss://') ? {} : undefined,
        maxRetriesPerRequest: 3,
    });
}

export const redis = globalForRedis.redis || createRedisClient();

if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
}

export async function getRedisStatus(): Promise<boolean> {
    try {
        await redis.ping();
        return true;
    } catch {
        return false;
    }
}

// ============================================================================
// Game Logs Storage Functions
// ============================================================================

const LOGS_KEY_PREFIX = 'game:logs:';
const ALL_LOGS_KEY = 'game:logs:all';
const MAX_LOGS_PER_GAME = 500;  // Max logs per game
const MAX_TOTAL_LOGS = 1000;   // Max logs in the "all" list
const LOG_TTL_SECONDS = 300; // 5 minutes TTL for logs

export interface GameLogEntry {
    id: string;
    gameId: string;
    gameName: string;
    content: string;
    type: 'Info' | 'Warn' | 'Error';
    timestamp: number; // Unix timestamp in ms
}

/**
 * Store a game log entry in Redis
 */
export async function storeGameLog(log: Omit<GameLogEntry, 'id'>): Promise<string> {
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const entry: GameLogEntry = { ...log, id };
    const serialized = JSON.stringify(entry);

    const gameLogsKey = `${LOGS_KEY_PREFIX}${log.gameId}`;

    // Use pipeline for atomic operations
    const pipeline = redis.pipeline();

    // Add to game-specific list (newest first)
    pipeline.lpush(gameLogsKey, serialized);
    pipeline.ltrim(gameLogsKey, 0, MAX_LOGS_PER_GAME - 1);
    pipeline.expire(gameLogsKey, LOG_TTL_SECONDS);

    // Add to global list (newest first)
    pipeline.lpush(ALL_LOGS_KEY, serialized);
    pipeline.ltrim(ALL_LOGS_KEY, 0, MAX_TOTAL_LOGS - 1);
    pipeline.expire(ALL_LOGS_KEY, LOG_TTL_SECONDS);

    await pipeline.exec();

    return id;
}

/**
 * Store multiple game logs at once
 */
export async function storeGameLogs(logs: Omit<GameLogEntry, 'id'>[]): Promise<string[]> {
    if (logs.length === 0) return [];

    const ids: string[] = [];
    const pipeline = redis.pipeline();

    // Group logs by gameId
    const logsByGame = new Map<string, string[]>();

    for (const log of logs) {
        const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        ids.push(id);

        const entry: GameLogEntry = { ...log, id };
        const serialized = JSON.stringify(entry);

        // Add to game-specific grouping
        if (!logsByGame.has(log.gameId)) {
            logsByGame.set(log.gameId, []);
        }
        logsByGame.get(log.gameId)!.push(serialized);

        // Add to global list
        pipeline.lpush(ALL_LOGS_KEY, serialized);
    }

    // Trim global list and set TTL
    pipeline.ltrim(ALL_LOGS_KEY, 0, MAX_TOTAL_LOGS - 1);
    pipeline.expire(ALL_LOGS_KEY, LOG_TTL_SECONDS);

    // Add to game-specific lists
    for (const [gameId, serializedLogs] of logsByGame) {
        const gameLogsKey = `${LOGS_KEY_PREFIX}${gameId}`;
        for (const serialized of serializedLogs) {
            pipeline.lpush(gameLogsKey, serialized);
        }
        pipeline.ltrim(gameLogsKey, 0, MAX_LOGS_PER_GAME - 1);
        pipeline.expire(gameLogsKey, LOG_TTL_SECONDS);
    }

    await pipeline.exec();

    return ids;
}

/**
 * Get game logs, optionally filtered by gameId
 */
export async function getGameLogs(gameId?: string, limit: number = 100): Promise<GameLogEntry[]> {
    const key = gameId ? `${LOGS_KEY_PREFIX}${gameId}` : ALL_LOGS_KEY;

    const rawLogs = await redis.lrange(key, 0, limit - 1);

    return rawLogs.map(raw => {
        try {
            return JSON.parse(raw) as GameLogEntry;
        } catch {
            return null;
        }
    }).filter((log): log is GameLogEntry => log !== null);
}

/**
 * Clear all logs for a specific game
 */
export async function clearGameLogs(gameId: string): Promise<void> {
    const gameLogsKey = `${LOGS_KEY_PREFIX}${gameId}`;
    await redis.del(gameLogsKey);
}

/**
 * Clear all game logs
 */
export async function clearAllLogs(): Promise<void> {
    // Find all game log keys
    const keys = await redis.keys(`${LOGS_KEY_PREFIX}*`);
    if (keys.length > 0) {
        await redis.del(...keys);
    }
    await redis.del(ALL_LOGS_KEY);
}

// ============================================================================
// Game Storage Functions
// ============================================================================

const GAMES_HASH_KEY = 'games:active';
const GAME_TTL_SECONDS = 300; // 5 minutes TTL for games

export interface GameEntry {
    id: string;
    gameId: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
    playerCount: number;
    lastPing: number; // Unix timestamp in ms
    createdAt: number;
}

/**
 * Store or update a game in Redis
 */
export async function upsertGame(game: Omit<GameEntry, 'id' | 'createdAt'>): Promise<GameEntry> {
    // Check if game exists
    const existing = await redis.hget(GAMES_HASH_KEY, game.gameId);

    let entry: GameEntry;
    if (existing) {
        const parsed = JSON.parse(existing) as GameEntry;
        entry = {
            ...parsed,
            ...game,
            lastPing: game.lastPing || Date.now(),
        };
    } else {
        entry = {
            id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            ...game,
            lastPing: game.lastPing || Date.now(),
            createdAt: Date.now(),
        };
    }

    await redis.hset(GAMES_HASH_KEY, game.gameId, JSON.stringify(entry));
    await redis.expire(GAMES_HASH_KEY, GAME_TTL_SECONDS * 10); // Expire the whole hash if no activity

    return entry;
}

/**
 * Get a game by its gameId
 */
export async function getGame(gameId: string): Promise<GameEntry | null> {
    const raw = await redis.hget(GAMES_HASH_KEY, gameId);
    if (!raw) return null;

    try {
        return JSON.parse(raw) as GameEntry;
    } catch {
        return null;
    }
}

/**
 * Get all active games, optionally filtered by recent ping
 */
export async function getActiveGames(minutesThreshold: number = 4): Promise<GameEntry[]> {
    const allGames = await redis.hgetall(GAMES_HASH_KEY);
    const cutoffTime = Date.now() - (minutesThreshold * 60 * 1000);

    const games: GameEntry[] = [];

    for (const [, value] of Object.entries(allGames)) {
        try {
            const game = JSON.parse(value) as GameEntry;
            // Only include games that have pinged recently and have players
            if (game.lastPing >= cutoffTime && game.playerCount > 0) {
                games.push(game);
            }
        } catch {
            // Skip invalid entries
        }
    }

    // Sort by lastPing descending
    return games.sort((a, b) => b.lastPing - a.lastPing);
}

/**
 * Get all games (including stale ones)
 */
export async function getAllGames(): Promise<GameEntry[]> {
    const allGames = await redis.hgetall(GAMES_HASH_KEY);

    const games: GameEntry[] = [];

    for (const [, value] of Object.entries(allGames)) {
        try {
            games.push(JSON.parse(value) as GameEntry);
        } catch {
            // Skip invalid entries
        }
    }

    return games.sort((a, b) => b.lastPing - a.lastPing);
}

/**
 * Delete a game
 */
export async function deleteGame(gameId: string): Promise<void> {
    await redis.hdel(GAMES_HASH_KEY, gameId);
}

/**
 * Clean up stale games that haven't sent a heartbeat
 */
export async function cleanupStaleGames(minutesThreshold: number = 5): Promise<number> {
    const allGames = await redis.hgetall(GAMES_HASH_KEY);
    const cutoffTime = Date.now() - (minutesThreshold * 60 * 1000);

    let deletedCount = 0;
    const pipeline = redis.pipeline();

    for (const [gameId, value] of Object.entries(allGames)) {
        try {
            const game = JSON.parse(value) as GameEntry;
            if (game.lastPing < cutoffTime) {
                pipeline.hdel(GAMES_HASH_KEY, gameId);
                deletedCount++;
            }
        } catch {
            // Delete invalid entries
            pipeline.hdel(GAMES_HASH_KEY, gameId);
            deletedCount++;
        }
    }

    await pipeline.exec();
    console.log(`[Redis Cleanup] Removed ${deletedCount} stale games (threshold: ${minutesThreshold} minutes)`);

    return deletedCount;
}

// ... (previous code)

/**
 * Get count of stale games
 */
export async function getStaleGamesCount(minutesThreshold: number = 5): Promise<number> {
    const allGames = await redis.hgetall(GAMES_HASH_KEY);
    const cutoffTime = Date.now() - (minutesThreshold * 60 * 1000);

    let count = 0;

    for (const [, value] of Object.entries(allGames)) {
        try {
            const game = JSON.parse(value) as GameEntry;
            if (game.lastPing < cutoffTime) {
                count++;
            }
        } catch {
            count++;
        }
    }

    return count;
}

// ============================================================================
// Hidden Games Functions
// ============================================================================

const HIDDEN_GAMES_SET_KEY = 'games:hidden';

/**
 * Toggle game visibility
 */
export async function toggleGameVisibility(gameId: string): Promise<boolean> {
    const isHidden = await redis.sismember(HIDDEN_GAMES_SET_KEY, gameId);
    if (isHidden) {
        await redis.srem(HIDDEN_GAMES_SET_KEY, gameId);
        return false; // Now visible
    } else {
        await redis.sadd(HIDDEN_GAMES_SET_KEY, gameId);
        return true; // Now hidden
    }
}

/**
 * Get all hidden game IDs
 */
export async function getHiddenGameIds(): Promise<Set<string>> {
    const ids = await redis.smembers(HIDDEN_GAMES_SET_KEY);
    return new Set(ids);
}

/**
 * Check if a game is hidden
 */
export async function isGameHidden(gameId: string): Promise<boolean> {
    return (await redis.sismember(HIDDEN_GAMES_SET_KEY, gameId)) === 1;
}
