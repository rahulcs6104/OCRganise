"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import { PlusCircle, Tag } from "lucide-react"
import "./category.css"

export default function CategoryPage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const handleBack = () => {
    router.push("/game")
  }

  const handleAddCategory = () => {
    setShowAddCategoryModal(true)
  }

  const handleCloseModal = () => {
    setShowAddCategoryModal(false)
    setNewCategoryName("")
    setError("")
  }

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category)
    setTimeout(() => {
      router.push(`/category/${encodeURIComponent(category.toLowerCase())}`)
    }, 300)
  }

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      setError("Category name cannot be empty")
      return
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: newCategoryName.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to add category")
      }

      // Update categories with the response from the server
      setCategories(data.categories)
      handleCloseModal()
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Fetch categories from the database
  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/categories")

        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated, redirect to login
            router.push("/login")
            return
          }
          throw new Error("Failed to fetch categories")
        }

        const data = await response.json()
        setCategories(data.categories)
      } catch (err) {
        console.error("Error fetching categories:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [router])

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

  // Function to get a color for each category
  const getCategoryColor = (index: number) => {
    const colors = [
      "bg-gradient-to-br from-purple-500 to-fuchsia-600",
      "bg-gradient-to-br from-amber-500 to-orange-600",
      "bg-gradient-to-br from-emerald-500 to-teal-600",
      "bg-gradient-to-br from-blue-500 to-indigo-600",
      "bg-gradient-to-br from-rose-500 to-pink-600",
      "bg-gradient-to-br from-yellow-500 to-amber-600",
    ]
    return colors[index % colors.length]
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/signup_background.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Press Start 2P', system-ui, sans-serif",
      }}
    >
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          onClick={handleBack}
          className="border-yellow-300 text-yellow-300 hover:bg-yellow-300/10"
        >
          Back
        </Button>
      </div>

      <div className="text-center text-white mt-16 mb-8">
        <h1 className="text-2xl mb-2">Categories</h1>
        <p className="text-sm text-yellow-300">Select a category to view items</p>
      </div>

      {/* Category grid */}
      <div className="w-full max-w-md px-4 mb-24">
        {isLoading ? (
          <div className="text-center text-white py-8">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center bg-white/10 rounded-xl p-8">
            <div className="text-white mb-4">No categories found</div>
            <p className="text-yellow-300 text-sm mb-6">Add your first category to get started</p>
            <Button
              onClick={handleAddCategory}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 py-2 flex items-center gap-2"
            >
              <PlusCircle size={16} />
              <span>Add Category</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category, index) => (
              <div
                key={category}
                className={`${getCategoryColor(index)} rounded-xl p-4 shadow-lg cursor-pointer transition-all duration-300 border-2 border-yellow-300 ${
                  activeCategory === category ? "scale-95 opacity-80" : "hover:shadow-xl hover:translate-y-[-4px]"
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                <div className="flex flex-col h-32 justify-between">
                  <div className="flex justify-between items-start">
                    <h2 className="text-white text-sm font-bold max-w-[80%] overflow-hidden">
                      {category === "Entertainment" ? <span className="inline-block">enter~</span> : category}
                    </h2>
                    <Tag className="text-white/80" size={16} />
                  </div>
                  <div className="mt-auto">
                    <div className="bg-white/20 rounded-full px-3 py-1 inline-block">
                      <span className="text-white text-xs">View</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Category Card */}
            <div
              className="bg-white/10 rounded-xl p-4 shadow-lg cursor-pointer transition-all duration-300 hover:bg-white/20 border-2 border-yellow-300"
              onClick={handleAddCategory}
            >
              <div className="flex flex-col h-32 items-center justify-center">
                <PlusCircle className="text-yellow-300 mb-2" size={32} />
                <span className="text-white text-xs">Add Category</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto w-full">
        <Footer />
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="bg-[#1a1a2e] border-2 border-yellow-300 rounded-xl p-6 max-w-sm w-full"
            style={{ fontFamily: "'Press Start 2P', system-ui, sans-serif" }}
          >
            <h2 className="text-white text-lg mb-6 text-center">Add Category</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-white rounded-md text-xs">{error}</div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="categoryName" className="block text-white text-sm">
                  CATEGORY NAME
                </label>
                <input
                  id="categoryName"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black"
                  placeholder="Enter category name"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <Button
                  onClick={handleSaveCategory}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white rounded-md py-3"
                >
                  Save
                </Button>

                <Button
                  onClick={handleCloseModal}
                  className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-md py-3"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
