import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl, videoId } = await request.json()

    if (!youtubeUrl || !videoId) {
      return NextResponse.json(
        { error: "YouTube URL and video ID are required" },
        { status: 400 }
      )
    }

    const audioUrl = `https://www.youtube.com/watch?v=${videoId}`

    const response = {
      audioUrl,
      duration: 0,
      success: true,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in extract-audio API:", error)
    return NextResponse.json(
      { error: "Failed to process audio extraction" },
      { status: 500 }
    )
  }
}
