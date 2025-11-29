# AnomWatch SOC Dashboard Walkthrough

## Overview
AnomWatch is a SOC-only web dashboard for real-time anomaly monitoring. It features a Python FastAPI backend and a React+Vite frontend.

## Features Implemented

### Backend (FastAPI)
- **REST API**: Endpoints for alerts, users, and chatbot (`/api/alerts`, `/api/chat`).
- **WebSockets**: Real-time alert broadcasting at `/ws/alerts`.
- **Mock Data Generator**: Simulates realistic SOC alerts, events, and cursor traces.
- **Chatbot Stub**: Mocked intelligence for querying incidents.

### Frontend (React + Vite)
- **Dashboard UI**: Dark-mode ready, split-pane layout with sidebar and header.
- **Live Alerts**: Real-time feed of incoming anomalies.
- **Alert Detail**: Deep dive into alert specifics, including model scores and raw logs.
- **Session Replay**: Canvas-based visualization of user cursor movement.
- **Chatbot**: Integrated assistant for SOC analysts.

## Verification Results

### 1. Dashboard & Chatbot
The dashboard loads successfully. The chatbot integration was verified to communicate with the backend API.

![Chatbot Response](dashboard_chatbot_response_1764333779680.png)

### 2. Backend API
Verified that the backend serves alert data via REST:
```json
{
  "alert_id": "ALERT_...",
  "severity": "high",
  "anomaly_score": 0.82,
  ...
}
```

### 3. Architecture
- **Frontend**: React, Tailwind, Recharts, Lucide Icons.
- **Backend**: FastAPI, Uvicorn, WebSockets.
- **Communication**: Axios for REST, Native WebSockets for real-time updates.

## Next Steps
- **Live Alerts**: Ensure WebSocket connection stability in all environments.
- **Session Replay**: Enhance with actual recorded data playback.
- **Authentication**: Implement OIDC/JWT for production security.
