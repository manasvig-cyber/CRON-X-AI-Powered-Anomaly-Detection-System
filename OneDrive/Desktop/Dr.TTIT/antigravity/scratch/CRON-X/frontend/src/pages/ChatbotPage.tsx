import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';
import { ChatResponse } from '../types';

const ChatbotPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string | ChatResponse }[]>([
        {
            role: 'bot',
            content: {
                answer_text: 'Hello! I\'m your SOC assistant. Ask me about alerts, users, or anomalies. Try: "Show recent high severity alerts" or "What happened with user asmith?"',
                references: [],
                suggested_actions: ['Show recent alerts', 'List high severity incidents', 'Check user asmith activity'],
                confidence: 'high'
            }
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        const userMsg = query;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setQuery('');
        setIsLoading(true);

        try {
            const res = await axios.post('http://localhost:8000/api/chat', {
                actor: 'user',
                query: userMsg
            });
            setMessages(prev => [...prev, { role: 'bot', content: res.data }]);
        } catch (err) {
            // Fallback to dummy responses for demo
            const lowerQuery = userMsg.toLowerCase();
            let dummyResponse: ChatResponse;

            if (lowerQuery.includes('alert') || lowerQuery.includes('high') || lowerQuery.includes('severity')) {
                dummyResponse = {
                    answer_text: "I found 2 alerts in the system. There's a high severity alert for user 'asmith' (alert_7b3d9e) with an anomaly score of 0.95, triggered by unusual keystroke patterns. There's also a medium severity alert for user 'jdoe' (alert_9c4e2f) related to a new IP login.",
                    references: ['alert_7b3d9e', 'alert_9c4e2f'],
                    suggested_actions: ['View alert details', 'Check user activity', 'Review session logs'],
                    confidence: 'high'
                };
            } else if (lowerQuery.includes('session') || lowerQuery.includes('user')) {
                dummyResponse = {
                    answer_text: "Currently tracking 3 active sessions: 'jdoe' (45 events), 'asmith' (128 events with 2 alerts), and 'mwilson' (12 events). User 'asmith' shows the most activity and has triggered alerts.",
                    references: ['sess_8f92a1', 'sess_7b3d9e', 'sess_9c4e2f'],
                    suggested_actions: ['View session details', 'Check alert history', 'Monitor user behavior'],
                    confidence: 'high'
                };
            } else if (lowerQuery.includes('anomal')) {
                dummyResponse = {
                    answer_text: "The system detected anomalies using isolation forest and autoencoder models. The highest anomaly score is 0.95 for rapid keystroke patterns from user 'asmith'. This exceeds the 99th percentile for typing speed.",
                    references: ['alert_7b3d9e'],
                    suggested_actions: ['Investigate user activity', 'Review keystroke patterns', 'Check for automation'],
                    confidence: 'high'
                };
            } else {
                dummyResponse = {
                    answer_text: "I can help you analyze security alerts, user sessions, and anomalies in the system. Try asking about recent alerts, specific users, or anomaly patterns.",
                    references: [],
                    suggested_actions: ['Show recent alerts', 'List active sessions', 'Explain anomaly detection'],
                    confidence: 'medium'
                };
            }

            setMessages(prev => [...prev, { role: 'bot', content: dummyResponse }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex flex-col h-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Sparkles className="text-primary" />
                        Antigravity Assistant
                    </h1>
                    <p className="text-muted-foreground mt-2">Ask questions about your security alerts and incidents</p>
                </div>

                <div className="flex-1 overflow-y-auto mb-4 bg-card border border-border rounded-lg p-4">
                    <div className="space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                                    }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className="flex-1">
                                    {typeof msg.content === 'string' ? (
                                        <p className="text-sm">{msg.content}</p>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-sm">{msg.content.answer_text}</p>
                                            {msg.content.references.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    <span className="text-xs text-muted-foreground">References:</span>
                                                    {msg.content.references.map(ref => (
                                                        <span key={ref} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded border border-border cursor-pointer hover:bg-secondary/80">
                                                            {ref}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {msg.content.suggested_actions.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-border/50">
                                                    <p className="text-xs font-semibold text-muted-foreground mb-2">Suggested Actions:</p>
                                                    <div className="space-y-1">
                                                        {msg.content.suggested_actions.map((action, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => setQuery(action)}
                                                                className="block w-full text-left text-xs text-primary hover:underline p-1.5 hover:bg-primary/5 rounded"
                                                            >
                                                                → {action}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                    <Bot size={16} />
                                </div>
                                <div className="flex gap-1 mt-2">
                                    <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-75" />
                                    <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask about alerts, users, or anomalies..."
                        className="flex-1 bg-card px-4 py-3 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Send size={18} />
                        Send
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default ChatbotPage;
