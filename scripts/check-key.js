const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkKey() {
    try {
        const key = await prisma.licenseKey.findUnique({
            where: { key: 'MOD-0G7J-BK51-36ZR-SAEZ-Q8NE' }
        })
        console.log(key)
    } catch (error) {
        console.error(error)
    } finally {
        await prisma.$disconnect()
    }
}

checkKey()
