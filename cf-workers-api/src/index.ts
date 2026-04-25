import { Hono } from 'hono';
import Redis from 'ioredis';
import { z } from 'zod';

// ============================================================================
// CONFIG & CONSTANTS
// ============================================================================

const GAMES_HASH_KEY = "games:active";
const LOGS_KEY_PREFIX = "game:logs:";
const ALL_LOGS_KEY = "game:logs:all";
const UNIVERSE_MAPPING_PREFIX = "universe:mapping:";

const MAX_LOGS_PER_GAME = 500;
const MAX_TOTAL_LOGS = 1000;
const LOG_TTL_SECONDS = 300; // 5 minutes
const GAME_TTL_SECONDS = 300; // 5 minutes

type Bindings = {
    REDIS_URL: string;
    ALLOWED_ASNS?: string;
    DISCORD_WEBHOOK_URL?: string;
    DISABLE_DISCORD_NOTIFICATIONS?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// ============================================================================
// MIDDLEWARE: ASN FILTER
// ============================================================================

app.use("*", async (c, next) => {
    const allowedAsns = c.env.ALLOWED_ASNS;

    if (allowedAsns) {
        // Clean up possible quotes from environment variable
        const cleanAllowed = allowedAsns.replace(/^"|"$/g, "");
        const allowedList = cleanAllowed.split(",")
            .map((n) => parseInt(n.trim()))
            .filter((n) => !isNaN(n));

        const asn = (c.req.raw as any).cf?.asn;

        if (asn) {
            if (!allowedList.includes(asn)) {
                console.warn(`[Blocked] Request from ASN ${asn} not in allowed list.`);
                return c.json({ success: false, error: `Forbidden: ASN ${asn} not allowed` }, 403);
            }
        }
    }

    await next();
});

// ============================================================================
// SCHEMAS
// ============================================================================

const HeartbeatSchema = z.object({
    gameId: z.string().min(1),
    name: z.string().min(1),
    playerCount: z.number().int().nonnegative().default(0),
    description: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable()
});

const LogEntrySchema = z.object({
    content: z.string(),
    type: z.enum(["Info", "Warn", "Error"]).default("Info"),
    timestamp: z.number().optional()
});

const WebhookPayloadSchema = z.object({
    gameId: z.string().min(1),
    playerCount: z.number().int().nonnegative(),
    jobId: z.string().min(1),
    logs: z.array(LogEntrySchema).default([])
});

const WebhookGameSchema = z.object({
    gameId: z.string().min(1),
    name: z.string().min(1),
    playerCount: z.number().int().nonnegative().default(0),
    description: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    jobId: z.string().optional().nullable()
});

// ============================================================================
// HELPERS
// ============================================================================

function getRedisClient(url: string) {
    const isTls = url.startsWith("rediss://");
    return new Redis(url, {
        maxRetriesPerRequest: 5,
        tls: isTls ? {} : undefined
    });
}

async function sendDiscordWebhook(url: string, embed: any) {
    try {
        await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: "Cryllix Dashboard",
                avatar_url: "https://github.com/shadcn.png",
                embeds: [embed]
            })
        });
    } catch (error) {
        console.error("Failed to send Discord webhook:", error);
    }
}

async function getUniverseIdFromPlaceId(placeId: string, redis: Redis) {
    const cacheKey = `${UNIVERSE_MAPPING_PREFIX}${placeId}`;
    try {
        const cached = await redis.get(cacheKey);
        if (cached) return parseInt(cached);

        const response = await fetch(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
        if (!response.ok) return null;

        const data: any = await response.json();
        const universeId = data.universeId || null;

        if (universeId) {
            await redis.set(cacheKey, universeId.toString(), "EX", 86400); // 24h cache
        }
        return universeId;
    } catch (error) {
        console.error("[Worker] Failed to fetch universeId:", error);
        return null;
    }
}

async function getUniverseData(universeId: number) {
    try {
        const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
        const data: any = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0];
        }
    } catch (error) {
        console.error("[Worker] Failed to fetch universe data:", error);
    }
    return null;
}

