import { SignJWT, jwtVerify } from 'jose'

// Defer secret key initialization to runtime to prevent build-time errors
export function getSecretKey(): Uint8Array {
    const secretKey = process.env.JWT_SECRET || 'default-dev-secret-do-not-use-in-prod'
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is not defined')
    }
    return new TextEncoder().encode(secretKey)
}

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(getSecretKey())
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, getSecretKey(), {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        return null
    }
}
