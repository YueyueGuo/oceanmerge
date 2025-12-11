import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { CreatureTier, Particle } from '../types';
import { CREATURES, GAME_WIDTH, GAME_HEIGHT, WALL_THICKNESS, CEILING_Y, MAX_SPAWN_TIER } from '../constants';
import { drawCreatureVisuals } from '../drawUtils';

// Matter.js aliases
const Engine = Matter.Engine,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite,
  Events = Matter.Events;

interface GameCanvasProps {
  onScoreUpdate: (score: number) => void;
  onNextCreatureUpdate: (tier: CreatureTier) => void;
  onGameOver: (isOver: boolean) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onScoreUpdate, onNextCreatureUpdate, onGameOver }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  
  // Game state refs
  // activeCreature: The one currently hanging at the top, ready to drop
  const activeCreatureRef = useRef<CreatureTier>(CreatureTier.Clam);
  // upcomingCreature: The one shown in the "Next" box
  const upcomingCreatureRef = useRef<CreatureTier>(CreatureTier.Clam);
  
  const isGameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const sealAnimationRef = useRef<{active: boolean, y: number, opacity: number} | null>(null);
  const timeRef = useRef(0); // For animations
  
  // Cooldown to prevent spamming drops
  const canDropRef = useRef(true);
  
  // Touch/Mouse handling
  const [dragX, setDragX] = useState<number>(GAME_WIDTH / 2);

  const getRandomTier = () => Math.floor(Math.random() * (MAX_SPAWN_TIER + 1));

  const initGame = () => {
    activeCreatureRef.current = getRandomTier();
    upcomingCreatureRef.current = getRandomTier();
    onNextCreatureUpdate(upcomingCreatureRef.current);
  };

  const cycleCreatures = () => {
    activeCreatureRef.current = upcomingCreatureRef.current;
    upcomingCreatureRef.current = getRandomTier();
    onNextCreatureUpdate(upcomingCreatureRef.current);
  };

  const createCreatureBody = (x: number, y: number, tier: CreatureTier, isStatic = false) => {
    const def = CREATURES[tier];
    const body = Bodies.circle(x, y, def.radius, {
      restitution: 0.3,
      friction: 0.1,
      density: 0.001 * (tier + 1),
      label: `creature-${tier}`,
      isStatic: isStatic,
      render: { visible: false },
      collisionFilter: {
        category: 0x0002,
        mask: 0x0001 | 0x0002
      }
    });
    (body as any).gameTier = tier;
    return body;
  };

  // --- PARTICLE SYSTEM ---
  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 10; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1.0,
        color,
        size: Math.random() * 6 + 3
      });
    }
  };

  const updateParticles = () => {
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      p.size *= 0.95;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
  };

  useEffect(() => {
    if (!sceneRef.current || !canvasRef.current) return;

    // --- SETUP ENGINE ---
    const engine = Engine.create({
      gravity: { x: 0, y: 1.2, scale: 0.001 }
    });
    const world = engine.world;
    engineRef.current = engine;
    
    // --- BOUNDARIES ---
    const ground = Bodies.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + WALL_THICKNESS / 2, GAME_WIDTH, WALL_THICKNESS, { 
      isStatic: true,
      render: { visible: false }
    });
    const leftWall = Bodies.rectangle(-WALL_THICKNESS / 2, GAME_HEIGHT / 2, WALL_THICKNESS, GAME_HEIGHT * 2, { 
      isStatic: true,
      render: { visible: false }
    });
    const rightWall = Bodies.rectangle(GAME_WIDTH + WALL_THICKNESS / 2, GAME_HEIGHT / 2, WALL_THICKNESS, GAME_HEIGHT * 2, { 
      isStatic: true,
      render: { visible: false }
    });

    Composite.add(world, [ground, leftWall, rightWall]);

    // --- COLLISION EVENTS ---
    Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      const pairsToProcess: {bodyA: Matter.Body, bodyB: Matter.Body}[] = [];

      pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const tierA = (bodyA as any).gameTier;
        const tierB = (bodyB as any).gameTier;

        if (tierA !== undefined && tierB !== undefined && tierA === tierB) {
          pairsToProcess.push({ bodyA, bodyB });
        }
      });

      pairsToProcess.forEach(({ bodyA, bodyB }) => {
        if (!Composite.get(world, bodyA.id, 'body') || !Composite.get(world, bodyB.id, 'body')) return;

        const tier = (bodyA as any).gameTier as CreatureTier;
        
        Composite.remove(world, bodyA);
        Composite.remove(world, bodyB);

        const points = CREATURES[tier].score;
        scoreRef.current += points;
        onScoreUpdate(scoreRef.current);

        const midX = (bodyA.position.x + bodyB.position.x) / 2;
        const midY = (bodyA.position.y + bodyB.position.y) / 2;

        createParticles(midX, midY, CREATURES[tier].color);

        if (tier < CreatureTier.Turtle) {
          const newTier = tier + 1;
          const newBody = createCreatureBody(midX, midY, newTier);
          Composite.add(world, newBody);
        } else if (tier === CreatureTier.Turtle) {
          scoreRef.current += CREATURES[CreatureTier.BabySeal].score;
          onScoreUpdate(scoreRef.current);
          sealAnimationRef.current = { active: true, y: midY, opacity: 1 };
        }
      });
    });

    // --- GAME OVER CHECK ---
    Events.on(engine, 'afterUpdate', () => {
       if (isGameOverRef.current) return;
       const bodies = Composite.allBodies(world);
       let over = false;
       for (const body of bodies) {
         if (body.label.startsWith('creature') && !body.isStatic) {
           if (body.position.y < CEILING_Y && body.velocity.y < 0.1 && body.speed < 0.1) {
             over = true; 
             break;
           }
         }
       }
       if (over) {
         isGameOverRef.current = true;
         onGameOver(true);
         runnerRef.current!.enabled = false;
       }
    });

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // --- RENDER LOOP ---
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId: number;

    const renderLoop = (timestamp: number) => {
      if (!ctx) return;
      timeRef.current = timestamp;

      // Clear
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Background Shore
      const gradient = ctx.createLinearGradient(0, GAME_HEIGHT * 0.7, 0, GAME_HEIGHT);
      gradient.addColorStop(0, "rgba(238, 214, 175, 0)");
      gradient.addColorStop(0.3, "rgba(238, 214, 175, 0.5)");
      gradient.addColorStop(1, "#EED6AF");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, GAME_HEIGHT * 0.7, GAME_WIDTH, GAME_HEIGHT * 0.3);

      // Game Over Guide Line
      if (!isGameOverRef.current) {
        ctx.beginPath();
        ctx.moveTo(0, CEILING_Y);
        ctx.lineTo(GAME_WIDTH, CEILING_Y);
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Drop Indicator & Preview
      if (canDropRef.current && !isGameOverRef.current) {
        // High Contrast Guide Line
        ctx.beginPath();
        ctx.moveTo(dragX, 50);
        ctx.lineTo(dragX, CEILING_Y);
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Fully Visible Preview with gentle bob (Current Active Creature)
        const def = CREATURES[activeCreatureRef.current];
        const bobY = Math.sin(timestamp * 0.005) * 5;
        
        drawCreatureVisuals(ctx, dragX, 50 + bobY, def.radius, 0, activeCreatureRef.current, 'happy', timestamp);
      }

      // Physics Bodies
      const bodies = Composite.allBodies(engine.world);
      bodies.forEach(body => {
        const rawTier = (body as any).gameTier;
        if (rawTier !== undefined) {
           const tier = rawTier as CreatureTier;
           const speed = body.speed;
           const mood = (speed > 4 && body.velocity.y > 0) ? 'surprised' : 'happy';
           drawCreatureVisuals(ctx, body.position.x, body.position.y, CREATURES[tier].radius, body.angle, tier, mood, timestamp);
        }
      });

      // Particles
      updateParticles();
      particlesRef.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      // Seal Exit Animation
      if (sealAnimationRef.current && sealAnimationRef.current.active) {
        const anim = sealAnimationRef.current;
        const sealDef = CREATURES[CreatureTier.BabySeal];
        
        ctx.save();
        ctx.globalAlpha = anim.opacity;
        // Waddle rotation
        const waddle = Math.sin(anim.y * 0.1) * 0.1;
        drawCreatureVisuals(ctx, GAME_WIDTH / 2, anim.y, sealDef.radius, waddle, CreatureTier.BabySeal, 'happy', timestamp);
        ctx.restore();

        anim.y += 3;
        if (anim.y > GAME_HEIGHT + 150) {
          sealAnimationRef.current = null;
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop(0);
    initGame();

    return () => {
      cancelAnimationFrame(animationFrameId);
      Runner.stop(runner);
      Engine.clear(engine);
      runnerRef.current = null;
      engineRef.current = null;
    };
  }, []);

  const handleInputMove = (clientX: number) => {
    if (isGameOverRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    let x = (clientX - rect.left) * (GAME_WIDTH / rect.width);
    const def = CREATURES[activeCreatureRef.current];
    x = Math.max(def.radius, Math.min(GAME_WIDTH - def.radius, x));
    
    setDragX(x);
  };

  const handleInputEnd = () => {
    if (!canDropRef.current || isGameOverRef.current || !engineRef.current) return;

    canDropRef.current = false;
    
    const tier = activeCreatureRef.current;
    
    // Spawn exactly where the ghost was
    const body = createCreatureBody(dragX, 50, tier);
    
    // Initial velocity down for immediate feedback
    Matter.Body.setVelocity(body, { x: 0, y: 5 });
    
    Composite.add(engineRef.current.world, body);

    setTimeout(() => {
      canDropRef.current = true;
      cycleCreatures();
    }, 600);
  };

  return (
    <div 
      className="relative w-full max-w-[400px] h-[650px] mx-auto bg-blue-50 rounded-xl overflow-hidden shadow-2xl touch-none select-none"
      ref={sceneRef}
      onTouchMove={(e) => handleInputMove(e.touches[0].clientX)}
      onTouchEnd={handleInputEnd}
      onMouseMove={(e) => handleInputMove(e.clientX)}
      onMouseUp={handleInputEnd}
      onMouseLeave={() => {}} 
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-200 via-blue-100 to-transparent pointer-events-none" />
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="relative z-10 w-full h-full cursor-col-resize"
      />
    </div>
  );
};

export default GameCanvas;