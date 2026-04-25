'use client'

import { LayoutDashboard, Gamepad2, LogOut, Settings, User, Hammer, Bell, Book, Palette } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-context"
import { logout } from "@/app/actions"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { ThemeBrowser } from "@/components/theme-browser"
import { useState } from "react"


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [themeBrowserOpen, setThemeBrowserOpen] = useState(false)
    const { dualToneIcons } = useTheme()

    // Check ban and maintenance status on client side
    useEffect(() => {
        // Check Ban
        fetch('/api/check-ban').then(res => {
            if (res.status === 403) {
                window.location.href = '/banned'
            }
        })

        // Check Maintenance
        fetch('/api/check-maintenance').then(res => {
            if (res.status === 503) {
                window.location.href = '/maintenance'
            }
        })
    }, [])

    const navItems = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/dashboard/games", icon: Gamepad2, label: "Games" },
        { href: "/dashboard/moderator", icon: Hammer, label: "Moderator", adminOnly: true }, // Protected route
        { href: "/dashboard/rules", icon: Book, label: "Rules" },
        { href: "/dashboard/profile", icon: User, label: "Profile" },
    ]

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 relative overflow-hidden">
            <NateWatermark />
            {/* Ultra-Premium Glass Dock */}
            <aside className="
                fixed z-50 rounded-[2.5rem] border border-white/10 bg-card/75 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500 hover:scale-[1.02] group ring-1 ring-white/5 overflow-visible flex items-center
                
                md:left-8 md:top-1/2 md:-translate-y-1/2 md:h-fit md:w-[5.5rem] md:flex-col md:py-8 md:gap-0
                
                max-md:bottom-6 max-md:left-1/2 max-md:-translate-x-1/2 max-md:w-[90%] max-md:h-20 max-md:flex-row max-md:justify-between max-md:px-6 max-md:bg-card/90
            ">

                {/* Cinematic Ambient Glow Behind */}
                <div className="absolute -inset-4 bg-blue-500/20 blur-3xl -z-10 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />

                {/* Logo - Embedded Gem (Hidden on Mobile for Space) */}
                <div className="relative group/logo cursor-pointer max-md:hidden mb-8">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover/logo:opacity-50 transition-opacity duration-500" />
                    <div className="w-12 h-12 rounded-2xl border border-white/10 flex items-center justify-center shadow-inner ring-1 ring-white/10 relative overflow-hidden bg-black/50">
                        <img src="/logo.png" alt="Cryllix Logo" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Separator (Desktop) */}
                <div className="max-md:hidden w-8 h-[1px] bg-white/10 mb-8" />

                {/* Navigation Pucks */}
                <nav className="flex md:flex-col gap-6 w-full items-center justify-center max-md:flex-row max-md:gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "relative w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 group/item overflow-visible",
                                    isActive
                                        ? "text-white"
                                        : "text-slate-400 hover:text-white"
                                )}
                                title={item.label}
                            >
                                {/* Active State Background Blob */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-blue-600 rounded-[1.25rem] shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-100 transition-all duration-500 -z-10 animate-in fade-in zoom-in-50" />
                                )}

                                {/* Hover Effect for Inactive */}
                                {!isActive && (
                                    <div className="absolute inset-0 bg-white/5 rounded-[1.25rem] scale-0 opacity-0 group-hover/item:scale-100 group-hover/item:opacity-100 transition-all duration-300 -z-10" />
                                )}

                                <item.icon
                                    className={cn(
                                        "w-6 h-6 transition-transform duration-300 group-hover/item:scale-110",
                                        dualToneIcons && "fill-primary/20"
                                    )}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />

                                {/* Active Indicator Dot (Desktop Only) */}
                                {isActive && (
                                    <div className="max-md:hidden absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-400 rounded-full blur-[2px] shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
                                )}

                                {/* Active Indicator Dot (Mobile - Bottom) */}
                                {isActive && (
                                    <div className="md:hidden absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_white]" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom Actions Container */}
                <div className="flex md:flex-col gap-5 w-full items-center md:mt-8 max-md:w-auto max-md:flex-row">
                    {/* Separator (Desktop) */}
                    <div className="max-md:hidden w-8 h-[1px] bg-white/10" />

                    {/* Settings Link (Moved to Bottom) */}
                    <Link
                        href="/dashboard/settings"
                        className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group/settings"
                        title="Settings"
                    >
                        <div className={cn(
                            "absolute inset-0 rounded-full transition-all duration-300",
                            pathname === "/dashboard/settings" ? "bg-white/10" : "scale-0 group-hover/settings:scale-100 bg-white/5"
                        )} />
                        <Settings
                            className={cn(
                                "h-5 w-5 transition-all duration-500 group-hover/settings:rotate-90",
                                pathname === "/dashboard/settings" ? "text-white" : "text-slate-400 group-hover/settings:text-white",
                                dualToneIcons && "fill-primary/20"
                            )}
                        />
                    </Link>

                    {/* Integrated Notification Bell */}
                    <div className="relative group/bell w-10 h-10 flex items-center justify-center cursor-pointer">
                        <div className="absolute inset-0 bg-white/5 rounded-full scale-0 group-hover/bell:scale-100 transition-transform duration-300" />
                        <Bell className="h-5 w-5 text-slate-400 group-hover/bell:text-white transition-colors duration-300" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0f0f1e] animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                    </div>

                    {/* Theme Browser Trigger */}
                    <button
                        onClick={() => setThemeBrowserOpen(true)}
                        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group/theme relative"
                        title="Change Theme"
                    >
                        <div className="absolute inset-0 bg-primary/0 group-hover/theme:bg-primary/20 rounded-full transition-colors duration-300" />
                        <Palette className="h-5 w-5 text-slate-400 group-hover/theme:text-primary transition-colors duration-300" />
                    </button>

                    {/* Separator (Mobile) */}
                    <div className="md:hidden w-[1px] h-8 bg-white/10" />

                    <form action={logout}>
                        <button
                            type="submit"
                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group/logout relative"
                            title="Logout"
                        >
                            <div className="absolute inset-0 bg-red-500/0 group-hover/logout:bg-red-500/10 rounded-full transition-colors duration-300" />
                            <LogOut className="h-5 w-5 text-slate-500 group-hover/logout:text-red-400 transition-colors duration-300" strokeWidth={2} />
                        </button>
                    </form>
                </div>
            </aside>

            <ThemeBrowser open={themeBrowserOpen} onOpenChange={setThemeBrowserOpen} />

            {/* Nate's Exclusive Watermark */}
            {/* We can check DOM or context here since this is a client component, but we need access to theme context 
                Wait, Layout doesn't have useTheme hook usage yet. We need to import it. 
                Actually, this Layout defines the providers but is ALSO a client component.
                Usually Layouts wrap children in Context. If this Layout is inside the Context provider (from RootLayout), we can use useTheme.
                Assuming RootLayout provides ThemeContext. Let's verify imports first.
            */}
            {/* Main Content Area - Shifted for floating sidebar */}
            <main className="flex-1 md:ml-32 max-md:mb-32 p-8 overflow-y-auto h-screen scrollbar-hide">
                <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {children}
                </div>
            </main>
        </div>
    )
}

function NateWatermark() {
    const { theme } = useTheme()

    if (theme !== 'nate') return null

    return (
        <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
            <h1 className="text-[15vw] font-black text-white/[0.03] -rotate-12 whitespace-nowrap select-none">
                NateDaPlayer
            </h1>
        </div>
    )
}
