import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { SignJWT } from "jose"
import clientPromise from "@/lib/mongodb"
import { verifyPassword } from "@/lib/auth/password"
import { type User, sanitizeUser } from "@/lib/models/user"

// In a real app, you would store this in an environment variable
const JWT_SECRET = new TextEncoder().encode("your-secret-key")

export async function POST(request: NextRequest) {
  try {
    // Check if MongoDB URI is available at runtime
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "Database connection not configured" }, { status: 500 })
    }

    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()
    const usersCollection = db.collection("users")

    // Find user by email
    const user = (await usersCollection.findOne({ email })) as User | null

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create JWT token
    const token = await new SignJWT({ userId: user._id?.toString() })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET)

    // Set cookie
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "strict",
    })

    // Return sanitized user (without password)
    return NextResponse.json({
      message: "Login successful",
      user: sanitizeUser(user),
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
