import { CreatureDef, CreatureTier } from './types';

// Physics world dimensions
export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 650;
export const WALL_THICKNESS = 100;
export const CEILING_Y = 120; // The warning line Y position

// Creatures definitions
export const CREATURES: Record<CreatureTier, CreatureDef> = {
  [CreatureTier.Clam]: {
    tier: CreatureTier.Clam,
    name: "Clam",
    radius: 18,
    color: "#FDE2E4", // Soft Pink
    faceColor: "#F4978E",
    score: 2,
  },
  [CreatureTier.SeaUrchin]: {
    tier: CreatureTier.SeaUrchin,
    name: "Urchin",
    radius: 26,
    color: "#8D6E63", // Brownish (Saddle Brown / Earthy)
    faceColor: "#5D4037",
    score: 4,
  },
  [CreatureTier.Shrimp]: {
    tier: CreatureTier.Shrimp,
    name: "Shrimp",
    radius: 34,
    color: "#FF8DA1", // Vibrant Coral Pink (Updated for reference)
    faceColor: "#E07A5F",
    score: 8,
  },
  [CreatureTier.Starfish]: {
    tier: CreatureTier.Starfish,
    name: "Starfish",
    radius: 44,
    color: "#FCE181", // Soft Yellow
    faceColor: "#D4A373",
    score: 16,
  },
  [CreatureTier.Crab]: {
    tier: CreatureTier.Crab,
    name: "Crab",
    radius: 56,
    color: "#F28482", // Pastel Red
    faceColor: "#8D0801",
    score: 32,
  },
  [CreatureTier.Jellyfish]: {
    tier: CreatureTier.Jellyfish,
    name: "Jelly",
    radius: 70,
    color: "#E2F0CB", // Mint
    faceColor: "#588157",
    score: 64,
  },
  [CreatureTier.Pufferfish]: {
    tier: CreatureTier.Pufferfish,
    name: "Puffer",
    radius: 86,
    color: "#99C1DE", // Air Blue
    faceColor: "#1D3557",
    score: 128,
  },
  [CreatureTier.Octopus]: {
    tier: CreatureTier.Octopus,
    name: "Octopus",
    radius: 104,
    color: "#C4A4B4", // Mauve/Taupe (Updated for reference)
    faceColor: "#7A5C6A",
    score: 256,
  },
  [CreatureTier.Turtle]: {
    tier: CreatureTier.Turtle,
    name: "Turtle",
    radius: 124,
    color: "#8AC926", // Lime
    faceColor: "#1A535C",
    score: 512,
  },
  [CreatureTier.BabySeal]: {
    tier: CreatureTier.BabySeal,
    name: "Seal",
    radius: 140,
    color: "#FFFFFF", // White
    faceColor: "#333333",
    score: 1000,
  },
};

// Only tiers 0-4 (Clam to Crab) can spawn naturally
export const MAX_SPAWN_TIER = 4;
export const COLLISION_CATEGORY_DEFAULT = 0x0001;
export const COLLISION_CATEGORY_CREATURE = 0x0002;

// Physics settings
export const GRAVITY_Y = 1.2;
export const GRAVITY_SCALE = 0.001;
export const RESTITUTION = 0.3;
export const FRICTION = 0.1;
export const DENSITY_BASE = 0.001;
export const INITIAL_DROP_VELOCITY = 5;

// Timing
export const DROP_COOLDOWN_MS = 600;

// Particle system
export const PARTICLE_COUNT = 10;
export const PARTICLE_VELOCITY_SPREAD = 6;
export const PARTICLE_INITIAL_LIFE = 1.0;
export const PARTICLE_SIZE_MIN = 3;
export const PARTICLE_SIZE_RANGE = 6;
export const PARTICLE_DECAY_RATE = 0.03;
export const PARTICLE_SIZE_DECAY = 0.95;

// Animation
export const BOB_FREQUENCY = 0.005;
export const BOB_AMPLITUDE = 5;
export const DROP_PREVIEW_Y = 50;
export const SEAL_EXIT_SPEED = 3;
export const SEAL_WADDLE_INTENSITY = 0.1;
export const SEAL_EXIT_BUFFER = 150;

// Game over detection
export const GAME_OVER_VELOCITY_THRESHOLD = 0.1;
export const GAME_OVER_SPEED_THRESHOLD = 0.1;

// Mood detection
export const SURPRISED_SPEED_THRESHOLD = 4;