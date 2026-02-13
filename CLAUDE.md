# DocGemma Frontend

## Overview

Vue 3 + TypeScript frontend for the DocGemma Medical AI Assistant.

- **Backend API:** FastAPI at `http://localhost:8000/api`
- **WebSocket:** Real-time events at `ws://localhost:8000/api/sessions/{id}/ws`
- **Routes:** `/` (Chat), `/ehr` (Patient Browser), `/ehr/patient/:id` (Patient Chart)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Vue 3 (Composition API + `<script setup>`) |
| Language | TypeScript |
| Build | Vite 5 |
| State | Pinia |
| Styling | Tailwind CSS 3.4 |
| Icons | Heroicons (`@heroicons/vue`) |
| Markdown | markdown-it |
| Routing | vue-router 4 |

## Project Structure

```
docgemma-frontend/
├── src/
│   ├── main.ts                       # App entry: createApp + Pinia + Router
│   ├── App.vue                       # Root component (RouterView)
│   ├── style.css                     # Tailwind imports + custom CSS
│   ├── vite-env.d.ts                 # Vite type declarations
│   │
│   ├── types/
│   │   ├── index.ts                  # Barrel export of all types
│   │   ├── api.ts                    # REST API response types (SessionStatus, Message, etc.)
│   │   ├── events.ts                 # WebSocket event types (AgentEvent union)
│   │   ├── patient.ts               # EHR types (PatientSummary, PatientChart, request/response)
│   │   └── trace.ts                 # Clinical trace types (TraceStep, ClinicalTrace)
│   │
│   ├── stores/
│   │   ├── index.ts                  # Barrel export
│   │   ├── sessionStore.ts           # Chat state, messages, turn state, pending approval
│   │   ├── ehrStore.ts               # EHR/patient state, chart data, modal state
│   │   └── websocketStore.ts         # Connection status, reconnect attempts
│   │
│   ├── composables/
│   │   ├── index.ts                  # Barrel export
│   │   ├── useApi.ts                 # REST client: sessions, health check
│   │   ├── usePatientApi.ts          # REST client: patients, chart, allergies, meds, notes
│   │   └── useWebSocket.ts           # WebSocket singleton (HMR-safe, Promise-based connect)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── index.ts
│   │   │   ├── AppLayout.vue         # Main layout: sidebar (w-72) + header + content slot
│   │   │   ├── Header.vue            # Top bar: logo, connection status, session ID, EHR link, new session
│   │   │   ├── SessionSidebar.vue    # Session list with preview, delete, active highlighting
│   │   │   └── SplitPane.vue         # Resizable split panel (draggable divider, 20-80% bounds)
│   │   │
│   │   ├── chat/
│   │   │   ├── index.ts
│   │   │   ├── ChatPanel.vue         # Main chat container (starter mode / active mode)
│   │   │   ├── ChatInput.vue         # Textarea + image upload + send/cancel buttons
│   │   │   ├── MessageList.vue       # Scrollable message list (max-w-[60%] mx-auto, auto-scroll)
│   │   │   ├── MessageBubble.vue     # Message display: user/assistant/tool roles, images, markdown, trace toggle
│   │   │   ├── StreamingText.vue     # Real-time response with blinking cursor + markdown
│   │   │   ├── AgentStatusIndicator.vue  # Animated status text during processing
│   │   │   ├── TraceStepCard.vue     # Single step in reasoning timeline (icon by type, expandable)
│   │   │   ├── ReasoningDrawer.vue   # Collapsible clinical reasoning trace timeline
│   │   │   ├── PatientSelector.vue   # Dropdown to select patient context (autocomplete, keyboard nav)
│   │   │   └── ToolModeSwitch.vue    # Toggle tool calling on/off
│   │   │
│   │   ├── tools/
│   │   │   ├── index.ts
│   │   │   └── ToolApprovalModal.vue # Human-in-the-loop tool approval dialog
│   │   │
│   │   ├── ehr/
│   │   │   ├── index.ts
│   │   │   ├── CreatePatientModal.vue   # New patient form (name, DOB, gender)
│   │   │   ├── AddAllergyModal.vue      # Allergy form (substance, reaction, severity)
│   │   │   ├── AddMedicationModal.vue   # Medication form (name, dosage, frequency)
│   │   │   └── AddNoteModal.vue         # Clinical note form (type select, text area)
│   │   │
│   │   └── common/
│   │       ├── index.ts
│   │       ├── ErrorBanner.vue       # Fixed error notification (bottom-right, dismissable)
│   │       ├── JsonViewer.vue        # Pretty-print JSON (green-on-dark terminal style)
│   │       └── LoadingSpinner.vue    # SVG spinner (sm/md/lg sizes)
│   │
│   ├── views/
│   │   ├── ChatView.vue              # Main chat page (lazy session creation, tool approval)
│   │   ├── EhrView.vue               # EHR shell with sidebar nav
│   │   ├── PatientListView.vue       # Patient directory (search, grid, create modal)
│   │   └── PatientChartView.vue      # Full patient chart (allergies, conditions, vitals, meds, labs, notes)
│   │
│   ├── utils/
│   │   ├── index.ts                  # Barrel export
│   │   ├── constants.ts              # ConnectionStatus type + status color mapping
│   │   └── eventHandlers.ts          # WebSocket event → Pinia store dispatch
│   │
│   └── router/
│       └── index.ts                  # Vue Router config (/, /ehr, /ehr/patient/:id)
│
├── index.html                        # SPA entry point
├── vite.config.ts                    # Vite config + Vue plugin
├── tailwind.config.js                # Tailwind configuration
├── postcss.config.js                 # PostCSS + Tailwind plugin
├── package.json                      # Dependencies + scripts
├── tsconfig.json
├── .env.example                      # VITE_API_URL, VITE_WS_URL
└── dist/                             # Production build output
```

