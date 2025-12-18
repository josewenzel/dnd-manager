"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface AudioTrack {
  id: string
  title: string
  youtubeUrl: string
  audioUrl?: string
  duration?: number
  isExtracting?: boolean
}

interface AudioLibraryContextType {
  tracks: AudioTrack[]
  currentTrackId: string | null
  isPlaying: boolean
  volume: number
  fadeDuration: number
  setTracks: (tracks: AudioTrack[]) => void
  setCurrentTrackId: (id: string | null) => void
  setIsPlaying: (playing: boolean) => void
  setVolume: (volume: number) => void
  setFadeDuration: (duration: number) => void
  addTrack: (track: AudioTrack) => void
  deleteTrack: (id: string) => void
  updateTrack: (id: string, updates: Partial<Omit<AudioTrack, 'id'>>) => void
  playTrack: (id: string) => void
  pauseTrack: () => void
  nextTrack: () => void
  previousTrack: () => void
}

const AudioLibraryContext = createContext<AudioLibraryContextType | undefined>(undefined)

const TRACKS_KEY = "dnd_audio_library_tracks"
const CURRENT_TRACK_KEY = "dnd_audio_library_current_track"
const VOLUME_KEY = "dnd_audio_library_volume"
const FADE_DURATION_KEY = "dnd_audio_library_fade_duration"

export function AudioLibraryProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<AudioTrack[]>([])
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [fadeDuration, setFadeDuration] = useState(2000)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedTracks = localStorage.getItem(TRACKS_KEY)
    if (savedTracks) {
      try {
        const parsed = JSON.parse(savedTracks)
        setTracks(parsed)
      } catch (e) {
        console.error("Failed to parse tracks from localStorage:", e)
      }
    }

    const savedCurrentTrack = localStorage.getItem(CURRENT_TRACK_KEY)
    if (savedCurrentTrack) {
      setCurrentTrackId(savedCurrentTrack)
    }

    const savedVolume = localStorage.getItem(VOLUME_KEY)
    if (savedVolume) {
      setVolume(parseFloat(savedVolume))
    }

    const savedFadeDuration = localStorage.getItem(FADE_DURATION_KEY)
    if (savedFadeDuration) {
      setFadeDuration(parseInt(savedFadeDuration))
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (tracks.length > 0) {
      localStorage.setItem(TRACKS_KEY, JSON.stringify(tracks))
    } else {
      localStorage.removeItem(TRACKS_KEY)
    }
  }, [tracks])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (currentTrackId) {
      localStorage.setItem(CURRENT_TRACK_KEY, currentTrackId)
    } else {
      localStorage.removeItem(CURRENT_TRACK_KEY)
    }
  }, [currentTrackId])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(VOLUME_KEY, volume.toString())
  }, [volume])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(FADE_DURATION_KEY, fadeDuration.toString())
  }, [fadeDuration])

  const addTrack = (track: AudioTrack) => {
    setTracks([...tracks, track])
  }

  const deleteTrack = (id: string) => {
    if (currentTrackId === id) {
      setCurrentTrackId(null)
      setIsPlaying(false)
    }
    setTracks(tracks.filter((t) => t.id !== id))
  }

  const updateTrack = (id: string, updates: Partial<Omit<AudioTrack, 'id'>>) => {
    setTracks(tracks.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const playTrack = (id: string) => {
    setCurrentTrackId(id)
    setIsPlaying(true)
  }

  const pauseTrack = () => {
    setIsPlaying(false)
  }

  const nextTrack = () => {
    if (tracks.length === 0) return
    const currentIndex = tracks.findIndex((t) => t.id === currentTrackId)
    const nextIndex = (currentIndex + 1) % tracks.length
    playTrack(tracks[nextIndex].id)
  }

  const previousTrack = () => {
    if (tracks.length === 0) return
    const currentIndex = tracks.findIndex((t) => t.id === currentTrackId)
    const prevIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1
    playTrack(tracks[prevIndex].id)
  }

  return (
    <AudioLibraryContext.Provider
      value={{
        tracks,
        currentTrackId,
        isPlaying,
        volume,
        fadeDuration,
        setTracks,
        setCurrentTrackId,
        setIsPlaying,
        setVolume,
        setFadeDuration,
        addTrack,
        deleteTrack,
        updateTrack,
        playTrack,
        pauseTrack,
        nextTrack,
        previousTrack,
      }}
    >
      {children}
    </AudioLibraryContext.Provider>
  )
}

export function useAudioLibrary() {
  const context = useContext(AudioLibraryContext)
  if (!context) {
    throw new Error("useAudioLibrary must be used within AudioLibraryProvider")
  }
  return context
}
