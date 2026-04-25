import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {


    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json(
            { success: false, error: 'Missing username parameter' },
            { status: 400 }
        );
    }

    try {
        // When using Edge runtime with Prisma Accelerate, caching strategies can be applied if configured in extension
        // Using findFirst with mode: 'insensitive' to handle Roblox username casing differences
        const whitelistEntry = await prisma.whitelist.findFirst({
            where: {
                robloxUsername: {
                    equals: username,
                    mode: 'insensitive'
                }
            },
            // Optional: cache usage if configured in accelerate
            // cacheStrategy: { ttl: 60, swr: 60 },
        });

        if (whitelistEntry) {
            return NextResponse.json({
                success: true,
                whitelisted: true,
                plan: whitelistEntry.plan,
                discordId: whitelistEntry.discordId,
            });
        } else {
            return NextResponse.json({
                success: true,
                whitelisted: false,
            });
        }

    } catch (error) {
        console.error('Error checking whitelist:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
