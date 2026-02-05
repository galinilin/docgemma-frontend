# DocGemma Frontend

Vue 3 + Vue Flow frontend for the DocGemma Medical AI Assistant.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000

# Production build
npm run build

# Type check
npm run type-check
```

## Environment

```bash
# .env or .env.local
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/api
```

## Tech Stack

- **Framework:** Vue 3 + Vite + TypeScript
- **Graph Visualization:** Vue Flow + Dagre
- **State Management:** Pinia
- **Styling:** Tailwind CSS
- **Icons:** Heroicons

## Features

- Real-time agent state visualization via Vue Flow
- WebSocket-based streaming for live updates
- Tool approval modal for human-in-the-loop control
- Data-driven node styling (no code changes needed for new node types)
- Image upload support for medical image analysis

## Documentation

See [CLAUDE_FRONTEND.md](./CLAUDE_FRONTEND.md) for detailed architecture, design patterns, and development notes.
