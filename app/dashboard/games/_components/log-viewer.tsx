'use client'

import { useState, useEffect } from 'react'
import { getGameLogs } from '@/app/actions/logs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Log {
    id: string
    content: string
    type: string
    timestamp: Date
    game: {
        name: string
    }
}

export function LogViewer() {
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [autoRefresh, setAutoRefresh] = useState(true)

    const fetchLogs = async () => {
        try {
            const result = await getGameLogs()
            if (result.success && result.logs) {
                setLogs(result.logs)
            }
        } catch (error) {
            console.error("Failed to fetch logs", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
        const interval = setInterval(() => {
            if (autoRefresh) {
                fetchLogs()
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [autoRefresh])

    return (
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Live Logs
                </h3>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={autoRefresh ? "text-green-400" : "text-muted-foreground"}
                    >
                        {autoRefresh ? "Auto-refresh On" : "Auto-refresh Off"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={fetchLogs} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-2 font-mono text-sm">
                    {logs.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10">
                            Waiting for logs...
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex gap-3 hover:bg-white/5 p-2 rounded transition-colors">
                                <span className="text-muted-foreground min-w-[80px] text-xs pt-1">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <div className="flex-1 break-all">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className={`
                                            ${log.type === 'Error' ? 'border-red-500/50 text-red-400 bg-red-500/10' :
                                                log.type === 'Warn' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                                                    'border-blue-500/50 text-blue-400 bg-blue-500/10'}
                                        `}>
                                            {log.type}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground/70">[{log.game.name}]</span>
                                    </div>
                                    <span className="text-gray-300">{log.content}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
