"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
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
import { IconCircleCheck, IconAlertCircle, IconEye, IconEyeOff, IconArrowLeft, IconLock } from "@tabler/icons-react"
import { LoadingSpinner } from "@/components/ui/loading"

function ResetPasswordFormInner({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState("")

    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")

    useEffect(() => {
        if (!token) {
            setError("Invalid reset link. Please request a new password reset.")
        }
    }, [token])

    const validatePassword = (pass: string) => {
        if (pass.length < 8) return "Password must be at least 8 characters"
        if (!/[A-Z]/.test(pass)) return "Password must include an uppercase letter"
        if (!/[a-z]/.test(pass)) return "Password must include a lowercase letter"
        if (!/[0-9]/.test(pass)) return "Password must include a number"
        return ""
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const passwordError = validatePassword(password)
        if (passwordError) {
            toast.error(passwordError)
            return
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (!token) {
            toast.error("Invalid reset link")
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (response.ok) {
                setIsSuccess(true)
                toast.success("Password reset successfully!", {
                    icon: <IconCircleCheck className="h-5 w-5 text-green-500" />,
                })
            } else {
                toast.error(data.error || "Failed to reset password")
            }
        } catch {
            toast.error("Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card className="border-0 shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                            <IconCircleCheck className="h-7 w-7 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl font-semibold">Password reset!</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Your password has been reset successfully. You can now sign in with your new password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Button
                            className="w-full h-11 font-medium"
                            onClick={() => router.push("/login")}
                        >
                            Sign in with new password
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className={cn("flex flex-col gap-6", className)} {...props}>
                <Card className="border-0 shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                            <IconAlertCircle className="h-7 w-7 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-semibold">Invalid link</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            {error}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <Button
                            className="w-full h-11 font-medium"
                            onClick={() => router.push("/forgot-password")}
                        >
                            Request new reset link
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

    const passwordStrength = password.length === 0 ? 0 :
        password.length < 8 ? 1 :
            (/[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)) ?
                (/[^A-Za-z0-9]/.test(password) ? 4 : 3) : 2

    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"]
    const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"]

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="border-0 shadow-lg">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-semibold">Reset password</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    New Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="h-11 pr-10"
                                        disabled={isLoading}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <IconEyeOff className="h-4 w-4" />
                                        ) : (
                                            <IconEye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {/* Password strength meter */}
                                {password.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((level) => (
                                                <div
                                                    key={level}
                                                    className={cn(
                                                        "h-1 flex-1 rounded-full transition-colors",
                                                        level <= passwordStrength ? strengthColor[passwordStrength] : "bg-muted"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <p className={cn(
                                            "text-xs",
                                            passwordStrength <= 1 ? "text-red-500" :
                                                passwordStrength === 2 ? "text-orange-500" :
                                                    passwordStrength === 3 ? "text-yellow-600" : "text-green-500"
                                        )}>
                                            {strengthLabel[passwordStrength]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirm Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={cn(
                                            "h-11 pr-10",
                                            confirmPassword && password !== confirmPassword && "border-red-300 focus-visible:ring-red-500"
                                        )}
                                        disabled={isLoading}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <IconEyeOff className="h-4 w-4" />
                                        ) : (
                                            <IconEye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <IconAlertCircle className="h-3 w-3" />
                                        Passwords do not match
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 font-medium"
                                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        Resetting password...
                                    </>
                                ) : (
                                    <>
                                        <IconLock className="h-4 w-4 mr-2" />
                                        Reset password
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-muted-foreground mt-6">
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

export function ResetPasswordForm(props: React.ComponentProps<"div">) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-8">
                <LoadingSpinner size="lg" />
            </div>
        }>
            <ResetPasswordFormInner {...props} />
        </Suspense>
    )
}
