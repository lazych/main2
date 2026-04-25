'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Key, Copy, Check, Loader2 } from 'lucide-react'

interface GeneratedKey {
    key: string
    expiresAt: string | null
    maxUses: number
    createdAt: string
}

export function KeyGenerator() {
    const [loading, setLoading] = useState(false)
    const [generatedKey, setGeneratedKey] = useState<GeneratedKey | null>(null)
    const [copied, setCopied] = useState(false)
    const [formData, setFormData] = useState({
        prefix: 'CRYL',
        segments: 4,
        segmentLength: 4,
        expiresInDays: '',
        maxUses: 1,
    })

    const handleGenerate = async () => {
        setLoading(true)
        setCopied(false)

        try {
            const payload: any = {
                prefix: formData.prefix,
                segments: formData.segments,
                segmentLength: formData.segmentLength,
                maxUses: formData.maxUses,
            }

            if (formData.expiresInDays) {
                payload.expiresInDays = parseInt(formData.expiresInDays)
            }

            const response = await fetch('/api/license/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (data.success) {
                setGeneratedKey(data.license)
            } else {
                alert('Failed to generate license key')
            }
        } catch (error) {
            console.error('Error generating key:', error)
            alert('Failed to generate license key')
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = async () => {
        if (generatedKey) {
            await navigator.clipboard.writeText(generatedKey.key)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 flex items-center justify-center">
                        <Key className="h-5 w-5 text-purple-400" />
                    </div>
                    <CardTitle className="text-xl">License Key Generator</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="prefix">Prefix</Label>
                        <Input
                            id="prefix"
                            value={formData.prefix}
                            onChange={(e) =>
                                setFormData({ ...formData, prefix: e.target.value.toUpperCase() })
                            }
                            placeholder="CRYL"
                            className="font-mono"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="maxUses">Max Uses</Label>
                        <Input
                            id="maxUses"
                            type="number"
                            min="1"
                            value={formData.maxUses}
                            onChange={(e) =>
                                setFormData({ ...formData, maxUses: parseInt(e.target.value) || 1 })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="segments">Segments</Label>
                        <Input
                            id="segments"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.segments}
                            onChange={(e) =>
                                setFormData({ ...formData, segments: parseInt(e.target.value) || 4 })
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="segmentLength">Segment Length</Label>
                        <Input
                            id="segmentLength"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.segmentLength}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    segmentLength: parseInt(e.target.value) || 4,
                                })
                            }
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="expiresInDays">Expires In (Days) - Optional</Label>
                        <Input
                            id="expiresInDays"
                            type="number"
                            min="1"
                            value={formData.expiresInDays}
                            onChange={(e) =>
                                setFormData({ ...formData, expiresInDays: e.target.value })
                            }
                            placeholder="Leave empty for no expiration"
                        />
                    </div>
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Key className="mr-2 h-4 w-4" />
                            Generate License Key
                        </>
                    )}
                </Button>

                {generatedKey && (
                    <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30">
                        <div className="flex items-center justify-between">
                            <Label className="text-green-400 font-semibold">Generated Key</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopy}
                                className="border-green-500/30 hover:bg-green-500/10"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-4 w-4 mr-1 text-green-400" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 mr-1" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="p-3 rounded bg-black/40 border border-green-500/20">
                            <code className="text-green-300 font-mono text-sm break-all">
                                {generatedKey.key}
                            </code>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                            <div>
                                <span className="font-semibold">Max Uses:</span> {generatedKey.maxUses}
                            </div>
                            <div>
                                <span className="font-semibold">Expires:</span>{' '}
                                {generatedKey.expiresAt
                                    ? new Date(generatedKey.expiresAt).toLocaleDateString()
                                    : 'Never'}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
