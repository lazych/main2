"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, Loader2, Eye, EyeOff } from "lucide-react"
import { adminResetPassword } from "@/app/actions/admin"
import { toast } from "@/components/ui/use-toast"

interface PasswordResetProps {
    userId: string
    username: string
}

export function PasswordReset({ userId, username }: PasswordResetProps) {
    const [open, setOpen] = useState(false)
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [saving, setSaving] = useState(false)

    const handleSave = async () => {
        if (password.length < 6) {
            toast({
                title: "Invalid Password",
                description: "Password must be at least 6 characters",
                variant: "destructive"
            })
            return
        }

        try {
            setSaving(true)
            await adminResetPassword(userId, password)
            toast({
                title: "Password Reset",
                description: `Successfully changed password for ${username}`,
            })
            setOpen(false)
            setPassword("")
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to reset password",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20">
                    <Key className="h-3 w-3" />
                    Reset Pass
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                        Set a new password for <span className="font-semibold text-foreground">{username}</span>.
                        <br />
                        <span className="text-red-400 text-xs">This will immediately invalidate their current session.</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>New Password</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password..."
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving} variant="destructive">
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Reset Password
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
