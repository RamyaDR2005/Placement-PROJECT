
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🛠️ Starting user verification fix...")

    try {
        // Find users with potential issues
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { emailVerified: null },
                    { password: { not: null } }
                ]
            }
        })

        console.log(`Found ${users.length} users needing updates.`)

        if (users.length === 0) {
            console.log("🎉 No legacy users found. Database is clean!")
            return
        }

        // Fix each user
        for (const user of users) {
            console.log(`Processing: ${user.email} (ID: ${user.id})`)

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: user.emailVerified || new Date(), // Verify email
                    password: null, // Clear interfering password
                    updatedAt: new Date()
                }
            })

            console.log(`✅ Fixed: ${user.email} -> Verified & Password cleared.`)
        }

        console.log("\n🚀 All legacy users have been updated to support Google Sign-In.")

    } catch (error) {
        console.error("❌ Error running fix script:", error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
