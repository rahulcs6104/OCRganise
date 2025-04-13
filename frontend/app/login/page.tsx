"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Footer } from "@/components/footer"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
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

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (registered) {
      setSuccess("Account created successfully! Please log in.")
    }
  }, [registered])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (!formData.email || !formData.password) {
      setError("Email and password are required")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      // Redirect to dashboard on successful login
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start p-4 overflow-auto"
      style={{
        backgroundImage: "url('/signup_background.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Press Start 2P', system-ui, sans-serif",
      }}
    >
      {/* Logo */}
      <div className="w-full flex justify-center mt-4 mb-8">
        <div className="relative w-[500px] h-[300px] sm:w-[600px] sm:h-[350px]">
          <Image src="/finall_logo.png" alt="OCRganise Logo" fill style={{ objectFit: "contain" }} priority />
        </div>
      </div>

      {/* Form container */}
      <div className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] bg-[#0f0f1a] border-2 border-yellow-300 rounded-md p-4 mb-16">
        <h1 className="text-xl text-white text-center mb-6">LOGIN</h1>

        {error && <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-white rounded-md">{error}</div>}

        {success && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-800 text-white rounded-md">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-white text-sm">
              USER NAME
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-white text-sm">
              PASSWORD
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black"
            />
          </div>
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-yellow-300 text-black font-bold rounded-md hover:bg-yellow-400 disabled:opacity-50"
            >
              {isLoading ? "LOADING..." : "LOGIN"}
            </button>
          </div>
        </form>

        <div className="text-center text-white text-sm mt-4">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-yellow-300 hover:underline">
            Sign up
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </main>
  )
}
