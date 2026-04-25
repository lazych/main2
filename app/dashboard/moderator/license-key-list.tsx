'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Key, Clock, CheckCircle, XCircle } from 'lucide-react'

interface LicenseKey {
    id: string
    key: string
    isUsed: boolean
    maxUses: number
    usedCount: number
    isActive: boolean
    expiresAt: string | null
    lastUsedAt: string | null
    createdAt: string
    user: { username: string } | null
}

export function LicenseKeyList({ keys }: { keys: LicenseKey[] }) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredKeys = keys.filter(key =>
        key.key.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (key: LicenseKey) => {
        if (!key.isActive) {
            return <Badge variant="destructive">Inactive</Badge>
        }
        if (key.expiresAt && new Date(key.expiresAt) < new Date()) {
            return <Badge variant="destructive">Expired</Badge>
        }
        if (key.usedCount >= key.maxUses) {
            return <Badge variant="secondary">Used</Badge>
        }
        return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center">
                        <Key className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl">All License Keys</CardTitle>
                        <p className="text-sm text-muted-foreground">Total: {keys.length} keys</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <input
                    type="text"
                    placeholder="Search keys..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                />

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {filteredKeys.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No keys found</p>
                    ) : (
                        filteredKeys.map((key) => (
                            <div
                                key={key.id}
                                className="p-3 rounded-lg bg-secondary/50 border border-border hover:bg-secondary/70 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <code className="text-sm font-mono text-primary bg-background px-2 py-0.5 rounded border border-border">
                                                {key.key}
                                            </code>
                                            {getStatusBadge(key)}
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <div>
                                                <span className="font-semibold">Uses:</span> {key.usedCount}/{key.maxUses}
                                            </div>
                                            <div>
                                                <span className="font-semibold">User:</span>{' '}
                                                {key.user ? key.user.username : 'None'}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Created:</span>{' '}
                                                {new Date(key.createdAt).toLocaleDateString()}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Expires:</span>{' '}
                                                {key.expiresAt
                                                    ? new Date(key.expiresAt).toLocaleDateString()
                                                    : 'Never'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
