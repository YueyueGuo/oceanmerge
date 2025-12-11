import React, { useEffect, useRef } from 'react';
import { CreatureTier } from '../types';
import { CREATURES } from '../constants';
import { RotateCcw } from 'lucide-react';
import { drawCreatureVisuals } from '../drawUtils';

interface UIOverlayProps {
  score: number;
  nextTier: CreatureTier;
  isGameOver: boolean;
  onRestart: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ score, nextTier, isGameOver, onRestart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    const def = CREATURES[nextTier];
    
    // Max radius of spawnable creature (Crab) is 56. Diameter 112.
    // Canvas is 70x70.
    // We want the visual to fit nicely.
    // Scale factor based on a target max diameter of roughly 50px to leave padding.
    const targetDiameter = 50;
    const scale = targetDiameter / (def.radius * 2);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(scale, scale);
    
    // Draw creature (static frame, timestamp 0)
    drawCreatureVisuals(ctx, 0, 0, def.radius, 0, nextTier, 'happy', 0);
    
    ctx.restore();

  }, [nextTier]);

  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl shadow-lg border-2 border-blue-100">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Score</p>
          <p className="text-2xl font-black text-blue-600 font-mono">{score}</p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg border-2 border-blue-100 flex flex-col items-center w-20">
          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Next</p>
          <div className="rounded-lg bg-blue-50/50 border border-blue-100 flex items-center justify-center w-14 h-14">
             <canvas ref={canvasRef} width={70} height={70} className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-6">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm w-full animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-blue-500 mb-2">Ocean Full!</h2>
            <p className="text-gray-500 mb-6">The creatures piled up too high.</p>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-8">
              <p className="text-sm text-blue-400 font-bold uppercase">Final Score</p>
              <p className="text-4xl font-black text-blue-600">{score}</p>
            </div>

            <button 
              onClick={onRestart}
              className="w-full py-4 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 pointer-events-auto"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UIOverlay;