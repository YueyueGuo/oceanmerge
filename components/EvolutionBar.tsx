import React, { useEffect, useRef } from 'react';
import { CreatureTier } from '../types';
import { CREATURES } from '../constants';
import { drawCreatureVisuals } from '../drawUtils';

const EvolutionBar: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const WIDTH = 360; // Fits within 400px container with padding
  const HEIGHT = 50;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw background
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Calculate positions
    // We have 10 tiers (0-9). 
    const tiers = Object.values(CreatureTier).filter(t => typeof t === 'number') as CreatureTier[];
    const count = tiers.length;
    const spacing = WIDTH / count;

    tiers.forEach((tier, index) => {
      const x = spacing * index + spacing / 2;
      const y = HEIGHT / 2;
      
      // Scale down drawing
      const originalRadius = CREATURES[tier].radius;
      // Fit within spacing (approx 36px wide slot)
      const scale = Math.min(12 / originalRadius, 0.8); 
      
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);
      drawCreatureVisuals(ctx, 0, 0, originalRadius, 0, tier, 'happy', 0);
      ctx.restore();

      // Draw arrow if not last
      if (index < count - 1) {
         ctx.fillStyle = 'rgba(255,255,255,0.3)';
         ctx.beginPath();
         ctx.moveTo(x + spacing/2 - 2, y);
         ctx.lineTo(x + spacing/2 - 5, y - 3);
         ctx.lineTo(x + spacing/2 - 5, y + 3);
         ctx.fill();
      }
    });

  }, []);

  return (
    <div className="w-full max-w-[400px] h-[60px] mx-auto mt-2 bg-slate-800 rounded-xl flex items-center justify-center border-2 border-slate-700">
      <canvas ref={canvasRef} width={360} height={50} />
    </div>
  );
};

export default EvolutionBar;