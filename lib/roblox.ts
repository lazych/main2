import { headers } from 'next/headers';

export async function isRobloxRequest(req: Request): Promise<boolean> {
    // In development, we might want to bypass this or check for a secret header
    if (process.env.NODE_ENV === 'development') return true;

    const ip = req.headers.get('x-forwarded-for') || '0.0.0.0';

    // This is a simplified check. For production, you should fetch the official list:
    // https://ip-ranges.amazonaws.com/ip-ranges.json (Roblox uses AWS)
    // Or use a known list of Roblox headers like 'Roblox-Id' which is spoofable but better than nothing if IP check is hard.
    // A robust IP check requires fetching the daily list of Roblox IPs.

    // For now, we'll check for the User-Agent or a custom header secret if you add one.
    const userAgent = req.headers.get('user-agent') || '';
    if (userAgent.includes('Roblox')) return true;

    return true; // Default to true for now to avoid blocking legitimate requests during dev
}

export async function getGameInfo(universeId: string | number) {
    try {
        const response = await fetch(`https://games.roblox.com/v1/games?universeIds=${universeId}`);
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0];
        }
        return null;
    } catch (error) {
        console.error("Failed to fetch game info:", error);
        return null;
    }
}

export async function getThumbnail(universeId: string | number) {
    try {
        const response = await fetch(`https://thumbnails.roblox.com/v1/assets?assetIds=${universeId}&returnPolicy=PlaceHolder&size=768x432&format=Png&isCircular=false`);
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0].imageUrl;
        }
        return "https://files.catbox.moe/49c8gw.png";
    } catch (error) {
        console.error("Failed to fetch thumbnail:", error);
        return "https://files.catbox.moe/49c8gw.png";
    }
}

export async function sendDiscordWebhook(embed: any) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "Cryllix Dashboard",
                avatar_url: "https://github.com/shadcn.png", // Replace with your logo
                embeds: [embed]
            })
        });
    } catch (error) {
        console.error("Failed to send Discord webhook:", error);
    }
}
