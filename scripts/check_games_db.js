const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkGames() {
    const games = await prisma.game.findMany()
    console.log('Total games found:', games.length)
    games.forEach(g => {
        console.log(`- [${g.gameId}] ${g.name}: ${g.playerCount} players (Last Ping: ${g.lastPing})`)
    })
}

checkGames()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
