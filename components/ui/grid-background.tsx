import React from 'react'

interface GridBackgroundProps {
    children: React.ReactNode
    className?: string
}

export function GridBackground({ children, className = '' }: GridBackgroundProps) {
    return (
        <div className={`relative min-h-screen w-full bg-background overflow-hidden ${className}`}>
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none opacity-40" />

            {/* Radial Gradient Overlay for Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,rgba(2,6,23,0)_50%)] pointer-events-none" />

            {/* Floated Orbs for Atmosphere */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}