## Commands

```bash
# Install dependencies
npm install

# Development server (Vite, HMR)
npm run dev

# Type check (vue-tsc)
npm run type-check

# Production build (vue-tsc && vite build)
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Environment Variables

```bash
# .env or .env.local
VITE_API_URL=http://localhost:8000/api    # REST API base URL
VITE_WS_URL=ws://localhost:8000/api       # WebSocket base URL
```

If `VITE_WS_URL` is not set, the WebSocket URL is constructed from `window.location` with proper protocol (`wss://` for HTTPS, `ws://` for HTTP).

## Routing

| Path | View | Description |
|------|------|-------------|
| `/` | `ChatView` | Main chat interface (lazy loaded) |
| `/ehr` | `EhrView` → `PatientListView` | Patient directory browser |
| `/ehr/patient/:patientId` | `EhrView` → `PatientChartView` | Individual patient chart |

**Navigation:**
- Header: EHR link (`/ehr`), New Session button
- EHR sidebar: Patients link (`/ehr`), Back to Chat (`/`)
- Patient list: Click card → `/ehr/patient/:id`
- Patient chart: Back button → `/ehr`

## Key Design Patterns

### 1. Lazy Session Creation

Sessions are NOT created on page load:
1. `ChatView.onMounted()` resets state — no API call
2. `handleNewSession()` disconnects WS + resets state — no API call
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

### 2. WebSocket Singleton (HMR-Safe)

- Static `socket`, `sessionId`, `reconnectTimeout` at module level (persists across Hot Module Replacement)
- `connect(sessionId)`: Returns `Promise<void>` — resolves on `onopen`
- Skips if already connected to same session
- Closes old connection if switching sessions
- Max 5 reconnection attempts with exponential backoff (2s × attempt)
- Auto-reconnect on unexpected close (skips on code 1000 or 4004)

### 3. Turn State Management

```typescript
// In useWebSocket.sendMessage():
sessionStore.resetTurnState()      // Clear previous turn artifacts
sessionStore.clearStreamingText()  // Clear streaming buffer
sessionStore.setStatus('processing')
// Add user message immediately (with image metadata if present)
// Send via WebSocket: { action: 'send_message', data: { content, image_base64, patient_id, tool_calling_enabled } }
```

### 4. Image Display in Messages

- User uploads → converted to base64 in `ChatInput`
- Added to message metadata: `{ has_image: true, image_url: 'data:image/jpeg;base64,...' }`
- Backend persists `image_url` in session message metadata (survives page refresh)
- `MessageBubble.vue` renders `<img>` above text for messages with `metadata.image_url`

### 5. Message Deduplication

```typescript
// In sessionStore.addMessage():
const isDuplicate = messages.value.some(
  (m) => m.role === message.role &&
         m.content === message.content &&
         Math.abs(timestamp_diff) < 5000
)
```

