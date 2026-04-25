import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/users/[id] - Fetch individual user
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
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

        // Allow users to view their own profile, or moderators to view any profile
        if (session.userId !== params.id && !currentUser?.isModerator) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            include: {
                licenseKey: {
                    select: {
                        key: true,
                        isActive: true,
                        expiresAt: true,
                        metadata: true,
                        usedCount: true,
                        maxUses: true,
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Remove password hash from response
        const { passwordHash, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            user: userWithoutPassword,
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// PATCH /api/users/[id] - Update user (moderator-only)
export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
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

        const body = await request.json();
        const { isBanned, isModerator, robloxUsername } = body;

        // Validate that at least one field is being updated
        if (isBanned === undefined && isModerator === undefined && robloxUsername === undefined) {
            return NextResponse.json(
                { success: false, error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        // Build update object with only provided fields
        const updateData: any = {};
        if (isBanned !== undefined) updateData.isBanned = isBanned;
        if (isModerator !== undefined) updateData.isModerator = isModerator;
        if (robloxUsername !== undefined) updateData.robloxUsername = robloxUsername;

        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            include: {
                licenseKey: {
                    select: {
                        key: true,
                        isActive: true,
                        expiresAt: true,
                        metadata: true,
                        usedCount: true,
                        maxUses: true,
                    }
                }
            }
        });

        // Remove password hash from response
        const { passwordHash, ...userWithoutPassword } = updatedUser;

        return NextResponse.json({
            success: true,
            user: userWithoutPassword,
            message: 'User updated successfully',
        });

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update user' },
            { status: 500 }
        );
    }
}
