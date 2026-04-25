import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { User, Calendar, Key, Shield } from "lucide-react"
import { UpdateRobloxForm } from "./update-roblox-form"
import { BadgeDisplay } from "@/components/badge-display"

export default async function ProfilePage() {
    const session = await getSession()

    const user = await prisma.user.findUnique({
        where: { id: session?.userId },
        include: {
            licenseKey: true,
            badges: true
        }
    })

    if (!user) {
        return <div>User not found</div>
    }

    return (
        <div className="space-y-12">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Profile</h2>
                        <p className="text-lg text-muted-foreground">Manage your account settings</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Account Information */}
                <Card className="group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Account Information
                        </CardTitle>
                        <CardDescription>Your basic account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Username</Label>
                            <Input
                                value={user.username}
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Member Since
                            </Label>
                            <Input
                                value={new Date(user.createdAt).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                                disabled
                                className="bg-muted/50 cursor-not-allowed"
                            />
                        </div>

                        {user.isModerator && (
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-amber-400" />
                                    <span className="text-sm font-semibold text-amber-400">Moderator Account</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* License Information */}
                <Card className="group">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-primary" />
                            License Information
                        </CardTitle>
                        <CardDescription>Your license key details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">License Key</Label>
                            <Input
                                value={user.licenseKey?.key || 'No license'}
                                disabled
                                className="bg-muted/50 cursor-not-allowed font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">Status</Label>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-sm font-semibold text-green-400">Active</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Badges / Achievements */}
                <Card className="group md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="w-5 h-5 flex items-center justify-center text-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
                            </div>
                            Achievements & Badges
                        </CardTitle>
                        <CardDescription>Your earned badges and awards</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user.badges.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {user.badges.map((badge) => (
                                    <BadgeDisplay key={badge.id} badge={badge} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-white/10">
                                <p>No badges earned yet.</p>
                                <p className="text-sm opacity-50">Participate in events to earn rewards!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Roblox Settings */}
                <Card className="group md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.926 5.076l-7.852-1.021-5.998 15.924 7.852 1.021 5.998-15.924z" />
                            </svg>
                            Roblox Settings
                        </CardTitle>
                        <CardDescription>Connect your Roblox account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UpdateRobloxForm currentUsername={user.robloxUsername || ''} />
                    </CardContent>
                </Card>

                {/* Discord Integration */}

            </div>
        </div>
    )
}
