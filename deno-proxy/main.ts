// Deno Image Proxy for Cryllix
// Deploy this to https://dash.deno.com/new

// Modern Deno.serve API (Deno 1.35+)
Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        });
    }

    const url = new URL(req.url);
    const placeId = url.searchParams.get("placeId");

    if (!placeId) {
        return new Response("Missing 'placeId' query parameter", {
            status: 400,
            headers: { "Access-Control-Allow-Origin": "*" }
        });
    }

    try {
        // 1. Get the image URL from Roblox API
        const metaUrl = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeId}&size=512x512&format=Png&isCircular=false`;
        const metaRes = await fetch(metaUrl);

        if (!metaRes.ok) {
            throw new Error(`Roblox API returned ${metaRes.status}`);
        }

        const metaData = await metaRes.json();
        const finalImageUrl = metaData?.data?.[0]?.imageUrl;

        if (!finalImageUrl) {
            return new Response("Image not found on Roblox", {
                status: 404,
                headers: { "Access-Control-Allow-Origin": "*" }
            });
        }

        // 2. Fetch the actual image content
        const imageRes = await fetch(finalImageUrl);
        if (!imageRes.ok) {
            throw new Error(`Failed to fetch image content: ${imageRes.status}`);
        }

        const imageBody = imageRes.body;

        // 3. Stream it back with CORS and Cache headers
        return new Response(imageBody, {
            headers: {
                "Content-Type": "image/png",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=3600, s-maxage=3600", // Cache for 1 hour on CDN and browser
            }
        });

    } catch (e: any) {
        return new Response(`Proxy Error: ${e.message}`, {
            status: 500,
            headers: { "Access-Control-Allow-Origin": "*" }
        });
    }
});
