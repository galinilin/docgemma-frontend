# DocGemma Frontend

Vue 3 web interface for DocGemma, a medical AI assistant with integrated EHR management. Provides real-time chat with an agentic AI, patient record browsing, and clinical decision support tools.

## Overview

DocGemma Frontend is a single-page application that connects to the [DocGemma Connect](../docgemma-connect) backend via REST and WebSocket APIs. It enables healthcare professionals to interact with a MedGemma-powered AI agent while managing patient records, reviewing clinical traces, and approving AI-suggested actions through a human-in-the-loop safety workflow.

### Key Features

- **Real-time AI chat** — Streamed agent responses with incremental token display
- **Tool approval workflow** — Inspect, edit, approve, or reject AI-proposed actions before execution
- **Patient EHR management** — Browse patient charts, allergies, medications, conditions, vitals, labs, and imaging
- **Clinical trace visualization** — Step-by-step reasoning transparency (thinking, tool calls, synthesis with durations)
- **Medical imaging** — Upload, view, and manage imaging studies with metadata
- **Session management** — Create, list, resume, and delete chat sessions
- **Agent controls** — Toggle tool calling and extended thinking modes

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vue 3 (Composition API) |
| Language | TypeScript |
| Routing | Vue Router |
| State management | Pinia |
| Styling | Tailwind CSS |
| Build tool | Vite |
| Markdown | markdown-it |
| Flow visualization | Vue Flow + Dagre |
| Icons | Heroicons |

## Project Structure

```
src/
├── views/                         # Page-level components (routes)
│   ├── ChatView.vue               # Main AI chat interface
│   ├── EhrView.vue                # EHR layout wrapper
│   ├── PatientListView.vue        # Patient list with search
│   └── PatientChartView.vue       # Individual patient record
├── components/
│   ├── chat/                      # Chat interface
│   │   ├── ChatPanel.vue          # Main chat container
│   │   ├── ChatInput.vue          # Message input with image attach
│   │   ├── MessageList.vue        # Scrollable message history
│   │   ├── MessageBubble.vue      # Role-colored message display
│   │   ├── StreamingText.vue      # Real-time response rendering
│   │   ├── StreamingThinking.vue  # Thinking indicator
│   │   ├── PatientSelector.vue    # Patient context selector
│   │   ├── ToolModeSwitch.vue     # Tool calling toggle
│   │   ├── ThinkingModeSwitch.vue # Extended thinking toggle
│   │   ├── TraceStepCard.vue      # Clinical trace step display
│   │   └── ReasoningDrawer.vue    # Expandable reasoning panel
│   ├── ehr/                       # EHR management
│   │   ├── CreatePatientModal.vue
│   │   ├── AddAllergyModal.vue
│   │   ├── AddMedicationModal.vue
│   │   ├── AddNoteModal.vue
│   │   ├── UploadImagingModal.vue
│   │   └── ImagingViewer.vue
│   ├── tools/
│   │   └── ToolApprovalModal.vue  # Approve/reject/edit tool calls
│   ├── layout/
│   │   ├── AppLayout.vue          # App shell
│   │   ├── Header.vue             # Top navigation
│   │   ├── SessionSidebar.vue     # Session history panel
│   │   └── SplitPane.vue          # Resizable split view
│   └── common/                    # Shared UI components
├── composables/                   # Vue composition API hooks
│   ├── useApi.ts                  # REST API client
│   ├── usePatientApi.ts           # Patient/EHR API client
│   └── useWebSocket.ts            # WebSocket connection manager
├── stores/                        # Pinia state stores
│   ├── sessionStore.ts            # Chat session & message state
│   ├── websocketStore.ts          # Connection state & reconnection
│   └── ehrStore.ts                # Patient/EHR data & modals
├── types/                         # TypeScript type definitions
│   ├── api.ts                     # API request/response types
│   ├── events.ts                  # WebSocket event types
│   ├── patient.ts                 # Patient/EHR domain types
│   └── trace.ts                   # Clinical trace types
├── utils/
│   ├── constants.ts               # Application constants
│   └── eventHandlers.ts           # WebSocket event dispatchers
└── router/
    └── index.ts                   # Route definitions
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- [DocGemma Connect](../docgemma-connect) backend running

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd docgemma-frontend

# Install dependencies
npm install
```

### Configuration

Copy the example environment file and adjust as needed:

```bash
cp .env.example .env
```

```ini
# Backend API base URL
VITE_API_URL=http://localhost:8000/api

# Backend WebSocket base URL
VITE_WS_URL=ws://localhost:8000/api
```

### Development

```bash
npm run dev
```

Starts the Vite dev server at `http://localhost:3000` with hot module replacement. The dev server proxies API requests to the backend.

### Production Build

```bash
npm run build
```

Outputs optimized static files to `dist/`. Type-checking runs automatically before the build.

### Other Commands

```bash
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking (no emit)
```

## Routes

| Path | View | Description |
|------|------|-------------|
| `/` | ChatView | AI chat interface with session management |
| `/ehr` | PatientListView | Patient list with search |
| `/ehr/patient/:patientId` | PatientChartView | Full patient medical record |

## Architecture Notes

### WebSocket Communication

The frontend maintains a persistent WebSocket connection per chat session. Key behaviors:

- Auto-reconnect with exponential backoff (max 5 attempts)
- Message deduplication within a 5-second window
- Singleton connection pattern (stable across Vite HMR)
- Clean disconnect on session switch

### State Management

Three Pinia stores manage application state:

- **sessionStore** — Active session, messages, streaming text, pending approvals, agent controls
- **websocketStore** — Connection status, reconnection attempts, error tracking
- **ehrStore** — Patient list, selected patient chart, modal visibility, search state

### Tool Approval Flow

When the AI agent proposes a write operation (prescribe medication, add allergy, save note):

1. Backend sends a `tool_approval_request` event via WebSocket
2. Frontend displays `ToolApprovalModal` with the tool name and arguments
3. User can approve (optionally editing arguments), or reject with a reason
4. Decision is sent back over WebSocket; the agent continues or adjusts accordingly
