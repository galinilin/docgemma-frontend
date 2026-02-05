# DocGemma Frontend

## Overview

Vue 3 + Vue Flow frontend for the DocGemma Medical AI Assistant. **Fully data-driven design** — never needs changes when backend graph nodes, tools, or events change.

- **Backend API:** FastAPI at `http://localhost:8000/api`
- **WebSocket:** Real-time events at `ws://localhost:8000/api/sessions/{id}/ws`

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Vue 3 + Vite + TypeScript |
| Graph Visualization | Vue Flow |
| Auto-Layout | Dagre |
| State Management | Pinia |
| Styling | Tailwind CSS |
| Icons | Heroicons |

## Project Structure

```
src/
├── main.ts                     # App entry point
├── App.vue                     # Main component, wires everything together
├── style.css                   # Tailwind imports + custom CSS
├── vite-env.d.ts               # Vite environment types
│
├── types/
│   ├── index.ts
│   ├── api.ts                  # Mirrors backend Pydantic schemas
│   └── events.ts               # WebSocket event types
│
├── stores/
│   ├── index.ts
│   ├── sessionStore.ts         # Session state, messages, status
│   ├── graphStore.ts           # Vue Flow nodes/edges
│   └── websocketStore.ts       # Connection state
│
├── composables/
│   ├── index.ts
│   ├── useApi.ts               # REST client
│   ├── useWebSocket.ts         # WS connection + event handling
│   └── useGraphLayout.ts       # Dagre auto-layout
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.vue       # Main grid layout
│   │   ├── Header.vue          # Session controls, connection status
│   │   └── SplitPane.vue       # Resizable panels
│   │
│   ├── graph/
│   │   ├── GraphPanel.vue      # Vue Flow container
│   │   ├── BaseNode.vue        # Generic node (styles from data)
│   │   └── AnimatedEdge.vue    # Edge with active animation
│   │
│   ├── chat/
│   │   ├── ChatPanel.vue       # Chat container
│   │   ├── MessageList.vue     # Conversation history
│   │   ├── MessageBubble.vue   # Individual message
│   │   ├── ChatInput.vue       # Input + image upload
│   │   └── StreamingText.vue   # Real-time response display
│   │
│   ├── tools/
│   │   ├── ToolPanel.vue       # Sidebar: subtasks + results
│   │   ├── ToolResultCard.vue  # Individual tool result
│   │   └── ToolApprovalModal.vue # Generic approval dialog
│   │
│   └── common/
│       ├── JsonViewer.vue      # Pretty JSON display
│       ├── LoadingSpinner.vue
│       └── ErrorBanner.vue
│
└── utils/
    ├── index.ts
    ├── constants.ts            # Node type colors, status styles
    ├── graphHelpers.ts         # API → Vue Flow transformation
    └── eventHandlers.ts        # WebSocket event dispatch
```

## Key Design Patterns

### 1. Data-Driven Node Styling

Node types (`llm`, `tool`, `code`) are styled via config map with `default` fallback:

```typescript
// src/utils/constants.ts
const NODE_TYPE_CONFIG: Record<string, NodeStyle> = {
  llm:     { icon: 'CpuChipIcon',   bg: 'bg-purple-100', border: 'border-purple-400' },
  tool:    { icon: 'WrenchIcon',    bg: 'bg-blue-100',   border: 'border-blue-400' },
  code:    { icon: 'CodeIcon',      bg: 'bg-green-100',  border: 'border-green-400' },
  default: { icon: 'CircleIcon',    bg: 'bg-gray-100',   border: 'border-gray-400' },
};

// Usage: NODE_TYPE_CONFIG[node.node_type] ?? NODE_TYPE_CONFIG.default
```

### 2. WebSocket Event Handling (Graceful Degradation)

```typescript
// src/utils/eventHandlers.ts
export function handleEvent(event: unknown) {
  const e = event as { event?: string };

  switch (e.event) {
    case 'node_start':
      graphStore.setNodeStatus(e.node_id, 'active');
      break;
    case 'node_end':
      graphStore.setNodeStatus(e.node_id, 'completed');
      break;
    case 'tool_approval_request':
      sessionStore.setPendingApproval(e);
      break;
    case 'completion':
      sessionStore.addMessage('assistant', e.final_response);
      break;
    case 'error':
      sessionStore.setError(e.message, e.recoverable);
      break;
    default:
      console.warn('Unknown event type:', e.event, event);
  }
}
```

### 3. API Types (Mirror Backend)

```typescript
// src/types/api.ts
interface GraphNode {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  node_type: string;  // 'llm' | 'tool' | 'code' | unknown
}

interface GraphEdge {
  source: string;
  target: string;
  label: string | null;
  active: boolean;
}
```

### 4. WebSocket Client Actions

```typescript
// Client -> Server
{ action: 'send_message', data: { content: '...', image_base64: null } }
{ action: 'approve_tool', data: {} }
{ action: 'reject_tool', data: { reason: 'optional' } }
{ action: 'cancel', data: {} }
```

### 5. Server Events

```typescript
// Server -> Client
{ event: 'node_start', node_id: '...' }
{ event: 'node_end', node_id: '...' }
{ event: 'tool_approval_request', tool_name: '...', tool_args: {...} }
{ event: 'tool_execution_start', tool_name: '...' }
{ event: 'tool_execution_end', tool_name: '...', success: true, result: {...} }
{ event: 'streaming_text', text: '...' }
{ event: 'completion', final_response: '...' }
{ event: 'error', message: '...', recoverable: true }
```

## Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/sessions` | Create session |
| GET | `/api/sessions` | List sessions |
| GET | `/api/sessions/{id}` | Get session |
| DELETE | `/api/sessions/{id}` | Delete session |
| GET | `/api/sessions/{id}/graph` | Get graph state |
| GET | `/api/sessions/{id}/messages` | Get messages |
| WS | `/api/sessions/{id}/ws` | WebSocket connection |
| GET | `/api/tools` | List available tools |

## Commands

```bash
# Install dependencies
npm install

# Development server (port 3000)
npm run dev

# Type check
npm run type-check

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Variables

```bash
# .env or .env.local
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/api
```

## UI Layout

```
┌────────────────────────────────────────────────────────────┐
│ Header: [Session: abc123] [● Connected] [+ New Session]    │
├──────────────────────────┬─────────────────────────────────┤
│                          │  Chat Panel                     │
│   Graph Panel            │  ┌─────────────────────────┐   │
│   (Vue Flow)             │  │ User: Check warfarin... │   │
│                          │  │ Assistant: Checking...  │   │
│   [Image Detection]      │  └─────────────────────────┘   │
│         ↓                │  ┌─────────────────────────┐   │
│   [Complexity Router]    │  │ Ask a medical question  │   │
│      ↓         ↓         │  └─────────────────────────┘   │
│   [Direct] [Thinking]    ├─────────────────────────────────┤
│              ↓           │  Tool Panel (collapsible)       │
│        [Decompose]       │  Subtasks: [1] Check drug...    │
│              ↓           │  Results: [check_drug_safety]   │
│        [Plan Tool]       │            └─ success           │
│              ↓           │                                 │
│      [Execute Tool] ←────┼── [Approval Modal]              │
│              ↓           │                                 │
│       [Synthesize]       │                                 │
└──────────────────────────┴─────────────────────────────────┘
```

## Development Notes

### Adding New Node Types

Just add to backend `GRAPH_NODES` — frontend will use `default` style automatically. Optionally add custom style in `constants.ts`.

### Adding New Events

Add handler in `eventHandlers.ts` switch statement. Unknown events log a warning but don't crash.

### Adding New Tools

No frontend changes needed. Tool approval modal displays any tool's `name` + `args` as JSON.

## Dependencies

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "@vue-flow/core": "^1.33.0",
    "@vue-flow/controls": "^1.1.0",
    "@vue-flow/minimap": "^1.4.0",
    "pinia": "^2.1.0",
    "dagre": "^0.8.5",
    "@heroicons/vue": "^2.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "@types/dagre": "^0.7.52",
    "@types/node": "^20.10.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "~5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0"
  }
}
```
