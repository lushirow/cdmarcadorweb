import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Connect to the local Socket.IO server we just created
const socket = io('http://localhost:3001');

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

    const timerRef = useRef(null);

    // Initial connection and listen for updates
    useEffect(() => {
        socket.on('stateUpdate', (newState) => {
            setGameState(newState);
        });

        return () => {
            socket.off('stateUpdate');
        };
    }, []);

    // Timer logic ONLY runs on the controller side to avoid multiple sources of truth.
    // If we are just viewing (OBS), we just receive the state.
    useEffect(() => {
        if (isController) {
            if (gameState.isRunning) {
                timerRef.current = setInterval(() => {
                    setGameState(prev => {
                        const nextState = { ...prev, timeSeconds: prev.timeSeconds + 1 };
                        // Broadcast timer tick to OBS every second
                        socket.emit('updateState', { timeSeconds: nextState.timeSeconds });
                        return nextState;
                    });
                }, 1000);
            } else {
                clearInterval(timerRef.current);
            }
        }
        return () => clearInterval(timerRef.current);
    }, [gameState.isRunning, isController]);

    // Push state changes to server
    const updateServer = (partialState) => {
        socket.emit('updateState', partialState);
        // Optimistic local update
        setGameState(prev => ({ ...prev, ...partialState }));
    };

    return { gameState, updateServer };
}
