# AnomWatch Implementation Plan

## Goal Description
Build a SOC-only web dashboard "AnomWatch" for real-time anomaly monitoring. It includes a Python FastAPI backend (serving mock data and WebSockets) and a React+Vite frontend with a premium dark-mode UI.

## User Review Required
> [!IMPORTANT]
> - **Backend**: Using Python FastAPI instead of Node.js for better alignment with "MCP/Algorithm" context.
> - **Mock Data**: The backend will generate synthetic data for alerts and sessions to simulate a live environment.
> - **Session Replay**: Will be implemented using a custom Canvas/SVG component rendering synthetic cursor traces.

## Proposed Changes

### Backend (Python FastAPI)
Location: `anomwatch/backend`

#### [NEW] [main.py](file:///C:/Users/deepu/.gemini/antigravity/scratch/anomwatch/backend/main.py)
- FastAPI application entry point.
- CORS middleware configuration.
- WebSocket endpoint `/ws/alerts`.
- Background task to emit `alert_new` events periodically.

#### [NEW] [models.py](file:///C:/Users/deepu/.gemini/antigravity/scratch/anomwatch/backend/models.py)
- Pydantic models for `Alert`, `Event`, `User`, `ChatQuery`, `ChatResponse`.

#### [NEW] [mock_data.py](file:///C:/Users/deepu/.gemini/antigravity/scratch/anomwatch/backend/mock_data.py)
- Functions to generate random alerts, users, and session events (cursor traces).

#### [NEW] [routes/api.py](file:///C:/Users/deepu/.gemini/antigravity/scratch/anomwatch/backend/routes/api.py)
- REST endpoints:
    - `GET /api/alerts`: List alerts.
    - `GET /api/alerts/{id}`: Alert details.
    - `POST /api/alerts/{id}/ack`: Acknowledge alert.
    - `POST /api/alerts/{id}/override`: Override action.
    - `POST /api/chat`: Chatbot interface (mocked logic).

### Frontend (React + Vite)
Location: `anomwatch/frontend`

#### [NEW] [Project Structure]
- Standard Vite + React + TypeScript setup.
- Dependencies: `axios`, `date-fns`, `framer-motion`, `lucide-react`, `react-router-dom`, `recharts`, `socket.io-client`, `clsx`, `tailwind-merge`.

#### [NEW] [src/components/SessionReplay.tsx](file:///C:/Users/deepu/.gemini/antigravity/scratch/anomwatch/frontend/src/components/SessionReplay.tsx)
- Canvas-based component to render cursor trails and clicks from `cursor_trace` data.
- Play/Pause/Scrub controls.

#### [NEW] [src/components/Chatbot.tsx](file:///C:/Users/deepu/.gemini/antigravity/scratch/anomwatch/frontend/src/components/Chatbot.tsx)
- Collapsible right-rail chat interface.
- Displays structured responses with clickable alert references.

#### [NEW] [src/pages/Dashboard.tsx](file:///C:/Users/deepu/.gemini/antigravity/scratch/anomwatch/frontend/src/pages/Dashboard.tsx)
- Main layout: Header, Sidebar, Live Alert Strip, Split-pane Alert Detail.

## Verification Plan

### Automated Tests
- **Backend**: Run `pytest` (if added) or manual curl tests.
- **Frontend**: `npm run build` to ensure type safety and build success.

### Manual Verification
1. **Start Backend**: `cd backend && uvicorn main:app --reload --port 8000`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Verify Live Alerts**: Open dashboard, wait for WebSocket to push new alerts (every ~10s).
4. **Verify Session Replay**: Click an alert, ensure session replay canvas draws cursor movement.
5. **Verify Chatbot**: Open chat, type "Show recent alerts", verify structured response.
6. **Verify Actions**: Click "Acknowledge" on an alert, verify status update in UI.
