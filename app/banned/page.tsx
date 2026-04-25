"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert, Mail } from "lucide-react"
import { useEffect, useState } from "react"

export default function BannedPage() {
    return (
        <div className="min-h-screen bg-background bg-grid-pattern flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center space-y-8">
                {/* Ban Icon with Glow Effect */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 border-2 border-red-500/30 flex items-center justify-center backdrop-blur-sm">
                            <ShieldAlert className="h-16 w-16 text-red-400" />
                        </div>
                    </div>
                </div>

                {/* Ban Message */}
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                        Account Suspended
                    </h1>
                    <BanReasonDisplay />
                </div>

                {/* Details Card */}
                <div className="glass-card ambient-shadow rounded-2xl p-8 max-w-md mx-auto">
                    <h2 className="text-xl font-semibold mb-4 text-foreground">What does this mean?</h2>
                    <ul className="text-left space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-red-400 mt-1">•</span>
                            <span>You no longer have access to the dashboard</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-400 mt-1">•</span>
                            <span>Your license key has been revoked</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-400 mt-1">•</span>
                            <span>This action may be permanent</span>
                        </li>
                    </ul>
                </div>

                {/* Decorative Element */}
                <div className="flex justify-center gap-2 py-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '200ms' }} />
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '400ms' }} />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                    <Link href="/">
                        <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                            Return Home
                        </Button>
                    </Link>
                    <a href="mailto:support@cryllix.com">
                        <Button size="lg" variant="destructive" className="gap-2 w-full sm:w-auto">
                            <Mail className="h-5 w-5" />
                            Contact Support
                        </Button>
                    </a>
                </div>

                {/* Additional Info */}
                <div className="pt-8 border-t border-white/5">
                    <p className="text-sm text-muted-foreground/60">
                        If you believe this is a mistake, please contact our support team with your account details.
                    </p>
                </div>
            </div>
        </div>
    )
}

function BanReasonDisplay() {
    const [reason, setReason] = useState<string>('Loading...');

    useEffect(() => {
        fetch('/api/check-ban').then(async res => {
            const data = await res.json();
            if (data.reason) {
                setReason(data.reason);
            } else {
                setReason('Violation of terms of service'); // Fallback
            }
        }).catch(() => setReason('Violation of terms of service'));
    }, []);

    return (
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Your account has been suspended.<br />
            <span className="font-semibold text-red-400">Reason: {reason}</span>
        </p>
    )
}
