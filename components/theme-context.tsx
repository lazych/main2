"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { getCurrentUsername } from "@/app/actions/user"

export type Theme = "default" | "midnight" | "neon" | "sunset" | "forest" | "ocean" | "nate"

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    streamerMode: boolean
    setStreamerMode: (enabled: boolean) => void
    dualToneIcons: boolean
    setDualToneIcons: (enabled: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}

export const themes: Record<Theme, { name: string; colors: Record<string, string> }> = {
    default: {
        name: "Cryllix Blue",
        colors: {
            "--background": "222 47% 11%",
            "--foreground": "210 40% 98%",
            "--card": "222 47% 11%",
            "--card-foreground": "210 40% 98%",
            "--popover": "222 47% 11%",
            "--popover-foreground": "210 40% 98%",
            "--primary": "221 83% 53%",
            "--primary-foreground": "210 40% 98%",
            "--secondary": "217 33% 17%",
            "--secondary-foreground": "210 40% 98%",
            "--muted": "217 33% 17%",
            "--muted-foreground": "215 20% 65%",
            "--accent": "217 33% 17%",
            "--accent-foreground": "210 40% 98%",
            "--destructive": "0 84% 60%",
            "--destructive-foreground": "210 40% 98%",
            "--border": "217 33% 17%",
            "--input": "217 33% 17%",
            "--ring": "221 83% 53%",
        },
    },
    midnight: {
        name: "Midnight Force",
        colors: {
            "--background": "260 60% 5%",
            "--foreground": "260 20% 98%",
            "--card": "260 50% 10%",
            "--card-foreground": "260 20% 98%",
            "--popover": "260 50% 10%",
            "--popover-foreground": "260 20% 98%",
            "--primary": "265 89% 66%",
            "--primary-foreground": "260 20% 98%",
            "--secondary": "260 30% 20%",
            "--secondary-foreground": "260 20% 98%",
            "--muted": "260 30% 20%",
            "--muted-foreground": "260 20% 70%",
            "--accent": "260 30% 20%",
            "--accent-foreground": "260 20% 98%",
            "--destructive": "0 84% 60%",
            "--destructive-foreground": "260 20% 98%",
            "--border": "260 30% 20%",
            "--input": "260 30% 20%",
            "--ring": "265 89% 66%",
        },
    },
    neon: {
        name: "Neon City",
        colors: {
            "--background": "0 0% 0%",
            "--foreground": "120 100% 97%",
            "--card": "0 0% 5%",
            "--card-foreground": "120 100% 97%",
            "--popover": "0 0% 5%",
            "--popover-foreground": "120 100% 97%",
            "--primary": "142 70% 50%", // Neon Green
            "--primary-foreground": "0 0% 0%",
            "--secondary": "0 0% 12%",
            "--secondary-foreground": "120 100% 97%",
            "--muted": "0 0% 12%",
            "--muted-foreground": "120 60% 70%",
            "--accent": "310 80% 55%", // Neon Pink
            "--accent-foreground": "0 0% 98%",
            "--destructive": "0 90% 60%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "142 70% 20%",
            "--input": "142 70% 15%",
            "--ring": "142 70% 50%",
        },
    },
    sunset: {
        name: "Sunset Drive",
        colors: {
            "--background": "280 40% 10%",
            "--foreground": "20 20% 98%",
            "--card": "280 35% 15%",
            "--card-foreground": "20 20% 98%",
            "--popover": "280 35% 15%",
            "--popover-foreground": "20 20% 98%",
            "--primary": "20 90% 60%", // Orange
            "--primary-foreground": "280 40% 10%",
            "--secondary": "280 30% 20%",
            "--secondary-foreground": "20 20% 98%",
            "--muted": "280 30% 25%",
            "--muted-foreground": "280 20% 75%",
            "--accent": "320 70% 60%", // Pinkish Purple
            "--accent-foreground": "20 20% 98%",
            "--destructive": "0 84% 60%",
            "--destructive-foreground": "210 40% 98%",
            "--border": "280 30% 25%",
            "--input": "280 30% 20%",
            "--ring": "20 90% 60%",
        },
    },
    forest: {
        name: "Enchanted Forest",
        colors: {
            "--background": "150 50% 5%",
            "--foreground": "150 20% 98%",
            "--card": "150 40% 8%",
            "--card-foreground": "150 20% 98%",
            "--popover": "150 40% 8%",
            "--popover-foreground": "150 20% 98%",
            "--primary": "140 70% 50%", // Emerald
            "--primary-foreground": "150 50% 5%",
            "--secondary": "150 30% 15%",
            "--secondary-foreground": "150 20% 98%",
            "--muted": "150 30% 15%",
            "--muted-foreground": "150 20% 70%",
            "--accent": "45 90% 60%", // Golden sunlight
            "--accent-foreground": "150 50% 5%",
            "--destructive": "0 84% 60%",
            "--destructive-foreground": "210 40% 98%",
            "--border": "150 30% 15%",
            "--input": "150 30% 10%",
            "--ring": "140 70% 50%",
        }
    },
    ocean: {
        name: "Deep Ocean",
        colors: {
            "--background": "210 60% 7%",
            "--foreground": "200 20% 98%",
            "--card": "210 50% 12%",
            "--card-foreground": "200 20% 98%",
            "--popover": "210 50% 12%",
            "--popover-foreground": "200 20% 98%",
            "--primary": "190 90% 50%", // Cyan
            "--primary-foreground": "210 60% 7%",
            "--secondary": "210 30% 20%",
            "--secondary-foreground": "200 20% 98%",
            "--muted": "210 30% 20%",
            "--muted-foreground": "200 20% 70%",
            "--accent": "260 60% 60%", // Purple reef
            "--accent-foreground": "200 20% 98%",
            "--destructive": "0 84% 60%",
            "--destructive-foreground": "210 40% 98%",
            "--border": "210 30% 20%",
            "--input": "210 30% 15%",
            "--ring": "190 90% 50%",
        }
    },
    nate: {
        name: "NateDaPlayerYT",
        colors: {
            "--background": "220 60% 8%", // Darker, rich blue bg
            "--foreground": "0 0% 100%",
            "--card": "220 50% 13%",
            "--card-foreground": "0 0% 100%",
            "--popover": "220 50% 13%",
            "--popover-foreground": "0 0% 100%",
            "--primary": "210 100% 56%", // Same specialized blue as badge (#1E90FF -> ~210 100 56)
            "--primary-foreground": "0 0% 100%",
            "--secondary": "220 40% 20%",
            "--secondary-foreground": "0 0% 100%",
            "--muted": "220 40% 20%",
            "--muted-foreground": "220 20% 70%",
            "--accent": "210 100% 56%",
            "--accent-foreground": "0 0% 100%",
            "--destructive": "0 84% 60%",
            "--destructive-foreground": "0 0% 100%",
            "--border": "210 100% 56%", // Blue borders
            "--input": "220 40% 15%",
            "--ring": "210 100% 56%",
        }
    },

}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, _setTheme] = useState<Theme>("default")
    const [mounted, setMounted] = useState(false)
    const [streamerMode, setStreamerMode] = useState(false)
    const [dualToneIcons, setDualToneIcons] = useState(false)

    // Load theme and settings from localStorage on mount
    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem("theme") as Theme
        if (savedTheme && themes[savedTheme]) {
            _setTheme(savedTheme)
        }

        const savedStreamerMode = localStorage.getItem('streamerMode') === 'true'
        setStreamerMode(savedStreamerMode)

        const savedDualTone = localStorage.getItem('dualToneIcons') === 'true'
        setDualToneIcons(savedDualTone)

        // Enforce Nate Theme for NateDaPlayerYT
        getCurrentUsername().then(username => {
            if (username === 'NateDaPlayerYT') {
                _setTheme('nate')
            }
        })
    }, [])

    // Update CSS variables when theme changes
    useEffect(() => {
        if (!mounted) return

        const root = document.documentElement
        const themeColors = themes[theme].colors

        // Apply all colors from the theme definition
        Object.entries(themeColors).forEach(([property, value]) => {
            root.style.setProperty(property, value)
        })

        localStorage.setItem("theme", theme)
    }, [theme, mounted])

    // Persist Streamer Mode
    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('streamerMode', String(streamerMode))
    }, [streamerMode, mounted])

    // Persist Dual Tone
    useEffect(() => {
        if (!mounted) return
        localStorage.setItem('dualToneIcons', String(dualToneIcons))
    }, [dualToneIcons, mounted])

    const setTheme = (newTheme: Theme) => {
        _setTheme(newTheme)
    }

    // Prevent hydration mismatch by rendering children only after mount, 
    // or just accept initial flash. Better to accept flash but keep content visible.
    // For specific CSS vars, we rely on CSS to have defaults until JS loads.

    const value = {
        theme,
        setTheme,
        streamerMode,
        setStreamerMode,
        dualToneIcons,
        setDualToneIcons
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}
