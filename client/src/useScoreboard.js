import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// In production, the server serves the client, so connect to the same origin.
// In development, connect to the local backend on port 3001.
const SOCKET_URL = import.meta.env.PROD ? window.location.origin : 'http://localhost:3001';
const socket = io(SOCKET_URL);

export function useScoreboard(isController = false) {
    const [gameState, setGameState] = useState({
        timeSeconds: 0,
        scoreLocal: 0,
        scoreVisit: 0,
        nameLocal: 'LOCAL',
        nameVisit: 'VISITANTE',
        colorLocal: '#3b82f6',
        colorVisit: '#ef4444',
        period: '1T',
        isRunning: false
    });

    // Initial connection and listen for updates
    useEffect(() => {
        socket.on('stateUpdate', (newState) => {
            if (isController && newState.isDefault) {
                const saved = localStorage.getItem('marcadorState');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        parsed.isDefault = false;
                        socket.emit('updateState', parsed);
                        return; // Ignore default state, we are restoring
                    } catch (e) {
                        console.error('Failed to restore state', e);
                    }
                }
            }

            setGameState(prev => {
                const next = { ...prev, ...newState };
                if (isController && !newState.isDefault) {
                    localStorage.setItem('marcadorState', JSON.stringify(next));
                }
                return next;
            });
        });

        // Ping server every 5 minutes to keep it awake (useful for Render free tier)
        const pingInterval = setInterval(() => {
            fetch(`${SOCKET_URL}/ping`).catch(err => console.error('Ping failed:', err));
        }, 5 * 60 * 1000); // 5 minutes

        return () => {
            socket.off('stateUpdate');
            clearInterval(pingInterval);
        };
    }, []);

    // Push state changes to server
    const updateServer = (partialState) => {
        socket.emit('updateState', partialState);
        // Optimistic local update
        setGameState(prev => {
            const next = { ...prev, ...partialState };
            if (isController) {
                localStorage.setItem('marcadorState', JSON.stringify(next));
            }
            return next;
        });
    };

    return { gameState, updateServer };
}
