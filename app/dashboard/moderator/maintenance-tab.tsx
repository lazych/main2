'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toggleGlobalMaintenance, backupDatabase, getGlobalMaintenanceStatus, restoreDatabase } from "./actions"
import { useState, useEffect } from "react"
import { AlertTriangle, Database, Power, Download, RefreshCw, Upload } from "lucide-react"

export function MaintenanceTab() {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isBackingUp, setIsBackingUp] = useState(false)

    const [message, setMessage] = useState('We are currently performing scheduled upgrades to improve your experience.')

    useEffect(() => {
        getGlobalMaintenanceStatus().then((result) => {
            setIsMaintenanceMode(result.isActive)
            if (result.message) setMessage(result.message)
            setIsLoading(false)
        })
    }, [])

    const handleToggleMaintenance = async () => {
        const action = isMaintenanceMode ? 'disable' : 'enable'
        if (confirm(`Are you sure you want to ${action} GLOBAL MAINTENANCE? access to the dashboard will be restricted.`)) {
            setIsLoading(true)
            const newState = await toggleGlobalMaintenance(message)
            setIsMaintenanceMode(newState)
            setIsLoading(false)
        }
    }

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!confirm('WARNING: Importing a database will merge data into the current database. Existing entries with matching IDs will be overwritten. Continue?')) {
            e.target.value = '' // Reset input
            return
        }

        setIsLoading(true)
        try {
            const text = await file.text()
            const result = await restoreDatabase(text)
            if (result.success) {
                alert(result.message)
            } else {
                alert(result.message)
            }
        } catch (error) {
            console.error(error)
            alert('An error occurred during import.')
        } finally {
            setIsLoading(false)
            e.target.value = '' // Reset input
        }
    }

    const handleBackup = async () => {
        setIsBackingUp(true)
        try {
            const data = await backupDatabase()
            const blob = new Blob([data], { type: 'application/json' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `cryllix-backup-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            alert('Backup downloaded successfully.')
        } catch (error) {
            console.error(error)
            alert('Failed to generate backup.')
        } finally {
            setIsBackingUp(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">System Maintenance</h3>
                <p className="text-sm text-muted-foreground">Manage global availability and data safety.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className={`border-2 ${isMaintenanceMode ? 'border-red-500/50 bg-red-950/10' : 'border-green-500/20'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Power className={`h-6 w-6 ${isMaintenanceMode ? 'text-red-500' : 'text-green-500'}`} />
                            Global Maintenance Mode
                        </CardTitle>
                        <CardDescription>
                            When enabled, only administrators and moderators can access the dashboard. All other users will see a maintenance page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Maintenance Message</label>
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter custom maintenance message..."
                                className="bg-black/20 border-white/10"
                                disabled={isMaintenanceMode}
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className={`font-mono text-sm px-3 py-1 rounded-full border ${isMaintenanceMode ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-green-500/20 text-green-500 border-green-500/30'}`}>
                                STATUS: {isLoading ? 'CHECKING...' : (isMaintenanceMode ? 'ACTIVE' : 'ONLINE')}
                            </span>
                            <Button
                                variant={isMaintenanceMode ? "default" : "destructive"}
                                onClick={handleToggleMaintenance}
                                disabled={isLoading}
                            >
                                {isMaintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-6 w-6 text-blue-400" />
                            Database Backup
                        </CardTitle>
                        <CardDescription>
                            Generate a JSON dump of all Users, License Keys, and Whitelist entries. Dowload this regularly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full gap-2 h-12"
                            onClick={handleBackup}
                            disabled={isBackingUp}
                        >
                            {isBackingUp ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            {isBackingUp ? 'Generating Dump...' : 'Download Full Backup'}
                        </Button>

                        <div className="relative">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isLoading}
                            />
                            <Button
                                variant="outline"
                                className="w-full gap-2 h-12 border-dashed"
                                disabled={isLoading}
                            >
                                <Upload className="h-4 w-4" />
                                {isLoading ? 'Importing...' : 'Import Database Dump'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
