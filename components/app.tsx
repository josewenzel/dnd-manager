"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { MusicTool } from "@/components/tools/music-tool"
import { InitiativeTracker } from "@/components/tools/initiative-tracker"
import { EncounterCreator } from "@/components/tools/encounter-creator"
import { MusicProvider } from "@/contexts/music-context"
import { MiniPlayer } from "@/components/layout/mini-player"

export function MainApp() {
  const [activeTool, setActiveTool] = useState("music")

  return (
    <MusicProvider>
      <div className="flex h-screen bg-white">
        <Sidebar activeTool={activeTool} setActiveTool={setActiveTool} />
        {activeTool === "music" && <MusicTool />}
        {activeTool === "initiative" && <InitiativeTracker />}
        {activeTool === "encounter" && <EncounterCreator />}
        <MiniPlayer />
      </div>
    </MusicProvider>
  )
}
