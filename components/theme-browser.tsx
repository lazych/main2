"use client"

import { useState, useEffect } from "react"
import { useTheme, themes, Theme } from "@/components/theme-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Check, Palette } from "lucide-react"
import { getCurrentUsername } from "@/app/actions/user"
import { toast } from "@/components/ui/use-toast"

interface ThemeBrowserProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ThemeBrowser({ open, onOpenChange }: ThemeBrowserProps) {
    const { theme: currentTheme, setTheme } = useTheme()
    const [username, setUsername] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            getCurrentUsername().then(setUsername)
        }
    }, [open])

    const handleThemeSelect = (themeKey: Theme) => {
        setTheme(themeKey)
        toast({
            title: "Theme Changed",
            description: `Applied ${themes[themeKey].name} theme.`,
        })
    }

    const availableThemes: Theme[] = [
        "default",
        "midnight",
        "neon",
        "sunset",
        "forest",
        "ocean"
    ]

    if (username === 'NateDaPlayerYT') {
        availableThemes.push('nate')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] bg-background/80 backdrop-blur-xl border-white/10 text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <Palette className="w-6 h-6 text-primary" />
                        Theme Browser
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {availableThemes.map((themeKey) => {
                        const themeData = themes[themeKey]
                        const isActive = currentTheme === themeKey

                        return (
                            <button
                                key={themeKey}
                                onClick={() => handleThemeSelect(themeKey)}
                                className={cn(
                                    "relative group overflow-hidden rounded-xl border-2 transition-all duration-300 text-left p-4 h-40",
                                    isActive
                                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                                        : "border-white/5 hover:border-white/20 bg-white/5 hover:bg-white/10"
                                )}
                            >
                                <div className="flex justify-between items-start z-10 relative">
                                    <div>
                                        <h3 className={cn(
                                            "text-lg font-semibold transition-colors",
                                            isActive ? "text-primary" : "text-foreground"
                                        )}>
                                            {themeData.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {themeKey === 'default' ? 'Original sleek design' :
                                                themeKey === 'midnight' ? 'Deep space aesthetic' :
                                                    themeKey === 'neon' ? 'High contrast cyber' :
                                                        themeKey === 'sunset' ? 'Warm sunset vibes' :
                                                            themeKey === 'forest' ? 'Enchanted nature' :
                                                                themeKey === 'ocean' ? 'Deep sea mystery' :
                                                                    'nate exclusive'}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                {/* Color Preview Swatches */}
                                <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                                    <div
                                        className="w-8 h-8 rounded-full border border-white/10 shadow-lg"
                                        style={{ backgroundColor: `hsl(${themeData.colors['--background']})` }}
                                        title="Background"
                                    />
                                    <div
                                        className="w-8 h-8 rounded-full border border-white/10 shadow-lg"
                                        style={{ backgroundColor: `hsl(${themeData.colors['--card']})` }}
                                        title="Card"
                                    />
                                    <div
                                        className="w-8 h-8 rounded-full border border-white/10 shadow-lg"
                                        style={{ backgroundColor: `hsl(${themeData.colors['--primary']})` }}
                                        title="Primary"
                                    />
                                    <div
                                        className="w-8 h-8 rounded-full border border-white/10 shadow-lg"
                                        style={{ backgroundColor: `hsl(${themeData.colors['--accent']})` }}
                                        title="Accent"
                                    />
                                </div>

                                {/* Background Decorative Gradient using theme colors */}
                                <div
                                    className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                                    style={{
                                        background: `linear-gradient(135deg, hsl(${themeData.colors['--background']}) 0%, hsl(${themeData.colors['--primary']}) 100%)`
                                    }}
                                />
                            </button>
                        )
                    })}
                </div>
            </DialogContent>
        </Dialog>
    )
}

