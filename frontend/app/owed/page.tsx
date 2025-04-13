"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"

type Friend = {
  name: string
  amount: string
}

export default function OwedPage() {
  const router = useRouter()
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [clearingFriend, setClearingFriend] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [activeButton, setActiveButton] = useState<string | null>(null)

  // Pinkish purple color for buttons
  const pinkishPurple = "#c026d3" // Tailwind's fuchsia-600

  const handleBack = () => {
    router.push("/game")
  }

  // Fetch friends from the database
  useEffect(() => {
    async function fetchFriends() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/friends")

        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated, redirect to login
            router.push("/login")
            return
          }
          throw new Error("Failed to fetch friends")
        }

        const data = await response.json()
        // Filter out friends with zero or empty amounts
        const friendsWithDebt = (data.friends || []).filter(
          (friend: Friend) => friend.amount && Number.parseFloat(friend.amount) > 0,
        )
        setFriends(friendsWithDebt)
      } catch (err: any) {
        console.error("Error fetching friends:", err)
        setError(err.message || "Failed to load friends")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFriends()
  }, [router])

  // Clear a friend's debt
  const handleClearDebt = async (friendName: string) => {
    try {
      setClearingFriend(friendName)
      setActiveButton(friendName)
      setError("")
      setSuccessMessage("")

      const response = await fetch("/api/friends/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendName }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to clear debt")
      }

      // Update the local state to remove the cleared friend
      setFriends((prevFriends) => prevFriends.filter((friend) => friend.name !== friendName))
      setSuccessMessage(`${friendName}'s debt has been cleared!`)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err: any) {
      console.error("Error clearing debt:", err)
      setError(err.message || "Failed to clear debt")
    } finally {
      setClearingFriend(null)
      setTimeout(() => {
        setActiveButton(null)
      }, 300)
    }
  }

  // Function to get a random gradient for each friend
  const getFriendGradient = (index: number) => {
    const gradients = [
      "from-purple-600 to-fuchsia-600",
      "from-amber-500 to-orange-600",
      "from-emerald-500 to-teal-600",
      "from-blue-500 to-indigo-600",
      "from-rose-500 to-pink-600",
    ]
    return gradients[index % gradients.length]
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/back.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Press Start 2P', system-ui, sans-serif",
      }}
    >
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="border-yellow-300 text-yellow-300 hover:bg-yellow-300/10"
        >
          Back
        </Button>
      </div>

      <div className="text-center text-white mt-20 mb-10">
        <h1 className="text-2xl mb-2">Money Owed</h1>
        <p className="text-sm text-yellow-300">Friends who owe you</p>
      </div>

      {/* Main content */}
      <div className="w-full max-w-md px-4">
        {isLoading ? (
          <div className="text-center text-white">Loading...</div>
        ) : error ? (
          <div className="bg-red-900/50 p-4 rounded-md border border-red-800 text-white">
            <p>{error}</p>
          </div>
        ) : successMessage ? (
          <div className="bg-green-900/50 p-4 rounded-md border border-green-800 text-white mb-6">
            <p>{successMessage}</p>
          </div>
        ) : null}

        {!isLoading && friends.length === 0 && !error && (
          <div className="bg-black/50 p-6 rounded-lg border-2 border-yellow-300 text-center">
            <p className="text-white mb-2">No one owes you money right now!</p>
            <p className="text-yellow-300 text-sm">Add expenses to track what friends owe you.</p>
          </div>
        )}

        {friends.length > 0 && (
          <div className="space-y-4">
            {friends.map((friend, index) => (
              <div
                key={friend.name}
                className="bg-black/50 p-4 rounded-lg border-2 border-yellow-300 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-white text-lg">{friend.name}</h3>
                  <p className="text-yellow-300 mt-1">${Number.parseFloat(friend.amount).toFixed(2)}</p>
                </div>
                <button
                  className={`py-2 px-4 text-white hover:bg-opacity-90 border-2 rounded-md pixel-button text-sm relative overflow-hidden transition-all duration-300 ${
                    activeButton === friend.name ? "scale-95 opacity-80" : ""
                  }`}
                  style={{
                    borderColor: "#a21caf",
                    boxShadow: "0 4px 0 #86198f",
                  }}
                  onClick={() => handleClearDebt(friend.name)}
                  disabled={clearingFriend === friend.name}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${getFriendGradient(index)} opacity-90`}></div>
                  <span className="relative z-10">{clearingFriend === friend.name ? "Clearing..." : "Clear"}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </main>
  )
}
