import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log("Assigning 'The Creator' badge to NateDaPlayer...")

    const username = "NateDaPlayerYT"
    const badgeName = "nate"

    // 1. Find the Badge
    const badge = await prisma.badge.findFirst({
        where: { name: badgeName }
    })

    if (!badge) {
        console.error(`Badge '${badgeName}' not found! Run seed-badges.ts first.`)
        return
    }

    // 2. Find or Create User
    // note: In a real app we might not want to auto-create, but for this specific request it ensures functionality
    // We'll try to find first.
    let user = await prisma.user.findUnique({
        where: { username }
    })

    if (!user) {
        console.log(`User '${username}' not found. Creating placeholder user for testing...`)
        // Create a dummy user if he doesn't exist yet, so we can verify the badge/theme logic
        // In reality, Nate would register. This is just to ensure the script works.
        try {
            user = await prisma.user.create({
                data: {
                    username,
                    passwordHash: "placeholder_hash_needs_reset",
                    licenseKey: {
                        create: {
                            key: "NATE-SPECIAL-KEY-001"
                        }
                    }
                }
            })
        } catch (e) {
            console.log("Could not create user (might already exist with different casing?), skipping creation.")
        }
    }

    if (!user) {
        console.error("Could not find or create user.")
        return
    }

    // 3. Assign Badge
    await prisma.user.update({
        where: { id: user.id },
        data: {
            badges: {
                connect: { id: badge.id }
            }
        }
    })

    console.log(`Successfully assigned '${badgeName}' to ${username}.`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
