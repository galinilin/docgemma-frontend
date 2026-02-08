# DocGemma Frontend

## Overview

Vue 3 + TypeScript frontend for the DocGemma Medical AI Assistant.

- **Backend API:** FastAPI at `http://localhost:8000/api`
- **WebSocket:** Real-time events at `ws://localhost:8000/api/sessions/{id}/ws`

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Vue 3 + Vite + TypeScript |
| State Management | Pinia |
| Styling | Tailwind CSS |
| Icons | Heroicons |

## Project Structure

```
src/
├── main.ts                     # App entry point
├── App.vue                     # Main component, router setup
├── style.css                   # Tailwind imports + custom CSS
│
├── types/
│   ├── api.ts                  # Mirrors backend Pydantic schemas
│   ├── events.ts               # WebSocket event types
│   ├── patient.ts              # Patient/EHR types
│   └── trace.ts                # Clinical trace types
│
├── stores/
│   ├── sessionStore.ts         # Chat state, messages, turn state
│   ├── ehrStore.ts             # EHR/patient state
│   └── websocketStore.ts       # Connection state
│
├── composables/
│   ├── useApi.ts               # REST client (sessions, tools)
│   ├── usePatientApi.ts        # REST client (patients, EHR)
│   └── useWebSocket.ts         # WS connection (singleton, Promise-based connect)
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.vue       # Main layout with sidebar
│   │   ├── Header.vue          # Top bar with session controls
│   │   ├── SessionSidebar.vue  # Session list (w-72)
│   │   └── SplitPane.vue       # Resizable panels
│   │
│   ├── chat/
│   │   ├── ChatPanel.vue       # Chat container
│   │   ├── MessageList.vue     # Scrollable message list (60% centered)
│   │   ├── MessageBubble.vue   # Individual message + image display + trace toggle
│   │   ├── ChatInput.vue       # Input + image upload
│   │   ├── StreamingText.vue   # Real-time response display
│   │   ├── AgentStatusIndicator.vue  # Agent processing status
│   │   ├── TraceStepCard.vue   # Single step in reasoning trace
│   │   └── ReasoningDrawer.vue # Collapsible trace timeline
│   │
│   ├── tools/
│   │   └── ToolApprovalModal.vue # Generic approval dialog
│   │
│   ├── ehr/
│   │   ├── AddAllergyModal.vue
│   │   ├── AddMedicationModal.vue
│   │   ├── AddNoteModal.vue
│   │   └── CreatePatientModal.vue
│   │
│   └── common/
│       ├── JsonViewer.vue      # Pretty JSON display
│       ├── LoadingSpinner.vue
│       └── ErrorBanner.vue
│
├── views/
│   ├── ChatView.vue            # Main chat page (lazy session creation)
│   ├── EhrView.vue             # EHR browser
│   ├── PatientListView.vue     # Patient list
│   └── PatientChartView.vue    # Individual patient chart
│
└── utils/
    ├── constants.ts            # Status styles
    └── eventHandlers.ts        # WebSocket event dispatch
```

## Key Design Patterns

### 1. Lazy Session Creation

Sessions are NOT created on page load. The flow:
1. `ChatView.onMounted()` just resets state
2. `handleNewSession()` disconnects WS + resets state (no API call)
3. First `handleSendMessage()` creates session → connects WS → sends message

```typescript
async function handleSendMessage(content: string, imageBase64?: string) {
  if (!sessionStore.sessionId) {
    const session = await api.createSession()
    sessionStore.setSession(session.session_id)
    await ws.connect(session.session_id)  // Promise-based
  }
  ws.sendMessage(content, imageBase64)
}
```

### 2. Image Display in Messages

When user uploads an image:
- `sendMessage()` stores `{ has_image: true, image_url: 'data:image/jpeg;base64,...' }` in message metadata
- Backend persists `image_url` in session message metadata (survives page refresh)
- `MessageBubble.vue` renders `<img>` above text for messages with `metadata.image_url`

### 3. WebSocket Event Handling (Graceful Degradation)

```typescript
// src/utils/eventHandlers.ts
switch (e.event) {
  case 'node_start': ...
  case 'node_end': ...
  case 'tool_approval_request': ...
  case 'streaming_text': ...
  case 'completion': ...  // addMessage with clinical_trace
  case 'error': ...
  default: console.warn('Unknown event type:', e.event)
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

### 5. Clinical Trace Display

- `MessageBubble` shows toggle button if `metadata.clinical_trace` exists
- `ReasoningDrawer` renders collapsible timeline
- `TraceStepCard` shows icon by type: thought (lightbulb), tool_call (search), synthesis (check)

### 6. Message Deduplication

`sessionStore.addMessage()` rejects duplicates with same role+content within 5 seconds.

## Layout

- Session sidebar: `w-72` (288px)
- Chat content: `max-w-[60%] mx-auto` (centered)
- User messages: right-aligned
- Assistant messages: left-aligned

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
```

## Environment Variables

```bash
# .env or .env.local
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/api
```
