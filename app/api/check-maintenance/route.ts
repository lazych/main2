import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getGlobalMaintenanceStatus } from '@/app/dashboard/moderator/actions';

export async function GET() {
    const session = await getSession();

    // 1. Check Global Maintenance
    const maintenanceStatus = await getGlobalMaintenanceStatus();

    if (maintenanceStatus.isActive) {
        // If global maintenance is active, allow only moderators
        if (session?.userId) {
            const user = await prisma.user.findUnique({
                where: { id: session.userId },
                select: { isModerator: true }
            });
            if (user?.isModerator) {
                return NextResponse.json({ status: 'ok' });
            }
        }
        // Anyone else gets 503 with custom message
        return NextResponse.json({
            error: 'Maintenance Mode',
            message: maintenanceStatus.message
        }, { status: 503 });
    }

    // 2. Check User-Specific Fake Maintenance
    if (session?.userId) {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { isFakeMaintenance: true }
        });

        if (user?.isFakeMaintenance) {
            return NextResponse.json({ error: 'Maintenance Mode' }, { status: 503 });
        }
    }

    return NextResponse.json({ status: 'ok' });
}
