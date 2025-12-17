import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { FileText } from "lucide-react"

export default async function DocumentsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login")
  }
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
  if (!profile?.isComplete) {
    redirect("/profile")
  }
  return (
    <main className="flex-1 bg-background min-h-screen">
      <div className="container mx-auto max-w-4xl px-4 py-8 flex flex-col gap-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold">Documents</h1>
        </div>
        <div className="rounded-lg bg-muted/40 p-6 text-center text-muted-foreground">
          Document management features coming soon.
        </div>
      </div>
    </main>
  )
} 