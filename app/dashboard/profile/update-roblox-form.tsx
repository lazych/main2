'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateRobloxUsername } from "./actions"
import { useState, useTransition } from "react"
import { Check, Loader2 } from "lucide-react"

export function UpdateRobloxForm({ currentUsername }: { currentUsername: string }) {
    const [username, setUsername] = useState(currentUsername)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess(false)

        if (!username.trim()) {
            setError('Please enter a Roblox username')
            return
        }

        startTransition(async () => {
            try {
                await updateRobloxUsername(username.trim())
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update username')
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="robloxUsername">Roblox Username</Label>
                <Input
                    id="robloxUsername"
                    type="text"
                    placeholder="Enter your Roblox username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isPending}
                    className="max-w-md"
                />
                <p className="text-sm text-muted-foreground">
                    Your Roblox username will be used to identify you in-game
                </p>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Roblox username updated successfully!
                </div>
            )}

            <Button
                type="submit"
                disabled={isPending || username.trim() === currentUsername}
                className="gap-2"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                    </>
                ) : (
                    'Save Username'
                )}
            </Button>
        </form>
    )
}
