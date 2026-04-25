'use client'

import { useEffect, useState } from 'react'

export default function MaintenancePage() {
    const [message, setMessage] = useState('We are currently performing scheduled upgrades to improve your experience.')

    useEffect(() => {
        fetch('/api/check-maintenance').then(async (res) => {
            const data = await res.json()
            if (data.message) setMessage(data.message)
        })
    }, [])

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white p-4 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full" />

            <div className="z-10 text-center space-y-6 max-w-lg">
                <div className="relative w-20 h-20 mx-auto mb-8">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl animate-pulse" />
                    <div className="w-full h-full rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-center relative overflow-hidden">
                        <img src="/logo.png" alt="Cryllix" className="w-16 h-16 object-contain opacity-80" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                        System Maintenance
                    </h1>
                    <p className="text-muted-foreground text-lg px-4">
                        {message}
                    </p>
                </div>

                <div className="pt-8 flex flex-col gap-4 items-center">
                    <div className="flex items-center gap-2 text-sm text-blue-400 font-mono bg-blue-950/20 px-4 py-2 rounded-full border border-blue-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        STATUS: UPGRADING INFRASTRUCTURE
                    </div>

                    <p className="text-sm text-muted-foreground/50">
                        Estimated uptime: Soon™
                    </p>
                </div>
            </div>

            {/* Grid Pattern overlay */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>
    )
}
