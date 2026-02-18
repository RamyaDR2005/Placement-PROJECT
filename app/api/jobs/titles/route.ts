import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET - Fetch job titles for dropdown (lightweight endpoint)
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify admin role
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const jobs = await prisma.job.findMany({
            where: {
                status: { in: ["ACTIVE", "DRAFT"] }
            },
            select: {
                id: true,
                title: true,
                companyName: true
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json(jobs)
    } catch (error) {
        console.error("Error fetching job titles:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
