import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs';

export async function GET() {
    const session = await getSession()

    if (!session?.userId) {
        return NextResponse.json({ banned: false })
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { isBanned: true, banReason: true }
    })

    if (user?.isBanned) {
        return NextResponse.json({ banned: true, reason: user.banReason }, { status: 403 })
    }

    return NextResponse.json({ banned: false })
}
