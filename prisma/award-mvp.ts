
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const badge = await prisma.badge.findFirst({ where: { name: 'Community MVP' } })
    const user = await prisma.user.findFirst({ where: { username: 'chasetest' } })

    if (badge && user) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                badges: {
                    connect: { id: badge.id }
                }
            }
        })
        console.log('Awarded Community MVP to chasetest')
    } else {
        console.error('Badge or user not found')
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })
