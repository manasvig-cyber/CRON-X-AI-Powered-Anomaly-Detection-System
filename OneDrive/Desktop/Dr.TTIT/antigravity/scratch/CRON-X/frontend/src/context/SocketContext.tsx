import React, { createContext, useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000'; // Or ws://localhost:8000/ws/alerts if using native WS, but socket.io client usually connects to http and upgrades

// Since backend uses native websockets at /ws/alerts, we might need native WebSocket or a specific config.
// The plan said "Socket.IO or native WebSocket". The backend implementation used `app.websocket("/ws/alerts")` which is native.
// So we should use native WebSocket API, not socket.io-client, OR change backend to use python-socketio.
// Given the backend implementation: `app.websocket("/ws/alerts")`, it's native.
// Let's switch to native WebSocket to match backend.

interface SocketContextType {
    socket: WebSocket | null;
    lastMessage: any;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    lastMessage: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<any>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8000/ws/alerts');

        ws.onopen = () => {
            console.log('Connected to WebSocket');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLastMessage(data);
            } catch (e) {
                console.error('Failed to parse WS message', e);
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket');
            setIsConnected(false);
            // Reconnect logic could go here
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, lastMessage, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
