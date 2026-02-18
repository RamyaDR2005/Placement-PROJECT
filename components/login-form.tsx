"use client"

import React, { useState } from "react"
import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showFixButton, setShowFixButton] = useState(false)

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true)
    signIn("google", { callbackUrl: "/dashboard" })
  }

  const handleFixAccount = async () => {
    try {
      toast.info("Attempting to fix account linking...")
      const res = await fetch("/api/debug-fix-user")
      const data = await res.json()

      if (data.success) {
        toast.success("Account fixed! Please try signing in again.")
        setTimeout(() => {
          window.location.href = "/login"
        }, 1500)
      } else {
        toast.error("Failed to fix account: " + data.error)
      }
    } catch (e) {
      toast.error("Something went wrong fixing the account.")
    }
  }

  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const error = searchParams.get("error")
    const success = searchParams.get("success")

    if (error === "OAuthAccountNotLinked") {
      setShowFixButton(true)
      toast.error("An account with this email already exists. Click 'Fix Account' to resolve permissions.", {
        duration: 8000,
      })
    } else if (error === "verification-failed") {
      toast.error("Email verification failed. Please try again.")
    } else if (success === "email-verified") {
      toast.success("Email verified successfully! You can now sign in.")
    }
  }, [])

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in with your Google account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          <div className="grid gap-5">
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 font-medium"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
              )}
              {isGoogleLoading ? "Connecting..." : "Continue with Google"}
            </Button>

            {showFixButton && (
              <Button
                type="button"
                variant="destructive"
                className="w-full h-11 font-medium bg-red-100 text-red-900 hover:bg-red-200 border-red-200"
                onClick={handleFixAccount}
              >
                Fix Account Issue
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground text-balance">
        By continuing, you agree to our{" "}
        <a href="/terms" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
      </p>
    </div>
  )
}
