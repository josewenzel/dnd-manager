"use client"

import { useState } from "react"
import { useMusicContext } from "@/contexts/music-context"
import { Button } from "@/components/ui/button"
import { X, MusicNote } from "@phosphor-icons/react"

export function MiniPlayer() {
  const { currentVideoId, videos, setCurrentVideoId } = useMusicContext()
  const [showSongList, setShowSongList] = useState(false)
  
  const currentVideo = videos.find((v) => v.id === currentVideoId)

  if (!currentVideoId || !currentVideo) return null

  const getYouTubeEmbedUrl = (embedUrl: string) => {
    return `${embedUrl}?autoplay=1&enablejsapi=1`
  }

  const handleSelectSong = (videoId: string) => {
    setCurrentVideoId(videoId)
    setShowSongList(false)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white border-2 border-gray-300 rounded-lg shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center gap-2 flex-1 min-w-0 relative">
          <MusicNote size={14} className="flex-shrink-0" />
          <button
            onClick={() => setShowSongList(!showSongList)}
            onBlur={() => setTimeout(() => setShowSongList(false), 200)}
            className="flex-1 text-left text-xs font-medium truncate cursor-pointer hover:text-gray-700"
          >
            {currentVideo.title}
          </button>
          {showSongList && videos.length > 1 && (
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto z-10">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => handleSelectSong(video.id)}
                  className={`w-full text-left px-3 py-2 hover:bg-gray-100 text-xs ${
                    video.id === currentVideoId ? "bg-gray-50 font-semibold" : ""
                  }`}
                >
                  <div className="truncate">{video.title}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setCurrentVideoId(null)}
          className="h-6 w-6 p-0 flex-shrink-0 min-w-6 flex items-center justify-center"
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
