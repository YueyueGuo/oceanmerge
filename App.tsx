import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import EvolutionBar from './components/EvolutionBar';
import { CreatureTier } from './types';

const App: React.FC = () => {
  const [score, setScore] = useState(0);
  const [nextTier, setNextTier] = useState<CreatureTier>(CreatureTier.Clam);
  const [isGameOver, setIsGameOver] = useState(false);
  // Key to force remount of GameCanvas on restart
  const [gameId, setGameId] = useState(0);

  const handleRestart = () => {
    setScore(0);
    setIsGameOver(false);
    setGameId(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-[420px]">
        
        {/* Header / Title outside game area */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 drop-shadow-sm" style={{fontFamily: 'Fredoka, sans-serif'}}>
            Ocean Merge
          </h1>
          <p className="text-slate-400 text-sm">Drop & Merge the sea creatures!</p>
        </div>

        {/* Game Container */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-8 ring-slate-800 bg-blue-50">
          <GameCanvas 
            key={gameId}
            onScoreUpdate={setScore}
            onNextCreatureUpdate={setNextTier}
            onGameOver={setIsGameOver}
          />
          
          <UIOverlay 
            score={score}
            nextTier={nextTier}
            isGameOver={isGameOver}
            onRestart={handleRestart}
          />
        </div>

        {/* Progression Footer */}
        <EvolutionBar />
        
        <div className="mt-4 text-center text-slate-500 text-xs">
           Merge two Turtles to set the Seal free!
        </div>
      </div>
    </div>
  );
};

export default App;