'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { hash } from 'bcryptjs'
import { redis } from '@/lib/redis'
import { NextResponse } from 'next/server'

export async function banUser(userId: string, reason?: string) {
    const session = await getSession()

    // Check if current user is a moderator
    const currentUser = await prisma.user.findUnique({
        where: { id: session?.userId },
        select: { isModerator: true }
    })

    if (!currentUser?.isModerator) {
        throw new Error('Unauthorized')
    }
    // Get the user's robloxUsername before banning
    const userToBan = await prisma.user.findUnique({
        where: { id: userId },
        select: { robloxUsername: true }
    })

    // Delete whitelist entry if user has a robloxUsername
    /*if (userToBan?.robloxUsername) {
        await prisma.whitelist.deleteMany({
            where: { robloxUsername: userToBan.robloxUsername }
        })
    }*/

    await prisma.user.update({
        where: { id: userId },
        data: {
            isBanned: true,
            banReason: reason || 'Violation of terms of service',
            //robloxUsername: null  // Clear roblox username when banned
        }
    })

    revalidatePath('/dashboard/moderator')
}

export async function unbanUser(userId: string) {
    const session = await getSession()

    // Check if current user is a moderator
    const currentUser = await prisma.user.findUnique({
        where: { id: session?.userId },
        select: { isModerator: true }
    })

    if (!currentUser?.isModerator) {
        throw new Error('Unauthorized')
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            isBanned: false,
            banReason: null
        }
    })

    revalidatePath('/dashboard/moderator')
}

export async function toggleShadowban(userId: string) {
    const session = await getSession()

    // Check if current user is a moderator
    const currentUser = await prisma.user.findUnique({
        where: { id: session?.userId },
        select: { isModerator: true }
    })

    if (!currentUser?.isModerator) {
        throw new Error('Unauthorized')
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { isShadowBanned: true, isModerator: true }
    })

    if (!targetUser) throw new Error('User not found')
    if (targetUser.isModerator) throw new Error('Cannot shadowban a moderator')

    // Clear robloxUsername when shadowbanning
    const isNowShadowbanned = !targetUser.isShadowBanned;

    await prisma.user.update({
        where: { id: userId },
        data: {
            isShadowBanned: isNowShadowbanned,
            robloxUsername: isNowShadowbanned ? null : undefined // Clear if enabling, keep if disabling (though they likely need to re-link)
        }
    })

    revalidatePath('/dashboard/moderator')
}

export async function toggleFakeMaintenance(userId: string) {
    const session = await getSession()

    // Check if current user is a moderator
    const currentUser = await prisma.user.findUnique({
        where: { id: session?.userId },
        select: { isModerator: true }
    })

    if (!currentUser?.isModerator) {
        throw new Error('Unauthorized')
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { isFakeMaintenance: true, isModerator: true }
    })

    if (!targetUser) throw new Error('User not found')
    if (targetUser.isModerator) throw new Error('Cannot apply fake maintenance to a moderator')

    await prisma.user.update({
        where: { id: userId },
        data: { isFakeMaintenance: !targetUser.isFakeMaintenance }
    })

    revalidatePath('/dashboard/moderator')
}

export async function toggleGlobalMaintenance(message: string = 'We are currently performing scheduled upgrades to improve your experience.') {
    const session = await getSession()

    // Check if current user is a moderator
    const currentUser = await prisma.user.findUnique({
        where: { id: session?.userId },
        select: { isModerator: true }
    })

    if (!currentUser?.isModerator) throw new Error('Unauthorized')

    const currentState = await redis.get('system:maintenance')
    const newState = currentState === 'true' ? 'false' : 'true'

    await redis.set('system:maintenance', newState)
    if (newState === 'true') {
        await redis.set('system:maintenance_message', message)
    }

    revalidatePath('/dashboard/moderator')
    return newState === 'true'
}

export async function getGlobalMaintenanceStatus() {
    // Public safe accessor (or just use in RSC)
    const state = await redis.get('system:maintenance')
    const message = await redis.get('system:maintenance_message')
    return {
        isActive: state === 'true',
        message: message || 'We are currently performing scheduled upgrades to improve your experience.'
    }
}

