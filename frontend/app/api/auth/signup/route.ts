import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth/password"
import { type User, sanitizeUser } from "@/lib/models/user"

export async function POST(request: NextRequest) {
  try {
    // Check if MongoDB URI is available at runtime
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "Database connection not configured" }, { status: 500 })
    }

    const { firstName, lastName, email, password } = await request.json()

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const item = {
      name: "dummy_lays",
      price: 0.0,
      vendor: "walmart",
      category: "food",
      uploadedAt: new Date().toISOString(), // Use current time for uploadedAt
    }
    const items = []
    items.push(item)
    const total = 0
    const tax = 0

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()
    const usersCollection = db.collection("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const now = new Date()
    const newUser: User = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
      items: items, // Items array now includes the item you created
      tax: tax,
      total: total,
      categories: ["food", "travel", "entertainment", "utilities"],
      friends: [], // Initialize with an empty array of friends
    }

    // Insert user into database
    const result = await usersCollection.insertOne(newUser)
    const insertedUser = await usersCollection.findOne({ _id: result.insertedId })

    if (!insertedUser) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Return sanitized user (without password)
    return NextResponse.json(
      {
        message: "User created successfully",
        user: sanitizeUser(insertedUser as User),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
