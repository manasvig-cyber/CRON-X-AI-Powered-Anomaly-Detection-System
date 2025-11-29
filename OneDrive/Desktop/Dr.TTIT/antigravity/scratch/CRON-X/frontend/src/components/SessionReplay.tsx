import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Event } from '../types';

interface SessionReplayProps {
    events: Event[];
}

const SessionReplay: React.FC<SessionReplayProps> = ({ events }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const animationRef = useRef<number>();
    const startTimeRef = useRef<number>(0);

    // Flatten all cursor traces from all events into one timeline
    const trace = React.useMemo(() => {
        const points: { t: number, x: number, y: number }[] = [];
        if (!events) return points;

        // Find earliest timestamp to normalize
        const startTs = events.length > 0 ? Math.min(...events.map(e => e.ts)) : 0;

        events.forEach(event => {
            if (event.cursor_trace) {
                event.cursor_trace.forEach(p => {
                    // Normalize time relative to session start (p.t is usually relative to event start, but let's assume p.t is offset from event.ts)
                    // Actually in mock data p.t is 0..5000ms.
                    // Let's assume we just want to play the traces sequentially or based on event.ts
                    // For simplicity, let's just concatenate them with some spacing if they are from different events
                    points.push({ ...p, t: p.t + (event.ts - startTs) * 1000 });
                });
            }
        });
        return points.sort((a, b) => a.t - b.t);
    }, [events]);

    const duration = trace.length > 0 ? trace[trace.length - 1].t : 1000;

    useEffect(() => {
        if (isPlaying) {
            const start = performance.now() - (progress * duration);

            const animate = (time: number) => {
                const elapsed = time - start;
                const newProgress = Math.min(elapsed / duration, 1);
                setProgress(newProgress);

                if (newProgress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                } else {
                    setIsPlaying(false);
                }
            };

            animationRef.current = requestAnimationFrame(animate);
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, duration]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background grid
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
        for (let i = 0; i < canvas.height; i += 50) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke(); }

        if (trace.length === 0) return;

        // Draw path up to current progress
        const currentTime = progress * duration;

        ctx.beginPath();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;

        let started = false;
        let lastX = 0, lastY = 0;

        for (const p of trace) {
            if (p.t > currentTime) break;

            if (!started) {
                ctx.moveTo(p.x, p.y);
                started = true;
            } else {
                ctx.lineTo(p.x, p.y);
            }
            lastX = p.x;
            lastY = p.y;
        }
        ctx.stroke();

        // Draw cursor
        if (started) {
            ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
            ctx.beginPath();
            ctx.arc(lastX, lastY, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1d4ed8';
            ctx.beginPath();
            ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
            ctx.fill();
        }

    }, [progress, trace, duration]);

    return (
        <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Session Replay</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1.5 hover:bg-muted rounded-md"
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                        onClick={() => { setIsPlaying(false); setProgress(0); }}
                        className="p-1.5 hover:bg-muted rounded-md"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>

            <div className="relative aspect-video bg-white rounded border overflow-hidden">
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={450}
                    className="w-full h-full object-contain"
                />
            </div>

            <div className="mt-2">
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.001"
                    value={progress}
                    onChange={(e) => {
                        setProgress(parseFloat(e.target.value));
                        setIsPlaying(false);
                    }}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>
        </div>
    );
};

export default SessionReplay;
