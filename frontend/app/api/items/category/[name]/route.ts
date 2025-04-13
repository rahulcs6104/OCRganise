import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

// In a real app, you would store this in an environment variable
const JWT_SECRET = new TextEncoder().encode("your-secret-key")

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    // Check if MongoDB URI is available at runtime
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: "Database connection not configured" }, { status: 500 })
    }

    // Get category name from URL params
    const categoryName = params.name
    if (!categoryName) {
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

    // Get all items from the user
    const allItems = user.items || []

    // Filter items by category (case insensitive)
    const categoryItems = allItems.filter(
      (item: any) => item.category && item.category.toLowerCase() === categoryName.toLowerCase(),
    )

    return NextResponse.json({
      items: categoryItems,
    })
  } catch (error) {
    console.error("Error fetching category items:", error)
    return NextResponse.json({ error: "Failed to fetch category items" }, { status: 500 })
  }
}
