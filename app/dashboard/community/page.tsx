import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BadgeDisplay } from "@/components/badge-display"
import { prisma } from "@/lib/prisma"
import { Users } from "lucide-react"

export default async function CommunityPage() {
    // Find the Community MVP badge first
    const mvpBadge = await prisma.badge.findFirst({
        where: { name: 'Community MVP' }
    })

    if (!mvpBadge) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Community module not initialized.
            </div>
        )
    }

    // Find users who have this badge
    const mvps = await prisma.user.findMany({
        where: {
            badges: {
                some: {
                    id: mvpBadge.id
                }
            }
        },
        include: {
            badges: true
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Community</h2>
                    <p className="text-muted-foreground">Recognizing our most valuable members.</p>
                </div>
            </div>

            <Card className="border-blue-500/20 bg-blue-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                        <span className="text-2xl">🏆</span>
                        Community MVPs
                    </CardTitle>
                    <CardDescription>
                        Users who have gone above and beyond for the Cryllix community.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {mvps.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mvps.map((user) => (
                                <div key={user.id} className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5 hover:border-blue-500/30 transition-colors group">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center font-bold text-slate-400 group-hover:text-white transition-colors">
                                        {user.username.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold group-hover:text-blue-400 transition-colors">
                                            {user.username}
                                        </p>
                                        <div className="flex gap-1 mt-1">
                                            {user.badges.map(b => (
                                                <div key={b.id} className="scale-75 origin-left">
                                                    <BadgeDisplay badge={b} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-muted-foreground bg-black/20 rounded-xl border border-dashed border-white/10">
                            No Community MVPs awarded yet even though they definitely exist!
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
