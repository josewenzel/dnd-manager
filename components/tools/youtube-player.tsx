"use client"

import { forwardRef, useEffect, useRef, Ref } from "react"

interface YouTubePlayerProps {
  videoUrl: string
  onVideoChange?: () => void
}

export const YouTubePlayer = forwardRef(
  ({ videoUrl }: YouTubePlayerProps, ref: Ref<{ stopVideo: () => void }>) => {
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
      // Dynamically load YouTube IFrame API if not already loaded
      if (!(window as any).YT) {
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        const firstScriptTag = document.getElementsByTagName("script")[0]
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag)
      }
    }, [])

    // Expose stopVideo method
    const stopVideo = () => {
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src
      }
    }

    // Make the stopVideo method available through the ref
    useEffect(() => {
      if (ref && typeof ref === "object") {
        (ref as any).current = { stopVideo }
      }
    }, [ref])

    return (
      <div className="w-full pt-[56.25%] relative bg-black overflow-hidden border border-gray-300">
        <iframe
          ref={iframeRef}
          className="absolute top-0 left-0 w-full h-full"
          src={videoUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube Music Player"
        />
      </div>
    )
  }
)

YouTubePlayer.displayName = "YouTubePlayer"
