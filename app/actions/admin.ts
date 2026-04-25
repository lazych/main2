"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"

async function checkAdmin() {
    const session = await getSession()
    if (!session?.userId) throw new Error("Unauthorized")

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { isModerator: true }
    })

    if (!user?.isModerator) throw new Error("Forbidden")
}

export async function updateUserBadges(userId: string, badgeIds: string[]) {
    await checkAdmin()

    // 1. Get current badges to determine what to disconnect
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { badges: true }
    })

    if (!user) throw new Error("User not found")

    // 2. Wrap in transaction to clear and set
    await prisma.user.update({
        where: { id: userId },
        data: {
            badges: {
                set: badgeIds.map(id => ({ id }))
            }
        }
    })

    revalidatePath('/dashboard/moderator')
    revalidatePath(`/dashboard/profile`)
    return { success: true }
}

export async function adminResetPassword(userId: string, newPassword: string) {
    await checkAdmin()

    if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters")
    }

    const hashedPassword = await hash(newPassword, 12)

    await prisma.user.update({
        where: { id: userId },
        data: {
            passwordHash: hashedPassword
        }
    })

    revalidatePath('/dashboard/moderator')
    return { success: true }
}

export async function getAllBadges() {
    await checkAdmin()
    return prisma.badge.findMany({
        orderBy: { name: 'asc' }
    })
}
