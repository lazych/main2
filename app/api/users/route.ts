import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/users - Fetch all users (moderator-only)
export async function GET(request: NextRequest) {
    try {
        // Check if user is authenticated and is a moderator
        const session = await getSession();

        if (!session?.userId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { isModerator: true }
        });

        if (!currentUser?.isModerator) {
            return NextResponse.json(
                { success: false, error: 'Forbidden - Moderator access required' },
                { status: 403 }
            );
        }

        // Fetch all users with their license keys
        const users = await prisma.user.findMany({
            include: {
                licenseKey: {
                    select: {
                        key: true,
                        isActive: true,
                        expiresAt: true,
                        metadata: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Remove password hashes from response
        const sanitizedUsers = users.map(user => {
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        return NextResponse.json({
            success: true,
            count: sanitizedUsers.length,
            users: sanitizedUsers,
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
