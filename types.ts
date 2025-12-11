import Matter from 'matter-js';

export enum CreatureTier {
  Clam = 0,
  SeaUrchin = 1,
  Shrimp = 2,
  Starfish = 3,
  Crab = 4,
  Jellyfish = 5,
  Pufferfish = 6,
  Octopus = 7,
  Turtle = 8,
  BabySeal = 9, // The special exit creature
}

// Extended Matter.Body with game-specific property
export interface CreatureBody extends Matter.Body {
  gameTier: CreatureTier;
}

export interface CreatureDef {
  tier: CreatureTier;
  name: string;
  radius: number;
  color: string;
  faceColor: string;
  score: number;
}

export interface GameState {
  score: number;
  bestScore: number;
  isGameOver: boolean;
  nextCreatureTier: CreatureTier;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}