import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Helper for Auth
function isAuthorized(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key');
    const apiSecret = process.env.API_SECRET;
    return !apiSecret || apiKey === apiSecret;
}

export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { robloxUsername, discordId, plan } = body;

        if (!robloxUsername || !discordId || !plan) {
            return NextResponse.json(
                { success: false, error: 'Missing: robloxUsername, discordId, plan' },
                { status: 400 }
            );
        }

        const entry = await prisma.whitelist.upsert({
            where: { robloxUsername },
            update: { discordId, plan },
            create: {
                robloxUsername,
                discordId,
                plan,
                keyUsed: 'MANUAL_ENTRY'
            }
        });

        return NextResponse.json({ success: true, data: entry });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to add user' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ success: false, error: 'Missing username' }, { status: 400 });
        }

        await prisma.whitelist.delete({
            where: { robloxUsername: username },
        });

        return NextResponse.json({ success: true, message: 'User removed from whitelist' });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'User not found or failed to delete' }, { status: 404 });
    }
}
