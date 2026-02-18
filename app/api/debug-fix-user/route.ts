
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        // 1. Find users who have a password (legacy credentials users) OR unverified email
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { password: { not: null } },
                    { emailVerified: null },
                    { email: "ramya.draikar@gmail.com" }
                ]
            },
            include: {
                accounts: true
            }
        })

        const logs = []
        logs.push(`Found ${users.length} users with potential conflicts.`)

        for (const user of users) {
            logs.push(`-> Processing: ${user.email} (ID: ${user.id}).`)

            try {
                // DELETE the user to allow fresh Google Sign-in to invoke creation
                await prisma.user.delete({
                    where: { id: user.id }
                })
                logs.push(`   🗑️ Deleted user account. A new clean account will be created on next Google Login.`)
            } catch (e: any) {
                logs.push(`   ❌ Deletion failed: ${e.message}`)
            }
        }

        return NextResponse.json({
            success: true,
            message: "Database updated. You can now sign in with Google.",
            logs
        })

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
