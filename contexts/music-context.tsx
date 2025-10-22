"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import Cookies from "js-cookie"

interface Video {
  id: string
  title: string
  youtubeUrl: string
}

interface MusicContextType {
  videos: Video[]
  setVideos: (videos: Video[]) => void
  currentVideoId: string | null
  setCurrentVideoId: (id: string | null) => void
  addVideo: (video: Video) => void
  deleteVideo: (id: string) => void
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

const PLAYLIST_COOKIE = "dnd_music_playlist"
const CURRENT_VIDEO_COOKIE = "dnd_current_video"

export function MusicProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)

  useEffect(() => {
    const savedPlaylist = Cookies.get(PLAYLIST_COOKIE)
    if (savedPlaylist) {
      try {
        const parsed = JSON.parse(savedPlaylist)
        setVideos(parsed)
      } catch (e) {
        console.error("Failed to parse playlist cookie:", e)
      }
    }

    const savedCurrentVideo = Cookies.get(CURRENT_VIDEO_COOKIE)
    if (savedCurrentVideo) {
      setCurrentVideoId(savedCurrentVideo)
    }
  }, [])

  useEffect(() => {
    if (videos.length > 0) {
      Cookies.set(PLAYLIST_COOKIE, JSON.stringify(videos), { expires: 365 })
    } else {
      Cookies.remove(PLAYLIST_COOKIE)
    }
  }, [videos])

  useEffect(() => {
    if (currentVideoId) {
      Cookies.set(CURRENT_VIDEO_COOKIE, currentVideoId, { expires: 365 })
    } else {
      Cookies.remove(CURRENT_VIDEO_COOKIE)
    }
  }, [currentVideoId])

  const addVideo = (video: Video) => {
    setVideos([...videos, video])
  }

  const deleteVideo = (id: string) => {
    if (currentVideoId === id) {
      setCurrentVideoId(null)
    }
    setVideos(videos.filter((v) => v.id !== id))
  }

  return (
    <MusicContext.Provider
      value={{
        videos,
        setVideos,
        currentVideoId,
        setCurrentVideoId,
        addVideo,
        deleteVideo,
      }}
    >
      {children}
    </MusicContext.Provider>
  )
}

export function useMusicContext() {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error("useMusicContext must be used within MusicProvider")
  }
  return context
}
