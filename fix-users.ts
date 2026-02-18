
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Checking for users with potential auth conflicts...")

    try {
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { password: { not: null } },
                    { emailVerified: null }
                ]
            }
        })

        console.log(`Found ${users.length} users to update.`)

        for (const user of users) {
            console.log(`Open user: ${user.email} (ID: ${user.id})`)

            // Remove password AND set emailVerified to true to facilitate linking
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: null,
                    emailVerified: user.emailVerified || new Date()
                }
            })
            console.log(`✅ Updated user: ${user.email} - Cleared password & verified email.`)
        }

        console.log("\n🎉 All users updated. You should now be able to sign in with Google.")

    } catch (error) {
        console.error("Error updating users:", error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
