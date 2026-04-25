const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setModerator() {
    try {
        // Get the first user and make them a moderator
        const user = await prisma.user.findFirst()

        if (!user) {
            console.log('No users found in database')
            return
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { isModerator: true }
        })

        console.log(`✅ User "${user.username}" is now a moderator!`)
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

setModerator()
