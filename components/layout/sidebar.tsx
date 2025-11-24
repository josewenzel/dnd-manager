"use client"

import { MusicNote, Sword, Users, List, X } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { ReactNode, useState, useEffect } from "react"

interface Tool {
  id: string
  name: string
  icon: ReactNode
}

const TOOLS: Tool[] = [
  {
    id: "music",
    name: "Music",
    icon: <MusicNote size={20} />,
  },
  {
    id: "initiative",
    name: "Initiative",
    icon: <Sword size={20} />,
  },
  {
    id: "encounter",
    name: "Encounter Creator",
    icon: <Users size={20} />,
  },
]

export function Sidebar({ activeTool, setActiveTool }: { activeTool: string; setActiveTool: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).kofiwidget2) {
      (window as any).kofiwidget2.init('Support me on Ko-fi', '#72a4f2', 'O4O01P2VK9');
      (window as any).kofiwidget2.draw();
    }
  }, [])

  const handleToolSelect = (id: string) => {
    setActiveTool(id)
    setIsOpen(false)
  }

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 bg-black p-4 flex items-center justify-between shadow-lg z-50">
        <h1 className="text-xl font-bold text-white">Lute and Loot</h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          fixed md:relative
          top-[72px] md:top-0
          left-0
          h-[calc(100vh-72px)] md:h-screen
          w-64
          bg-black
          p-4
          flex flex-col
          shadow-2xl
          z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="mb-8 hidden md:block">
          <h1 className="text-xl font-bold text-white">Lute and Loot</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {TOOLS.map((tool) => (
            <Button
              key={tool.id}
              onClick={() => handleToolSelect(tool.id)}
              variant={activeTool === tool.id ? "default" : "ghost"}
              className="w-full justify-start gap-3"
            >
              {tool.icon}
              {tool.name}
            </Button>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-3">
          <div id="kofi-widget-container"></div>
          <div className="text-xs text-gray-400 text-center">
            v0.1.0
          </div>
        </div>
      </div>
    </>
  )
}
