  # D&D Manager

A D&D session management tool with a modular tool system. Currently includes a music player for ambient background music during sessions.

## Features

- **Sidebar Navigation**: Easy tool switching with a clean sidebar interface
- **Music Player Tool**: 
  - Add YouTube videos as background music
  - Manage a playlist of music/ambience
  - Play/stop videos with automatic stopping of other videos
  - Remove videos from the playlist
  - Clean, organized UI with current player display

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library inspired by shadcn/ui
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Project Structure

```
├── app/                    # Next.js app directory
├── components/
│   ├── ui/                # Reusable UI components (Button, Input, Card)
│   ├── layout/            # Layout components (Sidebar)
│   ├── tools/             # Tool-specific components (MusicTool, YouTubePlayer)
│   └── app.tsx            # Main app component
├── lib/                   # Utility functions
└── package.json           # Dependencies
```

## Component Library

The project includes a lightweight component library with:

- **Button**: Versatile button with variants (default, destructive, outline, secondary, ghost, link)
- **Input**: Text input component
- **Card**: Container component with header, title, description, content, and footer

These components follow the shadcn/ui pattern and are fully customizable via Tailwind CSS.

## Adding New Tools

To add a new tool to the sidebar:

1. Create a new tool component in `components/tools/`
2. Add the tool to the `TOOLS` array in `components/layout/sidebar.tsx`
3. Import and add the tool rendering logic in `components/app.tsx`

Example:
```tsx
// components/tools/my-tool.tsx
export function MyTool() {
  return <div>{/* Tool content */}</div>
}

// components/app.tsx
{activeTool === "my-tool" && <MyTool />}
```

## License

MIT
