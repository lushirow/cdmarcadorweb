const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve the compiled React client
app.use(express.static(path.join(__dirname, 'public')));

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

// SPA fallback: any route not handled returns index.html for client-side routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
