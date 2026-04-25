import { jwtVerify, JWTPayload } from 'jose'

/**
 * Edge-compatible session decryption using 'jose'
 * This implementation is designed specifically for the Vercel Edge Runtime.
 */
export async function decrypt(token: string): Promise<JWTPayload | null> {
    if (!token) return null;

    try {
        const secretKey = new TextEncoder().encode(
            process.env.JWT_SECRET || 'default-dev-secret-do-not-use-in-prod'
        );

        const { payload } = await jwtVerify(token, secretKey, {
            algorithms: ['HS256'],
        });

        return payload;
    } catch (error) {
        // Silently return null on verification failure in edge middleware
        return null;
    }
}
