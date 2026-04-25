import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldAlert, Ban, Gavel, FileWarning } from "lucide-react"

export default function RulebookPage() {
    const rules = [
        {
            id: 1,
            title: "No Cross-Infection",
            description: "Do not infect games with other serversides. We maintain a clean ecosystem."
        },
        {
            id: 2,
            title: "Preserve Map Integrity",
            description: "Don't majorly destroy or permanently alter game maps. Keep the experience reversible."
        },
        {
            id: 3,
            title: "No Game Leaks",
            description: "Leaking games is strictly prohibited. Respect developer intellectual property."
        },
        {
            id: 4,
            title: "No Condos/NSFW",
            description: "Absolutely no infection of our serverside with condos (sex games) or NSFW content."
        },
        {
            id: 5,
            title: "Maintain Player Counts",
            description: "Do not intentionally attempt to kill or drasitcally reduce player counts."
        }
    ]

    return (
        <div className="flex min-h-screen flex-col font-sans">
            <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl h-16 rounded-2xl flex items-center justify-between px-6 transition-all duration-300 backdrop-blur-2xl bg-gradient-to-r from-[#0f172a]/80 via-[#1e293b]/80 to-black/80 border border-white/10 ring-1 ring-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] hover:bg-[#0f172a]/90 supports-[backdrop-filter]:bg-[#0f172a]/60">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter cursor-pointer group">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent transition-all group-hover:bg-gradient-to-l group-hover:scale-105 duration-300">Cryllix</span>
                    </div>
                </Link>
                <nav className="flex items-center gap-2">
                    <Link href="/login">
                        <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">Login</Button>
                    </Link>
                    <Link href="/register">
                        <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
                            Register
                        </Button>
                    </Link>
                </nav>
            </header>

            <main className="flex-1 flex flex-col items-center pt-32 pb-20 px-4">
                {/* Header Section */}
                <div className="relative z-10 text-center mb-16 max-w-3xl">
                    <div className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-300 mb-6 backdrop-blur-sm animate-fade-in-up">
                        <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                        Strictly Enforced
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight animate-in slide-in-from-bottom-5 fade-in duration-700">
                        <span className="text-white drop-shadow-2xl">Community</span>
                        <br />
                        <span className="bg-gradient-to-r from-red-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                            Rulebook
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
                        Adhere to these guidelines to maintain your access. We take our community standards seriously.
                    </p>
                </div>

                {/* Rules Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl w-full relative z-10 mb-20">
                    {rules.map((rule, index) => (
                        <Card key={rule.id} className={`group border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/10 animate-in fade-in zoom-in-50 duration-700 delay-${(index + 1) * 100}`}>
                            <CardHeader>
                                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 group-hover:bg-red-500/20 transition-all duration-500 font-bold text-xl">
                                    {rule.id}
                                </div>
                                <CardTitle className="text-xl group-hover:text-red-300 transition-colors">{rule.title}</CardTitle>
                                <CardDescription className="text-muted-foreground/80 text-base leading-relaxed mt-2">
                                    {rule.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                    {/* Last card spans 2 cols if needed, or just fill grid naturally. With 5 items, default layout is fine. */}
                </div>

                {/* Warning Section */}
                <div className="w-full max-w-4xl animate-in slide-in-from-bottom-10 fade-in duration-700 delay-500">
                    <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/50 to-black/50 p-8 md:p-12 text-center backdrop-blur-xl">
                        {/* Background pattern */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                        <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-red-500/10 blur-3xl" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-6 rounded-full bg-red-500/10 p-4 ring-1 ring-red-500/20">
                                <Ban className="h-10 w-10 text-red-500" />
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Zero Tolerance Policy
                            </h2>

                            <p className="max-w-xl text-lg text-red-200/80 mb-8 leading-relaxed">
                                Failure to follow these rules will result in an immediate and <span className="font-bold text-red-400">permanent ban</span> from our platform. There are no warnings and no appeals for major violations.
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center">
                                <Link href="/register">
                                    <Button variant="destructive" className="h-12 px-8 rounded-xl font-semibold shadow-lg shadow-red-900/20 hover:shadow-red-900/40 transition-all">
                                        I Understand
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full border-t border-white/5 py-8 bg-black/40 backdrop-blur-xl relative z-10 mt-auto">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-xs text-muted-foreground/40">
                        © 2024 Cryllix.
                    </p>
                </div>
            </footer>
        </div>
    )
}