async function getThumbnail(gameId: string, redis: Redis) {
    try {
        const uid = await getUniverseIdFromPlaceId(gameId, redis);
        if (!uid) return null;

        const response = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${uid}&returnPolicy=PlaceHolder&size=768x432&format=Png&isCircular=false`);
        if (response.ok) {
            const data: any = await response.json();
            return data?.data?.[0]?.imageUrl || "https://files.catbox.moe/49c8gw.png";
        }
    } catch (err) {
        console.error("[Worker] Failed to fetch thumbnail:", err);
    }
    return null;
}

async function isRobloxRequest(userAgent: string) {
    return userAgent.includes("Roblox");
}

async function cleanupStaleData(redis: Redis) {
    const allGames = await redis.hgetall(GAMES_HASH_KEY);
    if (!allGames) return 0;

    const cutoffTime = Date.now() - LOG_TTL_SECONDS * 1000;
    let deletedCount = 0;

    for (const [gameId, value] of Object.entries(allGames)) {
        try {
            const game = JSON.parse(value as string);
            if (game.lastPing < cutoffTime) {
                await redis.hdel(GAMES_HASH_KEY, gameId);
                await redis.del(`${LOGS_KEY_PREFIX}${gameId}`);
                deletedCount++;
            }
        } catch {
            await redis.hdel(GAMES_HASH_KEY, gameId);
            deletedCount++;
        }
    }
    return deletedCount;
}

// ============================================================================
// ROUTES
// ============================================================================

app.post("/api/webhooks/games", async (c) => {
    const redis = getRedisClient(c.env.REDIS_URL);
    try {
        const body = await c.req.json();
        const validation = WebhookGameSchema.safeParse(body);
        if (!validation.success) {
            return c.json({ success: false, error: "Validation failed" }, 400);
        }

        const { gameId, name: payloadName, playerCount: payloadPlayerCount, description: payloadDescription, imageUrl, jobId } = validation.data;

        let finalPlayerCount = payloadPlayerCount;
        let finalName = payloadName;
        let finalDescription = payloadDescription;
        let finalVisits = null;

        // Fetch real-time data from Roblox API
        const uid = await getUniverseIdFromPlaceId(gameId, redis);
        if (uid) {
            const robloxData = await getUniverseData(uid);
            if (robloxData) {
                // EXPLICIT OVERRIDE: prioritize real-time data from Roblox API
                if (typeof robloxData.playing === 'number') {
                    finalPlayerCount = robloxData.playing;
                }
                finalName = robloxData.name || finalName;
                finalDescription = robloxData.description || finalDescription;
                finalVisits = robloxData.visits || null;
            }
        }

        const existingRaw = await redis.hget(GAMES_HASH_KEY, gameId);
        const isNewGame = !existingRaw;

        const game = {
            id: existingRaw ? JSON.parse(existingRaw).id : `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            gameId,
            name: finalName,
            playerCount: finalPlayerCount,
            visits: finalVisits,
            lastPing: Date.now(),
            createdAt: existingRaw ? JSON.parse(existingRaw).createdAt : Date.now(),
            description: finalDescription || (existingRaw ? JSON.parse(existingRaw).description : null),
            imageUrl: imageUrl || (existingRaw ? JSON.parse(existingRaw).imageUrl : null)
        };

        await redis.hset(GAMES_HASH_KEY, gameId, JSON.stringify(game));
        await redis.expire(GAMES_HASH_KEY, GAME_TTL_SECONDS * 10);

        // Notification for new game
        const discordDisabled = c.env.DISABLE_DISCORD_NOTIFICATIONS === "true";
        if (isNewGame && c.env.DISCORD_WEBHOOK_URL && !discordDisabled) {
            const thumbnail = imageUrl || await getThumbnail(gameId, redis);
            c.executionCtx.waitUntil(sendDiscordWebhook(c.env.DISCORD_WEBHOOK_URL, {
                title: "🚨 New Infected Game!",
                description: `**${finalName}** has been logged via Worker.`,
                url: `https://www.roblox.com/games/${gameId}`,
                color: 0xFF0000,
                fields: [
                    { name: "Players", value: finalPlayerCount.toString(), inline: true },
                    { name: "Visits", value: (finalVisits || 0).toLocaleString(), inline: true },
                    { name: "Game ID", value: gameId, inline: true },
                    { name: "Job ID", value: jobId || "N/A", inline: false },
                    { name: "Join Link", value: `[Click to Join](https://www.roblox.com/games/${gameId})`, inline: false }
                ],
                thumbnail: thumbnail ? { url: thumbnail } : undefined,
                footer: { text: `Cryllix Worker • ${new Date().toLocaleTimeString()}` }
            }));
        }

        return c.json({ success: true, message: "Webhook received" });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    } finally {
        c.executionCtx.waitUntil(redis.quit());
    }
});

