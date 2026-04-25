'use client'

import { useActionState } from 'react'
import { login } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Turnstile from 'react-turnstile'
import { useState } from 'react'

const initialState = {
    error: '',
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState)

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Login to Cryllix</CardTitle>
                    <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
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

                        <div className="flex justify-center py-2">
                            <Turnstile
                                sitekey={process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || ""}
                                onVerify={(token) => {
                                    const input = document.getElementById('cf-turnstile-response') as HTMLInputElement
                                    if (input) input.value = token
                                }}
                            />
                            <input type="hidden" name="cf-turnstile-response" id="cf-turnstile-response" />
                        </div>

                        {state?.error && (
                            <p className="text-sm text-destructive">{state.error}</p>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2 gap-2">
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? 'Logging in...' : 'Login'}
                        </Button>

                        <p className="text-sm text-muted-foreground text-center">
                            Don't have an account? <Link href="/register" className="text-primary hover:underline">Redeem Key</Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
