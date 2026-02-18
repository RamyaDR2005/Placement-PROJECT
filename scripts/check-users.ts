
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    console.log("🔍 Checking User Details...")

    try {
        const users = await prisma.user.findMany({
            include: {
                accounts: true
            }
        })

        if (users.length === 0) {
            console.log("No users found.")
        } else {
            console.log(JSON.stringify(users, null, 2))
        }

    } catch (error) {
        console.error("Error checking users:", error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
