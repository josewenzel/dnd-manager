"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export interface Combatant {
  id: string
  name: string
  initiative: number
  type: "player" | "monster" | "ally"
  currentHp?: number
  maxHp?: number
  statuses?: string[]
  color?: string
}

interface InitiativeContextType {
  combatants: Combatant[]
  setCombatants: (combatants: Combatant[]) => void
  startCombat: (newCombatants: Combatant[], switchToTool: () => void) => void
  addCombatant: (combatant: Combatant) => void
  deleteCombatant: (id: string) => void
  updateCombatant: (id: string, updates: Partial<Combatant>) => void
  clearCombatants: () => void
}

const InitiativeContext = createContext<InitiativeContextType | undefined>(undefined)

export function InitiativeProvider({ children }: { children: ReactNode }) {
  const [combatants, setCombatants] = useState<Combatant[]>([])

  const startCombat = (newCombatants: Combatant[], switchToTool: () => void) => {
    setCombatants(newCombatants.sort((a, b) => b.initiative - a.initiative))
    switchToTool()
  }

  const addCombatant = (combatant: Combatant) => {
    setCombatants([...combatants, combatant].sort((a, b) => b.initiative - a.initiative))
  }

  const deleteCombatant = (id: string) => {
    setCombatants(combatants.filter((c) => c.id !== id))
  }

  const updateCombatant = (id: string, updates: Partial<Combatant>) => {
    setCombatants(
      combatants.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }

  const clearCombatants = () => {
    setCombatants([])
  }

  return (
    <InitiativeContext.Provider
      value={{
        combatants,
        setCombatants,
        startCombat,
        addCombatant,
        deleteCombatant,
        updateCombatant,
        clearCombatants,
      }}
    >
      {children}
    </InitiativeContext.Provider>
  )
}

export function useInitiativeContext() {
  const context = useContext(InitiativeContext)
  if (!context) {
    throw new Error("useInitiativeContext must be used within InitiativeProvider")
  }
  return context
}
