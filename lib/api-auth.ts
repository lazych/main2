import { NextRequest, NextResponse } from 'next/server';
import { getSession, decrypt } from './auth';
import { prisma } from './prisma';

/**
 * Checks if the request is authorized as a moderator.
 * Supports both session-based (dashboard), Bearer JWT, and API Key based authentication.
 * 
 * @param request The incoming Next.js request
 * @returns { userId: string } if authorized, otherwise returns a NextResponse with error
 */
export async function checkModeratorAuth(request: NextRequest) {
    // 1. Check for session (Browser/Dashboard access via Cookie)
    let session = await getSession();

    // 2. Fallback to Authorization header (API usage)
    if (!session) {
        const authHeader = request.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            session = await decrypt(token);
        }
    }

    if (session?.userId) {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { isModerator: true }
        });

        if (user?.isModerator) {
            return { userId: session.userId };
        }
    }

    // 3. Fallback to API Key (External tools/Moderator keys)
    const apiKey = request.headers.get('x-api-key');
    const apiSecret = process.env.API_SECRET;

    // We only allow API Key if API_SECRET is explicitly configured
    if (apiSecret && apiKey === apiSecret) {
        // For API keys, we return a system ID or just a success indicator
        return { userId: 'SYSTEM_API_KEY', isSystem: true };
    }

    // 3. Return Unauthorized/Forbidden response if both fail
    if (session?.userId) {
        // Authenticated but not a moderator
        return NextResponse.json(
            { success: false, error: 'Forbidden - Moderator access required' },
            { status: 403 }
        );
    }

    // Not authenticated at all
    return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
    );
}
