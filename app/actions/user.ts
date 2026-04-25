"use server"

import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getCurrentUsername() {
    try {
        const session = await getSession()
        if (!session?.userId) return null

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { username: true }
        })

        return user?.username || null
    } catch (e) {
        return null
    }
}

export async function getOwnedThemes() {
    try {
        const session = await getSession()
        if (!session?.userId) return ["default"]

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { ownedThemes: true, username: true } // Fetch username too for nate logic
        })

        if (!user) return ["default"]

        // Ensure default is always there
        const themes = [...new Set([...(user.ownedThemes || []), "default"])]

        // Legacy/Special handling for Nate
        if (user.username === 'NateDaPlayerYT' && !themes.includes('nate')) {
            themes.push('nate')
        }

        return themes
    } catch (e) {
        return ["default"]
    }
}

export async function getDiscordStatus() {
    try {
        const session = await getSession()
        if (!session?.userId) return null

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { discordId: true }
        })

        return {
            isLinked: !!user?.discordId
        }
    } catch (e) {
        return null
    }
}
