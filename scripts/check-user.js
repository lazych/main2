const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser() {
    try {
        const user = await prisma.user.findUnique({
            where: { id: 'cmi9x88t40002b5y5klan3e1d' }
        })
        console.log(user)
    } catch (error) {
        console.error(error)
    } finally {
        await prisma.$disconnect()
    }
}

checkUser()