export async function backupDatabase() {
    const session = await getSession()

    const currentUser = await prisma.user.findUnique({
        where: { id: session?.userId },
        select: { isModerator: true }
    })

    if (!currentUser?.isModerator) throw new Error('Unauthorized')

    // Simple JSON backup
    const users = await prisma.user.findMany({ include: { licenseKey: true } })
    const keys = await prisma.licenseKey.findMany()
    const whitelist = await prisma.whitelist.findMany()
    const accessKeys = await prisma.accessKey.findMany()

    const dump = {
        timestamp: new Date().toISOString(),
        users,
        keys,
        whitelist,
        accessKeys
    }

    return JSON.stringify(dump, null, 2)
}

export async function restoreDatabase(jsonString: string) {
    const session = await getSession()

    // Check moderator
    const currentUser = await prisma.user.findUnique({
        where: { id: session?.userId },
        select: { isModerator: true }
    })

    if (!currentUser?.isModerator) throw new Error('Unauthorized')

    try {
        const data = JSON.parse(jsonString)

        // 1. Users
        // We use a transaction or just sequential awaits. Sequential is fine for now to track progress/errors.
        if (data.users && Array.isArray(data.users)) {
            for (const user of data.users) {
                // Remove relation field 'licenseKey' if it exists in the object to avoid prisma errors
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { licenseKey, ...userData } = user;

                await prisma.user.upsert({
                    where: { id: userData.id },
                    update: {
                        username: userData.username,
                        passwordHash: userData.passwordHash,
                        robloxUsername: userData.robloxUsername,
                        isBanned: userData.isBanned,
                        isShadowBanned: userData.isShadowBanned,
                        isFakeMaintenance: userData.isFakeMaintenance,
                        isModerator: userData.isModerator,
                        createdAt: userData.createdAt,
                    },
                    create: {
                        id: userData.id,
                        username: userData.username,
                        passwordHash: userData.passwordHash,
                        robloxUsername: userData.robloxUsername,
                        isBanned: userData.isBanned,
                        isShadowBanned: userData.isShadowBanned || false,
                        isFakeMaintenance: userData.isFakeMaintenance || false,
                        isModerator: userData.isModerator,
                        createdAt: userData.createdAt,
                    }
                })
            }
        }

        // 2. Access Keys (No dependencies)
        if (data.accessKeys && Array.isArray(data.accessKeys)) {
            for (const key of data.accessKeys) {
                await prisma.accessKey.upsert({
                    where: { id: key.id },
                    update: key,
                    create: key
                })
            }
        }

        // 3. Whitelist (No strict dependencies usually, usually by robloxUsername)
        if (data.whitelist && Array.isArray(data.whitelist)) {
            for (const entry of data.whitelist) {
                await prisma.whitelist.upsert({
                    where: { id: entry.id },
                    update: entry,
                    create: entry
                })
            }
        }

        // 4. License Keys (Depends on User)
        if (data.keys && Array.isArray(data.keys)) {
            for (const key of data.keys) {
                // Clean up user relation if embedded object exists
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { user, ...keyData } = key;

                await prisma.licenseKey.upsert({
                    where: { id: keyData.id },
                    update: keyData,
                    create: keyData
                })
            }
        }

        revalidatePath('/dashboard/moderator')
        return { success: true, message: 'Database imported successfully.' }
    } catch (error) {
        console.error('Import failed:', error)
        return { success: false, message: 'Failed to import database. Check format.' }
    }
}

export async function resetUserPassword(userId: string) {
    const session = await getSession()

    // Check if current user is a moderator
    const currentUser = await prisma.user.findUnique({
        where: { id: session?.userId },
        select: { isModerator: true }
    })

    if (!currentUser?.isModerator) {
        throw new Error('Unauthorized')
    }

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { isModerator: true }
    })

    if (!targetUser) throw new Error('User not found')
    if (targetUser.isModerator) throw new Error('Cannot reset moderator password')

    // Default password: Changed123!
    const hashedPassword = await hash('Changed123!', 10)

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword }
    })

    revalidatePath('/dashboard/moderator')
}
