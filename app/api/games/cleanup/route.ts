import { NextRequest, NextResponse } from 'next/server';
import { cleanupStaleGames, getAllGames } from '@/lib/redis';
import { getSession, decrypt } from '@/lib/auth';

export const runtime = 'nodejs';

// POST /api/games/cleanup - Remove stale games
export async function POST(request: NextRequest) {
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

        // Delete games that haven't sent a heartbeat in the last 5 minutes
        const deletedCount = await cleanupStaleGames(5);

        console.log(`Cleaned up ${deletedCount} stale games`);

        return NextResponse.json({
            success: true,
            deletedCount: deletedCount,
            message: `Removed ${deletedCount} stale game(s)`,
        });

    } catch (error) {
        console.error('Error cleaning up stale games:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to cleanup stale games' },
            { status: 500 }
        );
    }
}

// GET /api/games/cleanup - Check how many stale games exist
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

        const staleThreshold = Date.now() - 5 * 60 * 1000;

        const allGames = await getAllGames();

        const staleGames = allGames
            .filter(game => game.lastPing < staleThreshold)
            .map(game => ({
                id: game.id,
                name: game.name,
                gameId: game.gameId,
                lastPing: new Date(game.lastPing),
            }));

        return NextResponse.json({
            success: true,
            count: staleGames.length,
            staleGames: staleGames,
        });

    } catch (error) {
        console.error('Error checking stale games:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check stale games' },
            { status: 500 }
        );
    }
}
