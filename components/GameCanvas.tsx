import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { CreatureTier, CreatureBody, Particle } from '../types';
import {
  CREATURES,
  GAME_WIDTH,
  GAME_HEIGHT,
  WALL_THICKNESS,
  CEILING_Y,
  MAX_SPAWN_TIER,
  COLLISION_CATEGORY_DEFAULT,
  COLLISION_CATEGORY_CREATURE,
  GRAVITY_Y,
  GRAVITY_SCALE,
  RESTITUTION,
  FRICTION,
  FRICTION_STATIC,
  FRICTION_AIR,
  ANGULAR_DAMPING,
  SLOP,
  DENSITY_BASE,
  INITIAL_DROP_VELOCITY,
  POSITION_ITERATIONS,
  VELOCITY_ITERATIONS,
  DROP_COOLDOWN_MS,
  PARTICLE_COUNT,
  PARTICLE_VELOCITY_SPREAD,
  PARTICLE_INITIAL_LIFE,
  PARTICLE_SIZE_MIN,
  PARTICLE_SIZE_RANGE,
  PARTICLE_DECAY_RATE,
  PARTICLE_SIZE_DECAY,
  BOB_FREQUENCY,
  BOB_AMPLITUDE,
  DROP_PREVIEW_Y,
  SEAL_EXIT_SPEED,
  SEAL_WADDLE_INTENSITY,
  SEAL_EXIT_BUFFER,
  GAME_OVER_VELOCITY_THRESHOLD,
  GAME_OVER_SPEED_THRESHOLD,
  SURPRISED_SPEED_THRESHOLD,
} from '../constants';
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

  const createCreatureBody = (x: number, y: number, tier: CreatureTier, isStatic = false): CreatureBody => {
    const def = CREATURES[tier];
    const body = Bodies.circle(x, y, def.radius, {
      restitution: RESTITUTION,
      friction: FRICTION,
      frictionStatic: FRICTION_STATIC,
      frictionAir: FRICTION_AIR,
      density: DENSITY_BASE * (tier + 1),
      slop: SLOP,
      label: `creature-${tier}`,
      isStatic: isStatic,
      render: { visible: false },
      collisionFilter: {
        category: COLLISION_CATEGORY_CREATURE,
        mask: COLLISION_CATEGORY_DEFAULT | COLLISION_CATEGORY_CREATURE
      }
    }) as CreatureBody;
    body.gameTier = tier;
    // Set angular damping to reduce spinning (not in IBodyDefinition types)
    (body as any).angularDamping = ANGULAR_DAMPING;
    return body;
  };

  // Calculate where a creature would land given X position and radius
  // Returns the Y position of the top of the landing spot
  const calculateLandingY = (dropX: number, creatureRadius: number): number => {
    if (!engineRef.current) return GAME_HEIGHT - creatureRadius;

    const bodies = Composite.allBodies(engineRef.current.world);
    let landingY = GAME_HEIGHT; // Default to ground level

    // Check each creature body to see if it would block the drop
    bodies.forEach(body => {
      const creature = body as CreatureBody;
      if (creature.gameTier === undefined) return; // Skip non-creature bodies (walls, ground)

      const bodyRadius = CREATURES[creature.gameTier].radius;
      const bodyX = body.position.x;
      const bodyY = body.position.y;

      // Check if dropping creature would horizontally overlap with this body
      const horizontalDistance = Math.abs(dropX - bodyX);
      const combinedRadii = creatureRadius + bodyRadius;

      if (horizontalDistance < combinedRadii) {
        // Calculate where the dropping creature would touch this body
        // Using circle-circle collision geometry
        const verticalOverlap = Math.sqrt(combinedRadii * combinedRadii - horizontalDistance * horizontalDistance);
        const touchY = bodyY - verticalOverlap;

        // Take the highest (smallest Y) landing position
        if (touchY < landingY) {
          landingY = touchY;
        }
      }
    });

    // Return the landing position adjusted for creature radius
    return landingY - creatureRadius;
  };

  // --- PARTICLE SYSTEM ---
  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * PARTICLE_VELOCITY_SPREAD,
        vy: (Math.random() - 0.5) * PARTICLE_VELOCITY_SPREAD,
        life: PARTICLE_INITIAL_LIFE,
        color,
        size: Math.random() * PARTICLE_SIZE_RANGE + PARTICLE_SIZE_MIN
      });
    }
  };

  const updateParticles = () => {
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= PARTICLE_DECAY_RATE;
      p.size *= PARTICLE_SIZE_DECAY;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);
  };

  useEffect(() => {
    if (!sceneRef.current || !canvasRef.current) return;

    // --- SETUP ENGINE ---
    const engine = Engine.create({
      gravity: { x: 0, y: GRAVITY_Y, scale: GRAVITY_SCALE },
      positionIterations: POSITION_ITERATIONS,
      velocityIterations: VELOCITY_ITERATIONS,
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
    const handleCollisionStart = (event: Matter.IEventCollision<Matter.Engine>) => {
      const pairs = event.pairs;
      const pairsToProcess: {bodyA: CreatureBody, bodyB: CreatureBody}[] = [];

      pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const creatureA = bodyA as CreatureBody;
        const creatureB = bodyB as CreatureBody;

        if (creatureA.gameTier !== undefined && creatureB.gameTier !== undefined && creatureA.gameTier === creatureB.gameTier) {
          pairsToProcess.push({ bodyA: creatureA, bodyB: creatureB });
        }
      });

      pairsToProcess.forEach(({ bodyA, bodyB }) => {
        if (!Composite.get(world, bodyA.id, 'body') || !Composite.get(world, bodyB.id, 'body')) return;

        const tier = bodyA.gameTier;

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
    };
    Events.on(engine, 'collisionStart', handleCollisionStart);

    // --- GAME OVER CHECK ---
    const handleAfterUpdate = () => {
       if (isGameOverRef.current) return;
       const bodies = Composite.allBodies(world);
       let over = false;
       for (const body of bodies) {
         if (body.label.startsWith('creature') && !body.isStatic) {
           if (body.position.y < CEILING_Y && body.velocity.y < GAME_OVER_VELOCITY_THRESHOLD && body.speed < GAME_OVER_SPEED_THRESHOLD) {
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
    };
    Events.on(engine, 'afterUpdate', handleAfterUpdate);

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
        const def = CREATURES[activeCreatureRef.current];
        const landingY = calculateLandingY(dragX, def.radius);

        // Draw drop guide line from creature to landing position
        ctx.beginPath();
        ctx.moveTo(dragX, DROP_PREVIEW_Y + def.radius);
        ctx.lineTo(dragX, landingY);
        ctx.setLineDash([10, 10]);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw landing indicator (ghost circle showing where creature will land)
        ctx.beginPath();
        ctx.arc(dragX, landingY, def.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw cross at landing center
        ctx.beginPath();
        ctx.moveTo(dragX - 8, landingY);
        ctx.lineTo(dragX + 8, landingY);
        ctx.moveTo(dragX, landingY - 8);
        ctx.lineTo(dragX, landingY + 8);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Fully Visible Preview with gentle bob (Current Active Creature)
        const bobY = Math.sin(timestamp * BOB_FREQUENCY) * BOB_AMPLITUDE;
        drawCreatureVisuals(ctx, dragX, DROP_PREVIEW_Y + bobY, def.radius, 0, activeCreatureRef.current, 'happy', timestamp);
      }

      // Physics Bodies
      const bodies = Composite.allBodies(engine.world);
      bodies.forEach(body => {
        const creature = body as CreatureBody;
        if (creature.gameTier !== undefined) {
           const tier = creature.gameTier;
           const speed = body.speed;
           const mood = (speed > SURPRISED_SPEED_THRESHOLD && body.velocity.y > 0) ? 'surprised' : 'happy';
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
        const waddle = Math.sin(anim.y * SEAL_WADDLE_INTENSITY) * SEAL_WADDLE_INTENSITY;
        drawCreatureVisuals(ctx, GAME_WIDTH / 2, anim.y, sealDef.radius, waddle, CreatureTier.BabySeal, 'happy', timestamp);
        ctx.restore();

        anim.y += SEAL_EXIT_SPEED;
        if (anim.y > GAME_HEIGHT + SEAL_EXIT_BUFFER) {
          sealAnimationRef.current = null;
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop(0);
    initGame();

    return () => {
      cancelAnimationFrame(animationFrameId);
      Events.off(engine, 'collisionStart', handleCollisionStart);
      Events.off(engine, 'afterUpdate', handleAfterUpdate);
      Runner.stop(runner);
      Engine.clear(engine);
      runnerRef.current = null;
      engineRef.current = null;
    };
  }, []);

  // Convert client X to game X coordinate, clamped to creature radius
  const clientToGameX = (clientX: number): number => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return dragX;

    let x = (clientX - rect.left) * (GAME_WIDTH / rect.width);
    const def = CREATURES[activeCreatureRef.current];
    x = Math.max(def.radius, Math.min(GAME_WIDTH - def.radius, x));
    return x;
  };

  // Called on touch/mouse START - immediately position creature at tap location
  const handleInputStart = (clientX: number) => {
    if (isGameOverRef.current) return;
    setDragX(clientToGameX(clientX));
  };

  // Called on touch/mouse MOVE - follow finger/cursor
  const handleInputMove = (clientX: number) => {
    if (isGameOverRef.current) return;
    setDragX(clientToGameX(clientX));
  };

  const handleInputEnd = () => {
    if (!canDropRef.current || isGameOverRef.current || !engineRef.current) return;

    canDropRef.current = false;

    const tier = activeCreatureRef.current;

    // Spawn exactly where the ghost was
    const body = createCreatureBody(dragX, DROP_PREVIEW_Y, tier);

    // Initial velocity down for immediate feedback
    Matter.Body.setVelocity(body, { x: 0, y: INITIAL_DROP_VELOCITY });

    Composite.add(engineRef.current.world, body);

    setTimeout(() => {
      canDropRef.current = true;
      cycleCreatures();
    }, DROP_COOLDOWN_MS);
  };

  return (
    <div
      className="relative w-full max-w-[400px] h-[650px] mx-auto bg-blue-50 rounded-xl overflow-hidden shadow-2xl touch-none select-none"
      ref={sceneRef}
      onTouchStart={(e) => handleInputStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleInputMove(e.touches[0].clientX)}
      onTouchEnd={handleInputEnd}
      onMouseDown={(e) => handleInputStart(e.clientX)}
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