import { ResetPasswordForm } from "@/components/reset-password-form"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left side - Branding */}
            <div className="hidden lg:flex flex-col justify-between bg-primary p-10">
                <Link href="/" className="flex items-center gap-2 text-primary-foreground">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-lg">CampusConnect</span>
                </Link>
                <div className="space-y-4">
                    <blockquote className="text-xl font-medium text-primary-foreground">
                        &quot;Choose a strong password to keep your account secure. Mix letters, numbers, and symbols for the best protection.&quot;
                    </blockquote>
                    <p className="text-primary-foreground/80">— Security First</p>
                </div>
                <p className="text-sm text-primary-foreground/60">
                    © {new Date().getFullYear()} SDMCET. All rights reserved.
                </p>
            </div>

            {/* Right side - Form */}
            <div className="flex flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm space-y-6">
                    <Link href="/" className="flex items-center gap-2 lg:hidden mb-8">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                            <GraduationCap className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-lg">CampusConnect</span>
                    </Link>
                    <ResetPasswordForm />
                </div>
            </div>
        </div>
    )
}
