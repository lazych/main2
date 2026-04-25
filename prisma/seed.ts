import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    // Create a license key
    const key = await prisma.licenseKey.upsert({
        where: { key: 'CRYLLIX-BETA-KEY-123' },
        update: {},
        create: {
            key: 'CRYLLIX-BETA-KEY-123',
        },
    })
    console.log({ key })

    // Note: Games are now stored in Redis, not Prisma
    console.log('Games are stored in Redis - no game seeding needed')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
