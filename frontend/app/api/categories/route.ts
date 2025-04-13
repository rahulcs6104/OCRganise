import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

// In a real app, you would store this in an environment variable
const JWT_SECRET = new TextEncoder().encode("your-secret-key")

// GET categories for the current user
export async function GET(request: NextRequest) {
  try {
    // Check if MongoDB URI is available at runtime
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "Database connection not configured" }, { status: 500 })
    }

    // Get token from cookies
    const token = cookies().get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()
    const usersCollection = db.collection("users")

    // Find user by ID
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return categories
    return NextResponse.json({
      categories: user.categories || [],
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

// POST to add a new category
export async function POST(request: NextRequest) {
  try {
    // Check if MongoDB URI is available at runtime
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "Database connection not configured" }, { status: 500 })
    }

    const { category } = await request.json()

    if (!category) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    // Get token from cookies
    const token = cookies().get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()
    const usersCollection = db.collection("users")

    // Find user by ID
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user's categories
    const existingCategories = user.categories || []

    // Check if category already exists
    if (existingCategories.includes(category)) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 })
    }

    // Add new category
    const updatedCategories = [...existingCategories, category]

    // Update in database
    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { categories: updatedCategories } })

    return NextResponse.json({
      message: "Category added successfully",
      categories: updatedCategories,
    })
  } catch (error) {
    console.error("Error adding category:", error)
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 })
  }
}
