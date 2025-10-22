"use client"

import { useMusicContext } from "@/contexts/music-context"
import { Button } from "@/components/ui/button"
import { X, Music2 } from "lucide-react"

export function MiniPlayer() {
  const { currentVideoId, videos, setCurrentVideoId } = useMusicContext()
  
  const currentVideo = videos.find((v) => v.id === currentVideoId)

  if (!currentVideoId || !currentVideo) return null

  const getYouTubeEmbedUrl = (embedUrl: string) => {
    return `${embedUrl}?autoplay=1&enablejsapi=1`
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white border-2 border-gray-300 rounded-lg shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Music2 size={14} />
          <span className="text-xs font-medium truncate">{currentVideo.title}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setCurrentVideoId(null)}
          className="h-6 w-6 p-0 flex-shrink-0 min-w-6"
        >
          <X size={14} className="flex-shrink-0" />
        </Button>
      </div>
      <div className="aspect-video">
        <iframe
          className="w-full h-full"
          src={getYouTubeEmbedUrl(currentVideo.youtubeUrl)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube Music Player"
        />
      </div>
    </div>
  )
}
