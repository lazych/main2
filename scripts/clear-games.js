const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function clearGames() {
    try {
        const deleted = await prisma.game.deleteMany({})
        console.log(`Deleted ${deleted.count} games.`)
    } catch (error) {
        console.error('Error clearing games:', error)
    } finally {
        await prisma.$disconnect()
    }
}

clearGames()
