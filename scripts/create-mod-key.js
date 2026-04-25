const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

function generateLicenseKey(options) {
    const {
        prefix = 'MOD',
        segments = 5,
        segmentLength = 4,
        separator = '-',
    } = options

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const segmentArray = []

    for (let i = 0; i < segments; i++) {
        let segment = ''
        for (let j = 0; j < segmentLength; j++) {
            const randomIndex = crypto.randomInt(0, chars.length)
            segment += chars[randomIndex]
        }
        segmentArray.push(segment)
    }

    return prefix ? `${prefix}${separator}${segmentArray.join(separator)}` : segmentArray.join(separator)
}

async function createModeratorKey() {
    try {
        const key = generateLicenseKey({
            prefix: 'MOD',
            segments: 5,
            segmentLength: 4,
        })

        const license = await prisma.licenseKey.create({
            data: {
                key: key,
                maxUses: 1,
                usedCount: 0,
                isActive: true,
                metadata: { type: 'moderator', createdFor: 'chase' },
            },
        })

        console.log('\n✅ Moderator License Key Created!\n')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`🔑 KEY: ${license.key}`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`\nMax Uses: ${license.maxUses}`)
        console.log(`Status: Active`)
        console.log(`Created: ${license.createdAt.toLocaleString()}\n`)
    } catch (error) {
        console.error('Error creating license key:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createModeratorKey()
