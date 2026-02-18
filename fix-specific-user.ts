
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const email = "ramya.draikar@gmail.com"
    console.log(`Searching for user: ${email}`)

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { accounts: true }
        })

        if (!user) {
            console.log("❌ User not found in database.")
            return
        }

        console.log(`✅ Found user: ${user.id}`)
        console.log(`   Email Verified: ${user.emailVerified}`)
        console.log(`   Has Password: ${!!user.password}`)
        console.log(`   Linked Accounts: ${user.accounts.length}`)

        // Force update
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                password: null
            }
        })

        console.log("✅ User updated successfully:")
        console.log(`   New Verified Status: ${updated.emailVerified}`)
        console.log(`   Password Cleared.`)

        console.log("\n👉 You should now be able to sign in with Google.")

    } catch (e) {
        console.error("Error fixing user:", e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
