'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateRobloxUsername(robloxUsername: string) {
    const session = await getSession()

    if (!session?.userId) {
        throw new Error('Not authenticated')
    }

    // Validate Roblox username (alphanumeric and underscores, 3-20 characters)
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(robloxUsername)) {
        throw new Error('Invalid Roblox username. Must be 3-20 characters, alphanumeric and underscores only.')
    }

    await prisma.user.update({
        where: { id: session.userId },
        data: { robloxUsername }
    })

    revalidatePath('/dashboard/profile')

    return { success: true }
}
