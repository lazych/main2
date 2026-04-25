const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const key = await prisma.licenseKey.upsert({
        where: { key: 'CRYLLIX-ADMIN-2024' },
        update: {},
        create: {
            key: 'CRYLLIX-ADMIN-2024',
            isActive: true,
            maxUses: 100,
            metadata: { type: 'moderator' }
        }
    });
    console.log('Moderator key:', key);

    const key2 = await prisma.licenseKey.upsert({
        where: { key: 'CRYLLIX-BETA-KEY-123' },
        update: {},
        create: {
            key: 'CRYLLIX-BETA-KEY-123',
            isActive: true,
            maxUses: 10
        }
    });
    console.log('Regular key:', key2);
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
