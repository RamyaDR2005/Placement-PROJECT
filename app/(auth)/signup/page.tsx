import { SignupForm } from "@/components/signup-form"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export default function SignupPage() {
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
          <h2 className="text-3xl font-bold text-primary-foreground">
            Start Your Placement Journey Today
          </h2>
          <p className="text-primary-foreground/80">
            Join 500+ students who have successfully navigated their career path with CampusConnect.
          </p>
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
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
