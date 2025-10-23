"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, User, ExternalLink } from "lucide-react"
import { MONSTERS } from "@/lib/monsters-data"

interface Player {
  id: string
  level: number
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

export function EncounterCreator() {
  const [players, setPlayers] = useState<Player[]>([])
  const [levelInput, setLevelInput] = useState("")
  const [monsters, setMonsters] = useState<EncounterMonster[]>([])
  const [monsterInput, setMonsterInput] = useState("")
  const [monsterCountInput, setMonsterCountInput] = useState("1")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleAddPlayer = () => {
    const level = parseInt(levelInput)
    if (isNaN(level) || level < 1 || level > 20) {
      alert("Level must be between 1 and 20")
      return
    }

    setPlayers([...players, { id: `player-${Date.now()}`, level }])
    setLevelInput("")
  }

  const handleDeletePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id))
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

  return (
    <div className="flex-1 p-8 overflow-auto bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-black">Encounter Creator</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Party</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Player Level</label>
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

                {players.length > 0 && (
                  <div className="space-y-2">
                    {players.map((player, index) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 rounded-md border border-card-border bg-card-bg"
                      >
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-player-icon" />
                          <span className="text-sm">
                            Player {index + 1} - Level {player.level}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePlayer(player.id)}
                          className="px-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
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
                <CardTitle className="text-lg">Monsters</CardTitle>
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
                <CardTitle className="text-lg">Encounter Analysis</CardTitle>
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
