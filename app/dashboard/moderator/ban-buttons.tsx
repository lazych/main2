'use client'

import { Button } from "@/components/ui/button"
import { Hammer, ShieldCheck, Ghost, RefreshCw, TriangleAlert } from "lucide-react"
import { banUser, unbanUser, toggleShadowban, resetUserPassword, toggleFakeMaintenance } from "./actions"
import { useTransition } from "react"

export function BanButton({ userId, username }: { userId: string; username: string }) {
    const [isPending, startTransition] = useTransition()

    const handleBan = () => {
        const reason = prompt(`Enter a reason for banning ${username} (optional):`, "Violation of terms of service");
        if (reason !== null && confirm(`Are you sure you want to ban ${username} for: "${reason}"? They will lose access to the dashboard immediately.`)) {
            startTransition(async () => {
                await banUser(userId, reason)
            })
        }
    }

    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={handleBan}
            disabled={isPending}
            className="gap-2"
        >
            <Hammer className="h-4 w-4" />
            {isPending ? 'Banning...' : 'Ban User'}
        </Button>
    )
}

export function UnbanButton({ userId, username }: { userId: string; username: string }) {
    const [isPending, startTransition] = useTransition()

    const handleUnban = () => {
        if (confirm(`Are you sure you want to unban ${username}? They will regain access to the dashboard.`)) {
            startTransition(async () => {
                await unbanUser(userId)
            })
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleUnban}
            disabled={isPending}
            className="gap-2 border-green-500/30 text-green-400 hover:bg-green-500/10"
        >
            <ShieldCheck className="h-4 w-4" />
            {isPending ? 'Unbanning...' : 'Unban User'}
        </Button>
    )
}

export function ShadowbanButton({ userId, username, isShadowBanned }: { userId: string; username: string; isShadowBanned: boolean }) {
    const [isPending, startTransition] = useTransition()

    const handleAction = () => {
        const action = isShadowBanned ? 'unshadowban' : 'shadowban';
        if (confirm(`Are you sure you want to ${action} ${username}? They will see no games.`)) {
            startTransition(async () => {
                await toggleShadowban(userId)
            })
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleAction}
            disabled={isPending}
            className={`gap-2 ${isShadowBanned ? 'border-purple-500/30 text-purple-400 hover:bg-purple-500/10' : 'border-gray-500/30 text-gray-400 hover:bg-gray-500/10'}`}
        >
            <Ghost className="h-4 w-4" />
            {isPending ? '...' : (isShadowBanned ? 'Unshadowban' : 'Shadowban')}
        </Button>
    )
}

export function ResetPasswordButton({ userId, username }: { userId: string; username: string }) {
    const [isPending, startTransition] = useTransition()

    const handleReset = () => {
        if (confirm(`Are you sure you want to reset password for ${username}? It will be set to 'Changed123!'.`)) {
            startTransition(async () => {
                await resetUserPassword(userId)
                alert(`Password for ${username} reset to 'Changed123!'`)
            })
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isPending}
            className="gap-2 text-muted-foreground hover:text-white"
        >
            <RefreshCw className="h-4 w-4" />
            {isPending ? 'Resetting...' : 'Reset Pwd'}
        </Button>
    )
}

export function FakeMaintenanceButton({ userId, username, isFakeMaintenance }: { userId: string; username: string; isFakeMaintenance: boolean }) {
    const [isPending, startTransition] = useTransition()

    const handleAction = () => {
        const action = isFakeMaintenance ? 'disable fake maintenance for' : 'enable fake maintenance for';
        if (confirm(`Are you sure you want to ${action} ${username}? They will see a maintenance page.`)) {
            startTransition(async () => {
                await toggleFakeMaintenance(userId)
            })
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleAction}
            disabled={isPending}
            className={`gap-2 ${isFakeMaintenance ? 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10' : 'border-gray-500/30 text-gray-400 hover:bg-gray-500/10'}`}
        >
            <TriangleAlert className="h-4 w-4" />
            {isPending ? '...' : (isFakeMaintenance ? 'Un-Maintain' : 'Fake Maint')}
        </Button>
    )
}
