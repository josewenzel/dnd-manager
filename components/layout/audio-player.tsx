"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, SkipForward, SkipBack, SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { useAudioLibrary } from "@/contexts/audio-library-context"

export function AudioPlayer() {
  const {
    tracks,
    currentTrackId,
    isPlaying,
    volume,
    fadeDuration,
    setIsPlaying,
    setVolume,
    nextTrack,
    previousTrack,
    pauseTrack,
  } = useAudioLibrary()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const currentTrack = tracks.find((t) => t.id === currentTrackId)

  const fadeVolume = (targetVolume: number, duration: number, onComplete?: () => void) => {
    if (!audioRef.current) return

    const steps = 50
    const stepDuration = duration / steps
    const startVolume = audioRef.current.volume
    const volumeStep = (targetVolume - startVolume) / steps
    let currentStep = 0

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

    fadeIntervalRef.current = setInterval(() => {
      if (!audioRef.current) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
        return
      }

      currentStep++
      const newVolume = startVolume + volumeStep * currentStep
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume))

      if (currentStep >= steps) {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current)
        audioRef.current.volume = targetVolume
        if (onComplete) onComplete()
      }
    }, stepDuration)
  }

  useEffect(() => {
    if (!audioRef.current || !currentTrack) return

    if (isPlaying) {
      fadeVolume(isMuted ? 0 : volume, fadeDuration / 2, () => {
        audioRef.current?.play().catch((e) => {
          console.error("Error playing audio:", e)
          setIsPlaying(false)
        })
      })
    } else {
      fadeVolume(0, fadeDuration / 2, () => {
        audioRef.current?.pause()
      })
    }
  }, [isPlaying, currentTrack])

  useEffect(() => {
    if (!audioRef.current || isMuted) return
    
    fadeVolume(volume, 300)
  }, [volume])

  useEffect(() => {
    if (!audioRef.current) return

    if (isMuted) {
      fadeVolume(0, 200)
    } else {
      fadeVolume(volume, 200)
    }
  }, [isMuted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => {
      if (tracks.length > 1) {
        nextTrack()
      } else {
        setIsPlaying(false)
      }
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [tracks.length, nextTrack, setIsPlaying])

  useEffect(() => {
    if (!audioRef.current || !currentTrack?.audioUrl) return

    fadeVolume(0, fadeDuration / 2, () => {
      if (audioRef.current) {
        audioRef.current.src = currentTrack.audioUrl!
        audioRef.current.load()
        if (isPlaying) {
          audioRef.current.play().then(() => {
            fadeVolume(isMuted ? 0 : volume, fadeDuration / 2)
          }).catch((e) => {
            console.error("Error playing new track:", e)
            setIsPlaying(false)
          })
        }
      }
    })
  }, [currentTrackId])

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (!currentTrack) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-black text-white border-t border-gray-700 shadow-2xl z-50">
      <audio ref={audioRef} />
      
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🎵</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate">{currentTrack.title}</div>
              <div className="text-xs text-gray-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={previousTrack}
              disabled={tracks.length <= 1}
              className="text-white hover:bg-white/10"
            >
              <SkipBack size={18} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => isPlaying ? pauseTrack() : setIsPlaying(true)}
              className="text-white hover:bg-white/10 w-10 h-10"
            >
              {isPlaying ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextTrack}
              disabled={tracks.length <= 1}
              className="text-white hover:bg-white/10"
            >
              <SkipForward size={18} />
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-3 flex-1">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/10"
            >
              {isMuted ? <SpeakerSlash size={18} /> : <SpeakerHigh size={18} />}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        <div className="md:hidden mt-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
