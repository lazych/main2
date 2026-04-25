import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

function generateKey() {
    const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase()
    return `MOD-${segment()}-${segment()}-${segment()}-${segment()}`
}

async function main() {
    const keys = []
    for (let i = 0; i < 4; i++) {
        const keyString = generateKey()
        const key = await prisma.licenseKey.create({
            data: {
                key: keyString,
                metadata: { type: 'moderator' },
                maxUses: 1
            }
        })
        keys.push(key.key)
    }

    console.log('Generated Moderator Keys:')
    keys.forEach(k => console.log(k))
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
