import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, sanitizeInput, logSecurityEvent } from "@/lib/auth-helpers"

export async function GET() {
  try {
    // Check authentication
    const { error, session } = await requireAuth()

    if (error || !session) {
      return error
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const { error, session } = await requireAuth()

    if (error || !session) {
      return error
    }

    const data = await request.json()

    // Prevent userId tampering - always use session userId
    const sanitizedData = { ...data }
    delete sanitizedData.userId // Remove if present in payload
    delete sanitizedData.id // Prevent ID manipulation

    // Sanitize string fields and filter out File objects (which serialize as empty objects)
    Object.keys(sanitizedData).forEach(key => {
      const value = sanitizedData[key]

      // Remove null/undefined
      if (value === null || value === undefined) {
        delete sanitizedData[key]
        return
      }

      // Sanitize strings
      if (typeof value === 'string') {
        sanitizedData[key] = sanitizeInput(value)
        return
      }

      // Filter out empty objects (File objects serialize as {} when sent as JSON)
      // Keep arrays and objects with actual data
      if (typeof value === 'object') {
        // Allow arrays (even empty ones for clearing)
        if (Array.isArray(value)) {
          return
        }
        // Remove empty objects (likely File objects that couldn't be serialized)
        if (Object.keys(value).length === 0) {
          delete sanitizedData[key]
          return
        }
      }
    })

    // Validate critical fields
    if (sanitizedData.usn && sanitizedData.usn.length > 20) {
      return NextResponse.json(
        { error: "USN too long" },
        { status: 400 }
      )
    }

    if (sanitizedData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedData.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    let profile
    if (existingProfile) {
      // Update existing profile - ensure user can only update their own profile
      profile = await prisma.profile.update({
        where: {
          userId: session.user.id // Always use session userId
        },
        data: {
          ...sanitizedData,
          updatedAt: new Date()
        }
      })

      logSecurityEvent("profile_updated", {
        userId: session.user.id,
        timestamp: new Date().toISOString()
      })
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId: session.user.id, // Always use session userId
          ...sanitizedData,
        }
      })

      logSecurityEvent("profile_created", {
        userId: session.user.id,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      success: true,
      profile,
      message: "Profile updated successfully"
    })
  } catch (error) {
    console.error("Error updating profile:", error)

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "USN already exists. Please use a different USN." },
          { status: 400 }
        )
      }
    }

    logSecurityEvent("profile_update_error", {
      error: error instanceof Error ? error.message : "Unknown error"
    })

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
