"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal, ModalContent } from "@/components/ui/modal"
import { Play, Trash2, Plus, Info } from "lucide-react"
import Image from "next/image"
import { useMusicContext } from "@/contexts/music-context"

export function MusicTool() {
  const { videos, currentVideoId, setCurrentVideoId, addVideo, deleteVideo } = useMusicContext()
  const [urlInput, setUrlInput] = useState("")
  const [titleInput, setTitleInput] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)

  const extractYouTubeId = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      if (urlObj.hostname.includes("youtube.com")) {
        return urlObj.searchParams.get("v")
      } else if (urlObj.hostname.includes("youtu.be")) {
        return urlObj.pathname.slice(1)
      }
    } catch {
      return null
    }
    return null
  }

  const handleAddVideo = () => {
    if (!urlInput.trim() || !titleInput.trim()) {
      alert("Please enter both title and URL")
      return
    }

    const youtubeId = extractYouTubeId(urlInput)
    if (!youtubeId) {
      alert("Invalid YouTube URL")
      return
    }

    const newVideo = {
      id: `video-${Date.now()}`,
      title: titleInput,
      youtubeUrl: `https://www.youtube.com/embed/${youtubeId}`,
    }

    addVideo(newVideo)
    setTitleInput("")
    setUrlInput("")
    setShowAddForm(false)
  }

  const handlePlayVideo = (videoId: string) => {
    setCurrentVideoId(videoId)
  }

  const handleDeleteVideo = (videoId: string) => {
    deleteVideo(videoId)
  }

  const getYouTubeThumbnail = (embedUrl: string) => {
    const videoId = embedUrl.split("/embed/")[1]?.split("?")[0]
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
  }

  return (
    <div className="flex-1 p-8 overflow-auto bg-white">
      <div className="flex items-center gap-2 mb-8">
        <h2 className="text-3xl font-bold text-black leading-none">Music Player</h2>
        <button
          onClick={() => setShowInfoModal(true)}
          className="text-gray-600 hover:text-gray-900 transition-colors mt-0.5"
        >
          <Info size={20} />
        </button>
      </div>

      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)}>
        <ModalContent>
          <h3 className="text-xl font-bold mb-4">Music Recommendations</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <p>
              Looking for great D&D ambient music and soundscapes? Check out the{" "}
              <a
                href="https://www.youtube.com/@bardify"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                Bardify YouTube channel
              </a>
              !
            </p>
            <p>
              They create amazing ambient music perfect for D&D sessions. Consider subscribing to support their work.
            </p>
            <p className="text-xs text-gray-500 italic">
              Note: We are not affiliated with Bardify. This is simply a recommendation for quality content.
            </p>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setShowInfoModal(false)}>
              Close
            </Button>
          </div>
        </ModalContent>
      </Modal>

      <div className="max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <Card key={video.id} className={`overflow-hidden cursor-pointer transition-all ${
              currentVideoId === video.id ? "ring-2 ring-black" : ""
            }`}>
              <div className="relative aspect-video bg-gray-900">
                <Image
                  src={getYouTubeThumbnail(video.youtubeUrl)}
                  alt={video.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePlayVideo(video.id)}
                    className="gap-2"
                  >
                    <Play size={16} />
                    Play
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteVideo(video.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4 pt-5">
                <h3 className="font-medium text-sm truncate">{video.title}</h3>
              </CardContent>
            </Card>
          ))}

          {showAddForm ? (
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Title</label>
                  <Input
                    placeholder="e.g., Forest Ambience"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddVideo()}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">YouTube URL</label>
                  <Input
                    placeholder="https://youtube.com/..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddVideo()}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddVideo} className="flex-1 h-9 text-sm gap-1">
                    <Plus size={14} />
                    Add
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowAddForm(false)
                      setTitleInput("")
                      setUrlInput("")
                    }}
                    className="h-9 text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="border-2 border-dashed border-card-border bg-card-bg hover:bg-card-hover hover:border-gray-400 rounded-lg transition-all min-h-[240px] flex items-center justify-center group"
            >
              <div className="text-center">
                <Plus size={48} className="mx-auto text-gray-400 group-hover:text-gray-600 transition-colors mb-2" />
                <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors font-medium">Add Video</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
