"use server"

export async function getGameThumbnailUrl(id: string): Promise<string | null> {
    if (!id) return null

    try {
        // Fetch using the specific endpoint requested by the user
        const res = await fetch(
            `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${id}&size=512x512&format=Png&isCircular=false`,
            { next: { revalidate: 3600 } }
        )

        if (res.ok) {
            const data = await res.json()
            if (data?.data?.[0]?.imageUrl) {
                return data.data[0].imageUrl
            }
        }
    } catch (error) {
        console.error("Error fetching Roblox thumbnail:", error)
    }

    return null
}
