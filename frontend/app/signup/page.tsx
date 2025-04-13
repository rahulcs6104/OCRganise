"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("All fields are required")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      // Redirect to login page on successful signup
      router.push("/login?registered=true")
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
        <h1 className="text-xl text-white text-center mb-6">SIGN UP</h1>

        {error && <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-white rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3 w-full">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-white text-sm">
              FIRST NAME
            </label>
            <input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-white text-sm">
              LAST NAME
            </label>
            <input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-white text-sm">
              EMAIL
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
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-white text-sm">
              CONFIRM PASSWORD
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black"
            />
          </div>
          <div className="flex justify-center pt-4 pb-2">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-yellow-300 text-black font-bold rounded-md hover:bg-yellow-400 disabled:opacity-50"
            >
              {isLoading ? "CREATING..." : "SIGN UP"}
            </button>
          </div>
        </form>

        <div className="text-center text-white text-sm mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-300 hover:underline">
            Login
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
