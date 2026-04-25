import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Simulate a payload from Roblox
        const mockPayload = {
            gameId: "123456789", // Example ID
            placeId: 123456789,
            name: "Test Game " + Math.floor(Math.random() * 1000),
            playerCount: Math.floor(Math.random() * 100),
            jobId: "test-job-id-" + Date.now()
        };

        // Call the webhook locally
        const response = await fetch('http://localhost:3000/api/webhooks/logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Roblox/WinInet' // Mock User-Agent to pass check
            },
            body: JSON.stringify(mockPayload)
        });

        const data = await response.json();

        return NextResponse.json({
            message: "Test request sent",
            payload: mockPayload,
            response: data
        });

    } catch (error) {
        return NextResponse.json({ error: "Failed to run test" }, { status: 500 });
    }
}
