"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, User, ExternalLink, ChevronUp, ChevronDown, Save, FolderOpen, Swords } from "lucide-react"
import { MONSTERS } from "@/lib/monsters-data"
import Cookies from "js-cookie"
import { useInitiativeContext, Combatant } from "@/contexts/initiative-context"

interface Player {
  id: string
  name: string
  level: number
}

interface SavedParty {
  id: string
  name: string
  players: Player[]
}

interface SavedEncounter {
  id: string
  name: string
  monsters: EncounterMonster[]
}

interface EncounterMonster {
  id: string
  name: string
  cr: number
  count: number
}

type DifficultyLevel = "easy" | "medium" | "hard" | "deadly"

interface DifficultyThreshold {
  easy: number
  medium: number
  hard: number
  deadly: number
}

const XP_BY_CR: Record<number, number> = {
  0: 10,
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
  21: 33000,
  22: 41000,
  23: 50000,
  24: 62000,
  30: 155000,
}

const XP_THRESHOLDS_BY_LEVEL: Record<number, DifficultyThreshold> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 },
}

interface EncounterCreatorProps {
  setActiveTool: (tool: string) => void
}

export function EncounterCreator({ setActiveTool }: EncounterCreatorProps) {
  const { startCombat } = useInitiativeContext()
  const [players, setPlayers] = useState<Player[]>([])
  const [nameInput, setNameInput] = useState("")
  const [levelInput, setLevelInput] = useState("")
  const [monsters, setMonsters] = useState<EncounterMonster[]>([])
  const [monsterInput, setMonsterInput] = useState("")
  const [monsterCountInput, setMonsterCountInput] = useState("1")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [savedParties, setSavedParties] = useState<SavedParty[]>([])
  const [partyNameInput, setPartyNameInput] = useState("")
  const [showSavedParties, setShowSavedParties] = useState(false)
  const [savedEncounters, setSavedEncounters] = useState<SavedEncounter[]>([])
  const [encounterNameInput, setEncounterNameInput] = useState("")
  const [showSavedEncounters, setShowSavedEncounters] = useState(false)
  const [showCombatSetup, setShowCombatSetup] = useState(false)
  const [combatSetup, setCombatSetup] = useState<{
    players: Array<{ id: string; name: string; initiative: string }>
    monsters: Array<{ id: string; name: string; initiative: string; hp: string; maxHp: number }>
  }>({ players: [], monsters: [] })

  useEffect(() => {
    const savedCookie = Cookies.get("dnd-saved-parties")
    if (savedCookie) {
      try {
        const parsed = JSON.parse(savedCookie)
        setSavedParties(parsed)
      } catch (e) {
        console.error("Failed to parse saved parties cookie:", e)
      }
    }

    const encountersCookie = Cookies.get("dnd-saved-encounters")
    if (encountersCookie) {
      try {
        const parsed = JSON.parse(encountersCookie)
        setSavedEncounters(parsed)
      } catch (e) {
        console.error("Failed to parse saved encounters cookie:", e)
      }
    }
  }, [])

  useEffect(() => {
    if (savedParties.length > 0) {
      Cookies.set("dnd-saved-parties", JSON.stringify(savedParties), { expires: 365 })
    } else {
      Cookies.remove("dnd-saved-parties")
    }
  }, [savedParties])

  useEffect(() => {
    if (savedEncounters.length > 0) {
      Cookies.set("dnd-saved-encounters", JSON.stringify(savedEncounters), { expires: 365 })
    } else {
      Cookies.remove("dnd-saved-encounters")
    }
  }, [savedEncounters])

  const handleAddPlayer = () => {
    if (!nameInput.trim()) {
      alert("Please enter a player name")
      return
    }
    const level = parseInt(levelInput)
    if (isNaN(level) || level < 1 || level > 20) {
      alert("Level must be between 1 and 20")
      return
    }

    setPlayers([...players, { id: `player-${Date.now()}`, name: nameInput.trim(), level }])
    setNameInput("")
    setLevelInput("")
  }

  const handleDeletePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id))
  }

  const handleLevelChange = (id: string, delta: number) => {
    setPlayers(
      players.map((p) => {
        if (p.id === id) {
          const newLevel = Math.max(1, Math.min(20, p.level + delta))
          return { ...p, level: newLevel }
        }
        return p
      })
    )
  }

  const handleSaveParty = () => {
    if (!partyNameInput.trim()) {
      alert("Please enter a party name")
      return
    }
    if (players.length === 0) {
      alert("Add at least one player to save the party")
      return
    }

    const newParty: SavedParty = {
      id: `party-${Date.now()}`,
      name: partyNameInput.trim(),
      players: [...players],
    }

    const updated = [...savedParties, newParty]
    setSavedParties(updated)
    setPartyNameInput("")
    alert(`Party "${newParty.name}" saved!`)
  }

  const handleLoadParty = (party: SavedParty) => {
    setPlayers([...party.players])
    setShowSavedParties(false)
  }

  const handleDeleteParty = (id: string) => {
    const updated = savedParties.filter((p) => p.id !== id)
    setSavedParties(updated)
  }

  const handleSaveEncounter = () => {
    if (!encounterNameInput.trim()) {
      alert("Please enter an encounter name")
      return
    }
    if (monsters.length === 0) {
      alert("Add at least one monster to save the encounter")
      return
    }

    const newEncounter: SavedEncounter = {
      id: `encounter-${Date.now()}`,
      name: encounterNameInput.trim(),
      monsters: [...monsters],
    }

    const updated = [...savedEncounters, newEncounter]
    setSavedEncounters(updated)
    setEncounterNameInput("")
    alert(`Encounter "${newEncounter.name}" saved!`)
  }

  const handleLoadEncounter = (encounter: SavedEncounter) => {
    setMonsters([...encounter.monsters])
    setShowSavedEncounters(false)
  }

  const handleDeleteEncounter = (id: string) => {
    const updated = savedEncounters.filter((e) => e.id !== id)
    setSavedEncounters(updated)
  }

  const handleAddMonster = (monsterName: string) => {
    const monster = MONSTERS.find((m) => m.name === monsterName)
    if (!monster) return

    const count = parseInt(monsterCountInput)
    if (isNaN(count) || count < 1) {
      alert("Count must be at least 1")
      return
    }

    setMonsters([
      ...monsters,
      {
        id: `monster-${Date.now()}`,
        name: monster.name,
        cr: monster.cr,
        count,
      },
    ])
    setMonsterInput("")
    setMonsterCountInput("1")
    setShowSuggestions(false)
  }

  const handleDeleteMonster = (id: string) => {
    setMonsters(monsters.filter((m) => m.id !== id))
  }

  const handleMonsterInputChange = (value: string) => {
    setMonsterInput(value)
    setShowSuggestions(value.length > 0)
  }

  const getFilteredMonsters = () => {
    const input = monsterInput.toLowerCase()
    if (!input) return MONSTERS
    return MONSTERS.filter((monster) => monster.name.toLowerCase().includes(input))
  }

  const handleSelectMonster = (monsterName: string) => {
    setMonsterInput(monsterName)
    setShowSuggestions(false)
  }

  const getMonsterUrl = (monsterName: string): string => {
    const formattedName = monsterName.replace(/\s+/g, "")
    return `https://roll20.net/compendium/dnd5e/Monsters:${formattedName}/#h-${formattedName}`
  }

  const calculateEncounterDifficulty = (): {
    totalXP: number
    adjustedXP: number
    difficulty: DifficultyLevel
    thresholds: DifficultyThreshold
  } => {
    if (players.length === 0) {
      return {
        totalXP: 0,
        adjustedXP: 0,
        difficulty: "easy",
        thresholds: { easy: 0, medium: 0, hard: 0, deadly: 0 },
      }
    }

    const totalMonsters = monsters.reduce((sum, m) => sum + m.count, 0)

    const totalXP = monsters.reduce((sum, m) => {
      return sum + (XP_BY_CR[m.cr] || 0) * m.count
    }, 0)

    let multiplier = 1
    if (totalMonsters === 1) multiplier = 1
    else if (totalMonsters === 2) multiplier = 1.5
    else if (totalMonsters >= 3 && totalMonsters <= 6) multiplier = 2
    else if (totalMonsters >= 7 && totalMonsters <= 10) multiplier = 2.5
    else if (totalMonsters >= 11 && totalMonsters <= 14) multiplier = 3
    else if (totalMonsters >= 15) multiplier = 4

    const adjustedXP = totalXP * multiplier

    const partyThresholds = players.reduce(
      (acc, player) => {
        const thresholds = XP_THRESHOLDS_BY_LEVEL[player.level]
        return {
          easy: acc.easy + thresholds.easy,
          medium: acc.medium + thresholds.medium,
          hard: acc.hard + thresholds.hard,
          deadly: acc.deadly + thresholds.deadly,
        }
      },
      { easy: 0, medium: 0, hard: 0, deadly: 0 }
    )

    let difficulty: DifficultyLevel = "easy"
    if (adjustedXP > partyThresholds.deadly) difficulty = "deadly"
    else if (adjustedXP > partyThresholds.hard && adjustedXP <= partyThresholds.deadly) difficulty = "hard"
    else if (adjustedXP > partyThresholds.medium && adjustedXP <= partyThresholds.hard) difficulty = "medium"

    return {
      totalXP,
      adjustedXP,
      difficulty,
      thresholds: partyThresholds,
    }
  }

  const encounterStats = calculateEncounterDifficulty()

  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case "easy":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "hard":
        return "text-orange-600"
      case "deadly":
        return "text-red-600"
    }
  }

  const getDifficultyBgColor = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100"
      case "medium":
        return "bg-yellow-100"
      case "hard":
        return "bg-orange-100"
      case "deadly":
        return "bg-red-100"
    }
  }

  const handleOpenCombatSetup = () => {
    const setupPlayers = players.map(player => ({
      id: player.id,
      name: player.name,
      initiative: "",
      hp: ""
    }))

    const setupMonsters = monsters.flatMap((monster) => {
      const monsterData = MONSTERS.find(m => m.name === monster.name)
      const baseHp = monsterData ? Math.floor(Math.random() * 20) + (monster.cr * 10) : 50
      
      return Array.from({ length: monster.count }, (_, i) => ({
        id: `monster-${monster.name}-${Date.now()}-${i}`,
        name: monster.count > 1 ? `${monster.name} #${i + 1}` : monster.name,
        initiative: "",
        hp: baseHp.toString(),
        maxHp: baseHp
      }))
    })

    setCombatSetup({ players: setupPlayers, monsters: setupMonsters })
    setShowCombatSetup(true)
  }

  const handleStartCombat = () => {
    const playerCombatants: Combatant[] = combatSetup.players
      .filter(p => p.initiative.trim() !== "")
      .map(player => ({
        id: player.id,
        name: player.name,
        initiative: parseInt(player.initiative) || 0,
        type: "player" as const,
        color: "#1f2937",
      }))

    const monsterCombatants: Combatant[] = combatSetup.monsters
      .filter(m => m.initiative.trim() !== "")
      .map(monster => ({
        id: monster.id,
        name: monster.name,
        initiative: parseInt(monster.initiative) || 0,
        type: "monster" as const,
        color: "#ef4444",
        currentHp: parseInt(monster.hp) || monster.maxHp,
        maxHp: monster.maxHp,
      }))

    const allCombatants = [...playerCombatants, ...monsterCombatants]
    
    if (allCombatants.length === 0) {
      alert("Please set initiative for at least one combatant")
      return
    }

    startCombat(allCombatants, () => setActiveTool("initiative"))
    setShowCombatSetup(false)
  }

  const handleUpdatePlayerInitiative = (id: string, value: string) => {
    setCombatSetup(prev => ({
      ...prev,
      players: prev.players.map(p => p.id === id ? { ...p, initiative: value } : p)
    }))
  }

  const handleUpdateMonsterInitiative = (id: string, value: string) => {
    setCombatSetup(prev => ({
      ...prev,
      monsters: prev.monsters.map(m => m.id === id ? { ...m, initiative: value } : m)
    }))
  }

  const handleUpdateMonsterHp = (id: string, value: string) => {
    setCombatSetup(prev => ({
      ...prev,
      monsters: prev.monsters.map(m => m.id === id ? { ...m, hp: value } : m)
    }))
  }

  const canStartCombat = players.length > 0 && monsters.length > 0

  return (
    <div className="flex-1 p-8 overflow-auto bg-white">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-black">Encounter Creator</h2>
      </div>
      <div className="max-w-6xl mx-auto">

        {showSavedParties && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Saved Parties</h3>
                <button
                  onClick={() => setShowSavedParties(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {savedParties.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p className="text-sm">No saved parties yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedParties.map((party) => (
                      <div
                        key={party.id}
                        className="flex items-center justify-between p-3 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100"
                      >
                        <button
                          onClick={() => handleLoadParty(party)}
                          className="flex-1 text-left"
                        >
                          <div className="text-sm font-medium">{party.name}</div>
                          <div className="text-xs text-gray-500">
                            {party.players.length} player{party.players.length !== 1 ? "s" : ""}
                          </div>
                        </button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteParty(party.id)}
                          className="px-2 h-7 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showSavedEncounters && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Saved Encounters</h3>
                <button
                  onClick={() => setShowSavedEncounters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {savedEncounters.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p className="text-sm">No saved encounters yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedEncounters.map((encounter) => (
                      <div
                        key={encounter.id}
                        className="flex items-center justify-between p-3 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100"
                      >
                        <button
                          onClick={() => handleLoadEncounter(encounter)}
                          className="flex-1 text-left"
                        >
                          <div className="text-sm font-medium">{encounter.name}</div>
                          <div className="text-xs text-gray-500">
                            {encounter.monsters.reduce((sum, m) => sum + m.count, 0)} monster{encounter.monsters.reduce((sum, m) => sum + m.count, 0) !== 1 ? "s" : ""}
                          </div>
                        </button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteEncounter(encounter.id)}
                          className="px-2 h-7 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showCombatSetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b shrink-0">
                <h3 className="text-lg font-semibold">Combat Setup</h3>
                <button
                  onClick={() => setShowCombatSetup(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                      <User size={18} className="text-player-icon" />
                      Players
                    </h4>
                    {combatSetup.players.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        <p className="text-sm">No players in party</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {combatSetup.players.map((player) => (
                          <div key={player.id} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                            <div className="font-medium mb-2">{player.name}</div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Initiative</label>
                              <Input
                                type="number"
                                placeholder="Roll initiative"
                                value={player.initiative}
                                onChange={(e) => handleUpdatePlayerInitiative(player.id, e.target.value)}
                                className="h-9"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                      <Swords size={18} className="text-monster" />
                      Monsters
                    </h4>
                    {combatSetup.monsters.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        <p className="text-sm">No monsters in encounter</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {combatSetup.monsters.map((monster) => (
                          <div key={monster.id} className="p-3 border border-gray-200 rounded-md bg-red-50">
                            <div className="font-medium mb-2">{monster.name}</div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block">Initiative</label>
                                <Input
                                  type="number"
                                  placeholder="Roll"
                                  value={monster.initiative}
                                  onChange={(e) => handleUpdateMonsterInitiative(monster.id, e.target.value)}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 mb-1 block">Hit Points</label>
                                <Input
                                  type="number"
                                  placeholder="HP"
                                  value={monster.hp}
                                  onChange={(e) => handleUpdateMonsterHp(monster.id, e.target.value)}
                                  className="h-9"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 p-4 border-t shrink-0">
                <Button variant="outline" onClick={() => setShowCombatSetup(false)}>
                  Cancel
                </Button>
                <Button onClick={handleStartCombat} className="gap-2">
                  <Swords size={16} />
                  Start Combat
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Party</CardTitle>
                  <Button
                    onClick={() => setShowSavedParties(true)}
                    size="sm"
                    variant="outline"
                    className="px-3"
                  >
                    <FolderOpen size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Player Name</label>
                    <Input
                      type="text"
                      placeholder="Enter name"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Level</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="1-20"
                        value={levelInput}
                        onChange={(e) => setLevelInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                        min="1"
                        max="20"
                        className="flex-1"
                      />
                      <Button onClick={handleAddPlayer} size="sm" className="px-3">
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                </div>

                {players.length > 0 && (
                  <>
                    <div className="space-y-2">
                      {players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between p-3 rounded-md border border-card-border bg-card-bg"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <User size={16} className="text-player-icon" />
                            <div className="flex-1">
                              <div className="text-sm font-medium">{player.name}</div>
                              <div className="text-xs text-gray-500">Level {player.level}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleLevelChange(player.id, -1)}
                              className="px-2 h-7"
                              disabled={player.level <= 1}
                            >
                              <ChevronDown size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleLevelChange(player.id, 1)}
                              className="px-2 h-7"
                              disabled={player.level >= 20}
                            >
                              <ChevronUp size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePlayer(player.id)}
                              className="px-2 h-7 text-red-600 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Party name"
                          value={partyNameInput}
                          onChange={(e) => setPartyNameInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveParty()}
                          className="flex-1"
                        />
                        <Button onClick={handleSaveParty} size="sm" className="px-3">
                          <Save size={16} />
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {players.length === 0 && (
                  <div className="text-center text-gray-400 py-6">
                    <p className="text-sm">Add players to your party</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Monsters</CardTitle>
                  <Button
                    onClick={() => setShowSavedEncounters(true)}
                    size="sm"
                    variant="outline"
                    className="px-3"
                  >
                    <FolderOpen size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <label className="text-sm text-gray-600 mb-2 block">Monster Name</label>
                  <Input
                    placeholder="Search monsters..."
                    value={monsterInput}
                    onChange={(e) => handleMonsterInputChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="mb-2"
                  />
                  {showSuggestions && monsterInput && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-input-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {getFilteredMonsters().map((monster) => (
                        <button
                          key={monster.name}
                          onClick={() => handleSelectMonster(monster.name)}
                          className="w-full text-left px-3 py-2 hover:bg-suggestion-hover text-sm group"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{monster.name}</span>
                            <span className="text-xs text-gray-500">CR {monster.cr}</span>
                          </div>
                        </button>
                      ))}
                      {getFilteredMonsters().length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-500 italic">No monsters found</div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Count</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="1"
                      value={monsterCountInput}
                      onChange={(e) => setMonsterCountInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddMonster(monsterInput)}
                      min="1"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleAddMonster(monsterInput)}
                      size="sm"
                      className="px-3"
                      disabled={!monsterInput}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                {monsters.length > 0 && (
                  <>
                    <div className="space-y-2 pt-2">
                      {monsters.map((monster) => (
                        <div
                          key={monster.id}
                          className="flex items-center justify-between p-3 rounded-md border border-card-border bg-card-bg group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <a
                                href={getMonsterUrl(monster.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium hover:text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {monster.name}
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                                CR {monster.cr}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Count: {monster.count} × {XP_BY_CR[monster.cr] || 0} XP = {(XP_BY_CR[monster.cr] || 0) * monster.count} XP
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMonster(monster.id)}
                            className="px-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Encounter name"
                          value={encounterNameInput}
                          onChange={(e) => setEncounterNameInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveEncounter()}
                          className="flex-1"
                        />
                        <Button onClick={handleSaveEncounter} size="sm" className="px-3">
                          <Save size={16} />
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {monsters.length === 0 && (
                  <div className="text-center text-gray-400 py-6">
                    <p className="text-sm">Add monsters to the encounter</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Encounter Analysis</CardTitle>
                  {canStartCombat && (
                    <Button onClick={handleOpenCombatSetup} className="gap-2">
                      <Swords size={16} />
                      Start Combat
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {players.length === 0 || monsters.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <p>Add players and monsters to see encounter analysis</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <div
                        className={`inline-flex px-6 py-3 rounded-lg ${getDifficultyBgColor(
                          encounterStats.difficulty
                        )}`}
                      >
                        <span className={`text-2xl font-bold capitalize ${getDifficultyColor(encounterStats.difficulty)}`}>
                          {encounterStats.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Total XP</div>
                            <div className="text-2xl font-bold">{encounterStats.totalXP}</div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-sm text-gray-600 mb-1">Adjusted XP</div>
                            <div className="text-2xl font-bold">{encounterStats.adjustedXP}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">XP Thresholds</h3>
                      <div className="space-y-2">
                        {(["easy", "medium", "hard", "deadly"] as DifficultyLevel[]).map((level) => (
                          <div
                            key={level}
                            className={`flex items-center justify-between p-3 rounded-md ${
                              encounterStats.difficulty === level
                                ? `${getDifficultyBgColor(level)} border-2 ${getDifficultyColor(level)} border-current`
                                : "bg-gray-50"
                            }`}
                          >
                            <span className={`text-sm font-medium capitalize ${encounterStats.difficulty === level ? getDifficultyColor(level) : "text-gray-700"}`}>
                              {level}
                            </span>
                            <span className={`text-sm ${encounterStats.difficulty === level ? getDifficultyColor(level) : "text-gray-600"}`}>
                              {encounterStats.thresholds[level]} XP
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Party Information</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Party Size:</span>
                          <span className="font-medium">{players.length} player{players.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Average Level:</span>
                          <span className="font-medium">
                            {(players.reduce((sum, p) => sum + p.level, 0) / players.length).toFixed(1)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Monsters:</span>
                          <span className="font-medium">{monsters.reduce((sum, m) => sum + m.count, 0)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="text-xs text-gray-500 leading-relaxed space-y-2">
                        <p>
                          <strong>Challenge Rating Guidelines:</strong> An appropriately equipped and well-rested party should be able to defeat a monster with a challenge rating equal to its level without suffering deaths.
                        </p>
                        <p>
                          <strong>Encounter Multipliers:</strong> Multiple monsters make encounters harder. The adjusted XP accounts for this using encounter multipliers based on monster count.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
