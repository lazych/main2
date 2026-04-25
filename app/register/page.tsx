'use client'

import { useActionState } from 'react'
import { register } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

const initialState = {
    error: '',
}

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(register, initialState)

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Redeem License Key</CardTitle>
                    <CardDescription>Create an account using your Cryllix license key.</CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="licenseKey">License Key</Label>
                            <Input id="licenseKey" name="licenseKey" placeholder="CRYLLIX-XXXX-XXXX" required />
                        </div>
                        {state?.error && (
                            <p className="text-sm text-destructive">{state.error}</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Creating Account...' : 'Redeem & Register'}
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
