"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Footer } from "@/components/footer"
import "./add-expense.css"

// Define types for our data structures
type Friend = {
  id: string
  name: string
  color: string
}

type SelectedItem = {
  selected: boolean
  friendId: string | null
}

type Item = {
  name: string
  price: number
  vendor: string
  category: string
  uploadedAt: string
}

type ManualItem = {
  name: string
  price: string
  vendor: string
  category: string
}

export default function AddExpensePage() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [scanResult, setScanResult] = useState<any>(null)
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: SelectedItem }>({})
  const [friends, setFriends] = useState<Friend[]>([
    { id: "self", name: "You", color: "#c026d3" }, // Default "You" friend
  ])
  const [newFriendName, setNewFriendName] = useState("")
  const [newFriendColor, setNewFriendColor] = useState("#3b82f6") // Default blue color
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Manual entry form state
  const [manualItem, setManualItem] = useState<ManualItem>({
    name: "",
    price: "",
    vendor: "",
    category: categories[0] || "food",
  })
  const [manualEntrySuccess, setManualEntrySuccess] = useState(false)

  // Available colors for friends
  const availableColors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#84cc16", // lime
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#d946ef", // fuchsia
    "#ec4899", // pink
  ]

  const handleBack = () => {
    router.push("/game")
  }

  const handleScanReceipt = () => {
    setShowImageUpload(true)
  }

  const handleManualEntry = () => {
    setShowManualEntry(true)
  }

  const handleCloseModal = () => {
    setShowImageUpload(false)
    setShowManualEntry(false)
  }

  // Add a new friend
  const handleAddFriend = () => {
    if (!newFriendName.trim()) {
      setError("Please enter a valid name")
      return
    }

    // Check if name already exists
    if (friends.some((friend) => friend.name.toLowerCase() === newFriendName.toLowerCase())) {
      setError("This name is already added")
      return
    }

    const newFriend: Friend = {
      id: Date.now().toString(),
      name: newFriendName,
      color: newFriendColor,
    }

    setFriends([...friends, newFriend])
    setNewFriendName("")
    setShowAddFriend(false)
    setError("")
  }

  // Remove a friend
  const handleRemoveFriend = (id: string) => {
    // Don't allow removing "You" (self)
    if (id === "self") return

    // Update selected items to reassign to self
    const updatedSelectedItems = { ...selectedItems }
    Object.keys(updatedSelectedItems).forEach((itemName) => {
      if (updatedSelectedItems[itemName].friendId === id) {
        updatedSelectedItems[itemName].friendId = "self"
      }
    })

    setSelectedItems(updatedSelectedItems)
    setFriends(friends.filter((friend) => friend.id !== id))
  }

  // Toggle item selection
  const toggleItemSelection = (itemName: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        selected: !prev[itemName].selected,
      },
    }))
  }

  // Assign item to friend
  const assignItemToFriend = (itemName: string, friendId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemName]: {
        ...prev[itemName],
        friendId,
      },
    }))
  }

  // Calculate total for selected items
  const calculateSelectedTotal = () => {
    if (!scanResult || !scanResult.items) return 0

    return scanResult.items
      .filter((item: any) => selectedItems[item.name]?.selected)
      .reduce((total: number, item: any) => total + Number.parseFloat(item.price), 0)
      .toFixed(2)
  }

  // Calculate total for a specific friend
  const calculateFriendTotal = (friendId: string) => {
    if (!scanResult || !scanResult.items) return 0

    return scanResult.items
      .filter((item: any) => selectedItems[item.name]?.selected && selectedItems[item.name]?.friendId === friendId)
      .reduce((total: number, item: any) => total + Number.parseFloat(item.price), 0)
      .toFixed(2)
  }

  // Handle manual item form change
  const handleManualItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setManualItem((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Save manual item to database
  const saveManualItem = async () => {
    try {
      setIsSaving(true)
      setError("")

      // Validate form
      if (!manualItem.name.trim()) {
        throw new Error("Item name is required")
      }

      if (!manualItem.price.trim() || isNaN(Number(manualItem.price))) {
        throw new Error("Valid price is required")
      }

      // Create item object
      const itemToSave: Item = {
        name: manualItem.name.trim(),
        price: Number(manualItem.price),
        vendor: manualItem.vendor.trim() || "Unknown",
        category: manualItem.category || "uncategorized",
        uploadedAt: new Date().toISOString(),
      }

      // Send to API
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item: itemToSave }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save item")
      }

      // Show success message
      setManualEntrySuccess(true)

      // Reset form after 2 seconds
      setTimeout(() => {
        setManualItem({
          name: "",
          price: "",
          vendor: "",
          category: categories[0] || "food",
        })
        setManualEntrySuccess(false)
        setShowManualEntry(false)
      }, 2000)
    } catch (err: any) {
      console.error("Error saving manual item:", err)
      setError(err.message || "Failed to save item")
    } finally {
      setIsSaving(false)
    }
  }

  // Save expenses to database
  const saveExpenses = async () => {
    try {
      setIsSaving(true)
      setError("")

      if (!scanResult || !scanResult.items) {
        throw new Error("No items to save")
      }

      // 1. Prepare items to save to the user's items array
      const itemsToSave: Item[] = scanResult.items
        .filter((item: any) => selectedItems[item.name]?.selected && selectedItems[item.name]?.friendId === "self")
        .map((item: any) => ({
          name: item.name,
          price: Number.parseFloat(item.price),
          vendor: scanResult.store_name || "Unknown",
          category: item.category || "uncategorized",
          uploadedAt: new Date().toISOString(),
        }))

      // 2. Calculate friend totals for the friends array
      const friendTotals = friends
        .filter((friend) => friend.id !== "self") // Exclude "You"
        .map((friend) => ({
          name: friend.name,
          amount: Number.parseFloat(calculateFriendTotal(friend.id)),
        }))
        .filter((friend) => friend.amount > 0) // Only include friends with amounts > 0

      // 3. Send both to API
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: itemsToSave,
          friends: friendTotals,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save expenses")
      }

      setSaveSuccess(true)

      // Reset form after 2 seconds
      setTimeout(() => {
        setScanResult(null)
        setSelectedItems({})
        setSaveSuccess(false)
        router.push("/game") // Navigate back to game page
      }, 2000)
    } catch (err: any) {
      console.error("Error saving expenses:", err)
      setError(err.message || "Failed to save expenses")
    } finally {
      setIsSaving(false)
    }
  }

  // Fetch categories from the database
  useEffect(() => {
    async function fetchCategories() {
      try {
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
        // Set default category for manual entry
        setManualItem((prev) => ({
          ...prev,
          category: data.categories[0] || "food",
        }))
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Failed to load categories. Please try again.")
      }
    }

    fetchCategories()
  }, [router])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      setError("")
      setScanResult(null)
      setSelectedItems({})

      // Log file info for debugging
      console.log("File selected:", {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`,
      })

      // Create FormData to send the file and categories
      const formData = new FormData()
      formData.append("file", file)

      // Make sure categories is an array and convert to JSON string
      const categoriesJson = JSON.stringify(Array.isArray(categories) ? categories : [])
      formData.append("categories", categoriesJson)

      // Send to our proxy API
      const response = await fetch("/api/scan-receipt", {
        method: "POST",
        body: formData,
      })

      const responseText = await response.text()
      console.log("Raw response:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        throw new Error(`Invalid response format: ${responseText.substring(0, 100)}...`)
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}. ${result.error || ""}`)
      }

      console.log("Scan result:", result)
      setScanResult(result)

      // Initialize all items as selected by default and assigned to self
      if (result && result.items) {
        const initialSelection = result.items.reduce((acc: { [key: string]: SelectedItem }, item: any) => {
          acc[item.name] = { selected: true, friendId: "self" }
          return acc
        }, {})
        setSelectedItems(initialSelection)
      }

      // Close the modal after successful scan
      setShowImageUpload(false)
    } catch (err: any) {
      console.error("Error scanning receipt:", err)
      setError(err.message || "Failed to scan receipt. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Check if we're on mobile after component mounts
  useEffect(() => {
    setMounted(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

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
      {/* Back button */}
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="border-yellow-300 text-yellow-300 hover:bg-yellow-300/10"
        >
          Back
        </Button>
      </div>

      {/* Title */}
      <div className="text-center text-white mt-20 mb-8">
        <h1 className="text-2xl">Add Expense</h1>
      </div>

      {/* Center the buttons in the page */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
        {!scanResult ? (
          <div className="w-full max-w-xs flex flex-col items-center">
            {/* Manual Entry button */}
            <button
              className="w-full py-4 bg-yellow-300 text-black font-bold hover:bg-yellow-400 border-2 border-yellow-300 rounded-md pixel-button text-base"
              onClick={handleManualEntry}
            >
              Manual Entry
            </button>

            {/* Scan Receipt button */}
            <button
              className="w-full py-4 bg-yellow-300 text-black font-bold hover:bg-yellow-400 border-2 border-yellow-300 rounded-md pixel-button text-base mt-12"
              onClick={handleScanReceipt}
            >
              Scan Receipt
            </button>

            {/* Display error if available */}
            {error && (
              <div className="mt-4 bg-red-900/50 p-4 rounded-md w-full border border-red-800">
                <h3 className="text-yellow-300 text-sm mb-2">Error:</h3>
                <p className="text-white text-xs">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full bg-black/50 rounded-lg p-4 border-2 border-yellow-300">
            <h2 className="text-yellow-300 text-xl mb-4 text-center">Scanned Items</h2>

            {/* Display store name if available */}
            {scanResult.store_name && (
              <div className="mb-4 text-center">
                <p className="text-white text-sm">{scanResult.store_name}</p>
              </div>
            )}

            {/* Display date if available */}
            {scanResult.date && (
              <div className="mb-4 text-center">
                <p className="text-white text-xs">{scanResult.date}</p>
              </div>
            )}

            {/* Success message */}
            {saveSuccess && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-800 text-white rounded-md">
                Expenses saved successfully!
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-white rounded-md text-xs">{error}</div>
            )}

            {/* Friends section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-yellow-300 text-sm">Friends</h3>
                <button
                  className="text-xs bg-purple-900/70 hover:bg-purple-800/70 text-white px-2 py-1 rounded-md"
                  onClick={() => setShowAddFriend(true)}
                >
                  + Add Friend
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center bg-black/30 rounded-full px-3 py-1">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: friend.color }}></div>
                    <span className="text-white text-xs mr-2">{friend.name}</span>
                    {friend.id !== "self" && (
                      <button
                        className="text-red-400 hover:text-red-300 text-xs"
                        onClick={() => handleRemoveFriend(friend.id)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {scanResult.items && scanResult.items.length > 0 ? (
                scanResult.items.map((item: any, index: number) => {
                  const itemState = selectedItems[item.name] || { selected: false, friendId: "self" }
                  const assignedFriend = friends.find((f) => f.id === itemState.friendId)

                  return (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-3 rounded-md ${
                        itemState.selected ? "bg-purple-900/50 border border-purple-500" : "bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={itemState.selected}
                          onChange={() => toggleItemSelection(item.name)}
                          className="mr-3 h-4 w-4 accent-purple-500"
                        />
                        <span className="text-white text-xs">{item.name}</span>
                      </div>
                      <div className="flex items-center">
                        {itemState.selected && (
                          <div className="relative mr-3">
                            <div
                              className="w-4 h-4 rounded-full cursor-pointer"
                              style={{ backgroundColor: assignedFriend?.color || "#c026d3" }}
                              onClick={(e) => {
                                e.stopPropagation()
                                const dropdown = document.getElementById(`friend-dropdown-${index}`)
                                if (dropdown) {
                                  dropdown.classList.toggle("hidden")
                                }
                              }}
                            ></div>
                            <div
                              id={`friend-dropdown-${index}`}
                              className="absolute right-0 mt-1 w-32 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-10 hidden"
                            >
                              {friends.map((friend) => (
                                <div
                                  key={friend.id}
                                  className="flex items-center px-3 py-2 hover:bg-gray-800 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    assignItemToFriend(item.name, friend.id)
                                    document.getElementById(`friend-dropdown-${index}`)?.classList.add("hidden")
                                  }}
                                >
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: friend.color }}
                                  ></div>
                                  <span className="text-white text-xs">{friend.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <span className="text-yellow-300 text-xs">${Number.parseFloat(item.price).toFixed(2)}</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-white text-center text-xs">No items found in receipt</p>
              )}
            </div>

            {/* Friend totals section */}
            <div className="border-t border-yellow-300/30 pt-4 mb-4">
              <h3 className="text-yellow-300 text-sm mb-2">Split Summary</h3>
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: friend.color }}></div>
                      <span className="text-white text-xs">{friend.name}</span>
                    </div>
                    <span className="text-yellow-300 text-xs">${calculateFriendTotal(friend.id)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total section */}
            <div className="border-t border-yellow-300/30 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-white text-sm">Total:</span>
                <span className="text-yellow-300 text-lg">${calculateSelectedTotal()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 space-y-3">
              <button
                className="w-full py-3 bg-yellow-300 text-black font-bold hover:bg-yellow-400 border-2 border-yellow-300 rounded-md pixel-button text-sm"
                onClick={saveExpenses}
                disabled={isSaving || saveSuccess}
              >
                {isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Expenses"}
              </button>

              <button
                className="w-full py-3 bg-yellow-300 text-black font-bold hover:bg-yellow-400 border-2 border-yellow-300 rounded-md pixel-button text-sm"
                onClick={() => {
                  setScanResult(null)
                  setSelectedItems({})
                }}
                disabled={isSaving || saveSuccess}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>

      {/* Hidden file inputs */}
      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="camera"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="bg-[#1a1a2e] border-2 border-yellow-300 rounded-xl p-6 max-w-sm w-full"
            style={{ fontFamily: "'Press Start 2P', system-ui, sans-serif" }}
          >
            <h2 className="text-white text-lg mb-6 text-center">Add Item Manually</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-white rounded-md text-xs">{error}</div>
            )}

            {manualEntrySuccess && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-800 text-white rounded-md text-xs">
                Item added successfully!
              </div>
            )}

            <div className="space-y-4">
              {/* Item Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-white text-xs">
                  ITEM NAME
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={manualItem.name}
                  onChange={handleManualItemChange}
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black text-sm"
                  placeholder="e.g., Coffee"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label htmlFor="price" className="block text-white text-xs">
                  PRICE
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={manualItem.price}
                  onChange={handleManualItemChange}
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black text-sm"
                  placeholder="e.g., 4.50"
                />
              </div>

              {/* Vendor */}
              <div className="space-y-2">
                <label htmlFor="vendor" className="block text-white text-xs">
                  VENDOR
                </label>
                <input
                  id="vendor"
                  name="vendor"
                  type="text"
                  value={manualItem.vendor}
                  onChange={handleManualItemChange}
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black text-sm"
                  placeholder="e.g., Starbucks"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-white text-xs">
                  CATEGORY
                </label>
                <select
                  id="category"
                  name="category"
                  value={manualItem.category}
                  onChange={handleManualItemChange}
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-yellow-300 rounded-md text-black text-sm"
                >
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  ) : (
                    <option value="food">food</option>
                  )}
                </select>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  className="flex-1 py-3 bg-yellow-300 text-black font-bold hover:bg-yellow-400 border-2 border-yellow-300 rounded-md pixel-button text-sm"
                  onClick={saveManualItem}
                  disabled={isSaving || manualEntrySuccess}
                >
                  {isSaving ? "Saving..." : manualEntrySuccess ? "Saved!" : "Save Item"}
                </button>

                <button
                  className="flex-1 py-3 bg-yellow-300 text-black font-bold hover:bg-yellow-400 border-2 border-yellow-300 rounded-md pixel-button text-sm"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="bg-[#1a1a2e] border-2 border-yellow-300 rounded-md p-6 max-w-sm w-full"
            style={{ fontFamily: "'Press Start 2P', system-ui, sans-serif" }}
          >
            {isLoading ? (
              /* Loading State */
              <div className="text-center py-8">
                <h2 className="text-white text-lg mb-8">Processing</h2>
                <div className="loading-dots text-yellow-300 text-2xl"></div>
                <p className="text-white/60 text-xs mt-8">Scanning your receipt</p>
              </div>
            ) : (
              /* Normal State */
              <>
                <h2 className="text-white text-lg mb-6 text-center">Upload Receipt</h2>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-white rounded-md text-xs">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    className="w-full py-3 bg-yellow-300 text-black font-bold hover:bg-yellow-400 border-2 border-yellow-300 rounded-md pixel-button text-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload File
                  </button>

                  <button
                    className="w-full py-3 bg-yellow-300 text-black font-bold hover:bg-yellow-400 border-2 border-yellow-300 rounded-md pixel-button text-sm"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    Take Photo
                  </button>

                  <button
                    className="w-full py-3 bg-yellow-300 text-black font-bold hover:bg-yellow-400 border-2 border-yellow-300 rounded-md pixel-button text-sm"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="bg-[#1a1a2e] border-2 border-yellow-300 rounded-md p-6 max-w-sm w-full"
            style={{ fontFamily: "'Press Start 2P', system-ui, sans-serif" }}
          >
            <h2 className="text-white text-lg mb-6 text-center">Add Friend</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-800 text-white rounded-md text-xs">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-yellow-300 text-xs mb-2">
                  Friend Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
                  placeholder="Enter friend's name"
                />
              </div>

              <div>
                <label className="block text-yellow-300 text-xs mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <div
                      key={color}
                      className={`w-6 h-6 rounded-full cursor-pointer ${
                        newFriendColor === color ? "ring-2 ring-white" : ""
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewFriendColor(color)}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  className="flex-1 py-3 bg-yellow-300 text-black font-bold hover:bg-yellow-400 border-2 border-yellow-300 rounded-md pixel-button text-sm"
                  onClick={handleAddFriend}
                >
                  Add
                </button>

                <button
                  className="flex-1 py-3 bg-yellow-300 text-black font-bold hover:bg-yellow-400 border-2 border-yellow-300 rounded-md pixel-button text-sm"
                  onClick={() => {
                    setShowAddFriend(false)
                    setError("")
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