Prevents duplicate messages from timing-sensitive WebSocket events.

### 6. WebSocket Event Handling (Graceful Degradation)

```typescript
// src/utils/eventHandlers.ts — handleEvent()
switch (e.event) {
  case 'node_start':             // No-op (traced for debugging)
  case 'node_end':               // No-op
  case 'agent_status':           // → sessionStore.agentStatusText
  case 'tool_approval_request':  // → sessionStore.setPendingApproval() → status 'waiting_approval'
  case 'tool_execution_start':   // → sessionStore.executingTool
  case 'tool_execution_end':     // → sessionStore.toolResults, clear executingTool
  case 'streaming_text':         // → append to sessionStore.streamingText, clear agent status
  case 'completion':             // → addMessage with clinical_trace metadata, reset status to 'active'
  case 'error':                  // → set error, clear streaming/status
  default:                       // console.warn (don't crash)
}
```

### 7. Clinical Trace Display

- `MessageBubble` shows toggle button if `metadata.clinical_trace` exists
- Shows tool count + response time as summary
- `ReasoningDrawer` renders collapsible timeline
- `TraceStepCard` per step with icon by type:
  - Thought: lightbulb (amber)
  - Tool call: search (blue)
  - Synthesis: check (green)
- Expandable reasoning text and tool result detail sections
- Vertical timeline with connecting line

### 8. Patient Selector

- Dropdown button with autocomplete search
- Keyboard navigation: Arrow keys, Enter to select, Escape to close
- Loads patients from `useApi.listPatients()` on mount
- Validates restored `selectedPatientId` against EHR
- Clears if patient no longer exists

### 9. Tool Approval Flow

- Backend sends `tool_approval_request` event → `sessionStore.setPendingApproval()`
- `ToolApprovalModal` shows: tool name, arguments (JsonViewer), intent description
- Approve → `ws.approveTool()` → backend resumes graph execution
- Reject → `ws.rejectTool(reason?)` → backend skips to synthesis

### 10. EHR Modal Pattern

Consistent pattern across all EHR modals (allergy, medication, note, patient):
```typescript
if (!field.trim()) { error.value = 'Please fill in...'; return }
isSubmitting.value = true
try {
  const response = await api.callEndpoint()
  if (response.error) { error.value = response.error }
  else { emit('success') }
} catch (err) {
  error.value = err?.detail || 'Failed...'
} finally {
  isSubmitting.value = false
}
```

## State Management (Pinia Stores)

### sessionStore
**Purpose:** Chat session + message state

| State | Type | Description |
|-------|------|-------------|
| `sessionId` | `string \| null` | Null until first message |
| `status` | `SessionStatus` | 'active' / 'processing' / 'waiting_approval' / 'error' |
| `messages` | `Message[]` | Chat history with metadata |
| `pendingApproval` | `PendingToolApproval \| null` | Current tool awaiting approval |
| `streamingText` | `string` | Accumulated response during streaming |
| `executingTool` | `{ name, args } \| null` | Currently executing tool |
| `agentStatusText` | `string` | Status text during processing |
| `error` | `{ message, recoverable } \| null` | Error display state |
| `selectedPatientId` | `string \| null` | Patient context for session |
| `toolCallingEnabled` | `boolean` | Tool calling toggle |

**Computed:** `isProcessing`, `isWaitingApproval`, `hasError`, `canSendMessage`

**Key Actions:**
- `setSession(id)`: Initialize, reset state
- `addMessage()`: With deduplication (5s window)
- `setPendingApproval()` / `clearPendingApproval()`: Tool approval state
- `resetTurnState()`: Clear tool results, subtasks, status (on new message)
- `resetState()`: Full reset except sessionId
- `resetControls()`: Reset patient/tool preferences

### ehrStore
**Purpose:** EHR/Patient browser state

| State | Type | Description |
|-------|------|-------------|
| `patients` | `PatientSummary[]` | Loaded from API |
| `selectedPatientId` | `string \| null` | Current patient |
| `currentChart` | `PatientChart \| null` | Full EHR data |
| `searchQuery` | `string` | Search filter |
| `isLoading` / `error` | — | API state |
| Modal flags | `boolean` | showAddAllergyModal, showAddMedicationModal, etc. |

**Computed:** `selectedPatient`, `hasPatients`, `allergies`, `medications`, `conditions`, `labs`, `notes`, `vitals`, `screenings`, `visitNotes`

