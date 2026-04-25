'use server'

import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function register(prevState: unknown, formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const licenseKey = formData.get('licenseKey') as string

    if (!username || !password || !licenseKey) {
        return { error: 'All fields are required' }
    }

    // Validate license key
    const key = await prisma.licenseKey.findUnique({
        where: { key: licenseKey },
    })

    console.log('--- DEBUG REGISTRATION ---')
    console.log('Input Key:', licenseKey)
    console.log('Found Key:', key)

    if (!key) {
        return { error: 'Invalid license key' }
    }

    // Check if key is active
    console.log('Is Active?', key.isActive)
    if (!key.isActive) {
        return { error: 'License key is inactive' }
    }

    // Check expiration
    if (key.expiresAt && new Date() > key.expiresAt) {
        return { error: 'License key has expired' }
    }

    // Check usage limits
    if (key.usedCount >= key.maxUses) {
        return { error: 'License key has reached maximum usage limit' }
    }

    // Check if username already exists (case-insensitive)
    const existingUser = await prisma.user.findFirst({
        where: {
            username: {
                equals: username,
                mode: 'insensitive'
            }
        }
    })

    if (existingUser) {
        return { error: 'Username already taken' }
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check metadata for moderator status
    const metadata = key.metadata as Record<string, any>
    const isModerator = metadata?.type === 'moderator'

    try {
        const user = await prisma.user.create({
            data: {
                username, // Save exactly as typed for display
                passwordHash: hashedPassword,
                isModerator,
                licenseKey: {
                    connect: { id: key.id }
                }
            }
        })

        // Update license key usage
        await prisma.licenseKey.update({
            where: { id: key.id },
            data: {
                usedCount: { increment: 1 },
                lastUsedAt: new Date(),
                // Only mark as fully used if we hit the limit
                isUsed: key.usedCount + 1 >= key.maxUses,
                // We don't set userId here because a key might be used by multiple users
                // The relation is one-to-one in the schema currently which is a problem for multi-use keys
                // We need to fix the schema relation if we want multi-use keys to work properly with relations
                // For now, we'll just increment the count
            }
        })

        await createSession(user.id)
    } catch (e) {
        return { error: 'Registration failed' }
    }

    redirect('/dashboard')
}

export async function login(prevState: unknown, formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const turnstileToken = formData.get('cf-turnstile-response') as string

    if (!turnstileToken) {
        return { error: 'Please complete the Turnstile challenge' }
    }

    // Verify Turnstile
    const verifyFormData = new URLSearchParams()
    verifyFormData.append('secret', process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || "")
    verifyFormData.append('response', turnstileToken)

    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: verifyFormData,
    }).then(res => res.json())

    if (!turnstileRes.success) {
        return { error: 'Turnstile verification failed' }
    }

    const user = await prisma.user.findFirst({
        where: {
            username: {
                equals: username,
                mode: 'insensitive'
            }
        }
    })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return { error: 'Invalid credentials' }
    }

    await createSession(user.id)
    redirect('/dashboard')
}

export async function logout() {
    await deleteSession()
    redirect('/login')
}
