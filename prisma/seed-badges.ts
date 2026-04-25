
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding badges...')

    const badges = [
        {
            name: 'Early Adopter',
            description: 'Joined before 2026.',
            color: '#eab308', // Yellow
            icon: 'star'
        },
        {
            name: 'Bug Hunter',
            description: 'Reported a critical bug.',
            color: '#ef4444', // Red
            icon: 'shield'
        },
        {
            name: 'VIP',
            description: 'Premium member status.',
            color: '#eab308', // Gold
            icon: 'crown'
        },
        {
            name: 'Community MVP',
            description: 'Recognized pillar of the community.',
            color: '#3b82f6', // Blue
            icon: 'award'
        },
        {
            name: "nate",
            description: "Legendary status.",
            color: "#1E90FF", // Custom Dodger Blue (Nate's) - Different from MVP
            icon: "crown"
        },
        {
            name: 'Staff',
            description: 'Official Cryllix team member.',
            color: '#a855f7', // Purple
            icon: 'zap'
        },
        {
            name: 'YouTuber',
            description: 'Verified Content Creator.',
            color: '#FF0000', // YouTube Red
            icon: 'video'
        }
    ]

    for (const badge of badges) {
        const existing = await prisma.badge.findFirst({
            where: { name: badge.name }
        })

        if (!existing) {
            await prisma.badge.create({
                data: badge
            })
            console.log(`Created badge: ${badge.name}`)
        } else {
            console.log(`Badge already exists: ${badge.name}`)
        }
    }

    console.log('Badge seeding complete.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
