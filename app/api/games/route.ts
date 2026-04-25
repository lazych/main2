import { NextRequest, NextResponse } from 'next/server';
import { getAllGames } from '@/lib/redis';
import { getSession, decrypt } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/games - Fetch all active games
export async function GET(request: NextRequest) {
    try {
        // Authenticate the request
        let session = await getSession();

        // Fallback to Authorization header if no cookie session
        if (!session) {
            const authHeader = request.headers.get('Authorization');
            if (authHeader?.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                session = await decrypt(token);
            }
        }

        if (!session || !session.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all games from Redis
        const allGames = await getAllGames();

        // Filter to only games with players
        const games = allGames
            .filter(game => game.playerCount > 0)
            .sort((a, b) => b.playerCount - a.playerCount)
            .map(game => ({
                id: game.id,
                name: game.name,
                gameId: game.gameId,
                description: game.description,
                imageUrl: game.imageUrl,
                playerCount: game.playerCount,
                lastPing: new Date(game.lastPing),
                createdAt: new Date(game.createdAt),
            }));

        return NextResponse.json({
            success: true,
            count: games.length,
            games: games,
        });

    } catch (error) {
        console.error('Error fetching games:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch games' },
            { status: 500 }
        );
    }
}
