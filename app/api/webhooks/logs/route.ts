import { NextRequest, NextResponse } from 'next/server';
import { storeGameLogs, upsertGame, getGame } from '@/lib/redis';
import { z } from 'zod';
import { isRobloxRequest, getThumbnail, sendDiscordWebhook } from '@/lib/roblox';

export const runtime = 'nodejs';

// ============================================================================
// SCHEMA
// ============================================================================

const LogEntrySchema = z.object({
    content: z.string(),
    type: z.enum(['Info', 'Warn', 'Error']).default('Info'),
    timestamp: z.number().optional(),
});

const WebhookPayloadSchema = z.object({
    gameId: z.string().min(1, 'Game ID is required'),
    playerCount: z.number().int().nonnegative(),
    jobId: z.string().min(1, 'Job ID is required'),
    logs: z.array(LogEntrySchema).default([]),
});

// ============================================================================
// POST /api/webhooks/logs
// ============================================================================

export async function POST(request: NextRequest) {
    try {
        // Security: Verify request is from Roblox
        if (!await isRobloxRequest(request)) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Parse and validate payload
        const body = await request.json();
        const validation = WebhookPayloadSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: 'Invalid payload', details: validation.error.format() },
                { status: 400 }
            );
        }

        const { gameId, playerCount, jobId, logs } = validation.data;

        // Check if game exists in Redis
        const existingGame = await getGame(gameId);
        const isNewGame = !existingGame;

        // Upsert game in Redis
        const game = await upsertGame({
            gameId,
            name: existingGame?.name || `Game ${gameId}`,
            playerCount,
            lastPing: Date.now(),
            description: existingGame?.description,
            imageUrl: existingGame?.imageUrl,
        });

        // Store logs in Redis
        if (logs.length > 0) {
            const logEntries = logs.map(log => ({
                gameId,
                gameName: game.name,
                content: log.content,
                type: log.type as 'Info' | 'Warn' | 'Error',
                timestamp: log.timestamp ? log.timestamp * 1000 : Date.now(),
            }));

            await storeGameLogs(logEntries);
        }

        // Discord notification for new games
        if (isNewGame) {
            const thumbnail = await getThumbnail(gameId);
            await sendDiscordWebhook({
                title: '🎮 New Game Detected!',
                description: `A new game has connected to Cryllix.`,
                url: `https://www.roblox.com/games/${gameId}`,
                color: 0xFFD700, // Gold
                fields: [
                    { name: 'Game ID', value: gameId, inline: true },
                    { name: 'Players', value: playerCount.toString(), inline: true },
                    { name: 'Job ID', value: jobId, inline: false },
                ],
                thumbnail: thumbnail ? { url: thumbnail } : undefined,
                footer: { text: `Cryllix Dashboard • ${new Date().toLocaleTimeString()}` },
            });
        }

        console.log(`[Logs] Game ${gameId} | Players: ${playerCount} | Logs: ${logs.length} | JobId: ${jobId}`);

        return NextResponse.json({
            success: true,
            message: `Processed ${logs.length} logs`,
            isNewGame,
        });

    } catch (error) {
        console.error('[Logs] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
