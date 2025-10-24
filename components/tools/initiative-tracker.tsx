"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Swords, User, Minus, Heart, X, ChevronUp, ChevronDown, Shield } from "lucide-react"
import { useInitiativeContext, Combatant } from "@/contexts/initiative-context"

const DND_CONDITIONS: Record<string, string> = {
  "Blinded": "Can't see, auto-fails sight checks. Attacks vs. have advantage, its attacks have disadvantage.",
  "Charmed": "Can't attack charmer or target with harmful effects. Charmer has advantage on social checks.",
  "Deafened": "Can't hear, auto-fails hearing checks.",
  "Frightened": "Disadvantage on checks and attacks while source in sight. Can't move closer to source.",
  "Grappled": "Speed becomes 0, can't benefit from speed bonuses.",
  "Incapacitated": "Can't take actions or reactions.",
  "Invisible": "Impossible to see without magic. Attacks vs. have disadvantage, its attacks have advantage.",
  "Paralyzed": "Incapacitated, can't move or speak. Auto-fails Str/Dex saves. Attacks vs. have advantage. Hits within 5ft are crits.",
  "Petrified": "Transformed to stone, incapacitated, can't move/speak. Attacks vs. have advantage. Auto-fails Str/Dex saves. Resistance to all damage. Immune to poison/disease.",
  "Poisoned": "Disadvantage on attack rolls and ability checks.",
  "Prone": "Can only crawl. Disadvantage on attacks. Attacks vs. have advantage if within 5ft, else disadvantage.",
  "Restrained": "Speed becomes 0. Attacks vs. have advantage, its attacks have disadvantage. Disadvantage on Dex saves.",
  "Stunned": "Incapacitated, can't move, speaks falteringly. Auto-fails Str/Dex saves. Attacks vs. have advantage.",
  "Unconscious": "Incapacitated, can't move/speak, unaware. Drops held items, falls prone. Auto-fails Str/Dex saves. Attacks vs. have advantage. Hits within 5ft are crits.",
  "Exhaustion": "Level-based debuffs: 1) Disadv. on checks, 2) Speed halved, 3) Disadv. on attacks/saves, 4) HP max halved, 5) Speed 0, 6) Death."
}

