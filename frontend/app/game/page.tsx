"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Footer } from "@/components/footer"
import { PlusCircle, BarChart3, Users, Grid3X3, Sparkles } from "lucide-react"
import "./game.css"

export default function GamePage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [activeCard, setActiveCard] = useState<string | null>(null)

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

  const handleCardClick = (destination: string) => {
    setActiveCard(destination)
    setTimeout(() => {
      router.push(`/${destination}`)
    }, 300)
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/OCR_2.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Press Start 2P', system-ui, sans-serif",
      }}
    >
      {/* Main content area */}
      <div className="w-full max-w-md px-4 mt-20 mb-24">
        {/* Welcome message */}
        <div className="text-center mb-8">
          <h1 className="text-2xl text-white mb-2">Game Quest</h1>
          <p className="text-sm text-yellow-300">Track your expenses and split costs</p>
        </div>

        {/* Grid layout for cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Add Expense Card - Larger spanning 2 columns (moved to first position) */}
          <div
            className={`col-span-2 h-40 bg-black/50 rounded-xl p-4 border-2 border-yellow-300 relative overflow-hidden cursor-pointer transition-all duration-300 ${
              activeCard === "add-expense" ? "scale-95 opacity-80" : "hover:shadow-xl hover:translate-y-[-4px]"
            }`}
            onClick={() => handleCardClick("add-expense")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h2 className="text-white text-lg font-bold">Add Expenses</h2>
                <PlusCircle className="text-white/80" size={24} />
              </div>
              <p className="text-white/80 text-xs mt-2">Add new expenses and split with friends</p>
              <div className="flex justify-end mt-auto">
                <div className="bg-white/20 rounded-full px-3 py-1">
                  <span className="text-white text-xs">New Entry</span>
                </div>
              </div>
            </div>
          </div>

          {/* View Owed Card */}
          <div
            className={`h-48 bg-black/50 rounded-xl p-4 border-2 border-yellow-300 relative overflow-hidden cursor-pointer transition-all duration-300 ${
              activeCard === "owed" ? "scale-95 opacity-80" : "hover:shadow-xl hover:translate-y-[-4px]"
            }`}
            onClick={() => handleCardClick("owed")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-80"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h2 className="text-white text-base font-bold">Money Owed</h2>
                <Users className="text-white/80" size={20} />
              </div>
              <p className="text-white/80 text-xs mt-2">Track who owes you</p>
              <div className="mt-auto">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-white text-xs">$</span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Card */}
          <div
            className={`h-48 bg-black/50 rounded-xl p-4 border-2 border-yellow-300 relative overflow-hidden cursor-pointer transition-all duration-300 ${
              activeCard === "report" ? "scale-95 opacity-80" : "hover:shadow-xl hover:translate-y-[-4px]"
            }`}
            onClick={() => handleCardClick("report")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-80"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h2 className="text-white text-base font-bold">Reports</h2>
                <BarChart3 className="text-white/80" size={20} />
              </div>
              <p className="text-white/80 text-xs mt-2">View spending analytics</p>
              <div className="mt-auto">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center">
                  <Sparkles className="text-white" size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* Category Card - Larger spanning 2 columns (moved to last position) */}
          <div
            className={`col-span-2 h-32 bg-black/50 rounded-xl p-4 border-2 border-yellow-300 relative overflow-hidden cursor-pointer transition-all duration-300 ${
              activeCard === "category" ? "scale-95 opacity-80" : "hover:shadow-xl hover:translate-y-[-4px]"
            }`}
            onClick={() => handleCardClick("category")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-fuchsia-600 opacity-80"></div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h2 className="text-white text-lg font-bold">Categories</h2>
                <Grid3X3 className="text-white/80" size={24} />
              </div>
              <div className="flex justify-end mt-auto">
                <div className="bg-white/20 rounded-full px-3 py-1">
                  <span className="text-white text-xs">Explore</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section - Updated style */}
        <div className="mt-8">
          <h2 className="text-white text-base mb-4">Recent Activity</h2>
          <div className="bg-black/50 rounded-xl p-4 border-2 border-yellow-300 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/20">
              <div>
                <p className="text-white text-xs">Grocery Shopping</p>
                <p className="text-yellow-300 text-xs mt-1">$45.32</p>
              </div>
              <span className="text-white/60 text-xs">Today</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-xs">Coffee with Friends</p>
                <p className="text-yellow-300 text-xs mt-1">$12.50</p>
              </div>
              <span className="text-white/60 text-xs">Yesterday</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto w-full">
        <Footer />
      </div>
    </main>
  )
}
