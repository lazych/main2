import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// POST /api/license/validate
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key } = body;

        if (!key) {
            return NextResponse.json(
                { success: false, error: 'License key is required' },
                { status: 400 }
            );
        }

        // Find the license key in the database
        const license = await prisma.licenseKey.findUnique({
            where: { key },
        });

        if (!license) {
            return NextResponse.json({
                success: false,
                valid: false,
                error: 'Invalid license key',
            }, { status: 404 });
        }

        // Check if the license is active
        if (!license.isActive) {
            return NextResponse.json({
                success: false,
                valid: false,
                error: 'License key has been deactivated',
            }, { status: 403 });
        }

        // Check if the license has expired
        if (license.expiresAt && new Date() > license.expiresAt) {
            return NextResponse.json({
                success: false,
                valid: false,
                error: 'License key has expired',
            }, { status: 403 });
        }

        // Check if the license has reached max uses
        if (license.usedCount >= license.maxUses) {
            return NextResponse.json({
                success: false,
                valid: false,
                error: 'License key has reached maximum usage limit',
            }, { status: 403 });
        }

        // Increment usage count
        await prisma.licenseKey.update({
            where: { key },
            data: {
                usedCount: {
                    increment: 1,
                },
                lastUsedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            valid: true,
            license: {
                key: license.key,
                usedCount: license.usedCount + 1,
                maxUses: license.maxUses,
                expiresAt: license.expiresAt,
            },
        });

    } catch (error) {
        console.error('Error validating license key:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to validate license key' },
            { status: 500 }
        );
    }
}
