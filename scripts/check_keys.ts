import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const keys = await prisma.licenseKey.findMany({
        where: {
            metadata: {
                path: ['type'],
                equals: 'moderator'
            }
        }
    })
    console.log('Moderator Keys in DB:', keys)

    // Also check if any are used
    const usedKeys = await prisma.licenseKey.findMany({
        where: { isUsed: true }
    })
    console.log('Used Keys:', usedKeys)
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
