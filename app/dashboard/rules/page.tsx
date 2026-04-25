'use client'

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Ban } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardRulesPage() {
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                    Community Rulebook
                </h1>
                <p className="text-muted-foreground">
                    Strict rules that must be followed to maintain your access to Cryllix.
                </p>
            </div>

            {/* Rules Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rules.map((rule, index) => (
                    <Card key={rule.id} className="group border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/10">
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
            </div>

            {/* Warning Section */}
            <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/20 to-black/50 p-8 text-center backdrop-blur-xl">
                {/* Background pattern */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-6 rounded-full bg-red-500/10 p-4 ring-1 ring-red-500/20">
                        <Ban className="h-8 w-8 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">
                        Zero Tolerance Policy
                    </h2>

                    <p className="max-w-xl text-red-200/80 mb-6 leading-relaxed">
                        Failure to follow these rules will result in an immediate and <span className="font-bold text-red-400">permanent ban</span>.
                    </p>

                    <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        I Understand & Agree
                    </Button>
                </div>
            </div>
        </div>
    )
}
