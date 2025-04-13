import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()

    // Log what we're sending for debugging
    console.log("Sending to backend:", {
      url: "https://cortelix-backend-1.onrender.com/scan-receipt/",
      categories: formData.get("categories"),
      hasImage: formData.has("file"), // Changed from "receipt_image" to "file"
    })

    // Forward the request to the deployed backend
    const response = await fetch("https://cortelix-backend-1.onrender.com/scan-receipt/", {
      method: "POST",
      body: formData,
      // Add a longer timeout for cloud processing
      signal: AbortSignal.timeout(60000), // 60 seconds timeout for cloud processing
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error text available")
      console.error("Backend error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      })
      throw new Error(`Backend error: ${response.status} ${response.statusText}. ${errorText}`)
    }

    // Get the response from the backend
    const data = await response.json()
    console.log("Backend response:", data)

    // Return the response to the client
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error in scan-receipt proxy:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to process receipt",
        details: "Check server logs for more information",
      },
      { status: 500 },
    )
  }
}
