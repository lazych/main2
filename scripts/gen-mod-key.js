const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const key = 'MOD-' + Math.random().toString(36).substring(2, 10).toUpperCase();

prisma.licenseKey.create({
    data: {
        key: key,
        isActive: true,
        maxUses: 1,
        metadata: { type: 'moderator' }
    }
}).then(result => {
    console.log('\n========================================');
    console.log('MODERATOR KEY (1 use):', result.key);
    console.log('========================================\n');
    prisma.$disconnect();
}).catch(e => {
    console.error(e);
    prisma.$disconnect();
});
