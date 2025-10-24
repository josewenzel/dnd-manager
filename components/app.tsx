"use client"

import { useState } from "react"
import { track } from "@vercel/analytics"
import { Sidebar } from "@/components/layout/sidebar"
import { MusicTool } from "@/components/tools/music-tool"
import { InitiativeTracker } from "@/components/tools/initiative-tracker"
import { EncounterCreator } from "@/components/tools/encounter-creator"
import { MusicProvider } from "@/contexts/music-context"
import { InitiativeProvider } from "@/contexts/initiative-context"
import { MiniPlayer } from "@/components/layout/mini-player"

export function MainApp() {
  const [activeTool, setActiveTool] = useState("music")

  const handleToolChange = (toolId: string) => {
    setActiveTool(toolId)
    track("tool_navigation", { tool: toolId })
  }

  return (
    <MusicProvider>
      <InitiativeProvider>
        <div className="flex h-screen bg-white">
          <Sidebar activeTool={activeTool} setActiveTool={handleToolChange} />
          {activeTool === "music" && <MusicTool />}
          {activeTool === "initiative" && <InitiativeTracker />}
          {activeTool === "encounter" && <EncounterCreator setActiveTool={handleToolChange} />}
          <MiniPlayer />
        </div>
      </InitiativeProvider>
    </MusicProvider>
  )
}
