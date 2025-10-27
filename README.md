  # Lute and Loot

A comprehensive D&D 5e session management tool with multiple integrated tools for Dungeon Masters. Manage encounters, track initiative, play ambient music, and more—all in one place.

## Features

### 🎵 Music Tool
- Add YouTube videos as background music for your sessions
- Persistent playlist saved in cookies (survives page refreshes)
- Mini player that follows you across tools
- Play/stop controls with automatic video management
- Visual player with embedded YouTube videos

### ⚔️ Encounter Creator
- **325+ D&D 5e monsters** from the SRD with official CR ratings
- **Accurate difficulty calculation** using DMG guidelines (Easy, Medium, Hard, Deadly)
- **Party management** with player names and levels (1-20)
- **Save/load parties** via cookies for quick reuse across campaigns
- **Quick level adjustment** with +/- buttons for each player
- **XP calculations** with encounter multipliers for monster count
- **Roll20 integration** - click monster names to open compendium pages
- Real-time difficulty analysis and party statistics

### 📊 Initiative Tracker
- Track combat initiative order
- Manage multiple combatants
- Quick reference during encounters

### 🎲 Tools Navigation
- Clean sidebar with tool switching
- Persistent state across sessions
- Responsive design for desktop and tablet use

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API + Cookies (js-cookie)
- **UI Components**: Custom component library inspired by shadcn/ui
- **Icons**: Lucide React
- **Data Persistence**: Cookie-based (365-day expiry)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will be running at `localhost:3000`. Any changes to the code will hot-reload automatically.

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Usage

### Running Your First Session

1. **Set up your party**:
   - Go to the Encounter Creator
   - Add players with their names and levels
   - Save your party for reuse (click the folder icon)

2. **Create an encounter**:
   - Search for monsters (start typing to see suggestions)
   - Add monster counts
   - View real-time difficulty rating (Easy/Medium/Hard/Deadly)
   - Click monster names to view Roll20 stats

3. **Play music**:
   - Navigate to the Music Tool
   - Add YouTube URLs for ambient music
   - Music persists across tool switches via mini player

4. **Track initiative**:
   - Use Initiative Tracker to manage combat order
   - Add combatants as needed

## Project Structure

```
my-dnd-manager/
├── app/                           # Next.js app directory (App Router)
│   ├── layout.tsx                # Root layout with MusicProvider
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles and Tailwind imports
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── button.tsx           # Button with variants
│   │   ├── input.tsx            # Text input
│   │   └── card.tsx             # Card container
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx          # Tool navigation sidebar
│   │   └── mini-player.tsx      # Persistent music mini player
│   ├── tools/                    # Tool-specific components
│   │   ├── music-tool.tsx       # Music management
│   │   ├── youtube-player.tsx   # YouTube video embed
│   │   ├── encounter-creator.tsx # D&D encounter builder
│   │   └── initiative-tracker.tsx # Combat initiative
│   └── app.tsx                   # Main app component with tool routing
├── contexts/
│   └── music-context.tsx         # Global music state management
├── lib/
│   ├── monsters-data.ts          # 325+ D&D 5e monster database
│   └── utils.ts                  # Utility functions (cn for classnames)
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## Component Library

The project includes a lightweight component library with:

- **Button**: Versatile button with variants (default, destructive, outline, secondary, ghost, link)
- **Input**: Text input with consistent styling
- **Card**: Container with CardHeader, CardTitle, CardDescription, CardContent, CardFooter

These components follow the shadcn/ui pattern and are fully customizable via Tailwind CSS.

## Data Persistence

The app uses **cookies** (via `js-cookie`) for cross-session persistence:

- **Music playlist**: Saved for 365 days in `dnd_music_playlist` cookie
- **Current video**: Saved in `dnd_current_video` cookie
- **Saved parties**: Saved for 365 days in `dnd-saved-parties` cookie

No backend or database required—everything runs client-side.

## Adding New Tools

To add a new tool to the sidebar:

1. Create a new tool component in `components/tools/`
2. Add the tool to the `TOOLS` array in `components/layout/sidebar.tsx`
3. Import and add the tool rendering logic in `components/app.tsx`

Example:
```tsx
// components/tools/my-tool.tsx
export function MyTool() {
  return <div className="flex-1 p-8 overflow-auto bg-white">
    {/* Tool content */}
  </div>
}

// components/layout/sidebar.tsx
export const TOOLS = [
  // ... existing tools
  { id: "my-tool", name: "My Tool", icon: Icon },
]

// components/app.tsx
{activeTool === "my-tool" && <MyTool />}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
