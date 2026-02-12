import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { StudentProfileView } from "@/components/admin/student-profile-view"

interface StudentProfilePageProps {
    params: Promise<{ id: string }>
}

export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
        redirect("/login")
    }

    // Get user with role information
    const adminUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    })

    if (adminUser?.role !== 'ADMIN') {
        redirect("/dashboard")
    }

    // Fetch the student with full profile
    const student = await prisma.user.findUnique({
        where: { id },
        include: {
            profile: true
        }
    })

    if (!student || student.role !== 'STUDENT') {
        notFound()
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <StudentProfileView student={student} adminId={session.user.id} />
        </div>
    )
}
