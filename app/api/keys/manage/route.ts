import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function isAuthorized(request: NextRequest) {
    const apiKey = request.headers.get('x-api-key');
    const apiSecret = process.env.API_SECRET;
    return !apiSecret || apiKey === apiSecret;
}

export async function DELETE(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const key = searchParams.get('key');

        if (!key) {
            return NextResponse.json({ success: false, error: 'Missing key' }, { status: 400 });
        }

        await prisma.accessKey.delete({
            where: { key },
        });

        return NextResponse.json({ success: true, message: 'Key deleted' });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Key not found' }, { status: 404 });
    }
}
