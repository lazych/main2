import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key, robloxUsername, discordId } = body;

        if (!key || !robloxUsername || !discordId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: key, robloxUsername, discordId' },
                { status: 400 }
            );
        }

        // 1. Validate the Key
        const accessKey = await prisma.accessKey.findUnique({
            where: { key },
        });

        if (!accessKey) {
            return NextResponse.json(
                { success: false, error: 'Invalid key' },
                { status: 404 }
            );
        }

        if (accessKey.isUsed) {
            return NextResponse.json(
                { success: false, error: 'Key already redeemed' },
                { status: 409 }
            );
        }

        // 2. Check if user is already whitelisted
        // (Optional: Depends if we allow multiple plans or overwrite. Usually prevent duplicates.)
        const existingWhitelist = await prisma.whitelist.findUnique({
            where: { robloxUsername },
        });

        if (existingWhitelist) {
            return NextResponse.json(
                { success: false, error: 'User is already whitelisted' },
                { status: 409 }
            );
        }

        // 3. Redeem: Create Whitelist entry and Update Key
        // Transaction ensures atomicity
        const [whitelistEntry, updatedKey] = await prisma.$transaction([
            prisma.whitelist.create({
                data: {
                    robloxUsername,
                    discordId,
                    keyUsed: key,
                    plan: accessKey.plan,
                },
            }),
            prisma.accessKey.update({
                where: { key },
                data: {
                    isUsed: true,
                },
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: 'Key redeemed successfully',
            data: {
                robloxUsername: whitelistEntry.robloxUsername,
                plan: whitelistEntry.plan,
            },
        });

    } catch (error) {
        console.error('Error redeeming key:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
