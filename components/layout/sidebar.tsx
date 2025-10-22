"use client"

import { Music, Swords } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReactNode } from "react"

interface Tool {
  id: string
  name: string
  icon: ReactNode
}

const TOOLS: Tool[] = [
  {
    id: "music",
    name: "Music",
    icon: <Music size={20} />,
  },
  {
    id: "initiative",
    name: "Initiative",
    icon: <Swords size={20} />,
  },
]

export function Sidebar({ activeTool, setActiveTool }: { activeTool: string; setActiveTool: (id: string) => void }) {
  return (
    <div className="w-64 bg-black h-screen p-4 flex flex-col shadow-2xl relative z-10">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">D&D Manager</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {TOOLS.map((tool) => (
          <Button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            variant={activeTool === tool.id ? "default" : "ghost"}
            className="w-full justify-start gap-3"
          >
            {tool.icon}
            {tool.name}
          </Button>
        ))}
      </nav>

      <div className="text-xs text-gray-400 text-center mt-4">
        v0.1.0
      </div>
    </div>
  )
}
