"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export function ReloadButton() {
    const router = useRouter()
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        router.refresh()

        // Add a small artificial delay so the animation plays long enough to be felt
        // (router.refresh is often too fast locally)
        setTimeout(() => {
            setIsRefreshing(false)
        }, 750)
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2 bg-black/40 border-white/10 hover:bg-white/10 transition-all font-mono text-xs uppercase tracking-wider"
        >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
    )
}
