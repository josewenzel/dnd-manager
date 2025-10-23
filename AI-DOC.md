# AI Development Context

This document provides technical context for AI assistants working on this codebase.

## Project Overview

A Next.js 14 D&D 5e session management tool for Dungeon Masters with multiple integrated tools: encounter creator, initiative tracker, and music player. Client-side only, no backend.

## Tech Stack

- **Next.js 14.0.0** (App Router, React 18.2.0)
- **TypeScript 5.3.0**
- **Tailwind CSS 3.3.5** with custom design system
- **Lucide React** for icons
- **js-cookie 3.0.5** for persistence (no localStorage, cookies only)
- **No backend** - fully client-side application

## Key Architecture Decisions

### 1. Cookie-Based Persistence
All data is stored in cookies (365-day expiry) using `js-cookie`:
- `dnd_music_playlist` - YouTube video playlist
- `dnd_current_video` - Currently playing video ID
- `dnd-saved-parties` - Array of saved party configurations

**Why cookies over localStorage?**
- Cross-session persistence established pattern
- Follows existing music context implementation
- No mixing of storage methods

### 2. React Context for Global State
`contexts/music-context.tsx` provides global music state:
- Loaded from cookies on mount
- Synced to cookies on change via `useEffect`
- Used by `mini-player.tsx` and `music-tool.tsx`

### 3. Component Architecture
- **No comments in code** (per project style)
- Custom UI components in `components/ui/` (not npm packages)
- Tool components are self-contained in `components/tools/`
- Layout components in `components/layout/`

### 4. Styling Patterns
- Tailwind utility classes exclusively
- Custom color palette in `globals.css`:
  - `--background`, `--foreground`
  - `--sidebar-bg`, `--sidebar-text`, `--sidebar-active`
  - `--card-bg`, `--card-border`
  - `--button-primary`, `--input-border`
- No inline styles or CSS modules

## File-by-File Guide

### Core Application Files

#### `app/layout.tsx`
- Root layout with `<html>` and `<body>`
- Wraps children with `<MusicProvider>` for global music state
- Imports `globals.css`

#### `components/app.tsx`
- Main application component rendered in `app/page.tsx`
- Manages active tool state (`activeTool`)
- Renders `<Sidebar>` and conditionally renders tool components
- Handles mini player visibility (shown when music exists and not on music tool)

### Layout Components

#### `components/layout/sidebar.tsx`
- Fixed left sidebar navigation
- Exports `TOOLS` array (source of truth for available tools)
- Each tool has `id`, `name`, and `icon` (from lucide-react)
- Calls `onToolChange` when tool clicked

#### `components/layout/mini-player.tsx`
- Compact music player shown across all tools (except music tool itself)
- Uses `useMusicContext()` to access global music state
- Shows current video title and stop button
- Positioned in top-right of content area

### Tool Components

#### `components/tools/encounter-creator.tsx`
**Purpose**: Build D&D 5e encounters with difficulty calculation

**Key Features**:
- Party management with player names and levels (1-20)
- Save/load parties via cookies
- Monster search with autocomplete (325+ monsters from `lib/monsters-data.ts`)
- Real-time difficulty calculation (Easy/Medium/Hard/Deadly)
- XP thresholds from DMG (stored in `XP_THRESHOLDS_BY_LEVEL`)
- CR to XP mapping (stored in `XP_BY_CR`)
- Roll20 compendium links for monsters

**Important Implementation Details**:
- Uses `Cookies` from `js-cookie` for party persistence
- `savedParties` loaded on mount via `useEffect`
- `savedParties` synced to cookies via `useEffect` dependency
- Modal for saved parties (not inline list) to save space
- Folder button in card header (opposite title)
- Save party controls only shown when `players.length > 0`
- Level adjustment uses ChevronUp/ChevronDown buttons
- Monster suggestions use `showSuggestions` state + `onBlur` with timeout

**Data Structures**:
```typescript
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

interface EncounterMonster {
  id: string
  name: string
  cr: number
  count: number
}
```

**Difficulty Calculation**:
1. Sum total XP from monsters (CR × count)
2. Apply multiplier based on total monster count
3. Compare adjusted XP to party thresholds (sum of individual player thresholds)
4. Determine difficulty tier

**Layout Structure**:
- 3-column grid (lg breakpoint): Party | Monsters | Encounter Analysis
- Party card has folder button in header (always visible)
- Save party controls appear below player list
- Modal overlay for saved parties list

#### `components/tools/music-tool.tsx`
- Add YouTube URLs to playlist
- Display playlist with video titles
- Play/delete controls for each video
- Uses `useMusicContext()` for state management

#### `components/tools/youtube-player.tsx`
- Embeds YouTube video via iframe
- Extracts video ID from URL (supports various formats)
- Responsive 16:9 aspect ratio

#### `components/tools/initiative-tracker.tsx`
- Initiative order tracking for combat
- Add/remove combatants

### Context

