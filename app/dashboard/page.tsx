import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ServiceStatus } from "@/app/components/service-status"
import { Button } from "@/components/ui/button"
import { ExternalLink, Zap, Shield, Activity, User } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
    const session = await getSession()
    const user = await prisma.user.findUnique({
        where: { id: session?.userId },
        include: { licenseKey: true }
    })

    return (
        <div className="space-y-12 h-full flex flex-col">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Command Center
                </h2>
                <p className="text-lg text-muted-foreground">
                    Welcome, <span className="text-blue-400 font-semibold">{user?.username}</span>, get ready to troll!
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="group overflow-hidden border-white/10 bg-black/40 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">License Status</CardTitle>
                        <Shield className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">Active</div>
                        <p className="text-xs text-muted-foreground mt-1 truncate font-mono opacity-70">
                            {user?.licenseKey?.key}
                        </p>
                    </CardContent>
                </Card>

                <Card className="group overflow-hidden border-white/10 bg-black/40 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Access Level</CardTitle>
                        <Zap className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">Premium Tier</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Full script execution enabled
                        </p>
                    </CardContent>
                </Card>

                <Card className="group overflow-hidden border-white/10 bg-black/40 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Roblox Account</CardTitle>
                        <User className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white truncate">
                            {user?.robloxUsername || "Not Linked"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Connected Identity
                        </p>
                    </CardContent>
                </Card>

                <Card className="group overflow-hidden border-white/10 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-200">Quick Actions</CardTitle>
                        <Activity className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Link href="/dashboard/games" className="block">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-blue-300 hover:text-blue-200 hover:bg-blue-500/20">
                                <ExternalLink className="mr-2 h-3 w-3" />
                                View Active Games
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-semibold border-b border-white/10 pb-2">System Status</h3>
                <ServiceStatus />
            </div>
        </div>
    )
}

