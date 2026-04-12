import React, { useState, useEffect } from 'react';
import { useScoreboard } from './useScoreboard';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function ControlPanel() {
    const { gameState, updateServer } = useScoreboard(true);
    
    // Format timer
    const minutes = Math.floor(gameState.timeSeconds / 60);
    const seconds = gameState.timeSeconds % 60;
    const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const toggleTimer = () => {
        updateServer({ isRunning: !gameState.isRunning });
    };

    const resetTimer = () => {
        if (window.confirm('¿Estás seguro de reiniciar el tiempo?')) {
            updateServer({ isRunning: false, timeSeconds: 0 });
        }
    };

    const updateScore = (team, delta) => {
        if (team === 'local') {
            updateServer({ scoreLocal: Math.max(0, gameState.scoreLocal + delta) });
            triggerAnimation('score-local');
        } else {
            updateServer({ scoreVisit: Math.max(0, gameState.scoreVisit + delta) });
            triggerAnimation('score-visit');
        }
    };

    // Helper for visual animation
    const triggerAnimation = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('updating');
            void el.offsetWidth;
            el.classList.add('updating');
        }
    };

    return (
        <div className="app-container" style={{ '--accent-local': gameState.colorLocal, '--accent-visit': gameState.colorVisit }}>
            <header className="header-timer glass-panel">
                <div className="time-display">{timeDisplay}</div>
                <div className="timer-controls">
                    <select 
                        className="btn-control period-select"
                        value={gameState.period}
                        onChange={(e) => updateServer({ period: e.target.value })}
                        style={{ width: 'auto', padding: '0 10px', borderRadius: '12px' }}
                    >
                        <option value="1T">1T</option>
                        <option value="2T">2T</option>
                        <option value="ET1">ET1</option>
                        <option value="ET2">ET2</option>
                        <option value="PEN">PEN</option>
                    </select>

                    <button 
                        className={`btn-control play ${gameState.isRunning ? 'active' : ''}`}
                        onClick={toggleTimer}
                    >
                        {gameState.isRunning ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button className="btn-control" onClick={resetTimer}>
                        <RotateCcw size={24} />
                    </button>
                </div>
            </header>

            <main className="scoreboard">
                <section className="team team-local">
                    <div className="team-header">
                        <input 
                            type="color" 
                            className="color-picker"
                            value={gameState.colorLocal}
                            onChange={(e) => updateServer({ colorLocal: e.target.value })}
                        />
                        <input 
                            className="team-name-input" 
                            value={gameState.nameLocal}
                            onChange={(e) => updateServer({ nameLocal: e.target.value })}
                            spellCheck="false"
                        />
                    </div>
                    <div className="score-container glass-panel">
                        <button className="btn-score btn-minus" onClick={() => updateScore('local', -1)}>-</button>
                        <div className="score-number" id="score-local">{gameState.scoreLocal}</div>
                        <button className="btn-score btn-plus" onClick={() => updateScore('local', 1)}>+</button>
                    </div>
                </section>

                <div className="vs-divider">VS</div>

                <section className="team team-visit">
                    <div className="team-header">
                        <input 
                            className="team-name-input" 
                            value={gameState.nameVisit}
                            onChange={(e) => updateServer({ nameVisit: e.target.value })}
                            spellCheck="false"
                        />
                        <input 
                            type="color" 
                            className="color-picker"
                            value={gameState.colorVisit}
                            onChange={(e) => updateServer({ colorVisit: e.target.value })}
                        />
                    </div>
                    <div className="score-container glass-panel">
                        <button className="btn-score btn-minus" onClick={() => updateScore('visit', -1)}>-</button>
                        <div className="score-number" id="score-visit">{gameState.scoreVisit}</div>
                        <button className="btn-score btn-plus" onClick={() => updateScore('visit', 1)}>+</button>
                    </div>
                </section>
            </main>
        </div>
    );
}
