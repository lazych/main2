import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const username = 'chase'
    const password = 'Vince_2008'

    console.log(`Creating moderator account for user: ${username}...`)

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { username },
        update: {
            passwordHash,
            isModerator: true,
            isBanned: false,
        },
        create: {
            username,
            passwordHash,
            isModerator: true,
            isBanned: false,
        },
    })

    console.log(`✅ Successfully created/updated moderator: ${user.username}`)
    console.log(`Password set to: ${password}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
