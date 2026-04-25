import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// GET /api/roblox/check-user?username=RobloxUsername
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json(
                { success: false, error: 'Username is required' },
                { status: 400 }
            );
        }

        // Find user by Roblox username (case-insensitive search would be ideal, 
        // but for now we'll do exact match or rely on how it was saved)
        // Since Prisma/PostgreSQL case sensitivity depends on collation, 
        // and we want to be robust, we might want to store normalized versions later.
        // For now, we assume exact match or that the user saved it correctly.

        // We'll try to find a user where the robloxUsername matches
        const user = await prisma.user.findFirst({
            where: {
                robloxUsername: {
                    equals: username,
                    mode: 'insensitive', // PostgreSQL specific: case-insensitive
                },
            },
            include: {
                licenseKey: {
                    select: {
                        metadata: true,
                    }
                }
            }
        });

        if (!user || user.isBanned) {
            return NextResponse.json({
                success: true,
                exists: false,
                username: username,
            });
        }

        // Extract tier from metadata if available
        const metadata = user.licenseKey?.metadata as Record<string, any> | undefined;
        const tier = metadata?.tier || 'standard';

        return NextResponse.json({
            success: true,
            exists: true,
            username: user.robloxUsername, // Return the stored casing
            isBanned: user.isBanned,
            isModerator: user.isModerator,
            tier: tier,
            userId: user.id, // Internal ID might be useful for logging but maybe not exposed if not needed
        });

    } catch (error) {
        console.error('Error checking Roblox user:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
