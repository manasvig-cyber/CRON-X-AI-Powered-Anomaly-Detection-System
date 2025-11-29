import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import LiveAlerts from '../components/LiveAlerts';
import AlertDetail from '../components/AlertDetail';
import Chatbot from '../components/Chatbot';
import EmailConfig from '../components/EmailConfig';
import { useSocket } from '../context/SocketContext';
import { Alert } from '../types';
import axios from 'axios';
import { Mail, Ban, Shield, Activity, Zap } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { lastMessage, isConnected } = useSocket();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [showEmailConfig, setShowEmailConfig] = useState(false);
    const [overriding, setOverriding] = useState(false);

    // Initial fetch
    useEffect(() => {
        const DUMMY_ALERTS: Alert[] = [
            {
                alert_id: "alert_7b3d9e",
                created_ts: Math.floor(Date.now() / 1000) - 300,
                status: 'open',
                severity: 'high',
                anomaly_score: 0.95,
                model_scores: { "isolation_forest": 0.98, "autoencoder": 0.92 },
                suggested_action: "Investigate immediately. Unusual keystroke pattern detected.",
                user_id: "asmith",
                session_id: "sess_7b3d9e",
                ip: "10.0.0.55",
                events: [],
                structured_reasons: [
                    { tag: "rapid_keystrokes", weight: 0.8, detail: "Typing speed exceeds 99th percentile" },
                    { tag: "unusual_time", weight: 0.4, detail: "Activity outside normal working hours" }
                ],
                notes: [],
                audit: []
            },
            {
                alert_id: "alert_9c4e2f",
                created_ts: Math.floor(Date.now() / 1000) - 1800,
                status: 'acknowledged',
                severity: 'medium',
                anomaly_score: 0.75,
                model_scores: { "isolation_forest": 0.70, "autoencoder": 0.80 },
                suggested_action: "Monitor user activity.",
                user_id: "jdoe",
                session_id: "sess_8f92a1",
                ip: "192.168.1.101",
                events: [],
                structured_reasons: [
                    { tag: "new_ip", weight: 0.6, detail: "First time login from this subnet" }
                ],
                notes: [],
                audit: []
            }
        ];

        const fetchAlerts = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/alerts');
                setAlerts(res.data);
                if (res.data.length > 0) {
                    setSelectedAlert(res.data[0]);
                }
            } catch (e) {
                console.warn("Failed to fetch alerts, using dummy data", e);
                setAlerts(DUMMY_ALERTS);
                if (DUMMY_ALERTS.length > 0) {
                    setSelectedAlert(DUMMY_ALERTS[0]);
                }
            }
        };
        fetchAlerts();
    }, []);

    // Handle real-time updates
    useEffect(() => {
        if (lastMessage) {
            if (lastMessage.type === 'alert_new') {
                const newAlert = lastMessage.alert;
                setAlerts(prev => [newAlert, ...prev]);
                // Optional: auto-select if it's high severity?
                // if (newAlert.severity === 'high') setSelectedAlert(newAlert);
            } else if (lastMessage.type === 'alert_update') {
                setAlerts(prev => prev.map(a =>
                    a.alert_id === lastMessage.alert_id ? { ...a, ...lastMessage.changes } : a
                ));
                if (selectedAlert?.alert_id === lastMessage.alert_id) {
                    setSelectedAlert(prev => prev ? { ...prev, ...lastMessage.changes } : null);
                }
            }
        }
    }, [lastMessage, selectedAlert?.alert_id]);

    const handleAlertUpdate = (updatedAlert: Alert) => {
        setAlerts(prev => prev.map(a => a.alert_id === updatedAlert.alert_id ? updatedAlert : a));
        setSelectedAlert(updatedAlert);
    };

    const handleQuickOverride = async () => {
        if (!selectedAlert) return;

        if (!window.confirm(`Override alert ${selectedAlert.alert_id}? This will mark it as a false positive.`)) {
            return;
        }

        setOverriding(true);
        try {
            await axios.post(`http://localhost:8000/api/alerts/${selectedAlert.alert_id}/override`, {
                actor: 'analyst_user',
                action: 'false_positive',
                reason: 'Marked as false positive via dashboard'
            });

            // Refresh alert data
            const res = await axios.get(`http://localhost:8000/api/alerts/${selectedAlert.alert_id}`);
            handleAlertUpdate(res.data);

            alert('Alert overridden successfully');
        } catch (e) {
            alert('Failed to override alert');
            console.error(e);
        } finally {
            setOverriding(false);
        }
    };

    const handleTriggerTestAlert = async () => {
        try {
            await axios.post('http://localhost:8000/api/trigger-alert');
        } catch (e) {
            console.error("Failed to trigger alert", e);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col h-[calc(100vh-8rem)]">
                {/* Action Buttons */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setShowEmailConfig(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 text-sm shadow-lg shadow-blue-500/20 transition-all"
                    >
                        <Mail size={16} />
                        Configure Email Alerts
                    </button>
                    {selectedAlert && selectedAlert.status === 'open' && (
                        <button
                            onClick={handleQuickOverride}
                            disabled={overriding}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-sm shadow-lg shadow-amber-500/20 transition-all"
                        >
                            <Ban size={16} />
                            {overriding ? 'Overriding...' : 'Override False Positive'}
                        </button>
                    )}
                    <button
                        onClick={handleTriggerTestAlert}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 text-sm shadow-lg shadow-purple-500/20 transition-all ml-auto"
                    >
                        <Zap size={16} />
                        Trigger Alert
                    </button>
                </div>

                {alerts.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center max-w-md">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse-slow" />
                                <Shield className="w-24 h-24 mx-auto text-blue-500 relative z-10" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Real-Time Monitoring Active
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                No alerts detected. The system is monitoring for anomalies in real-time.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <Activity className={`w-4 h-4 ${isConnected ? 'text-green-500 animate-pulse' : 'text-red-500'}`} />
                                <span className={isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                    {isConnected ? 'Connected to monitoring system' : 'Disconnected'}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-6">
                                Click "Trigger Alert" above to test the system
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <LiveAlerts alerts={alerts} onSelect={setSelectedAlert} />

                        <div className="flex-1 min-h-0">
                            {selectedAlert ? (
                                <AlertDetail alert={selectedAlert} onUpdate={handleAlertUpdate} />
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    Select an alert to view details
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <Chatbot />
            {showEmailConfig && <EmailConfig onClose={() => setShowEmailConfig(false)} />}
        </Layout>
    );
};

export default Dashboard;
