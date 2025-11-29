import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Sessions from './pages/Sessions';
import Playbooks from './pages/Playbooks';
import ChatbotPage from './pages/ChatbotPage';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';
import { SocketProvider } from './context/SocketContext';

import { ActivityTracker } from './components/ActivityTracker';

function App() {
    return (
        <SocketProvider>
            <ActivityTracker />
            <Router>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/sessions" element={<Sessions />} />
                    <Route path="/playbooks" element={<Playbooks />} />
                    <Route path="/chatbot" element={<ChatbotPage />} />
                    <Route path="/audit-log" element={<AuditLog />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </SocketProvider>
    );
}

export default App;
