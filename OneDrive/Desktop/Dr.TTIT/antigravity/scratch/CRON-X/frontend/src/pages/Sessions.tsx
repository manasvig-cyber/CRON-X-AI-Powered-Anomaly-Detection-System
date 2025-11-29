import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { User, Clock } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';

interface Session {
    session_id: string;
    user_id: string;
    ip: string;
    event_count: number;
    last_seen: number;
    alerts_count: number;
}

const Sessions: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    const DUMMY_SESSIONS: Session[] = [
        {
            session_id: "sess_8f92a1",
            user_id: "jdoe",
            ip: "192.168.1.101",
            event_count: 45,
            last_seen: Math.floor(Date.now() / 1000) - 120,
            alerts_count: 0
        },
        {
            session_id: "sess_7b3d9e",
            user_id: "asmith",
            ip: "10.0.0.55",
            event_count: 128,
            last_seen: Math.floor(Date.now() / 1000) - 30,
            alerts_count: 2
        },
        {
            session_id: "sess_9c4e2f",
            user_id: "mwilson",
            ip: "172.16.0.23",
            event_count: 12,
            last_seen: Math.floor(Date.now() / 1000) - 600,
            alerts_count: 0
        }
    ];

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await axios.get('http://localhost:8000/api/sessions');
                setSessions(res.data);
            } catch (e) {
                console.warn("Failed to fetch sessions, using dummy data", e);
                setSessions(DUMMY_SESSIONS);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();

        // Refresh every 30 seconds
        const interval = setInterval(fetchSessions, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-full">
                    <div className="text-muted-foreground">Loading sessions...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Active Sessions</h1>
                    <div className="text-sm text-muted-foreground">
                        {sessions.length} active sessions
                    </div>
                </div>

                {sessions.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        No active sessions found
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {sessions.map((session) => (
                                <div key={session.session_id} className="p-5 bg-card border border-border rounded-lg hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="text-primary" size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold">{session.session_id}</div>
                                                <div className="text-sm text-muted-foreground">User: {session.user_id}</div>
                                            </div>
                                        </div>
                                        <div className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs rounded">
                                            {session.alerts_count} alert{session.alerts_count !== 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <div className="text-muted-foreground text-xs mb-1">Last Activity</div>
                                            <div className="flex items-center gap-1 font-medium">
                                                <Clock size={14} />
                                                {formatDistanceToNow(session.last_seen * 1000, { addSuffix: true })}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-muted-foreground text-xs mb-1">Events</div>
                                            <div className="font-bold text-primary">{session.event_count}</div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="text-muted-foreground text-xs mb-1">IP Address</div>
                                            <div className="font-mono text-xs">{session.ip}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Sessions;
