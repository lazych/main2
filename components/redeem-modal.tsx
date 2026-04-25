"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function RedeemKeyModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
    const [message, setMessage] = useState("")

    const [formData, setFormData] = useState({
        key: "",
        robloxUsername: "",
        discordId: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setStatus("idle")
        setMessage("")

        try {
            const res = await fetch("/api/keys/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok && data.success) {
                setStatus("success")
                setMessage(`Success! ${data.data.robloxUsername} is now whitelisted on the ${data.data.plan} plan.`)
                setFormData({ key: "", robloxUsername: "", discordId: "" })
            } else {
                setStatus("error")
                setMessage(data.error || "Failed to redeem key")
            }
        } catch (error) {
            setStatus("error")
            setMessage("An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="relative rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] group transform hover:scale-105 active:scale-95 ring-1 ring-white/10"
            >
                <span className="relative z-10 flex items-center gap-2">
                    Redeem Key
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 blur-md" />
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/90 p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
                        {/* Glow effect */}
                        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

                        <div className="relative flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">Redeem Access Key</h2>
                                <p className="text-sm text-zinc-400">Enter your key to whitelist your account.</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-white/10">
                                <X className="h-5 w-5 text-zinc-400" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="relative space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="key" className="text-zinc-300">License Key</Label>
                                <Input
                                    id="key"
                                    placeholder="XXXX-XXXX-XXXX-XXXX"
                                    value={formData.key}
                                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                                    required
                                    className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="roblox" className="text-zinc-300">Roblox Username</Label>
                                <Input
                                    id="roblox"
                                    placeholder="RobloxPlayer123"
                                    value={formData.robloxUsername}
                                    onChange={(e) => setFormData({ ...formData, robloxUsername: e.target.value })}
                                    required
                                    className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discord" className="text-zinc-300">Discord ID</Label>
                                <Input
                                    id="discord"
                                    placeholder="123456789012345678"
                                    value={formData.discordId}
                                    onChange={(e) => setFormData({ ...formData, discordId: e.target.value })}
                                    required
                                    className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50"
                                />
                            </div>

                            {status === "error" && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {message}
                                </div>
                            )}

                            {status === "success" && (
                                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2 animate-in slide-in-from-top-2">
                                    <CheckCircle className="h-4 w-4" />
                                    {message}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Validating...
                                    </>
                                ) : (
                                    "Redeem & Whitelist"
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