### websocketStore
**Purpose:** Connection status tracking

| State | Type | Description |
|-------|------|-------------|
| `status` | `ConnectionStatus` | 'disconnected' / 'connecting' / 'connected' / 'error' |
| `reconnectAttempts` | `number` | For exponential backoff |
| `lastError` | `string \| null` | Last connection error |

## Type Definitions

### api.ts
- `SessionStatus`: 'active' | 'processing' | 'waiting_approval' | 'error'
- `Message`: `{ id, role ('user'|'assistant'|'tool'), content, timestamp, metadata }`
- `PendingToolApproval`: `{ tool_name, tool_args, subtask_intent, checkpoint_id }`
- `SessionResponse`, `SessionListResponse`, `HealthResponse`

### events.ts (WebSocket Events)
- Base: `BaseEvent` `{ event: string, timestamp }`
- `NodeStartEvent`, `NodeEndEvent`: Agent step lifecycle
- `AgentStatusEvent`: `{ status_text, node_id, tool_name }`
- `ToolApprovalRequestEvent`: Human-in-the-loop
- `ToolExecutionStartEvent`, `ToolExecutionEndEvent`: Tool lifecycle
- `StreamingTextEvent`: `{ text, node_id }`
- `CompletionEvent`: `{ final_response, tool_calls_made, clinical_trace? }`
- `ErrorEvent`: `{ error_type, message, recoverable }`
- Union: `AgentEvent` covers all event types
- Client actions: `SendMessageAction`, `ApproveToolAction`, `RejectToolAction`, `CancelAction`

### patient.ts
- `PatientSummary`: `{ patient_id, name, dob, gender }`
- `PatientChart`: Full EHR (demographics, conditions, medications, allergies, labs, notes, vitals, screenings, visitNotes)
- Request/Response types for create patient, add allergy, prescribe medication, save note

### trace.ts
- `TraceStepType`: 'thought' | 'tool_call' | 'synthesis'
- `TraceStep`: `{ label, description, type, duration_ms, reasoning_text?, tool_name?, tool_result_summary?, tool_result_detail?, success? }`
- `ClinicalTrace`: `{ steps[], total_duration_ms, tools_consulted }`

## Composables

### useApi
- Base URL: `VITE_API_URL` or `/api`
- `checkHealth()`: GET `/health`
- `createSession(request?)`: POST `/sessions`
- `listSessions()`: GET `/sessions`
- `getSession(id)`: GET `/sessions/{id}`
- `deleteSession(id)`: DELETE `/sessions/{id}`
- `listPatients()`: GET `/patients`

### usePatientApi
- `searchPatients(name?, dob?)`: GET `/patients?name=...&dob=...`
- `listPatients()`: GET `/patients`
- `getPatientChart(id)`: GET `/patients/{id}`
- `createPatient(request)`: POST `/patients`
- `addAllergy(id, request)`: POST `/patients/{id}/allergies`
- `prescribeMedication(id, request)`: POST `/patients/{id}/medications`
- `saveNote(id, request)`: POST `/patients/{id}/notes`

### useWebSocket
- Singleton pattern (HMR-safe static state)
- `connect(sessionId)`: Promise-based, awaitable
- `disconnect()`: Close + clear state
- `send(action)`: Raw send if connected
- `sendMessage(content, imageBase64?)`: Full turn initiation (reset state, add user message, send)
- `approveTool()`, `rejectTool(reason?)`, `cancel()`: Tool control actions

## WebSocket Protocol

### Client → Server
```json
{ "action": "send_message", "data": { "content": "...", "image_base64": null, "patient_id": null, "tool_calling_enabled": true } }
{ "action": "approve_tool", "data": {} }
{ "action": "reject_tool", "data": { "reason": "optional" } }
{ "action": "cancel", "data": {} }
```

### Server → Client
| Event | Purpose |
|-------|---------|
| `node_start` / `node_end` | Node execution lifecycle |
| `agent_status` | Status text updates |
| `tool_approval_request` | Tool approval dialog trigger |
| `tool_execution_start` / `tool_execution_end` | Tool execution lifecycle |
| `streaming_text` | Token-by-token synthesis output |
| `completion` | Final response + `clinical_trace` metadata |
| `error` | Error with type + recoverable flag |

