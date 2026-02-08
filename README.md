# DocGemma Frontend

Vue 3 + TypeScript frontend for the DocGemma Medical AI Assistant.

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
- **State Management:** Pinia
- **Styling:** Tailwind CSS
- **Icons:** Heroicons

## Features

- WebSocket-based streaming for real-time agent updates
- Lazy session creation (session created on first message, not page load)
- Image upload with display in message bubbles (persists across refresh)
- Clinical trace — inline collapsible reasoning timeline per message
- Tool approval modal for human-in-the-loop control
- EHR browser with patient list and chart views

## Documentation

See [CLAUDE_FRONTEND.md](./CLAUDE_FRONTEND.md) for detailed architecture, design patterns, and development notes.
