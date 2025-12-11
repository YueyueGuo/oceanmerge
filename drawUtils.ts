import { CreatureTier } from './types';
import { CREATURES } from './constants';

export const drawKawaiiFace = (ctx: CanvasRenderingContext2D, r: number, mood: 'happy' | 'surprised' = 'happy', yOffset: number = 0) => {
  const eyeX = r * 0.28;
  const eyeY = (mood === 'surprised' ? -r * 0.1 : -r * 0.05) + yOffset;
  const eyeSize = r * 0.12;

  // Eyes
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.ellipse(-eyeX, eyeY, eyeSize, eyeSize * 1.15, 0, 0, Math.PI * 2);
  ctx.ellipse(eyeX, eyeY, eyeSize, eyeSize * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eye Shine
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(-eyeX + eyeSize * 0.3, eyeY - eyeSize * 0.3, eyeSize * 0.35, 0, Math.PI * 2);
  ctx.arc(eyeX + eyeSize * 0.3, eyeY - eyeSize * 0.3, eyeSize * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Cheeks
  if (mood === 'happy') {
    ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
    ctx.beginPath();
    ctx.arc(-eyeX * 1.4, eyeY + r * 0.25, r * 0.15, 0, Math.PI * 2);
    ctx.arc(eyeX * 1.4, eyeY + r * 0.25, r * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth
  ctx.lineWidth = Math.max(2, r * 0.05);
  ctx.strokeStyle = '#333';
  ctx.lineCap = 'round';
  ctx.beginPath();
  
  if (mood === 'surprised') {
    ctx.ellipse(0, eyeY + r * 0.3, r * 0.1, r * 0.1, 0, 0, Math.PI * 2);
  } else {
    // Tiny Smile
    ctx.arc(0, eyeY + r * 0.1, r * 0.15, 0.2 * Math.PI, 0.8 * Math.PI);
  }
  ctx.stroke();
};

export const drawCreatureVisuals = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, angle: number, tier: CreatureTier, mood: 'happy' | 'surprised' = 'happy', timestamp: number = 0) => {
  const def = CREATURES[tier];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Common fill
  ctx.fillStyle = def.color;

  switch (tier) {
    case CreatureTier.Clam: // 0 - Clam (Fan shape with growth rings)
      ctx.beginPath();
      // Shell shape
      ctx.arc(0, 0, radius, Math.PI * 0.1, Math.PI * 0.9, true); 
      ctx.lineTo(0, radius * 0.6); 
      ctx.closePath();
      ctx.fill();
      
      // Growth rings (concentric arcs width-wise)
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 1.5;
      
      // Draw 3 concentric bands
      for(let i = 1; i <= 3; i++) {
        ctx.beginPath();
        // Adjust radii to look like bands across the width
        ctx.arc(0, 0, radius * (0.4 + i * 0.2), Math.PI * 0.15, Math.PI * 0.85, true);
        ctx.stroke();
      }
      
      // Center hinge line
      ctx.beginPath();
      ctx.moveTo(0, radius * 0.6);
      ctx.lineTo(0, -radius * 0.2);
      ctx.stroke();
      break;

    case CreatureTier.SeaUrchin: // 1 - Urchin (Much more spiny, brown)
      ctx.beginPath();
      const spikes = 24; // More spikes
      for (let i = 0; i < spikes * 2; i++) {
          const a = (i / (spikes * 2)) * Math.PI * 2;
          // Deeper spikes
          const r = (i % 2 === 0) ? radius : radius * 0.6;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      
      // Texture: Darker center
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;

    case CreatureTier.Shrimp: // 2 - Shrimp (Inward legs, C-shape, smaller face)
      const sColor = def.color; // Coral Pink
      const sStripe = "#FFFFFF"; // White

      // 1. Legs (Inner Curve - Concave side)
      ctx.strokeStyle = "#C62828";
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      const legCount = 5;
      for(let i=0; i<legCount; i++) {
        const t = i / (legCount - 1);
        const angleOffset = Math.PI * 0.2 + (t * Math.PI * 0.8);
        const lx = Math.cos(angleOffset) * radius * 0.35;
        const ly = Math.sin(angleOffset) * radius * 0.35;
        
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx * 0.6, ly * 0.6 + 5); 
        ctx.stroke();
      }

      // 2. Body Segments (C-Shape)
      // Head (Top Left)
      ctx.fillStyle = sColor;
      ctx.beginPath();
      ctx.ellipse(-radius * 0.1, -radius * 0.35, radius * 0.45, radius * 0.4, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // White Face Mask (Smaller area)
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(-radius * 0.2, -radius * 0.35, radius * 0.32, radius * 0.35, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Segments
      ctx.fillStyle = sColor;
      ctx.beginPath(); ctx.ellipse(radius * 0.35, -radius * 0.15, radius * 0.32, radius * 0.35, 0.5, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = sStripe;
      ctx.beginPath(); ctx.ellipse(radius * 0.45, radius * 0.25, radius * 0.28, radius * 0.3, 1.0, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = sColor;
      ctx.beginPath(); ctx.ellipse(radius * 0.2, radius * 0.55, radius * 0.25, radius * 0.25, 1.5, 0, Math.PI * 2); ctx.fill();
      
      ctx.fillStyle = sStripe;
      ctx.beginPath(); ctx.ellipse(-radius * 0.05, radius * 0.6, radius * 0.18, radius * 0.2, 2.0, 0, Math.PI * 2); ctx.fill();

      // Tail Fan
      ctx.fillStyle = sColor;
      ctx.save();
      ctx.translate(-radius * 0.25, radius * 0.6);
      ctx.rotate(2.5);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 0.2, radius * 0.1, 0, 0, Math.PI * 2);
      ctx.ellipse(0, 5, radius * 0.2, radius * 0.1, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 3. Antennae
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-radius * 0.2, -radius * 0.6); ctx.bezierCurveTo(-radius * 0.2, -radius * 1.2, 0, -radius * 1.4, radius * 0.1, -radius * 1.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-radius * 0.1, -radius * 0.6); ctx.bezierCurveTo(0, -radius * 1.1, radius * 0.3, -radius * 1.3, radius * 0.5, -radius * 1.2); ctx.stroke();

      // Manual Face Call
      ctx.save();
      ctx.translate(-radius * 0.25, -radius * 0.35);
      drawKawaiiFace(ctx, radius * 0.4, mood, 0);
      ctx.restore();
      break;

    case CreatureTier.Starfish: // 3 - Starfish
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
          const r = (i % 2 === 0) ? radius * 1.1 : radius * 0.55; 
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      
      // Pores
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      for(let i=0; i<5; i++) {
         const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
         ctx.beginPath(); ctx.arc(Math.cos(a)*radius*0.6, Math.sin(a)*radius*0.6, 3, 0, Math.PI*2); ctx.fill();
         ctx.beginPath(); ctx.arc(Math.cos(a)*radius*0.35, Math.sin(a)*radius*0.35, 2.5, 0, Math.PI*2); ctx.fill();
      }
      break;
    
    case CreatureTier.Crab: // 4 - Crab
      // 1. Antennae
      ctx.strokeStyle = "#C62828";
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-radius * 0.4, -radius * 0.4); ctx.lineTo(-radius * 0.6, -radius * 0.85); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(radius * 0.4, -radius * 0.4); ctx.lineTo(radius * 0.6, -radius * 0.85); ctx.stroke();

      // 2. Claws
      const clawColor = "#FF6B6B";
      const drawClaw = (side: 'left' | 'right') => {
        ctx.save();
        const dir = side === 'left' ? -1 : 1;
        ctx.translate(dir * radius * 0.85, -radius * 0.15);
        ctx.rotate(dir * -Math.PI / 6);
        ctx.fillStyle = clawColor;
        ctx.beginPath(); ctx.ellipse(0, 0, radius * 0.35, radius * 0.45, dir * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(dir * radius * 0.15, radius * 0.2, radius * 0.15, radius * 0.25, dir * -0.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      };
      drawClaw('left');
      drawClaw('right');

      // 3. Legs
      ctx.strokeStyle = "#C62828";
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      for(let i = 0; i < 3; i++) {
         const offset = (i * radius * 0.12) + radius * 0.2;
         ctx.beginPath(); ctx.moveTo(-offset, radius * 0.65); ctx.quadraticCurveTo(-offset - 5, radius * 0.8, -offset - 2, radius * 0.85); ctx.stroke();
         ctx.beginPath(); ctx.moveTo(offset, radius * 0.65); ctx.quadraticCurveTo(offset + 5, radius * 0.8, offset + 2, radius * 0.85); ctx.stroke();
      }

      // 4. Main Body
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, radius, radius * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Body Shine
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.ellipse(-radius * 0.4, -radius * 0.3, radius * 0.2, radius * 0.1, -0.4, 0, Math.PI * 2);
      ctx.fill();
      break;

    case CreatureTier.Jellyfish: // 5 - Jellyfish
      // Tentacles
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = -2; i <= 2; i++) {
         ctx.beginPath();
         const wave = Math.sin(timestamp * 0.005 + i) * (radius * 0.1);
         const startX = i * radius * 0.25;
         ctx.moveTo(startX, radius * 0.4);
         ctx.quadraticCurveTo(startX + wave, radius * 0.8, startX - wave, radius * 1.1);
         ctx.stroke();
      }

      // Dome
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(0, -radius * 0.15, radius, Math.PI, 0); 
      ctx.lineTo(radius, radius * 0.4);
      ctx.quadraticCurveTo(0, radius * 0.6, -radius, radius * 0.4);
      ctx.closePath();
      ctx.fill();

      // Spots
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath(); ctx.arc(-radius*0.5, -radius*0.4, radius*0.15, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(radius*0.4, -radius*0.5, radius*0.1, 0, Math.PI*2); ctx.fill();
      break;

    case CreatureTier.Pufferfish: // 6 - Puffer
      // Side Fins
      ctx.fillStyle = "#7BAACF";
      ctx.beginPath(); ctx.ellipse(-radius*0.9, 0, radius*0.2, radius*0.15, -0.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(radius*0.9, 0, radius*0.2, radius*0.15, 0.5, 0, Math.PI*2); ctx.fill();

      // Body
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Dots (New: Spots on the back)
      ctx.fillStyle = "#5E90AF"; 
      const dotPos = [
          {x: -0.5, y: -0.5, s: 0.15}, {x: 0.5, y: -0.5, s: 0.15},
          {x: 0, y: -0.7, s: 0.18},
          {x: -0.7, y: -0.2, s: 0.12}, {x: 0.7, y: -0.2, s: 0.12},
          {x: -0.3, y: -0.3, s: 0.1}, {x: 0.3, y: -0.3, s: 0.1},
          {x: -0.6, y: -0.55, s: 0.13}, {x: 0.6, y: -0.55, s: 0.13}
      ];
      dotPos.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x * radius, p.y * radius, p.s * radius, 0, Math.PI*2);
          ctx.fill();
      });

      // Belly
      ctx.fillStyle = "#E0F0FF";
      ctx.beginPath();
      ctx.arc(0, radius * 0.4, radius * 0.6, 0.2, Math.PI - 0.2);
      ctx.fill();

      // Spikes
      ctx.fillStyle = "#7BAACF";
      const pSpikes = 8;
      for(let i=0; i<pSpikes; i++) {
          const angle = (i/pSpikes) * Math.PI * 2;
          const sx = Math.cos(angle) * radius * 0.75;
          const sy = Math.sin(angle) * radius * 0.75;
          ctx.beginPath();
          ctx.moveTo(sx, sy - 6);
          ctx.lineTo(sx + 6, sy);
          ctx.lineTo(sx, sy + 6);
          ctx.lineTo(sx - 6, sy);
          ctx.fill();
      }

      // Manual Face (New: Open mouth)
      // Eyes (Standard)
      const pfEyeX = radius * 0.3;
      const pfEyeY = -radius * 0.05;
      const pfEyeSize = radius * 0.12;

      ctx.fillStyle = '#333';
      ctx.beginPath(); ctx.ellipse(-pfEyeX, pfEyeY, pfEyeSize, pfEyeSize*1.15, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(pfEyeX, pfEyeY, pfEyeSize, pfEyeSize*1.15, 0, 0, Math.PI*2); ctx.fill();
      
      // Eye Shine
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(-pfEyeX + pfEyeSize*0.3, pfEyeY - pfEyeSize*0.3, pfEyeSize*0.35, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(pfEyeX + pfEyeSize*0.3, pfEyeY - pfEyeSize*0.3, pfEyeSize*0.35, 0, Math.PI*2); ctx.fill();

      // Cheeks
      if(mood === 'happy') {
        ctx.fillStyle = 'rgba(255, 150, 150, 0.5)';
        ctx.beginPath(); ctx.arc(-pfEyeX * 1.4, pfEyeY + radius * 0.25, radius * 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(pfEyeX * 1.4, pfEyeY + radius * 0.25, radius * 0.15, 0, Math.PI * 2); ctx.fill();
      }

      // Puffer Mouth (Open 'O')
      ctx.fillStyle = '#333'; // Inside mouth
      ctx.beginPath();
      const pfMouthY = radius * 0.2;
      const pfMouthSize = mood === 'surprised' ? radius * 0.16 : radius * 0.12;
      ctx.arc(0, pfMouthY, pfMouthSize, 0, Math.PI*2);
      ctx.fill();

      // Tongue/Inner detail
      ctx.fillStyle = '#FF8DA1';
      ctx.beginPath();
      ctx.arc(0, pfMouthY + pfMouthSize * 0.5, pfMouthSize * 0.6, 0, Math.PI*2);
      ctx.fill();
      break;

    case CreatureTier.Octopus: // 7 - Octopus (Updated: Separated legs)
      // Tentacles
      ctx.fillStyle = def.color;
      const tentacleCount = 5;
      
      for(let i=0; i<tentacleCount; i++) {
           const offset = i - 2; // -2, -1, 0, 1, 2
           // Wider spread: ~0.55 rad per step for clear separation
           const angleStep = 0.55; 
           const angleBase = Math.PI * 0.5 + (offset * angleStep); 
           
           ctx.save();
           // Position on body rim
           const startR = radius * 0.65;
           ctx.translate(Math.cos(angleBase) * startR, Math.sin(angleBase) * startR);
           
           // Rotate so +Y points outward from center
           ctx.rotate(angleBase - Math.PI * 0.5);

           // Curl Logic
           const curlSide = offset === 0 ? 1 : Math.sign(offset);
           const curlIntensity = offset === 0 ? 0.5 : 1.0;

           // Draw Tentacle
           ctx.beginPath();
           const baseW = radius * 0.12;
           ctx.moveTo(-baseW, 0); 
           
           const tipX = radius * 0.45 * curlSide * curlIntensity;
           const tipY = radius * 0.35; 
           
           // Curve to tip
           ctx.bezierCurveTo(
               -baseW, radius * 0.2,           
               tipX - (radius * 0.1 * curlSide), tipY + (radius * 0.1),
               tipX, tipY                       
           );

           // Curve back
           ctx.bezierCurveTo(
               tipX + (radius * 0.1 * curlSide), tipY - (radius * 0.05),
               baseW, radius * 0.2,             
               baseW, 0                         
           );
           
           ctx.fill();
           
           // Suckers
           ctx.fillStyle = "rgba(255,230,240,0.6)"; 
           ctx.beginPath(); ctx.arc(tipX * 0.8, tipY * 0.8, radius * 0.04, 0, Math.PI*2); ctx.fill();
           ctx.beginPath(); ctx.arc(tipX * 0.4, tipY * 0.5, radius * 0.05, 0, Math.PI*2); ctx.fill();

           ctx.restore();
           ctx.fillStyle = def.color;
      }
      
      // Head (Large Bulbous)
      ctx.beginPath();
      ctx.ellipse(0, -radius * 0.1, radius * 0.95, radius * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head Shine
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.ellipse(-radius * 0.4, -radius * 0.4, radius * 0.25, radius * 0.15, -0.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case CreatureTier.Turtle: // 8 - Turtle (New Design with Head & Tail)
      const skinColor = "#6AA314";
      
      // Tail (Small triangle at bottom)
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.moveTo(0, radius * 0.95);
      ctx.lineTo(-radius * 0.15, radius * 1.15);
      ctx.lineTo(radius * 0.15, radius * 1.15);
      ctx.fill();

      // Flippers
      ctx.fillStyle = skinColor;
      // Front Left
      ctx.beginPath(); ctx.ellipse(-radius*0.9, -radius*0.3, radius*0.35, radius*0.15, -0.5, 0, Math.PI*2); ctx.fill();
      // Front Right
      ctx.beginPath(); ctx.ellipse(radius*0.9, -radius*0.3, radius*0.35, radius*0.15, 0.5, 0, Math.PI*2); ctx.fill();
      // Back Left
      ctx.beginPath(); ctx.ellipse(-radius*0.7, radius*0.6, radius*0.25, radius*0.12, 0.5, 0, Math.PI*2); ctx.fill();
      // Back Right
      ctx.beginPath(); ctx.ellipse(radius*0.7, radius*0.6, radius*0.25, radius*0.12, -0.5, 0, Math.PI*2); ctx.fill();

      // Head (Circle at top)
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(0, -radius * 0.9, radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Shell (Main Body)
      ctx.fillStyle = def.color; 
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.92, 0, Math.PI * 2);
      ctx.fill();
      
      // Shell Pattern
      ctx.strokeStyle = "rgba(0,50,0,0.15)";
      ctx.lineWidth = 3;
      // Central Hexagon
      ctx.beginPath();
      const hexR = radius * 0.35;
      for(let i=0; i<6; i++) {
          const a = i * Math.PI / 3;
          const hx = Math.cos(a) * hexR;
          const hy = Math.sin(a) * hexR;
          if(i===0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
      
      // Lines to edge
      for(let i=0; i<6; i++) {
          const a = i * Math.PI / 3;
          const hx = Math.cos(a) * hexR;
          const hy = Math.sin(a) * hexR;
          const ex = Math.cos(a) * radius * 0.92;
          const ey = Math.sin(a) * radius * 0.92;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(ex, ey); ctx.stroke();
      }

      // Manual Face Call for Turtle
      ctx.save();
      ctx.translate(0, -radius * 0.9);
      drawKawaiiFace(ctx, radius * 0.35, mood, 0);
      ctx.restore();
      break;

    case CreatureTier.BabySeal: // 9 - Seal
      // Flippers
      ctx.fillStyle = "#E0E0E0";
      ctx.beginPath(); ctx.ellipse(-radius*0.8, radius*0.4, radius*0.3, radius*0.15, 0.5, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(radius*0.8, radius*0.4, radius*0.3, radius*0.15, -0.5, 0, Math.PI*2); ctx.fill();

      // Body
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // Muzzle
      ctx.fillStyle = "#F5F5F5";
      ctx.beginPath();
      ctx.ellipse(0, radius*0.1, radius*0.35, radius*0.25, 0, 0, Math.PI*2);
      ctx.fill();

      // Whiskers
      ctx.strokeStyle = "#AAA";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-radius*0.1, radius*0.1); ctx.lineTo(-radius*0.5, radius*0.05); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-radius*0.1, radius*0.15); ctx.lineTo(-radius*0.5, radius*0.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(radius*0.1, radius*0.1); ctx.lineTo(radius*0.5, radius*0.05); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(radius*0.1, radius*0.15); ctx.lineTo(radius*0.5, radius*0.2); ctx.stroke();
      break;

    default: 
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  // Universal Bubble Highlight (only if not already drawn by specific creature)
  // Shrimp and Turtle manage their own highlights
  if (tier !== CreatureTier.Crab && tier !== CreatureTier.Shrimp && tier !== CreatureTier.Turtle && tier !== CreatureTier.Octopus) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.35, -radius * 0.35, radius * 0.15, radius * 0.08, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
  }

  let faceYOffset = 0;
  // Crab face is centered on the body (which is 0,0), so 0 offset is fine.
  if (tier === CreatureTier.Jellyfish) faceYOffset = -radius * 0.1;

  // Shrimp, Turtle, and Pufferfish call this manually inside their cases to position on specific body parts or customize mouth
  // Octopus is mostly head so center is fine, maybe slightly down
  if (tier !== CreatureTier.Shrimp && tier !== CreatureTier.Turtle && tier !== CreatureTier.Pufferfish) {
    drawKawaiiFace(ctx, radius, mood, faceYOffset);
  }

  ctx.restore();
};