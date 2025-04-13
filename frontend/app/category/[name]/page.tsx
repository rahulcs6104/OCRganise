"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import "../category.css"

type Item = {
  name: string
  price: number
  vendor: string
  category: string
  uploadedAt: string
}

export default function CategoryItemsPage() {
  const router = useRouter()
  const params = useParams()
  const categoryName = params.name as string
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [totalSpent, setTotalSpent] = useState(0)

  // Pinkish purple color for buttons
  const pinkishPurple = "#c026d3" // Tailwind's fuchsia-600

  const handleBack = () => {
    router.push("/category")
  }

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Fetch items for this category from the database
  useEffect(() => {
    async function fetchCategoryItems() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/items/category/${encodeURIComponent(categoryName)}`)

        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated, redirect to login
            router.push("/login")
            return
          }
          throw new Error("Failed to fetch items")
        }

        const data = await response.json()
        setItems(data.items || [])

        // Calculate total spent
        const total = (data.items || []).reduce((sum: number, item: Item) => sum + Number(item.price), 0)
        setTotalSpent(total)
      } catch (err: any) {
        console.error("Error fetching category items:", err)
        setError(err.message || "Failed to load items")
      } finally {
        setIsLoading(false)
      }
    }

    if (categoryName) {
      fetchCategoryItems()
    }
  }, [categoryName, router])

  // Format the category name for display (capitalize first letter)
  const displayCategoryName = categoryName
    ? categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase()
    : ""

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

      <div className="text-center text-white mt-20 mb-6">
        <h1 className="text-2xl mb-2">{displayCategoryName}</h1>
        <p className="text-yellow-300 text-sm">Total Spent: ${totalSpent.toFixed(2)}</p>
      </div>

      {/* Main content */}
      <div className="w-full max-w-md mb-16">
        {isLoading ? (
          <div className="text-center text-white">Loading items...</div>
        ) : error ? (
          <div className="bg-red-900/50 p-4 rounded-md border border-red-800 text-white">
            <p>{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-black/50 p-6 rounded-lg border-2 border-yellow-300 text-center">
            <p className="text-white mb-2">No items found in this category</p>
            <p className="text-yellow-300 text-sm">Add expenses to track your spending.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="bg-black/50 p-4 rounded-lg border-2 border-yellow-300">
                <div className="flex justify-between items-start">
                  <h3 className="text-white text-lg">{item.name}</h3>
                  <p className="text-yellow-300 font-bold">${Number(item.price).toFixed(2)}</p>
                </div>
                <div className="mt-2 text-xs text-gray-300">
                  <p>Vendor: {item.vendor || "Unknown"}</p>
                  <p>Date: {formatDate(item.uploadedAt)}</p>
                </div>
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
