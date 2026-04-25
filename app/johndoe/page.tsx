import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function JohnDoeLandingPage() {
    const session = await getSession();
    let isBanned = false;

    if (session?.userId) {
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { isBanned: true },
        });
        if (user?.isBanned) {
            isBanned = true;
        }
    }

    if (isBanned) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-600 font-mono p-4">
                <h1 className="text-6xl font-black mb-4 glitch-effect">BANNED</h1>
                <p className="text-xl text-gray-500">You have been banned from the John Doe experience.</p>
                <div className="mt-8 p-4 border border-red-900 bg-red-950/20 rounded">
                    <p className="text-sm text-red-400">Reason: Being too serious.</p>
                </div>
                <Link href="/" className="mt-12 text-gray-600 hover:text-white transition-colors underline">
                    Return to Safety
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-yellow-500 font-sans selection:bg-yellow-500 selection:text-black">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="text-2xl font-bold tracking-tighter text-white">
                    JOHN <span className="text-yellow-500">DOE</span>
                </div>
                <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-400">
                    <Link href="#" className="hover:text-yellow-500 transition-colors">FEATURES</Link>
                    <Link href="#" className="hover:text-yellow-500 transition-colors">PRICING</Link>
                    <Link href="#" className="hover:text-yellow-500 transition-colors">DISCORD</Link>
                </div>
                <button className="px-6 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors transform hover:scale-105 active:scale-95">
                    GET ACCESS
                </button>
            </nav>

            {/* Hero Section */}
            <main className="flex flex-col items-center justify-center text-center px-4 mt-20 md:mt-32 max-w-5xl mx-auto">
                <div className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-widest text-black bg-yellow-500 rounded-full">
                    #1 ROBLOX SERVERSIDE
                </div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-tight">
                    THE LEGEND <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                        RETURNS.
                    </span>
                </h1>

                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
                    Dominate every server with the power of John Doe.
                    The most advanced, undetected, and chaotic tool ever created for Roblox.
                    It's not just a script, it's a legacy.
                </p>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button className="px-8 py-4 bg-yellow-500 text-black text-lg font-bold rounded hover:bg-yellow-400 transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        BUY NOW - $20
                    </button>
                    <button className="px-8 py-4 bg-transparent border border-gray-700 text-white text-lg font-bold rounded hover:border-yellow-500 hover:text-yellow-500 transition-all">
                        VIEW FEATURES
                    </button>
                </div>

                {/* Stats / Social Proof */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 w-full border-t border-gray-900 pt-12">
                    <div>
                        <div className="text-3xl font-black text-white">10k+</div>
                        <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">Users</div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-white">99.9%</div>
                        <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">Uptime</div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-white">Lvl 8</div>
                        <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">Execution</div>
                    </div>
                    <div>
                        <div className="text-3xl font-black text-white">0</div>
                        <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">Bans</div>
                    </div>
                </div>
            </main>

            {/* Feature Grid */}
            <section className="max-w-7xl mx-auto px-4 py-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Undetected", desc: "Our bypass methods are constantly updated to stay ahead of Byfron and Hyperion." },
                        { title: "Custom UI", desc: "A sleek, fully customizable user interface that puts power at your fingertips." },
                        { title: "Script Hub", desc: "Access thousands of community-made scripts directly from our cloud database." },
                    ].map((feature, i) => (
                        <div key={i} className="p-8 border border-gray-900 bg-gray-950/50 rounded-xl hover:border-yellow-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-yellow-500/20 transition-colors">
                                <div className="w-6 h-6 bg-yellow-500 rounded-sm" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-900 py-12 text-center text-gray-600 text-sm">
                <p>&copy; 2024 John Doe Serverside. All rights reserved.</p>
                <p className="mt-2">Not affiliated with Roblox Corporation.</p>
            </footer>
        </div>
    );
}
