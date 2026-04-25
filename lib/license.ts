import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export interface LicenseOptions {
    prefix?: string;
    segments?: number;
    segmentLength?: number;
    separator?: string;
}

export function generateLicenseKeyString(options: LicenseOptions = {}): string {
    const {
        prefix = 'CRYL',
        segments = 4,
        segmentLength = 4,
        separator = '-',
    } = options;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segmentArray: string[] = [];

    for (let i = 0; i < segments; i++) {
        let segment = '';
        for (let j = 0; j < segmentLength; j++) {
            const randomIndex = crypto.randomInt(0, chars.length);
            segment += chars[randomIndex];
        }
        segmentArray.push(segment);
    }

    return prefix ? `${prefix}${separator}${segmentArray.join(separator)}` : segmentArray.join(separator);
}

export async function createLicenseKey(data: {
    maxUses?: number;
    expiresInDays?: number;
    metadata?: any;
    prefix?: string;
}) {
    const { maxUses = 1, expiresInDays, metadata = {}, prefix = 'CRYL' } = data;

    const licenseKey = generateLicenseKeyString({ prefix });

    let expiresAt = null;
    if (expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    return await prisma.licenseKey.create({
        data: {
            key: licenseKey,
            maxUses,
            usedCount: 0,
            expiresAt,
            metadata,
            isActive: true,
        },
    });
}
