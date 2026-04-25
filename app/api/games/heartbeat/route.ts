import { NextRequest, NextResponse } from 'next/server';
import { upsertGame, getGame } from '@/lib/redis';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_ASNS = [8151, 22697, 16509, 136766, 11281, 14618];
const AASN = ["purely cosmetic"];

// Schema for validation
const heartbeatSchema = z.object({
    gameId: z.string().min(1, "Game ID is required"),
    name: z.string().min(1, "Name is required"),
    playerCount: z.number().int().nonnegative().default(0),
    description: z.string().optional().nullable(),
    imageUrl: z.string().url().optional().nullable(),
});

// POST /api/games/heartbeat
export async function POST(request: Request) {
    return NextResponse.json(
        { success: false, error: 'Enhance your calm' },
        { status: 420 }
    );
    /*
    try {
        // ASN Filtering
        const asnHeader = request.headers.get('x-vercel-ip-as-number');
        if (asnHeader) {
            const asn = parseInt(asnHeader);
            if (!ALLOWED_ASNS.includes(asn)) {
                console.warn(`[Heartbeat] Blocked request from unauthorized ASN: ${asn}`);
                return NextResponse.json(
                    { success: false, error: `Access denied: ASN ${asn} not allowed` },
                    { status: 403 }
                );
            }
        }

        const body = await request.json();

        // Validate input
        const result = heartbeatSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: 'Validation failed', details: result.error.format() },
                { status: 400 }
            );
        }

        let { gameId, name, playerCount, description, imageUrl: providedImageUrl } = result.data;

        // Verify image URL provider
        if (providedImageUrl && !providedImageUrl.startsWith("https://tr.rbxcdn.com") && !providedImageUrl.startsWith("http://tr.rbxcdn.com")) {
            return NextResponse.json(
                { success: false, error: 'Invalid image URL provider' },
                { status: 400 }
            );
        }

        // Fetch thumbnail from Roblox API
        let finalImageUrl = providedImageUrl;
        if (!finalImageUrl) {
            try {
                // Using Places/GameIcons endpoint for correct thumbnail
                // Fetch fresh thumbnail using the requested endpoint
                const thumbRes = await fetch(
                    `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${body.gameId}&size=512x512&format=Png&isCircular=false`
                );

                if (thumbRes.ok) {
                    const thumbnailData = await thumbRes.json();
                    if (thumbnailData?.data?.[0]?.imageUrl) {
                        finalImageUrl = thumbnailData.data[0].imageUrl;
                    }
                }
            } catch (err) {
                console.error('[Heartbeat] Failed to fetch thumbnail:', err);
                // Fallback to providedImageUrl is already set
            }
        }
        // Upsert the game in Redis
        const game = await upsertGame({
            gameId,
            name,
            playerCount,
            lastPing: Date.now(),
            description: description || null,
            imageUrl: finalImageUrl || null,
        });

        console.log(`[Heartbeat] Updated game: ${name} (${gameId}) - Players: ${playerCount}`);

        return NextResponse.json({
            success: true,
            game: {
                id: game.id,
                name: game.name,
                playerCount: game.playerCount,
                lastPing: new Date(game.lastPing),
            },
        });

    } catch (error) {
        console.error('[Heartbeat] Error processing game heartbeat:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
    */
}
