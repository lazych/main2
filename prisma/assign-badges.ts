
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Assigning badges...')

    // 1. Get Early Adopter Badge
    const earlyAdopterBadge = await prisma.badge.findFirst({
        where: { name: 'Early Adopter' }
    })

    if (!earlyAdopterBadge) {
        console.error('Early Adopter badge not found. Run seed-badges.ts first.')
        return
    }

    // 2. Find eligible users (Joined before Jan 1, 2026)
    const cutoffDate = new Date('2026-01-01')
    const eligibleUsers = await prisma.user.findMany({
        where: {
            createdAt: {
                lt: cutoffDate
            },
            badges: {
                none: {
                    id: earlyAdopterBadge.id
                }
            }
        }
    })

    console.log(`Found ${eligibleUsers.length} users eligible for Early Adopter.`)

    // 3. Award Badge
    for (const user of eligibleUsers) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                badges: {
                    connect: { id: earlyAdopterBadge.id }
                }
            }
        })
        console.log(`Awarded Early Adopter to ${user.username}`)
    }

    console.log('Badge assignment complete.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
