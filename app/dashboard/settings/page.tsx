"use client"

import { useTheme } from "@/components/theme-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Monitor, Eye, EyeOff, ShieldAlert } from "lucide-react"

export default function SettingsPage() {
    const { streamerMode, setStreamerMode } = useTheme()

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-4xl font-black tracking-tight text-white mb-2">Settings</h1>
                <p className="text-slate-400 text-lg">Manage your dashboard preferences and privacy.</p>
            </div>

            <div className="grid gap-6">
                {/* Privacy & Streaming Card */}
                <section className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
                            <Monitor className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Streaming & Privacy</h2>
                            <p className="text-slate-400 text-sm">Tools for content creators.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="streamer-mode" className="text-base font-medium text-white cursor-pointer">
                                    Streamer Mode
                                </Label>
                                {streamerMode ? (
                                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
                                ) : (
                                    <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full font-bold">INACTIVE</span>
                                )}
                            </div>
                            <p className="text-sm text-slate-400">
                                Disables "Anti-Snoop" blur and screenshot censorship mechanics.
                            </p>
                        </div>
                        <Switch
                            id="streamer-mode"
                            checked={streamerMode}
                            onCheckedChange={setStreamerMode}
                            className="data-[state=checked]:bg-purple-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className={`p-4 rounded-xl border border-white/5 transition-all ${!streamerMode ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-900/40 opacity-50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <EyeOff className="w-4 h-4 text-blue-400" />
                                <h3 className="font-bold text-blue-100">Anti-Snoop</h3>
                            </div>
                            <p className="text-xs text-blue-200/70">
                                Blurs the screen when looking specifically at the Games page.
                                <br />
                                <span className={!streamerMode ? "text-green-400" : "text-slate-500"}>
                                    {!streamerMode ? "Enabled" : "Disabled by Mode"}
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Appearance Card */}
                <section className="bg-card/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                            <Eye className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Appearance</h2>
                            <p className="text-slate-400 text-sm">Customize visual flair.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="space-y-1">
                            <Label htmlFor="dual-tone" className="text-base font-medium text-white cursor-pointer">
                                Dual Tone Icons
                            </Label>
                            <p className="text-sm text-slate-400">
                                Adds a subtle fill color to interface icons matching your theme.
                            </p>
                        </div>
                        <Switch
                            id="dual-tone"
                            checked={useTheme().dualToneIcons}
                            onCheckedChange={useTheme().setDualToneIcons}
                            className="data-[state=checked]:bg-blue-600"
                        />
                    </div>
                </section>
            </div>
        </div>
    )
}
