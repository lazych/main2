import Redis from 'ioredis';
import { promises as fs } from 'fs';
import path from 'path';

// Redis connection singleton
const globalForRedis = globalThis as unknown as { redis: Redis | null };

const redisUrl = process.env.REDIS_URL;
const USE_LOCAL_STORAGE = !redisUrl;

// Local storage directory
const LOCAL_STORAGE_DIR = path.join(process.cwd(), '.local-storage');
const LOGS_FILE = path.join(LOCAL_STORAGE_DIR, 'game-logs.json');
const GAMES_FILE = path.join(LOCAL_STORAGE_DIR, 'games.json');
const HIDDEN_GAMES_FILE = path.join(LOCAL_STORAGE_DIR, 'hidden-games.json');

// In-memory caches
let localLogs: GameLogEntry[] = [];
let localGames: Map<string, GameEntry> = new Map();
let localHiddenGames: Set<string> = new Set();
let storageInitialized = false;

// Initialize local storage
async function initLocalStorage(): Promise<void> {
    if (storageInitialized) return;
    try {
        await fs.mkdir(LOCAL_STORAGE_DIR, { recursive: true });

        // Load logs
        try {
            const logsData = await fs.readFile(LOGS_FILE, 'utf-8');
            localLogs = JSON.parse(logsData);
        } catch {
            localLogs = [];
        }

        // Load games
        try {
            const gamesData = await fs.readFile(GAMES_FILE, 'utf-8');
            const gamesArray = JSON.parse(gamesData) as GameEntry[];
            localGames = new Map(gamesArray.map(g => [g.gameId, g]));
        } catch {
            localGames = new Map();
        }

        // Load hidden games
        try {
            const hiddenData = await fs.readFile(HIDDEN_GAMES_FILE, 'utf-8');
            localHiddenGames = new Set(JSON.parse(hiddenData));
        } catch {
            localHiddenGames = new Set();
        }

        storageInitialized = true;
    } catch (error) {
        console.error('[LocalStorage] Failed to initialize:', error);
    }
}

// Save to local files
async function saveLocalLogs(): Promise<void> {
    await fs.writeFile(LOGS_FILE, JSON.stringify(localLogs.slice(-1000)), 'utf-8');
}

async function saveLocalGames(): Promise<void> {
    await fs.writeFile(GAMES_FILE, JSON.stringify(Array.from(localGames.values())), 'utf-8');
}

async function saveLocalHiddenGames(): Promise<void> {
    await fs.writeFile(HIDDEN_GAMES_FILE, JSON.stringify(Array.from(localHiddenGames)), 'utf-8');
}

// Create Redis connection with TLS support for Upstash
function createRedisClient(): Redis | null {
    if (USE_LOCAL_STORAGE) {
        console.log('[Storage] Using local file storage (REDIS_URL not set)');
        return null;
    }

    // Upstash uses rediss:// for TLS connections
    const url = redisUrl!.includes('upstash.io') && redisUrl!.startsWith('redis://')
        ? redisUrl!.replace('redis://', 'rediss://')
        : redisUrl!;

    const client = new Redis(url, {
        tls: url.startsWith('rediss://') ? {} : undefined,
        maxRetriesPerRequest: 3,
    });

    client.on('error', () => {
        // Silently handle Redis errors in production
    });

    return client;
}

export const redis = globalForRedis.redis || createRedisClient();

if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
}

export async function getRedisStatus(): Promise<boolean> {
    if (!redis) return false;
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
 * Store a game log entry in Redis or local storage
 */
export async function storeGameLog(log: Omit<GameLogEntry, 'id'>): Promise<string> {
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const entry: GameLogEntry = { ...log, id };

    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        localLogs.unshift(entry);
        // Keep only last MAX_TOTAL_LOGS
        if (localLogs.length > MAX_TOTAL_LOGS) {
            localLogs = localLogs.slice(0, MAX_TOTAL_LOGS);
        }
        await saveLocalLogs();
        return id;
    }

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

    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        for (const log of logs) {
            const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            ids.push(id);
            const entry: GameLogEntry = { ...log, id };
            localLogs.unshift(entry);
        }
        // Keep only last MAX_TOTAL_LOGS
        if (localLogs.length > MAX_TOTAL_LOGS) {
            localLogs = localLogs.slice(0, MAX_TOTAL_LOGS);
        }
        await saveLocalLogs();
        return ids;
    }

    const pipeline = redis.pipeline();
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
    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        if (gameId) {
            return localLogs
                .filter(log => log.gameId === gameId)
                .slice(0, limit);
        }
        return localLogs.slice(0, limit);
    }

    const key = gameId ? `${LOGS_KEY_PREFIX}${gameId}` : ALL_LOGS_KEY;
    const rawLogs = await redis.lrange(key, 0, limit - 1);

    return rawLogs.map((raw: string) => {
        try {
            return JSON.parse(raw) as GameLogEntry;
        } catch {
            return null;
        }
    }).filter((log: GameLogEntry | null): log is GameLogEntry => log !== null);
}

/**
 * Clear all logs for a specific game
 */
