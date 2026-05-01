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
            setGameState(prev => ({ ...prev, ...newState }));
        });

        return () => {
            socket.off('stateUpdate');
        };
    }, []);

    // Push state changes to server
    const updateServer = (partialState) => {
        socket.emit('updateState', partialState);
        // Optimistic local update
        setGameState(prev => ({ ...prev, ...partialState }));
    };

    return { gameState, updateServer };
}
