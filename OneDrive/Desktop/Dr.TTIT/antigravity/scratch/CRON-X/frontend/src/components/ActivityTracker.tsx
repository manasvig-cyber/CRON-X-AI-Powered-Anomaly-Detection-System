import React, { useEffect, useRef } from 'react';
import axios from 'axios';

// Configuration
const TRACKING_INTERVAL = 2000; // Send logs every 2 seconds
const API_URL = 'http://localhost:8000/api/log-activity';

export const ActivityTracker: React.FC = () => {
    const cursorPositions = useRef<{ x: number, y: number, t: number }[]>([]);
    const keystrokes = useRef<{ t: number }[]>([]);
    const lastSentTime = useRef<number>(Date.now());
    const userId = useRef<string>(`user_${Math.floor(Math.random() * 10000)}`);
    const sessionId = useRef<string>(`sess_${Date.now()}`);

    useEffect(() => {
        // Track mouse movements
        const handleMouseMove = (e: MouseEvent) => {
            cursorPositions.current.push({
                x: e.clientX,
                y: e.clientY,
                t: Date.now()
            });
        };

        // Track keystrokes
        const handleKeyDown = () => {
            keystrokes.current.push({ t: Date.now() });
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('keydown', handleKeyDown);

        // Periodic log sending
        const intervalId = setInterval(async () => {
            const now = Date.now();

            // Calculate metrics
            const positions = cursorPositions.current;
            const keys = keystrokes.current;

            // Calculate cursor speed (pixels per second)
            let cursorSpeed = 0;
            if (positions.length > 1) {
                let totalDist = 0;
                for (let i = 1; i < positions.length; i++) {
                    const dx = positions[i].x - positions[i - 1].x;
                    const dy = positions[i].y - positions[i - 1].y;
                    totalDist += Math.sqrt(dx * dx + dy * dy);
                }
                const duration = (positions[positions.length - 1].t - positions[0].t) / 1000;
                if (duration > 0) cursorSpeed = totalDist / duration;
            }

            // Calculate keystroke speed (chars per minute)
            let keystrokeSpeed = 0;
            if (keys.length > 1) {
                const duration = (keys[keys.length - 1].t - keys[0].t) / 1000 / 60; // minutes
                if (duration > 0) keystrokeSpeed = keys.length / duration;
            }

            // Prepare log data
            const logData = {
                timestamp: now / 1000,
                user_id: userId.current,
                session_id: sessionId.current,
                ip: "127.0.0.1", // In real app, server gets this
                event_type: "activity_heartbeat",
                cursor_speed: Math.round(cursorSpeed),
                keystroke_speed: Math.round(keystrokeSpeed),
                session_duration: Math.round((now - lastSentTime.current) / 1000),
                api_calls_count: 1, // Self
                failed_logins: 0
            };

            // Send to backend if there was activity
            if (positions.length > 0 || keys.length > 0) {
                try {
                    await axios.post(API_URL, logData);
                    console.log("📡 Sent activity log:", logData);
                } catch (error) {
                    console.error("Failed to send activity log", error);
                }
            }

            // Reset buffers
            cursorPositions.current = [];
            keystrokes.current = [];
            lastSentTime.current = now;

        }, TRACKING_INTERVAL);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(intervalId);
        };
    }, []);

    return null; // Invisible component
};
