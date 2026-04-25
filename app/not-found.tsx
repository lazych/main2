import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
            <div className="relative">
                {/* Glowing 404 Text */}
                <h1 className="text-[150px] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 select-none">
                    404
                </h1>
                <div className="absolute inset-0 bg-cyber/20 blur-[100px] -z-10 rounded-full" />
            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">
                Page Not Found
            </h2>

            <p className="mt-4 text-muted-foreground max-w-[400px]">
                Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>

            <div className="mt-2 flex justify-center gap-1">
                <span className="h-1 w-1 rounded-full bg-cyber animate-pulse" />
                <span className="h-1 w-1 rounded-full bg-cyber animate-pulse delay-100" />
                <span className="h-1 w-1 rounded-full bg-cyber animate-pulse delay-200" />
            </div>

            <div className="mt-10 flex items-center gap-4">
                <Link href="/">
                    <Button variant="glow" className="gap-2">
                        <Home className="h-4 w-4" />
                        Go Home
                    </Button>
                </Link>
                <Link href="/dashboard">
                    <Button variant="outline" className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            <div className="mt-20 text-xs text-muted-foreground">
                Need help? <Link href="#" className="text-cyber hover:underline">Contact Support</Link>
            </div>
        </div>
    )
}
