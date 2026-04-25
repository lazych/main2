"use client"

import { Badge } from "@prisma/client"
import * as Icons from "lucide-react"
import { LucideIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface BadgeDisplayProps {
    badge: Badge
    size?: "sm" | "md" | "lg"
    showText?: boolean // New prop to control text display
}

export function BadgeDisplay({ badge, size = "md", showText = false }: BadgeDisplayProps) {
    // Dynamically get icon, fallback to Award if not found
    // @ts-ignore
    const IconComponent: LucideIcon = Icons[badge.icon.charAt(0).toUpperCase() + badge.icon.slice(1)] || Icons.Award

    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    }

    const containerSize = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-16 h-16"
    }

    const badgeContent = (
        <div className="flex flex-col items-center gap-1">
            <div
                className={`${containerSize[size]} rounded-full flex items-center justify-center border bg-background/50 shadow-sm transition-transform hover:scale-110`}
                style={{
                    borderColor: badge.color,
                    boxShadow: `0 0 10px ${badge.color}40`
                }}
            >
                <IconComponent
                    className={`${sizeClasses[size]}`}
                    style={{ color: badge.color }}
                />
            </div>
            {showText && (
                <div className="text-center">
                    <p className="text-xs font-bold leading-none">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight max-w-[100px] mt-0.5">{badge.description}</p>
                </div>
            )}
        </div>
    )

    if (showText) {
        // If showing text, we don't necessarily need the tooltip as much, but still nice for consistency
        return badgeContent
    }

    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    {badgeContent}
                </TooltipTrigger>
                <TooltipContent side="bottom" className="border-border bg-popover text-popover-foreground">
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
