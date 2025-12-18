"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Plus, Trash, Play, Pause, SkipForward, SkipBack, MusicNote } from "@phosphor-icons/react"
import { useAudioLibrary } from "@/contexts/audio-library-context"
import { toast } from "sonner"

export function AudioLibrary() {
  const {
    tracks,
    currentTrackId,
    isPlaying,
    addTrack,
    deleteTrack,
    playTrack,
    pauseTrack,
    nextTrack,
    previousTrack,
  } = useAudioLibrary()

  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [trackTitle, setTrackTitle] = useState("")
  const [isExtracting, setIsExtracting] = useState(false)

  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^?&\s]+)/,
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const handleAddTrack = async () => {
    if (!youtubeUrl.trim()) {
      toast.error("Please enter a YouTube URL")
      return
    }

    const videoId = extractYoutubeId(youtubeUrl)
    if (!videoId) {
      toast.error("Invalid YouTube URL")
      return
    }

    const title = trackTitle.trim() || `Track ${tracks.length + 1}`
    const newTrack = {
      id: `track-${Date.now()}`,
      title,
      youtubeUrl: youtubeUrl.trim(),
      isExtracting: true,
    }

    addTrack(newTrack)
    setYoutubeUrl("")
    setTrackTitle("")

    setIsExtracting(true)
    try {
      const response = await fetch("/api/extract-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl: youtubeUrl.trim(), videoId }),
      })

      if (!response.ok) {
        throw new Error("Failed to extract audio")
      }

      const data = await response.json()
      
      const updatedTrack = tracks.find(t => t.id === newTrack.id)
      if (updatedTrack) {
        updatedTrack.audioUrl = data.audioUrl
        updatedTrack.duration = data.duration
        updatedTrack.isExtracting = false
      }
    } catch (error) {
      console.error("Error extracting audio:", error)
      toast.error("Failed to extract audio from YouTube video")
      deleteTrack(newTrack.id)
    } finally {
      setIsExtracting(false)
    }
  }

  const handlePlayPause = (trackId: string) => {
    if (currentTrackId === trackId && isPlaying) {
      pauseTrack()
    } else {
      playTrack(trackId)
    }
  }

  const currentTrack = tracks.find(t => t.id === currentTrackId)

  return (
    <div className="flex-1 p-8 overflow-auto bg-white">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-black">Audio Library</h2>
      </div>

      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Track from YouTube</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Track Title (Optional)</label>
              <Input
                type="text"
                placeholder="Enter track title"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTrack()}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">YouTube URL</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTrack()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddTrack} 
                  disabled={isExtracting}
                  className="gap-2"
                >
                  <Plus size={16} />
                  {isExtracting ? "Processing..." : "Add"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {currentTrack && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                    <MusicNote size={24} weight="fill" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{currentTrack.title}</div>
                    <div className="text-sm text-gray-600">
                      {isPlaying ? "Now Playing" : "Paused"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousTrack}
                    disabled={tracks.length <= 1}
                  >
                    <SkipBack size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlayPause(currentTrack.id)}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextTrack}
                    disabled={tracks.length <= 1}
                  >
                    <SkipForward size={18} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Tracks ({tracks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {tracks.length === 0 ? (
              <EmptyState message="No tracks in your library yet" />
            ) : (
              <div className="space-y-2">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      currentTrackId === track.id
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePlayPause(track.id)}
                        disabled={track.isExtracting}
                        className="w-10 h-10 rounded-full"
                      >
                        {currentTrackId === track.id && isPlaying ? (
                          <Pause size={18} />
                        ) : (
                          <Play size={18} />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="font-medium">{track.title}</div>
                        {track.isExtracting ? (
                          <div className="text-xs text-blue-600">Extracting audio...</div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            {track.duration ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}` : "Ready"}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteTrack(track.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
