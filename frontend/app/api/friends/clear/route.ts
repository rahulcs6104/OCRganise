import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

// In a real app, you would store this in an environment variable
const JWT_SECRET = new TextEncoder().encode("your-secret-key")

export async function POST(request: NextRequest) {
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

    // Get friend name from request body
    const { friendName } = await request.json()

    if (!friendName) {
      return NextResponse.json({ error: "Friend name is required" }, { status: 400 })
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

    // Get existing friends
    const existingFriends = user.friends || []

    // Find the friend to update
    const friendIndex = existingFriends.findIndex(
      (friend: { name: string }) => friend.name.toLowerCase() === friendName.toLowerCase(),
    )

    if (friendIndex === -1) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 })
    }

    // Update the friend's amount to 0
    existingFriends[friendIndex].amount = "0"

    // Update user in database
    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { friends: existingFriends } })

    return NextResponse.json({
      message: "Friend's debt cleared successfully",
      friends: existingFriends,
    })
  } catch (error) {
    console.error("Error clearing friend's debt:", error)
    return NextResponse.json({ error: "Failed to clear friend's debt" }, { status: 500 })
  }
}