## Layout

- Session sidebar: `w-72` (288px fixed)
- Chat content: `max-w-[60%] mx-auto` (centered, 60% of viewport)
- User messages: right-aligned, blue-600 bg, white text
- Assistant messages: left-aligned, white bg, border, markdown-rendered
- Tool messages: gray bg, tool icon
- Patient chart: responsive grid (`md:grid-cols-2`, `lg:grid-cols-3`)
- Modals: `max-w-md` fixed max width
- Error banner: fixed `bottom-4 right-4`

## Component Details

### Chat Components

| Component | Purpose | Key Feature |
|-----------|---------|-------------|
| `ChatPanel` | Main container | Starter mode (centered greeting + input) / Active mode (messages + streaming) |
| `ChatInput` | Message input | Image upload (base64), Enter=send, Shift+Enter=newline, cancel during processing |
| `MessageList` | Scrollable list | Auto-scroll on new messages/streaming, centered max-w-[60%] |
| `MessageBubble` | Individual message | Role-based styling, image display, markdown (markdown-it), trace toggle |
| `StreamingText` | Live response | Markdown + blinking cursor, purple pulsing avatar |
| `AgentStatusIndicator` | Processing status | Italic gray text with animated CPU icon |
| `ReasoningDrawer` | Trace timeline | Collapsible, stats header, TraceStepCard per step |
| `TraceStepCard` | Single trace step | Icon by type (thought/tool/synthesis), expandable reasoning + result detail |
| `PatientSelector` | Patient context | Autocomplete dropdown, keyboard nav, validates against EHR |
| `ToolModeSwitch` | Toggle tools | Emerald ON / Gray OFF button |

### EHR Components

| Component | Purpose | Theme Color |
|-----------|---------|-------------|
| `CreatePatientModal` | New patient | Default |
| `AddAllergyModal` | Allergy entry | Red-50 |
| `AddMedicationModal` | Medication order | Blue-50 |
| `AddNoteModal` | Clinical note | Amber-50 |

Note types: clinical-note, progress-note, discharge-summary, history-and-physical, consultation

### PatientChartView Sections

| Section | Theme | Features |
|---------|-------|----------|
| Allergies | Red | + Add button → AddAllergyModal |
| Conditions | Purple | Read-only list |
| Vital Signs | Teal | 2-column grid |
| Medications | Blue | + Add button → AddMedicationModal |
| Recent Labs | Green | Table: Test / Result / Date |
| Screenings | Rose | Table: Assessment / Score / Date |
| Visit Documentation | Indigo | Expandable cards by type |
| Clinical Notes | Amber | + Add button → AddNoteModal |

## Dependencies

```json
{
  "@heroicons/vue": "^2.1.0",     // Icon library
  "@vue-flow/controls": "^1.1.0", // Flow controls (legacy)
  "@vue-flow/core": "^1.33.0",    // Flow diagram (legacy)
  "@vue-flow/minimap": "^1.4.0",  // Flow minimap (legacy)
  "dagre": "^0.8.5",              // Graph layout (legacy)
  "markdown-it": "^14.1.0",       // Markdown rendering
  "pinia": "^2.1.0",              // State management
  "vue": "^3.4.0",                // UI framework
  "vue-router": "^4.6.4"          // Client-side routing
}
```

Dev: `typescript ~5.3`, `vite ^5.0`, `vue-tsc ^1.8`, `tailwindcss ^3.4`, `postcss ^8.4`, `autoprefixer ^10.4`

## Conventions

1. **File Organization**: Components by feature (chat/, layout/, ehr/), stores by domain, types centralized
2. **Naming**: PascalCase for Vue components, camelCase for composables/stores/utils
3. **Imports**: Use `@` alias for src/ paths (not currently configured — use relative paths)
4. **Barrel Exports**: Every directory has `index.ts` for clean imports
5. **Reactive State**: Computed for derived state, actions for mutations
6. **Error Handling**: Graceful degradation — unknown events logged, don't crash
7. **Performance**: Lazy route loading, singleton WebSocket, message deduplication
8. **Styling**: Tailwind utility-first, custom `:deep` styles for markdown rendering
9. **Markdown**: markdown-it with custom styles for h1-h3, lists, code, blockquote, table, links
10. **Icons**: Heroicons (UserIcon, CpuChipIcon, WrenchIcon, etc.) by role/context