export async function clearGameLogs(gameId: string): Promise<void> {
    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        localLogs = localLogs.filter(log => log.gameId !== gameId);
        await saveLocalLogs();
        return;
    }
    const gameLogsKey = `${LOGS_KEY_PREFIX}${gameId}`;
    await redis.del(gameLogsKey);
}

/**
 * Clear all game logs
 */
export async function clearAllLogs(): Promise<void> {
    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        localLogs = [];
        await saveLocalLogs();
        return;
    }
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
 * Store or update a game in Redis or local storage
 */
export async function upsertGame(game: Omit<GameEntry, 'id' | 'createdAt'>): Promise<GameEntry> {
    let entry: GameEntry;
    const existing = localGames.get(game.gameId);

    if (existing) {
        entry = {
            ...existing,
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

    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        localGames.set(game.gameId, entry);
        await saveLocalGames();
        return entry;
    }

    // Check if game exists in Redis
    const existingRedis = await redis.hget(GAMES_HASH_KEY, game.gameId);
    if (existingRedis) {
        const parsed = JSON.parse(existingRedis) as GameEntry;
        entry = {
            ...parsed,
            ...game,
            lastPing: game.lastPing || Date.now(),
        };
    }

    await redis.hset(GAMES_HASH_KEY, game.gameId, JSON.stringify(entry));
    await redis.expire(GAMES_HASH_KEY, GAME_TTL_SECONDS * 10);

    return entry;
}

/**
 * Get a game by its gameId
 */
export async function getGame(gameId: string): Promise<GameEntry | null> {
    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        return localGames.get(gameId) || null;
    }

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
    const cutoffTime = Date.now() - (minutesThreshold * 60 * 1000);

    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        const games: GameEntry[] = [];
        for (const game of localGames.values()) {
            if (game.lastPing >= cutoffTime && game.playerCount > 0) {
                games.push(game);
            }
        }
        return games.sort((a, b) => b.lastPing - a.lastPing);
    }

    const allGames = await redis.hgetall(GAMES_HASH_KEY);
    const games: GameEntry[] = [];

    for (const [, value] of Object.entries(allGames)) {
        try {
            const game = JSON.parse(value as string) as GameEntry;
            // Only include games that have pinged recently and have players
            if (game.lastPing >= cutoffTime && game.playerCount > 0) {
                games.push(game);
            }
        } catch {
            // Skip invalid entries
        }
    }

    return games.sort((a, b) => b.lastPing - a.lastPing);
}

/**
 * Get all games (including stale ones)
 */
export async function getAllGames(): Promise<GameEntry[]> {
    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        return Array.from(localGames.values()).sort((a, b) => b.lastPing - a.lastPing);
    }

    const allGames = await redis.hgetall(GAMES_HASH_KEY);
    const games: GameEntry[] = [];

    for (const [, value] of Object.entries(allGames)) {
        try {
            games.push(JSON.parse(value as string) as GameEntry);
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
    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        localGames.delete(gameId);
        await saveLocalGames();
        return;
    }
    await redis.hdel(GAMES_HASH_KEY, gameId);
}

/**
 * Clean up stale games that haven't sent a heartbeat
 */
export async function cleanupStaleGames(minutesThreshold: number = 5): Promise<number> {
    const cutoffTime = Date.now() - (minutesThreshold * 60 * 1000);

    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        let deletedCount = 0;
        for (const [gameId, game] of localGames.entries()) {
            if (game.lastPing < cutoffTime) {
                localGames.delete(gameId);
                deletedCount++;
            }
        }
        if (deletedCount > 0) {
            await saveLocalGames();
        }
        console.log(`[LocalStorage Cleanup] Removed ${deletedCount} stale games (threshold: ${minutesThreshold} minutes)`);
        return deletedCount;
    }

    const allGames = await redis.hgetall(GAMES_HASH_KEY);
    let deletedCount = 0;
    const pipeline = redis.pipeline();

    for (const [gameId, value] of Object.entries(allGames)) {
        try {
            const game = JSON.parse(value as string) as GameEntry;
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
    const cutoffTime = Date.now() - (minutesThreshold * 60 * 1000);

    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        let count = 0;
        for (const game of localGames.values()) {
            if (game.lastPing < cutoffTime) {
                count++;
            }
        }
        return count;
    }

    const allGames = await redis.hgetall(GAMES_HASH_KEY);
    let count = 0;

    for (const [, value] of Object.entries(allGames)) {
        try {
            const game = JSON.parse(value as string) as GameEntry;
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
    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        const isHidden = localHiddenGames.has(gameId);
        if (isHidden) {
            localHiddenGames.delete(gameId);
            await saveLocalHiddenGames();
            return false; // Now visible
        } else {
            localHiddenGames.add(gameId);
            await saveLocalHiddenGames();
            return true; // Now hidden
        }
    }

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
    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        return new Set(localHiddenGames);
    }
    const ids = await redis.smembers(HIDDEN_GAMES_SET_KEY);
    return new Set(ids);
}

/**
 * Check if a game is hidden
 */
export async function isGameHidden(gameId: string): Promise<boolean> {
    if (!redis) {
        // Local storage mode
        await initLocalStorage();
        return localHiddenGames.has(gameId);
    }
    return (await redis.sismember(HIDDEN_GAMES_SET_KEY, gameId)) === 1;
}
