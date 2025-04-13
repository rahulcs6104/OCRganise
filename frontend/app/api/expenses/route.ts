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

    // Get data from request body
    const { items, friends } = await request.json()

    if (!Array.isArray(items) && !Array.isArray(friends)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
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

    // Get existing items and friends
    const existingItems = user.items || []
    const existingFriends = user.friends || []

    // Add new items to the items array
    const updatedItems = [...existingItems, ...items]

    // Update friends list by merging with existing friends
    const updatedFriends = [...existingFriends]

    for (const newFriend of friends) {
      const existingIndex = updatedFriends.findIndex((f) => f.name.toLowerCase() === newFriend.name.toLowerCase())

      if (existingIndex >= 0) {
        // Friend exists, update amount
        updatedFriends[existingIndex].amount = (
          Number.parseFloat(updatedFriends[existingIndex].amount) + Number.parseFloat(newFriend.amount)
        ).toFixed(2)
      } else {
        // New friend, add to list
        updatedFriends.push({
          name: newFriend.name,
          amount: Number.parseFloat(newFriend.amount).toFixed(2),
        })
      }
    }

    // Update user in database
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { items: updatedItems, friends: updatedFriends } },
    )

    return NextResponse.json({
      message: "Expenses saved successfully",
      itemsCount: items.length,
      friendsCount: friends.length,
    })
  } catch (error) {
    console.error("Error saving expenses:", error)
    return NextResponse.json({ error: "Failed to save expenses" }, { status: 500 })
  }
}
