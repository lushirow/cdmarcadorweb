import React, { useEffect } from 'react';
import { useScoreboard } from './useScoreboard';

export default function OBSViewer() {
    // OBS viewer is NOT the controller
    const { gameState } = useScoreboard(false);

    // Format timer
    const minutes = Math.floor(gameState.timeSeconds / 60);
    const seconds = gameState.timeSeconds % 60;
    const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const triggerAnimation = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.remove('updating');
            void el.offsetWidth;
            el.classList.add('updating');
        }
    };

    // Animate when scores change
    useEffect(() => {
        triggerAnimation('obs-score-local');
    }, [gameState.scoreLocal]);

    useEffect(() => {
        triggerAnimation('obs-score-visit');
    }, [gameState.scoreVisit]);

    return (
        <div className="obs-body" style={{ '--accent-local': gameState.colorLocal, '--accent-visit': gameState.colorVisit }}>
            <div className="overlay-container glass-panel">
                <div className="obs-team obs-team-local">
                    <span className="obs-team-name">{gameState.nameLocal}</span>
                </div>
                
                <div className="obs-score-container">
                    <span className="obs-score" id="obs-score-local">{gameState.scoreLocal}</span>
                    <span className="obs-divider">-</span>
                    <span className="obs-score" id="obs-score-visit">{gameState.scoreVisit}</span>
                </div>

                <div className="obs-team obs-team-visit">
                    <span className="obs-team-name">{gameState.nameVisit}</span>
                </div>

                <div className="obs-time-container">
                    <span className="obs-period" style={{ marginRight: '10px', fontSize: '1rem', color: '#94a3b8' }}>{gameState.period}</span>
                    <span className="obs-time">{timeDisplay}</span>
                </div>
            </div>
        </div>
    );
}
