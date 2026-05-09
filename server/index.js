const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

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

const stateFilePath = path.join(__dirname, 'gameState.json');

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

// Try to load saved state
try {
    if (fs.existsSync(stateFilePath)) {
        const savedState = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
        gameState = { ...gameState, ...savedState };
        // Pause timer on server restart to avoid unexpected behavior
        gameState.isRunning = false;
    }
} catch (error) {
    console.error('Could not load saved state:', error);
}

function saveState() {
    try {
        const tempPath = stateFilePath + '.tmp';
        fs.writeFileSync(tempPath, JSON.stringify(gameState));
        fs.renameSync(tempPath, stateFilePath);
    } catch (error) {
        console.error('Could not save state:', error);
    }
}

let timerInterval = null;

function handleTimer() {
    if (gameState.isRunning && !timerInterval) {
        // Start the server-side timer
        timerInterval = setInterval(() => {
            gameState.timeSeconds++;
            io.emit('stateUpdate', { timeSeconds: gameState.timeSeconds });
            saveState();
        }, 1000);
    } else if (!gameState.isRunning && timerInterval) {
        // Stop the server-side timer
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current state to newly connected client instantly
    socket.emit('stateUpdate', gameState);

    // Listen for updates from any client (control panel)
    socket.on('updateState', (newState) => {
        // Merge the new state
        gameState = { ...gameState, ...newState };
        saveState();
        // Broadcast the updated state to ALL clients (including OBS)
        io.emit('stateUpdate', gameState);
        
        // Handle timer start/stop if isRunning was changed
        handleTimer();
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Ping route to keep Render free tier awake
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// SPA fallback: any route not handled returns index.html for client-side routing
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
