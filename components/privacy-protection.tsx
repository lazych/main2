"use client"

import { useEffect, useState } from "react"
import { EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-context"
import { usePathname } from "next/navigation"

export function PrivacyProtection() {
    const [isBlurred, setIsBlurred] = useState(false)
    const { streamerMode } = useTheme()
    const pathname = usePathname()

    useEffect(() => {
        // Streamer mode logic handled nicely via just removing the features
        // Current state:
        // - Anti-Snoop (Blur): REMOVED
        // - Capture Guard (Flash): REMOVED
    }, [])

    return (
        <>
            {/* Privacy Features Removed */}
        </>
    )
}