export function InitiativeTracker() {
  const { combatants, setCombatants } = useInitiativeContext()
  const [nameInput, setNameInput] = useState("")
  const [initiativeInput, setInitiativeInput] = useState("")
  const [typeInput, setTypeInput] = useState<"player" | "monster" | "ally">("player")
  const [hpInput, setHpInput] = useState("")
  const [hpAdjustInputs, setHpAdjustInputs] = useState<Record<string, string>>({})
  const [statusInputs, setStatusInputs] = useState<Record<string, string>>({})
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({})
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)

  const handleAddCombatant = () => {
    if (!nameInput.trim() || !initiativeInput.trim()) {
      alert("Please enter both name and initiative")
      return
    }

    const initiative = parseInt(initiativeInput)
    if (isNaN(initiative)) {
      alert("Initiative must be a number")
      return
    }

    if (typeInput === "monster" && hpInput.trim()) {
      const hp = parseInt(hpInput)
      if (isNaN(hp)) {
        alert("HP must be a number")
        return
      }
    }

    const defaultColor = typeInput === "monster" ? "#ef4444" : typeInput === "ally" ? "#3b82f6" : "#1f2937"
    
    const newCombatant: Combatant = {
      id: `combatant-${Date.now()}`,
      name: nameInput,
      initiative,
      type: typeInput,
      color: defaultColor,
    }

    if ((typeInput === "monster" || typeInput === "ally") && hpInput.trim()) {
      const hp = parseInt(hpInput)
      newCombatant.maxHp = hp
      newCombatant.currentHp = hp
    }

    setCombatants([...combatants, newCombatant].sort((a, b) => b.initiative - a.initiative))
    setNameInput("")
    setInitiativeInput("")
    setHpInput("")
  }

  const handleDeleteCombatant = (id: string) => {
    setCombatants(combatants.filter((c) => c.id !== id))
  }

  const handleClearAll = () => {
    if (combatants.length > 0 && confirm("Clear all combatants?")) {
      setCombatants([])
    }
  }

  const handleAdjustHp = (id: string, amount: number) => {
    const adjustValue = hpAdjustInputs[id] ? parseInt(hpAdjustInputs[id]) : 1
    const finalAmount = isNaN(adjustValue) ? 1 : adjustValue * amount
    
    setCombatants(
      combatants.map((c) => {
        if (c.id === id && c.type === "monster" && c.currentHp !== undefined) {
          const newHp = Math.max(0, c.currentHp + finalAmount)
          return { ...c, currentHp: newHp }
        }
        return c
      })
    )
    
    setHpAdjustInputs({ ...hpAdjustInputs, [id]: "" })
  }

  const handleHpAdjustInputChange = (id: string, value: string) => {
    setHpAdjustInputs({ ...hpAdjustInputs, [id]: value })
  }

  const handleAddStatus = (id: string) => {
    const status = statusInputs[id]?.trim()
    if (!status) return

    setCombatants(
      combatants.map((c) => {
        if (c.id === id) {
          const statuses = c.statuses || []
          if (!statuses.includes(status)) {
            return { ...c, statuses: [...statuses, status] }
          }
        }
        return c
      })
    )

    setStatusInputs({ ...statusInputs, [id]: "" })
  }

  const handleRemoveStatus = (id: string, status: string) => {
    setCombatants(
      combatants.map((c) => {
        if (c.id === id) {
          return { ...c, statuses: (c.statuses || []).filter((s) => s !== status) }
        }
        return c
      })
    )
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newCombatants = [...combatants]
    const temp = newCombatants[index]
    newCombatants[index] = newCombatants[index - 1]
    newCombatants[index - 1] = temp
    setCombatants(newCombatants)
  }

  const handleMoveDown = (index: number) => {
    if (index === combatants.length - 1) return
    const newCombatants = [...combatants]
    const temp = newCombatants[index]
    newCombatants[index] = newCombatants[index + 1]
    newCombatants[index + 1] = temp
    setCombatants(newCombatants)
  }

  const canMoveUp = (index: number) => {
    if (index === 0) return false
    return combatants[index].initiative === combatants[index - 1].initiative
  }

  const canMoveDown = (index: number) => {
    if (index === combatants.length - 1) return false
    return combatants[index].initiative === combatants[index + 1].initiative
  }

  const hasInitiativeClash = (index: number) => {
    return canMoveUp(index) || canMoveDown(index)
  }

  const PRESET_COLORS = [
    "#1f2937", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", 
    "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316"
  ]

  const handleColorChange = (id: string, color: string) => {
    setCombatants(
      combatants.map((c) => (c.id === id ? { ...c, color } : c))
    )
    setShowColorPicker(null)
  }

  const handleStatusInputChange = (id: string, value: string) => {
    setStatusInputs({ ...statusInputs, [id]: value })
    setShowSuggestions({ ...showSuggestions, [id]: value.length > 0 })
  }

  const getFilteredConditions = (id: string) => {
    const input = statusInputs[id]?.toLowerCase() || ""
    if (!input) return Object.keys(DND_CONDITIONS)
    return Object.keys(DND_CONDITIONS).filter(condition => 
      condition.toLowerCase().includes(input)
    )
  }

  const handleSelectCondition = (id: string, condition: string) => {
    setStatusInputs({ ...statusInputs, [id]: condition })
    setShowSuggestions({ ...showSuggestions, [id]: false })
  }

  return (
    <div className="flex-1 p-8 overflow-auto bg-white">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-black">Initiative Tracker</h2>
          {combatants.length > 0 && (
            <Button variant="destructive" onClick={handleClearAll} className="gap-2">
              <Trash2 size={16} />
              Clear All
            </Button>
          )}
        </div>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Combat Order</CardTitle>
              </CardHeader>
              <CardContent>
                {combatants.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <p>No combatants added yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {combatants.map((combatant, index) => (
                      <div
                        key={combatant.id}
                        className="p-4 rounded-md border border-card-border bg-card-bg hover:bg-card-hover transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-4">
                            {hasInitiativeClash(index) && (
                              <div className="flex flex-col gap-0.5 w-6 shrink-0">
                              <button
                                onClick={() => handleMoveUp(index)}
                                disabled={!canMoveUp(index)}
                                className="h-4 w-6 flex items-center justify-center rounded hover:bg-card-hover disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronUp size={14} className="text-arrow hover:text-arrow-hover" />
                              </button>
                              <button
                                onClick={() => handleMoveDown(index)}
                                disabled={!canMoveDown(index)}
                                className="h-4 w-6 flex items-center justify-center rounded hover:bg-card-hover disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronDown size={14} className="text-arrow hover:text-arrow-hover" />
                              </button>
                              </div>
                            )}
                            {!hasInitiativeClash(index) && <div className="w-6 shrink-0" />}
                            <div className="relative">
                              <button
                                onClick={() => setShowColorPicker(showColorPicker === combatant.id ? null : combatant.id)}
                                className="flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: combatant.color || "#1f2937" }}
                              >
                                {combatant.initiative}
                              </button>
                              {showColorPicker === combatant.id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowColorPicker(null)}
                                  />
                                  <div className="absolute top-14 left-0 z-50 bg-white border border-colorpicker-border rounded-lg shadow-lg p-3 min-w-max">
                                    <div className="grid grid-cols-5 gap-2">
                                      {PRESET_COLORS.map((color) => (
                                        <button
                                          key={color}
                                          onClick={() => handleColorChange(combatant.id, color)}
                                          className="w-7 h-7 rounded-full border-2 border-colorpicker-border hover:border-gray-500 transition-colors"
                                          style={{ backgroundColor: color }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {combatant.type === "player" ? (
                                <User size={18} className="text-player-icon shrink-0" />
                              ) : combatant.type === "ally" ? (
                                <Shield size={18} className="text-ally shrink-0" />
                              ) : (
                                <Swords size={18} className="text-monster shrink-0" />
                              )}
                              <span className="font-medium text-lg">{combatant.name}</span>
                            </div>
                            <span className="text-xs text-gray-500 capitalize shrink-0">
                              {combatant.type}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCombatant(combatant.id)}
                            className="px-2 text-red-600 hover:text-red-700 shrink-0"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        {(combatant.type === "monster" || combatant.type === "ally") && combatant.currentHp !== undefined && (
                          <div className="flex items-center gap-2 mb-3 ml-[88px]">
                            <div className="flex items-center gap-1 px-3 py-1 rounded-md bg-hp-bg text-hp">
                              <Heart size={14} fill="currentColor" />
                              <span className="text-sm font-medium">
                                {combatant.currentHp}/{combatant.maxHp}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAdjustHp(combatant.id, -1)}
                                className="px-2 h-8"
                              >
                                <Minus size={14} />
                              </Button>
                              <Input
                                type="number"
                                value={hpAdjustInputs[combatant.id] || ""}
                                onChange={(e) => handleHpAdjustInputChange(combatant.id, e.target.value)}
                                placeholder="1"
                                className="w-16 h-8 text-center text-sm"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAdjustHp(combatant.id, 1)}
                                className="px-2 h-8"
                              >
                                <Plus size={14} />
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="ml-[88px] space-y-2">
                          {combatant.statuses && combatant.statuses.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                               {combatant.statuses.map((status) => (
                                <span
                                  key={status}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-status-bg text-status rounded-md group relative cursor-help"
                                  title={DND_CONDITIONS[status] || "Custom status"}
                                >
                                  {status}
                                  {DND_CONDITIONS[status] && (
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-tooltip-bg text-white text-xs rounded-md whitespace-normal w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity pointer-events-none z-20">
                                      {DND_CONDITIONS[status]}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleRemoveStatus(combatant.id, status)}
                                    className="hover:text-status"
                                  >
                                    <X size={12} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-1 relative">
                            <div className="flex-1 relative">
                              <Input
                                placeholder="Add status (e.g., Poisoned)"
                                value={statusInputs[combatant.id] || ""}
                                onChange={(e) => handleStatusInputChange(combatant.id, e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddStatus(combatant.id)}
                                onBlur={() => setTimeout(() => setShowSuggestions({ ...showSuggestions, [combatant.id]: false }), 200)}
                                className="h-8 text-sm"
                              />
                              {showSuggestions[combatant.id] && statusInputs[combatant.id] && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-input-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                  {getFilteredConditions(combatant.id).map((condition) => (
                                    <button
                                      key={condition}
                                      onClick={() => handleSelectCondition(combatant.id, condition)}
                                      className="w-full text-left px-3 py-2 hover:bg-suggestion-hover text-sm group"
                                    >
                                      <div className="font-medium text-gray-900">{condition}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">{DND_CONDITIONS[condition]}</div>
                                    </button>
                                  ))}
                                  {getFilteredConditions(combatant.id).length === 0 && (
                                    <div className="px-3 py-2 text-sm text-gray-500 italic">
                                      Press Enter to add &quot;{statusInputs[combatant.id]}&quot;
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddStatus(combatant.id)}
                              className="px-2 h-8"
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Combatant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Name</label>
                  <Input
                    placeholder="e.g., Goblin #1"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCombatant()}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Initiative</label>
                  <Input
                    type="number"
                    placeholder="e.g., 15"
                    value={initiativeInput}
                    onChange={(e) => setInitiativeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddCombatant()}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTypeInput("player")}
                      className={`justify-center ${typeInput === "player" ? "border-2 border-player-icon bg-gray-100" : ""}`}
                    >
                      Player
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTypeInput("ally")}
                      className={`justify-center ${typeInput === "ally" ? "border-2 border-ally bg-ally-light" : ""}`}
                    >
                      Ally
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTypeInput("monster")}
                      className={`justify-center ${typeInput === "monster" ? "border-2 border-monster bg-monster-light" : ""}`}
                    >
                      Monster
                    </Button>
                  </div>
                </div>
                {(typeInput === "monster" || typeInput === "ally") && (
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">Hit Points (Optional)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 45"
                      value={hpInput}
                      onChange={(e) => setHpInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddCombatant()}
                    />
                  </div>
                )}
                <Button onClick={handleAddCombatant} className="w-full gap-2">
                  <Plus size={16} />
                  Add Combatant
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Combatants:</span>
                  <span className="font-medium">{combatants.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <User size={14} className="text-gray-700" />
                    Players:
                  </span>
                  <span className="font-medium">
                    {combatants.filter((c) => c.type === "player").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Shield size={14} className="text-ally" />
                    Allies:
                  </span>
                  <span className="font-medium">
                    {combatants.filter((c) => c.type === "ally").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Swords size={14} className="text-monster" />
                    Monsters:
                  </span>
                  <span className="font-medium">
                    {combatants.filter((c) => c.type === "monster").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
