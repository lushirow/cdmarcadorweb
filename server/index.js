const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// The single source of truth for the scoreboard
let gameState = {
    timeSeconds: 0,
    scoreLocal: 0,
    scoreVisit: 0,
    nameLocal: 'LOCAL',
    nameVisit: 'VISITANTE',
    colorLocal: '#3b82f6',
    colorVisit: '#ef4444',
    period: '1T',
    isRunning: false
};

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current state to newly connected client instantly
    socket.emit('stateUpdate', gameState);

    // Listen for updates from any client (control panel)
    socket.on('updateState', (newState) => {
        // Merge the new state
        gameState = { ...gameState, ...newState };
        // Broadcast the updated state to ALL clients (including OBS)
        io.emit('stateUpdate', gameState);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Socket.IO Server running on http://localhost:${PORT}`);
});
