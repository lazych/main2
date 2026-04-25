"use client"

import { useState, useEffect } from "react"
import { Badge } from "@prisma/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Award, Loader2 } from "lucide-react"
import { updateUserBadges, getAllBadges } from "@/app/actions/admin"
import { toast } from "@/components/ui/use-toast"
import { BadgeDisplay } from "@/components/badge-display"

interface BadgeManagerProps {
    userId: string
    username: string
    currentBadges: Badge[]
}

export function BadgeManager({ userId, username, currentBadges }: BadgeManagerProps) {
    const [open, setOpen] = useState(false)
    const [availableBadges, setAvailableBadges] = useState<Badge[]>([])
    const [selectedBadgeIds, setSelectedBadgeIds] = useState<string[]>(currentBadges.map(b => b.id))
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (open) {
            setLoading(true)
            getAllBadges()
                .then(badges => {
                    setAvailableBadges(badges)
                    // Reset selected to current prop when opening to ensure freshness
                    // (Though usually we rely on parent revalidation)
                    setSelectedBadgeIds(currentBadges.map(b => b.id))
                })
                .catch(err => {
                    toast({
                        title: "Error fetching badges",
                        description: "Could not load available badges.",
                        variant: "destructive"
                    })
                })
                .finally(() => setLoading(false))
        }
    }, [open, currentBadges])

    const handleToggle = (badgeId: string, checked: boolean) => {
        if (checked) {
            setSelectedBadgeIds(prev => [...prev, badgeId])
        } else {
            setSelectedBadgeIds(prev => prev.filter(id => id !== badgeId))
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            await updateUserBadges(userId, selectedBadgeIds)
            toast({
                title: "Badges updated",
                description: `Successfully updated badges for ${username}`,
            })
            setOpen(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update badges",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed">
                    <Award className="h-3 w-3" />
                    Badges
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Badges</DialogTitle>
                    <DialogDescription>
                        Select badges to award to <span className="font-semibold text-foreground">{username}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        availableBadges.map(badge => (
                            <div key={badge.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <Checkbox
                                    id={`badge-${badge.id}`}
                                    checked={selectedBadgeIds.includes(badge.id)}
                                    onCheckedChange={(checked) => handleToggle(badge.id, checked as boolean)}
                                />
                                <div className="flex-1 flex items-center justify-between">
                                    <Label htmlFor={`badge-${badge.id}`} className="flex items-center gap-2 cursor-pointer font-medium">
                                        {badge.name}
                                    </Label>
                                    <BadgeDisplay badge={badge} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving || loading}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
