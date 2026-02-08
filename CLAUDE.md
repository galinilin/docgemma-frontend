# DocGemma Frontend

Vue 3 + TypeScript frontend for the DocGemma medical AI assistant.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Vue 3 (Composition API) |
| Language | TypeScript |
| State | Pinia |
| Styling | Tailwind CSS |
| Icons | Heroicons |
| Build | Vite |

## Project Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── ChatPanel.vue        # Main chat container
│   │   ├── ChatInput.vue        # Message input with image upload
│   │   ├── MessageList.vue      # Scrollable message list (60% centered)
│   │   ├── MessageBubble.vue    # Individual message + image display + trace toggle
│   │   ├── StreamingText.vue    # Typing indicator for responses
│   │   ├── TraceStepCard.vue    # Single step in reasoning trace
│   │   └── ReasoningDrawer.vue  # Collapsible trace timeline
│   ├── layout/
│   │   ├── AppLayout.vue        # Main layout with sidebar
│   │   ├── Header.vue           # Top bar with session controls
│   │   └── SessionSidebar.vue   # Session list (w-72)
│   ├── tools/
│   │   └── ToolApprovalModal.vue # Tool execution approval dialog
│   └── common/
│       └── ErrorBanner.vue      # Error display
├── composables/
│   ├── useApi.ts                # REST API calls
│   └── useWebSocket.ts          # WebSocket connection (singleton, Promise-based connect)
├── stores/
│   ├── sessionStore.ts          # Chat state, messages, turn state
│   ├── graphStore.ts            # (legacy, mostly unused)
│   └── websocketStore.ts        # Connection status
├── types/
│   ├── api.ts                   # API response types
│   ├── events.ts                # WebSocket event types
│   └── trace.ts                 # Clinical trace types
├── utils/
│   └── eventHandlers.ts         # WebSocket event dispatch
└── views/
    ├── ChatView.vue             # Main chat page
    ├── EhrView.vue              # EHR placeholder
    └── Patient*.vue             # Patient management views
```

## Key Patterns

### Message Flow (Lazy Session Creation)
1. User types → `ChatInput` emits `send`
2. `ChatView.handleSendMessage()` creates session lazily if `sessionStore.sessionId` is null
3. `useWebSocket.connect()` returns `Promise<void>` (awaitable)
4. `ws.sendMessage()` stores user message (with `image_url` in metadata if image attached), resets state, sends via WebSocket
5. Backend streams events → `handleEvent()` dispatches to stores
6. `completion` event → `sessionStore.addMessage()` with clinical trace

### State Reset on New Turn
```typescript
// In useWebSocket.sendMessage()
sessionStore.resetTurnState()
sessionStore.clearStreamingText()
sessionStore.setStatus('processing')
```

### Image Display in Message Bubbles
- `sendMessage()` stores `{ has_image: true, image_url: 'data:image/jpeg;base64,...' }` in message metadata
- Backend persists `image_url` in session message metadata (survives page refresh)
- `MessageBubble.vue` renders `<img>` above text for messages with `metadata.image_url`

### Lazy Session Creation
- `onMounted` in `ChatView` just resets state — no API call
- `handleNewSession()` disconnects WebSocket + resets state — no API call
- Session is created on first `handleSendMessage()` call (POST `/api/sessions` → connect WS → send message)

### Message Deduplication
`sessionStore.addMessage()` rejects duplicates with same role+content within 5 seconds.

### Clinical Trace Display
- `MessageBubble` shows toggle button if `metadata.clinical_trace` exists
- `ReasoningDrawer` renders collapsible timeline
- `TraceStepCard` shows icon by type: thought (lightbulb), tool_call (search), synthesis (check)

## Layout

- Session sidebar: `w-72` (288px)
- Chat content: `max-w-[60%] mx-auto` (centered)
- User messages: right-aligned
- Assistant messages: left-aligned

## Commands

```bash
# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Type check
npm run type-check
```

## Environment

```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/api
```
