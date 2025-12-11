# OceanMerge Refactoring Plan

## Implementation Strategy
- **Chunked execution**: Phases 1-2 together, then Phase 3 (incremental), then Phase 4
- **Testing**: Vitest when ready
- **Decomposition approach**: Incremental (one hook at a time, verify after each)

---

## Phase 1: Memory Safety & Type Foundation

### 1.1 Fix Memory Leaks - Matter.js Event Cleanup
- [x] Extract collision handler to named function in `GameCanvas.tsx`
- [x] Extract afterUpdate handler to named function
- [x] Add `Events.off()` calls in useEffect cleanup

### 1.2 Type Safety - Eliminate `any` Casts
- [x] Create `CreatureBody` interface in `types.ts`
- [x] Update line 72 (body creation) to use proper typing
- [x] Update lines 134-135 (collision detection)
- [x] Update line 145 (merge handling)
- [x] Update line 249 (rendering)

---

## Phase 2: Extract Magic Numbers

- [x] Add timing constants to `constants.ts` (DROP_COOLDOWN_MS, PARTICLE_DECAY_RATE, etc.)
- [x] Add animation constants (BOB_FREQUENCY, BOB_AMPLITUDE, SEAL_EXIT_SPEED, etc.)
- [x] Add physics constants (GRAVITY_Y, RESTITUTION, FRICTION, etc.)
- [x] Add particle constants (PARTICLE_COUNT, PARTICLE_VELOCITY_SPREAD, etc.)
- [x] Add game over constants (velocity/speed thresholds)
- [x] Update `GameCanvas.tsx` to use new constants

---

## Phase 3: Decompose GameCanvas (Incremental)

### 3.1 Extract usePhysicsEngine
- [ ] Create `hooks/usePhysicsEngine.ts`
- [ ] Move engine creation, world setup, boundaries
- [ ] Move runner lifecycle
- [ ] Update `GameCanvas.tsx` to use hook
- [ ] **VERIFY**: Game still works

### 3.2 Extract ParticleSystem
- [ ] Create `systems/ParticleSystem.ts` class
- [ ] Move particle creation, update, render logic
- [ ] Update `GameCanvas.tsx` to use class
- [ ] **VERIFY**: Particles still work on merge

### 3.3 Extract useCollisionHandler
- [ ] Create `hooks/useCollisionHandler.ts`
- [ ] Move collision event subscription
- [ ] Move merge logic and score calculation
- [ ] Move seal win condition
- [ ] Update `GameCanvas.tsx` to use hook
- [ ] **VERIFY**: Merging and scoring works

### 3.4 Extract useGameOverDetection
- [ ] Create `hooks/useGameOverDetection.ts`
- [ ] Move afterUpdate event subscription
- [ ] Move ceiling breach detection logic
- [ ] Update `GameCanvas.tsx` to use hook
- [ ] **VERIFY**: Game over triggers correctly

### 3.5 Extract useGameRenderer
- [ ] Create `hooks/useGameRenderer.ts`
- [ ] Move requestAnimationFrame loop
- [ ] Move all rendering logic (background, creatures, UI)
- [ ] Update `GameCanvas.tsx` to use hook
- [ ] **VERIFY**: All visuals render correctly

### 3.6 Final GameCanvas Cleanup
- [ ] Remove redundant code from `GameCanvas.tsx`
- [ ] Ensure component is ~100 lines or less
- [ ] Clean up imports

---

## Phase 4: Extract Creature Drawing Functions

### 4.1 Setup Module Structure
- [ ] Create `drawUtils/` directory
- [ ] Create `drawUtils/types.ts` with CreatureDrawContext interface
- [ ] Create `drawUtils/kawaiiFace.ts` (extract from current drawUtils.ts)

### 4.2 Extract Individual Creatures
- [ ] Create `drawUtils/creatures/clam.ts`
- [ ] Create `drawUtils/creatures/seaUrchin.ts`
- [ ] Create `drawUtils/creatures/shrimp.ts`
- [ ] Create `drawUtils/creatures/starfish.ts`
- [ ] Create `drawUtils/creatures/crab.ts`
- [ ] Create `drawUtils/creatures/jellyfish.ts`
- [ ] Create `drawUtils/creatures/pufferfish.ts`
- [ ] Create `drawUtils/creatures/octopus.ts`
- [ ] Create `drawUtils/creatures/turtle.ts`
- [ ] Create `drawUtils/creatures/babySeal.ts`

### 4.3 Create Index and Cleanup
- [ ] Create `drawUtils/index.ts` with lookup map
- [ ] Update imports in `GameCanvas.tsx`, `UIOverlay.tsx`, `EvolutionBar.tsx`
- [ ] Delete old `drawUtils.ts`
- [ ] **VERIFY**: All creatures render correctly

---

## Phase 5: Cleanup & Polish

- [ ] Remove unused `GameState` interface from `types.ts` (or implement it)
- [ ] Evaluate if `scoreRef` duplication is still needed
- [ ] Remove unused `faceColor` from CreatureDef if not used

---

## Phase 6: Testing Infrastructure (Future)

- [ ] Add Vitest to project
- [ ] Create `hooks/useCollisionHandler.test.ts`
- [ ] Create `systems/ParticleSystem.test.ts`
- [ ] Create `hooks/useGameOverDetection.test.ts`

---

## Phase 7: Features (Future)

### High Score Persistence
- [ ] Add localStorage wrapper
- [ ] Load high score on init
- [ ] Save on game over
- [ ] Display in UI

### Accessibility
- [ ] Add keyboard controls
- [ ] Add pause functionality
- [ ] Add ARIA labels

---

## File Change Summary

| File | Action | Phase |
|------|--------|-------|
| `components/GameCanvas.tsx` | Modify | 1, 2, 3 |
| `types.ts` | Add CreatureBody | 1 |
| `constants.ts` | Add constants | 2 |
| `hooks/usePhysicsEngine.ts` | Create | 3.1 |
| `systems/ParticleSystem.ts` | Create | 3.2 |
| `hooks/useCollisionHandler.ts` | Create | 3.3 |
| `hooks/useGameOverDetection.ts` | Create | 3.4 |
| `hooks/useGameRenderer.ts` | Create | 3.5 |
| `drawUtils/` | Create directory | 4 |
| `drawUtils.ts` | Delete | 4 |
