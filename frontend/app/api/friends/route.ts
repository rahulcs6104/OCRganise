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

    // Get friends data from request body
    const { friends } = await request.json()

    if (!Array.isArray(friends)) {
      return NextResponse.json({ error: "Invalid friends data" }, { status: 400 })
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

    // Get existing friends or initialize empty array
    const existingFriends = user.friends || []

    // Update friends list by merging with existing friends
    // If a friend already exists, update their amount
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
    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { friends: updatedFriends } })

    return NextResponse.json({
      message: "Friends updated successfully",
      friends: updatedFriends,
    })
  } catch (error) {
    console.error("Error updating friends:", error)
    return NextResponse.json({ error: "Failed to update friends" }, { status: 500 })
  }
}

// GET friends for the current user
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

    // Return friends list
    return NextResponse.json({
      friends: user.friends || [],
    })
  } catch (error) {
    console.error("Error fetching friends:", error)
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 })
  }
}
