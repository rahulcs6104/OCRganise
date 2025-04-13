"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Footer } from "@/components/footer"

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile after component mounts
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

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Signup form state
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignupData((prev) => ({ ...prev, [name]: value }))
  }

  const switchToLogin = () => {
    setActiveTab("login")
  }

  const switchToSignup = () => {
    setActiveTab("signup")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (!loginData.email || !loginData.password) {
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
          email: loginData.email,
          password: loginData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Redirect to dashboard on successful login
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (!signupData.firstName || !signupData.lastName || !signupData.email || !signupData.password) {
      setError("All fields are required")
      return
    }

    if (signupData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if (signupData.password !== signupData.confirmPassword) {
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
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          email: signupData.email,
          password: signupData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Signup failed")
      }

      // Show success message and clear form
      setSuccess("Account created successfully! You can now log in.")
      setSignupData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      setActiveTab("login")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Only show logo if we're on login tab or on desktop
  const showLogo = activeTab === "login" || !isMobile

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
      {/* Logo - conditionally rendered */}
      {showLogo && (
        <div className="w-full flex justify-center mt-4 mb-8">
          <div className="relative w-[500px] h-[300px] sm:w-[600px] sm:h-[350px]">
            <Image src="/finall_logo.png" alt="OCRganise Logo" fill style={{ objectFit: "contain" }} priority />
          </div>
        </div>
      )}

      {/* Form container */}
      <div className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[400px] flex flex-col items-center mb-16">
        {/* Tabs - Using separate divs for better touch targets */}
        <div className="flex w-full">
          <div
            className={`w-1/2 py-3 text-center font-bold border-2 border-r-0 border-yellow-300 rounded-tl-md cursor-pointer ${
              activeTab === "login" ? "bg-white text-black" : "bg-[#1a1a2e] text-white"
            }`}
            onClick={switchToLogin}
          >
            LOGIN
          </div>
          <div
            className={`w-1/2 py-3 text-center font-bold border-2 border-l-0 border-yellow-300 rounded-tr-md cursor-pointer ${
              activeTab === "signup" ? "bg-white text-black" : "bg-[#1a1a2e] text-white"
            }`}
            onClick={switchToSignup}
          >
            SIGN UP
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#0f0f1a] border-2 border-yellow-300 rounded-b-md p-4 w-full">
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/50 border-red-800 text-white">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-900/50 border-green-800 text-white">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4 w-full">
              <div className="space-y-2">
                <label htmlFor="login-email" className="block text-white text-sm">
                  USER NAME
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="login-password" className="block text-white text-sm">
                  PASSWORD
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black"
                />
              </div>
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-yellow-300 text-black font-bold rounded-md hover:bg-yellow-400 disabled:opacity-50 active:bg-yellow-500"
                >
                  {isLoading ? "LOADING..." : "LOGIN"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3 w-full">
              <div className="space-y-2">
                <label htmlFor="firstName" className="block text-white text-sm">
                  FIRST NAME
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  value={signupData.firstName}
                  onChange={handleSignupChange}
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
                  value={signupData.lastName}
                  onChange={handleSignupChange}
                  required
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="signup-email" className="block text-white text-sm">
                  EMAIL
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="signup-password" className="block text-white text-sm">
                  PASSWORD
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  value={signupData.password}
                  onChange={handleSignupChange}
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
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  required
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black"
                />
              </div>
              <div className="flex justify-center pt-4 pb-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-yellow-300 text-black font-bold rounded-md hover:bg-yellow-400 disabled:opacity-50 active:bg-yellow-500"
                >
                  {isLoading ? "CREATING..." : "SIGN UP"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </main>
  )
}
