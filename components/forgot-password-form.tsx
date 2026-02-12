"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { IconCircleCheck, IconAlertCircle, IconArrowLeft, IconMail } from "@tabler/icons-react"
import { LoadingSpinner } from "@/components/ui/loading"

export function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const [email, setEmail] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            toast.error("Please enter your email address")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            })

            const data = await response.json()

            if (response.ok) {
                setEmailSent(true)
                toast.success("Check your email for a reset link!", {
                    icon: <IconCircleCheck className="h-5 w-5 text-green-500" />,
                })
            } else {
                toast.error(data.error || "Something went wrong")
            }
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card className="border-0 shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                            <IconMail className="h-7 w-7 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-semibold">Check your email</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            We&apos;ve sent a password reset link to{" "}
                            <span className="font-medium text-foreground">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <p className="text-sm text-center text-muted-foreground">
                            The link will expire in 1 hour. If you don&apos;t see the email, check your spam folder.
                        </p>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                setEmailSent(false)
                                setEmail("")
                            }}
                        >
                            Try a different email
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            <a href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                                <IconArrowLeft className="inline h-4 w-4 mr-1" />
                                Back to sign in
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="border-0 shadow-lg">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-semibold">Forgot password?</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Enter your email and we&apos;ll send you a reset link
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="h-11 pr-10"
                                        disabled={isLoading}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <IconMail className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 font-medium"
                                disabled={isLoading || !email.trim()}
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        Sending reset link...
                                    </>
                                ) : (
                                    "Send reset link"
                                )}
                            </Button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Remember your password?{" "}
                        <a href="/login" className="text-primary font-medium hover:underline underline-offset-4">
                            Sign in
                        </a>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