#### `contexts/music-context.tsx`
**Purpose**: Global music state management

**Pattern**:
```typescript
const [videos, setVideos] = useState<Video[]>([])

// Load from cookies on mount
useEffect(() => {
  const saved = Cookies.get(PLAYLIST_COOKIE)
  if (saved) {
    setVideos(JSON.parse(saved))
  }
}, [])

// Sync to cookies on change
useEffect(() => {
  if (videos.length > 0) {
    Cookies.set(PLAYLIST_COOKIE, JSON.stringify(videos), { expires: 365 })
  } else {
    Cookies.remove(PLAYLIST_COOKIE)
  }
}, [videos])
```

**Exports**: `MusicProvider`, `useMusicContext()`

### Data Files

#### `lib/monsters-data.ts`
- Export: `MONSTERS` array of 325+ D&D 5e creatures
- Structure: `{ name: string, cr: number }`
- Used by encounter creator for autocomplete and XP lookup
- Covers CR 0 to CR 30

#### `lib/utils.ts`
- Export: `cn()` function for merging Tailwind classes
- Uses `clsx` and `tailwind-merge`

### UI Components

#### `components/ui/button.tsx`
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- Uses `class-variance-authority` for variant management

#### `components/ui/input.tsx`
- Standard text input with consistent styling
- Supports all native input props

#### `components/ui/card.tsx`
- Exports: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Used extensively for organizing tool layouts

## Common Patterns

### Adding a New Tool

1. Create `components/tools/new-tool.tsx`:
```typescript
export function NewTool() {
  return (
    <div className="flex-1 p-8 overflow-auto bg-white">
      <h2 className="text-3xl font-bold text-black mb-8">New Tool</h2>
      {/* Content */}
    </div>
  )
}
```

2. Add to `components/layout/sidebar.tsx`:
```typescript
export const TOOLS = [
  // ... existing
  { id: "new-tool", name: "New Tool", icon: IconName }
]
```

3. Add to `components/app.tsx`:
```typescript
import { NewTool } from "./tools/new-tool"

// In render:
{activeTool === "new-tool" && <NewTool />}
```

### Cookie Persistence Pattern

```typescript
import Cookies from "js-cookie"

const [data, setData] = useState<DataType[]>([])

useEffect(() => {
  const saved = Cookies.get("cookie-name")
  if (saved) {
    try {
      setData(JSON.parse(saved))
    } catch (e) {
      console.error("Failed to parse cookie:", e)
    }
  }
}, [])

useEffect(() => {
  if (data.length > 0) {
    Cookies.set("cookie-name", JSON.stringify(data), { expires: 365 })
  } else {
    Cookies.remove("cookie-name")
  }
}, [data])
```

### Modal Pattern (Encounter Creator Example)

```typescript
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Title</h3>
        <button onClick={() => setShowModal(false)}>×</button>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        {/* Content */}
      </div>
    </div>
  </div>
)}
```

## Development Workflow

### Build Commands
```bash
npm run dev      # Development server (port 3000)
npm run build    # Production build
npm run lint     # ESLint
```

### Testing Changes
1. Always run `npm run build` to verify TypeScript compilation
2. Check browser console for runtime errors
3. Test cookie persistence by refreshing page

## Important Notes for AI Assistants

1. **No code comments** - This is a project style rule. Do not add comments unless explicitly requested.

2. **Cookie-only persistence** - Do not use localStorage. Follow the cookie pattern established in `music-context.tsx`.

3. **No external component libraries** - UI components are custom-built in `components/ui/`. Do not suggest installing shadcn/ui, Material-UI, etc.

4. **D&D 5e accuracy** - When working with encounter creator:
   - Use official DMG XP thresholds (already implemented correctly)
   - CR to XP mapping is canonical
   - Difficulty tiers are Easy/Medium/Hard/Deadly (no "Trivial" or "Impossible")

5. **Layout consistency** - All tool components should:
   - Use `className="flex-1 p-8 overflow-auto bg-white"`
   - Have `<h2 className="text-3xl font-bold text-black mb-8">` title
   - Use Card components for sections

6. **TypeScript strictness** - The project uses TypeScript. Always type props, state, and function returns.

7. **Lucide React icons** - When adding icons, import from `lucide-react`, not other icon libraries.

8. **Responsive design** - Use Tailwind responsive prefixes (sm:, md:, lg:) for mobile support.

## Current State (Last Updated)

- **Music tool**: Fully functional with playlist and mini player
- **Encounter creator**: Feature-complete with party management, difficulty calculation, and Roll20 links
- **Initiative tracker**: Basic implementation (could be expanded)
- **All features use cookie persistence**: Music playlist, saved parties

## Future Enhancement Ideas

- Initiative tracker improvements (HP tracking, status effects)
- Campaign notes tool
- NPC generator
- Loot table roller
- Session planning tool
- Export/import for saved data
- Mobile-responsive improvements
- Dark mode toggle
