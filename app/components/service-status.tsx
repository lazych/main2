import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Server, Shield, CheckCircle2, XCircle, Activity } from "lucide-react"
import { getRedisStatus } from "@/lib/redis"
import { prisma } from "@/lib/prisma"

export async function ServiceStatus() {
    // Check Redis Status
    const isRedisAlive = await getRedisStatus();

    // Check Database Status (Prisma)
    let isPostgresAlive = false;
    try {
        await prisma.$queryRaw`SELECT 1`;
        isPostgresAlive = true;
    } catch {
        isPostgresAlive = false;
    }

    // Auth System (If DB is up, auth is likely up)
    const isAuthAlive = isPostgresAlive;

    const services = [
        {
            name: "Main Database",
            icon: Database,
            status: isPostgresAlive,
            desc: "PostgreSQL Cluster"
        },
        {
            name: "Game Management Database",
            icon: Server,
            status: isRedisAlive,
            desc: "Valkey / Redis Mesh"
        },
        {
            name: "Authentication",
            icon: Shield,
            status: isAuthAlive,
            desc: "Identity Provider"
        }
    ]

    return (
        <section className="container mx-auto px-4 pb-24 relative z-10 w-full max-w-6xl">
            <div className="flex flex-col items-center mb-12 animate-in slide-in-from-bottom-5 fade-in duration-700 delay-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground mb-4">
                    <Activity className="h-4 w-4 animate-pulse text-green-400" />
                    <span>Live Systems Status</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                    Operational Integrity
                </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {services.map((service, i) => (
                    <Card key={service.name} className={`bg-black/40 border-white/10 backdrop-blur-sm hover:bg-white/5 transition-colors overflow-hidden animate-in fade-in zoom-in-50 duration-700 delay-${(i + 4) * 100}`}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/5">
                                    <service.icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="space-y-0.5">
                                    <CardTitle className="text-base font-medium">{service.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{service.desc}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    {service.status ? (
                                        <>
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            <span className="text-sm font-medium text-green-400">Operational</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="relative flex h-2 w-2">
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                            </span>
                                            <span className="text-sm font-medium text-red-400">Downtime</span>
                                        </>
                                    )}
                                </div>
                                {service.status ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500/50" />
                                ) : (
                                    <XCircle className="h-5 w-5 text-red-500/50" />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}
