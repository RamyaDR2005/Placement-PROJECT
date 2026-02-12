import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { consumePasswordResetToken } from "@/lib/email"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            )
        }

        if (typeof password !== "string" || password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters long" },
                { status: 400 }
            )
        }

        // Verify and consume the token (deletes it after use)
        const result = await consumePasswordResetToken(token)

        if (!result.success || !result.email) {
            return NextResponse.json(
                { error: result.error || "Invalid or expired reset link" },
                { status: 400 }
            )
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Update the user's password
        await prisma.user.update({
            where: { email: result.email },
            data: { password: hashedPassword }
        })

        console.log(`✅ Password reset successful for ${result.email}`)

        return NextResponse.json({
            success: true,
            message: "Password has been reset successfully"
        })

    } catch (error) {
        console.error("Error in reset-password:", error)
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        )
    }
}
