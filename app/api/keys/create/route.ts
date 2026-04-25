import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { checkModeratorAuth } from '@/lib/api-auth';

export const runtime = 'nodejs';

function generateKey() {
    // Generate a formatted key XXXX-XXXX-XXXX-XXXX
    return Array(4).fill(0).map(() => crypto.randomBytes(2).toString('hex').toUpperCase()).join('-');
}

export async function POST(request: NextRequest) {
    // Security check - handles session, JWT and API key
    const auth = await checkModeratorAuth(request);
    if (auth instanceof NextResponse) {
        return auth;
    }

    try {
        const body = await request.json();
        const { plan, issuedBy } = body;

        if (!plan || !issuedBy) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: plan, issuedBy' },
                { status: 400 }
            );
        }

        const keyString = generateKey();

        // Ensure uniqueness (unlikely collision but good practice)
        // In robust systems, retry logic applies. Here validation handles collision.

        const newKey = await prisma.accessKey.create({
            data: {
                key: keyString,
                plan,
                issuedBy,
            },
        });

        return NextResponse.json({
            success: true,
            key: newKey.key,
            createdAt: newKey.issuedAt
        });

    } catch (error) {
        console.error('Error creating key:', error);
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
