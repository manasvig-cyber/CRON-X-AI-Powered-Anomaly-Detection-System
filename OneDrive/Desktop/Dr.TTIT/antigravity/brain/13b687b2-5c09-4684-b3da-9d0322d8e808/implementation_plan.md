# Implementation Plan - Dummy Data for Demo

The goal is to ensure the application displays data during a demo, even if the backend is unavailable or empty. I will inject dummy data into the frontend components.

## Proposed Changes

### Frontend

#### [MODIFY] [Sessions.tsx](file:///c:/Users/deepu/.gemini/antigravity/scratch/anomwatch/frontend/src/pages/Sessions.tsx)
- Update `DUMMY_SESSIONS` to use realistic IDs and data (e.g., `sess_8f92a1`, `user_jdoe`).

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/deepu/.gemini/antigravity/scratch/anomwatch/frontend/src/pages/Dashboard.tsx)
- Update `DUMMY_ALERTS` to use realistic IDs and data (e.g., `alert_7b3d9e`).

## Verification Plan

### Manual Verification
- Refresh the frontend.
- Verify that `Sessions` and `Dashboard` pages show the realistic data.
