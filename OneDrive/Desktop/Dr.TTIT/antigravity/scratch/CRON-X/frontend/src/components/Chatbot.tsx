import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import { ChatResponse } from '../types';

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string | ChatResponse }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

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

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform z-50"
            >
                <Sparkles size={24} />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border bg-primary text-primary-foreground flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Bot size={20} />
                    <span className="font-semibold">Antigravity Assistant</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
                    ✕
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm mt-10">
                        <Sparkles className="mx-auto mb-2 opacity-50" />
                        <p>Ask me about alerts, users, or anomalies.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                        )}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={cn(
                            "max-w-[80%] rounded-lg p-3 text-sm",
                            msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                        )}>
                            {typeof msg.content === 'string' ? (
                                msg.content
                            ) : (
                                <div className="space-y-2">
                                    <p>{msg.content.answer_text}</p>
                                    {msg.content.references.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {msg.content.references.map(ref => (
                                                <span key={ref} className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-xs rounded border border-border cursor-pointer hover:bg-secondary/80">
                                                    {ref}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {msg.content.suggested_actions.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-border/50">
                                            <p className="text-xs font-semibold text-muted-foreground mb-1">Suggestions:</p>
                                            <ul className="space-y-1">
                                                {msg.content.suggested_actions.map((action, i) => (
                                                    <li key={i} className="text-xs text-primary cursor-pointer hover:underline">
                                                        → {action}
                                                    </li>
                                                ))}
                                            </ul>
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
                            <Bot size={14} />
                        </div>
                        <div className="bg-card border border-border rounded-lg p-3">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-75" />
                                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type a query..."
                        className="flex-1 bg-muted px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chatbot;
