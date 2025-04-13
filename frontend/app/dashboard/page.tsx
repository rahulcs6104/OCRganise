"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import type { SafeUser } from "@/lib/models/user"
import "./dashboard.css"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<SafeUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [visibleChars, setVisibleChars] = useState<number>(0)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/auth/me")

        if (!response.ok) {
          throw new Error("Not authenticated")
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error("Authentication error:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  // Effect for sequential text animation
  useEffect(() => {
    if (!user) return

    // Get the full message
    const message = `Hey ${user.firstName}! let's log and level up!`
    const totalChars = message.length

    // Show characters sequentially with delays
    const timeouts: NodeJS.Timeout[] = []
    const charDelay = 150 // 150ms delay between characters

    for (let i = 1; i <= totalChars; i++) {
      const timeout = setTimeout(() => {
        setVisibleChars(i)
      }, i * charDelay)

      timeouts.push(timeout)
    }

    // Cleanup timeouts on unmount
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handlePlayClick = () => {
    router.push("/game")
  }

  // Function to create circular text with sequential animation
  const createCircularText = () => {
    if (!user) return null

    const message = `Hey ${user.firstName}! let's log and level up!`
    const characters = message.split("")
    const totalChars = characters.length
    // Smaller radius on mobile
    const radius = isMobile ? 140 : 180
    const result = []

    for (let i = 0; i < totalChars; i++) {
      // Only render characters that should be visible based on the animation state
      if (i >= visibleChars) continue

      // Calculate the angle for each character (starting from the top and going clockwise)
      const angle = (i * 360) / totalChars - 90 // -90 to start from the top
      const radian = (angle * Math.PI) / 180

      // Calculate position using trigonometry
      const x = radius * Math.cos(radian)
      const y = radius * Math.sin(radian)

      // Rotate each character to face outward
      const charRotation = angle + 90 // +90 to make characters face outward

      result.push(
        <span
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 text-yellow-300"
          style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${y}px)`,
            transform: `translate(-50%, -50%) rotate(${charRotation}deg)`,
            fontSize: isMobile ? "14px" : "16px",
            fontFamily: "'Press Start 2P', system-ui, sans-serif",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            opacity: 1,
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          {characters[i]}
        </span>,
      )
    }

    return result
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white" style={{ fontFamily: "'Press Start 2P', system-ui, sans-serif" }}>
          Loading...
        </p>
      </div>
    )
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-black p-4"
      style={{ fontFamily: "'Press Start 2P', system-ui, sans-serif" }}
    >
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-yellow-300 text-yellow-300 hover:bg-yellow-300/10"
        >
          Log out
        </Button>
      </div>

      <div className="text-center flex-1 flex flex-col items-center justify-center">
        {/* Circular text container with play button */}
        <div className="relative w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[500px] md:h-[500px] mx-auto">
          {/* Circular animated text */}
          {createCircularText()}

          {/* Larger play button in the center with enhanced pulse animation */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] sm:w-[280px] sm:h-[280px] md:w-[320px] md:h-[320px] cursor-pointer hover:scale-105 transition-transform animate-pulse-custom"
            onClick={handlePlayClick}
          >
            <Image src="/play.png" alt="Play Button" fill style={{ objectFit: "contain" }} priority />
          </div>
        </div>

        <p className="text-yellow-300 text-sm mt-4">Click to play</p>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </main>
  )
}
