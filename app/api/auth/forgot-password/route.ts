import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            )
        }

        const normalizedEmail = email.toLowerCase().trim()

        // Find the user - don't reveal whether the email exists
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true, name: true, email: true, password: true }
        })

        // Always return success to prevent email enumeration attacks
        // But only actually send the email if the user exists and has a password
        if (user && user.password) {
            try {
                await sendPasswordResetEmail(normalizedEmail, user.name || "User")
            } catch (error) {
                console.error("Failed to send password reset email:", error)
                // Still return success to prevent enumeration
            }
        }

        return NextResponse.json({
            success: true,
            message: "If an account exists with this email, you will receive a password reset link."
        })

    } catch (error) {
        console.error("Error in forgot-password:", error)
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        )
    }
}
