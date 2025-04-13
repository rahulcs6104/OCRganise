"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Footer } from "@/components/footer"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { DollarSign, TrendingUp, ChevronLeft, ArrowUpRight, ArrowDownRight } from "lucide-react"

// Define types
type Item = {
  name: string
  price: number
  vendor: string
  category: string
  uploadedAt: string
}

type CategoryTotal = {
  name: string
  value: number
  color: string
}

type VendorTotal = {
  name: string
  value: number
  color: string
}

type DailySpending = {
  date: string
  amount: number
}

export default function ReportPage() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState("week")
  const [dailySpending, setDailySpending] = useState<DailySpending[]>([])
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([])
  const [vendorTotals, setVendorTotals] = useState<VendorTotal[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [averagePerDay, setAveragePerDay] = useState(0)
  const [topCategory, setTopCategory] = useState("")
  const [topVendor, setTopVendor] = useState("")
  const [percentChange, setPercentChange] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Category colors
  const categoryColors = {
    food: "#8b5cf6",
    travel: "#f59e0b",
    entertainment: "#ec4899",
    utilities: "#10b981",
    default: "#6b7280",
  }

  // Vendor colors - a different color palette
  const vendorColors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#d946ef", // fuchsia
  ]

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const handleBack = () => {
    router.push("/game")
  }

  // Fetch items from the database
  useEffect(() => {
    async function fetchItems() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/items")

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login")
            return
          }
          throw new Error("Failed to fetch items")
        }

        const data = await response.json()
        setItems(data.items || [])
      } catch (err: any) {
        console.error("Error fetching items:", err)
        setError(err.message || "Failed to load items")
      } finally {
        setIsLoading(false)
      }
    }

    fetchItems()
  }, [router])

  // Process data when items or timeRange changes
  useEffect(() => {
    if (items.length === 0) return

    // Filter items based on time range
    const now = new Date()
    const filteredItems = items.filter((item) => {
      const itemDate = new Date(item.uploadedAt)
      if (timeRange === "week") {
        // Last 7 days
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return itemDate >= weekAgo
      } else if (timeRange === "month") {
        // Last 30 days
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return itemDate >= monthAgo
      } else if (timeRange === "year") {
        // Last 365 days
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        return itemDate >= yearAgo
      }
      return true
    })

    // Calculate total spent
    const total = filteredItems.reduce((sum, item) => sum + Number(item.price), 0)
    setTotalSpent(total)

    // Calculate average per day
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365
    setAveragePerDay(total / days)

    // Calculate category totals
    const categoryMap = new Map<string, number>()
    filteredItems.forEach((item) => {
      const category = item.category || "uncategorized"
      const currentTotal = categoryMap.get(category) || 0
      categoryMap.set(category, currentTotal + Number(item.price))
    })

    const categoryData: CategoryTotal[] = Array.from(categoryMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: (categoryColors as any)[name] || categoryColors.default,
    }))

    setCategoryTotals(categoryData.sort((a, b) => b.value - a.value))

    // Set top category
    if (categoryData.length > 0) {
      setTopCategory(categoryData.sort((a, b) => b.value - a.value)[0].name)
    }

    // Calculate vendor totals
    const vendorMap = new Map<string, number>()
    filteredItems.forEach((item) => {
      const vendor = item.vendor || "Unknown"
      const currentTotal = vendorMap.get(vendor) || 0
      vendorMap.set(vendor, currentTotal + Number(item.price))
    })

    const vendorData: VendorTotal[] = Array.from(vendorMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: vendorColors[index % vendorColors.length],
    }))

    setVendorTotals(vendorData.sort((a, b) => b.value - a.value))

    // Set top vendor
    if (vendorData.length > 0) {
      setTopVendor(vendorData.sort((a, b) => b.value - a.value)[0].name)
    }

    // Calculate daily spending
    const dailyMap = new Map<string, number>()

    // Determine date range based on timeRange
    let startDate: Date
    if (timeRange === "week") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (timeRange === "month") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else {
      // For year, we'll group by month instead of day
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    }

    // Initialize all dates in range with 0
    if (timeRange !== "year") {
      // For week and month, show daily data
      for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0]
        dailyMap.set(dateStr, 0)
      }
    } else {
      // For year, show monthly data
      for (let m = 0; m < 12; m++) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1)
        const monthStr = monthDate.toISOString().split("T")[0].substring(0, 7) // YYYY-MM
        dailyMap.set(monthStr, 0)
      }
    }

    // Add spending data
    filteredItems.forEach((item) => {
      const itemDate = new Date(item.uploadedAt)
      let dateKey: string

      if (timeRange !== "year") {
        dateKey = itemDate.toISOString().split("T")[0] // YYYY-MM-DD
      } else {
        dateKey = itemDate.toISOString().split("T")[0].substring(0, 7) // YYYY-MM
      }

      const currentAmount = dailyMap.get(dateKey) || 0
      dailyMap.set(dateKey, currentAmount + Number(item.price))
    })

    // Convert to array and sort by date
    const dailyData = Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))

    setDailySpending(dailyData)

    // Calculate percent change from previous period
    if (dailyData.length > 0) {
      const currentPeriodTotal = total

      // Calculate previous period total
      const previousPeriodItems = items.filter((item) => {
        const itemDate = new Date(item.uploadedAt)
        if (timeRange === "week") {
          // Previous 7 days
          const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return itemDate >= twoWeeksAgo && itemDate < weekAgo
        } else if (timeRange === "month") {
          // Previous 30 days
          const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return itemDate >= twoMonthsAgo && itemDate < monthAgo
        } else if (timeRange === "year") {
          // Previous 365 days
          const twoYearsAgo = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000)
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          return itemDate >= twoYearsAgo && itemDate < yearAgo
        }
        return false
      })

      const previousPeriodTotal = previousPeriodItems.reduce((sum, item) => sum + Number(item.price), 0)

      if (previousPeriodTotal > 0) {
        const change = ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100
        setPercentChange(change)
      } else {
        setPercentChange(100) // If previous period had no spending, consider it 100% increase
      }
    }
  }, [items, timeRange])

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (timeRange === "year" && dateStr.length === 7) {
      // For yearly view, format as "Jan", "Feb", etc.
      const date = new Date(`${dateStr}-01T00:00:00`)
      return date.toLocaleString("default", { month: "short" })
    }

    // For weekly and monthly views
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return `${value.toFixed(2)}`
  }

  // Custom tooltip for mobile
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 p-3 border border-yellow-300 rounded-md shadow-lg">
          <p className="text-white text-xs mb-1">{formatDate(label)}</p>
          <p className="text-yellow-300 text-sm font-bold">${Number(payload[0].value).toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  // Get period label based on timeRange
  const getPeriodLabel = () => {
    switch (timeRange) {
      case "week":
        return "vs previous week"
      case "month":
        return "vs previous month"
      case "year":
        return "vs previous year"
      default:
        return "vs previous period"
    }
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
      {/* Back button - larger and more touch-friendly for mobile */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="outline"
          onClick={handleBack}
          className="border-yellow-300 text-yellow-300 hover:bg-yellow-300/10 px-3 py-2 flex items-center gap-1"
          size={isMobile ? "lg" : "default"}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </div>

      <div className="text-center text-white mt-20 mb-6">
        <h1 className="text-xl md:text-2xl mb-2">Spending Reports</h1>
        <p className="text-xs md:text-sm text-yellow-300">Track your spending patterns</p>
      </div>

      {/* Time range selector - Mobile optimized */}
      <div className="w-full max-w-4xl mb-6 px-2">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full md:w-[180px] bg-black/50 border-2 border-yellow-300 text-white h-12 md:h-10 text-sm">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent className="bg-black/90 border-2 border-yellow-300 text-white">
            <SelectItem value="week" className="text-sm py-3 md:py-2">
              Last 7 Days
            </SelectItem>
            <SelectItem value="month" className="text-sm py-3 md:py-2">
              Last 30 Days
            </SelectItem>
            <SelectItem value="year" className="text-sm py-3 md:py-2">
              Last Year
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main content */}
      <div className="w-full max-w-4xl mb-16 px-2">
        {isLoading ? (
          <div className="text-center text-white py-12">Loading reports...</div>
        ) : error ? (
          <div className="bg-red-900/50 p-4 rounded-md border border-red-800 text-white">
            <p>{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-black/50 p-6 rounded-lg border-2 border-yellow-300 text-center">
            <p className="text-white mb-2">No spending data available</p>
            <p className="text-yellow-300 text-sm">Add expenses to see your spending reports.</p>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            {/* Mobile-optimized tabs with larger touch targets - Only Overview and Trends */}
            <TabsList className="grid w-full grid-cols-2 bg-black/50 border-2 border-yellow-300 h-14 md:h-10">
              <TabsTrigger
                value="overview"
                className="text-white data-[state=active]:bg-purple-900/50 text-xs md:text-sm py-4 md:py-2"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="trends"
                className="text-white data-[state=active]:bg-purple-900/50 text-xs md:text-sm py-4 md:py-2"
              >
                Trends
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab - Mobile optimized */}
            <TabsContent value="overview">
              {/* Stats cards - Single column on mobile, multi-column on larger screens */}
              <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mt-4">
                <Card className="bg-black/50 border-2 border-yellow-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
                    <CardTitle className="text-xs font-medium text-white">Total Spent</CardTitle>
                    <DollarSign className="h-4 w-4 text-yellow-300" />
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-0">
                    <div className="text-lg md:text-2xl font-bold text-yellow-300">${formatCurrency(totalSpent)}</div>
                    <p className="text-[10px] md:text-xs text-white/70 mt-1">
                      {timeRange === "week" ? "Last 7 days" : timeRange === "month" ? "Last 30 days" : "Last year"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-black/50 border-2 border-yellow-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
                    <CardTitle className="text-xs font-medium text-white">Daily Avg</CardTitle>
                    <TrendingUp className="h-4 w-4 text-yellow-300" />
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-0">
                    <div className="text-lg md:text-2xl font-bold text-yellow-300">
                      ${formatCurrency(averagePerDay)}
                    </div>
                    <p className="text-[10px] md:text-xs text-white/70 mt-1">Per day</p>
                  </CardContent>
                </Card>

                <Card className="bg-black/50 border-2 border-yellow-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
                    <CardTitle className="text-xs font-medium text-white">Top Category</CardTitle>
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{
                        backgroundColor: (categoryColors as any)[topCategory] || categoryColors.default,
                      }}
                    />
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-0">
                    <div className="text-lg md:text-2xl font-bold text-yellow-300 capitalize truncate">
                      {topCategory}
                    </div>
                    <p className="text-[10px] md:text-xs text-white/70 mt-1">Highest spending</p>
                  </CardContent>
                </Card>

                {/* Replace Top Vendor with Comparative Change */}
                <Card className="bg-black/50 border-2 border-yellow-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
                    <CardTitle className="text-xs font-medium text-white">Change</CardTitle>
                    {percentChange >= 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-red-400" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-green-400" />
                    )}
                  </CardHeader>
                  <CardContent className="px-3 pb-3 pt-0">
                    <div
                      className={`text-lg md:text-2xl font-bold ${
                        percentChange >= 0 ? "text-red-400" : "text-green-400"
                      }`}
                    >
                      {percentChange >= 0 ? "+" : ""}
                      {percentChange.toFixed(1)}%
                    </div>
                    <p className="text-[10px] md:text-xs text-white/70 mt-1">{getPeriodLabel()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts - Single column on mobile */}
              <div className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card className="bg-black/50 border-2 border-yellow-300">
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-white text-sm md:text-base">Spending Over Time</CardTitle>
                    <CardDescription className="text-white/70 text-xs">Your spending pattern</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-0 pr-2 pb-4">
                    <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                      <LineChart
                        data={dailySpending}
                        margin={{ top: 5, right: 5, left: isMobile ? -20 : 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis
                          dataKey="date"
                          stroke="#fff"
                          tickFormatter={formatDate}
                          tick={{ fill: "#fff", fontSize: isMobile ? 8 : 12 }}
                          tickMargin={10}
                          interval={isMobile ? "preserveStartEnd" : 0}
                        />
                        <YAxis
                          stroke="#fff"
                          tickFormatter={(value) => `${value}`}
                          tick={{ fill: "#fff", fontSize: isMobile ? 8 : 12 }}
                          width={isMobile ? 30 : 40}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#c026d3"
                          strokeWidth={2}
                          dot={{ fill: "#c026d3", r: isMobile ? 3 : 4 }}
                          activeDot={{ r: isMobile ? 5 : 6, fill: "#f0abfc" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-black/50 border-2 border-yellow-300">
                  <CardHeader className="px-4 py-3">
                    <CardTitle className="text-white text-sm md:text-base">Category Breakdown</CardTitle>
                    <CardDescription className="text-white/70 text-xs">Spending distribution</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Pie
                          data={categoryTotals}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={isMobile ? 60 : 80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {categoryTotals.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          formatter={(value) => (
                            <span style={{ color: "#fff", fontSize: isMobile ? 10 : 12 }}>{value}</span>
                          )}
                          layout={isMobile ? "horizontal" : "vertical"}
                          verticalAlign={isMobile ? "bottom" : "middle"}
                          align={isMobile ? "center" : "right"}
                          wrapperStyle={isMobile ? { fontSize: 10 } : {}}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Trends Tab - Mobile optimized */}
            <TabsContent value="trends">
              <Card className="bg-black/50 border-2 border-yellow-300 mt-4">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-white text-sm md:text-base">Spending Trends</CardTitle>
                  <CardDescription className="text-white/70 text-xs">Your spending over time</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
                    <LineChart data={dailySpending} margin={{ top: 5, right: 5, left: isMobile ? -20 : 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis
                        dataKey="date"
                        stroke="#fff"
                        tickFormatter={formatDate}
                        tick={{ fill: "#fff", fontSize: isMobile ? 8 : 12 }}
                        tickMargin={10}
                        interval={isMobile ? "preserveStartEnd" : 0}
                      />
                      <YAxis
                        stroke="#fff"
                        tickFormatter={(value) => `${value}`}
                        tick={{ fill: "#fff", fontSize: isMobile ? 8 : 12 }}
                        width={isMobile ? 30 : 40}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#c026d3"
                        strokeWidth={2}
                        dot={{ fill: "#c026d3", r: isMobile ? 3 : 4 }}
                        activeDot={{ r: isMobile ? 5 : 6, fill: "#f0abfc" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Vendor spending breakdown */}
              <Card className="bg-black/50 border-2 border-yellow-300 mt-4">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-white text-sm md:text-base">Spending by Vendor</CardTitle>
                  <CardDescription className="text-white/70 text-xs">Where your money goes</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <ResponsiveContainer width="100%" height={isMobile ? 300 : 350}>
                    <BarChart
                      data={vendorTotals}
                      layout="vertical"
                      margin={{ top: 5, right: 5, left: isMobile ? 10 : 50, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis type="number" stroke="#fff" tick={{ fill: "#fff", fontSize: isMobile ? 8 : 12 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#fff"
                        tick={{ fill: "#fff", fontSize: isMobile ? 8 : 12 }}
                        width={isMobile ? 80 : 120}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value">
                        {vendorTotals.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Daily spending breakdown */}
              <Card className="bg-black/50 border-2 border-yellow-300 mt-4">
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-white text-sm md:text-base">Daily Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="max-h-[300px] overflow-y-auto pr-2">
                    <div className="space-y-3">
                      {dailySpending
                        .filter((day) => day.amount > 0)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((day, index) => (
                          <div key={index} className="flex justify-between items-center border-b border-white/10 pb-2">
                            <span className="text-white text-xs">{formatDate(day.date)}</span>
                            <span className="text-yellow-300 font-bold text-sm">${formatCurrency(day.amount)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>
    </main>
  )
}