// Heartbeat alias
app.post("/api/games/heartbeat", async (c) => {
    return app.fetch(new Request(c.req.raw.url.replace("/games/heartbeat", "/webhooks/games"), c.req.raw), c.env, c.executionCtx);
});

app.post("/api/webhooks/logs", async (c) => {
    if (!await isRobloxRequest(c.req.header("user-agent") || "")) {
        return c.json({ success: false, error: "Unauthorized" }, 403);
    }

    const redis = getRedisClient(c.env.REDIS_URL);
    try {
        const body = await c.req.json();
        const validation = WebhookPayloadSchema.safeParse(body);
        if (!validation.success) {
            return c.json({ success: false, error: "Invalid payload" }, 400);
        }

        const { gameId, playerCount: payloadPlayerCount, jobId, logs } = validation.data;

        let finalPlayerCount = payloadPlayerCount;
        let finalName = `Game ${gameId}`;
        let finalVisits = null;

        const uid = await getUniverseIdFromPlaceId(gameId, redis);
        if (uid) {
            const robloxData = await getUniverseData(uid);
            if (robloxData) {
                // EXPLICIT OVERRIDE: prioritize real-time data from Roblox API
                if (typeof robloxData.playing === 'number') {
                    finalPlayerCount = robloxData.playing;
                }
                finalName = robloxData.name || finalName;
                finalVisits = robloxData.visits || null;
            }
        }

        const existingRaw = await redis.hget(GAMES_HASH_KEY, gameId);
        let game: any;
        const isNewGame = !existingRaw;

        if (existingRaw) {
            const parsed = JSON.parse(existingRaw);
            game = {
                ...parsed,
                name: finalName,
                playerCount: finalPlayerCount,
                visits: finalVisits || parsed.visits,
                lastPing: Date.now()
            };
        } else {
            game = {
                id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                gameId,
                name: finalName,
                playerCount: finalPlayerCount,
                visits: finalVisits,
                lastPing: Date.now(),
                createdAt: Date.now()
            };
        }

        await redis.hset(GAMES_HASH_KEY, gameId, JSON.stringify(game));

        if (logs.length > 0) {
            const pipeline = redis.pipeline();
            const gameLogsKey = `${LOGS_KEY_PREFIX}${gameId}`;

            for (const log of logs) {
                const entry = {
                    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    gameId,
                    gameName: game.name,
                    content: log.content,
                    type: log.type,
                    timestamp: log.timestamp ? log.timestamp * 1000 : Date.now()
                };
                const serialized = JSON.stringify(entry);
                pipeline.lpush(gameLogsKey, serialized);
                pipeline.lpush(ALL_LOGS_KEY, serialized);
            }

            pipeline.ltrim(gameLogsKey, 0, MAX_LOGS_PER_GAME - 1);
            pipeline.expire(gameLogsKey, LOG_TTL_SECONDS);
            pipeline.ltrim(ALL_LOGS_KEY, 0, MAX_TOTAL_LOGS - 1);
            pipeline.expire(ALL_LOGS_KEY, LOG_TTL_SECONDS);

            await pipeline.exec();
        }

        return c.json({
            success: true,
            message: `Processed ${logs.length} logs`,
            isNewGame
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    } finally {
        c.executionCtx.waitUntil(redis.quit());
    }
});

app.post("/api/games/cleanup", async (c) => {
    const redis = getRedisClient(c.env.REDIS_URL);
    try {
        const deletedCount = await cleanupStaleData(redis);
        return c.json({ success: true, deletedCount, message: `Removed ${deletedCount} stale game(s)` });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    } finally {
        c.executionCtx.waitUntil(redis.quit());
    }
});

// ============================================================================
// EXPORT
// ============================================================================

export default {
    fetch: app.fetch,
    async scheduled(event: any, env: Bindings, ctx: any) {
        const redis = getRedisClient(env.REDIS_URL);
        try {
            await cleanupStaleData(redis);
        } finally {
            ctx.waitUntil(redis.quit());
        }
    }
};
