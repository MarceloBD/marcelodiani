/**
 * Pure game simulation engine -- no DOM, audio, canvas, or React dependencies.
 * Shared between client (for gameplay) and server (for replay verification).
 */

import {
  type GameState,
  type TickEvents,
  type InputEvent,
  type ReplayResult,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GRAVITY,
  JUMP_FORCE,
  PLAYER_SIZE,
  PLATFORM_HEIGHT,
  SPIKE_WIDTH,
  ENEMY_SIZE,
  ENEMY_SPEED,
  PLATFORM_COUNT,
  POINTS_PER_PLATFORM,
  COIN_SIZE,
  POINTS_PER_COIN,
  MAX_GAME_TICKS,
} from "./types";
import {
  generateInitialPlatforms,
  generatePlatform,
  shouldSpawnEnemy,
  shouldSpawnCoin,
  generateCoin,
} from "./helpers";
import { createSeededRandom } from "./seededRandom";

export function createInitialGameState(random: () => number): GameState {
  return {
    player: {
      x: CANVAS_WIDTH / 2 - PLAYER_SIZE / 2,
      y: CANVAS_HEIGHT - 80,
      velocityX: 0,
      velocityY: 0,
      facingRight: true,
    },
    platforms: generateInitialPlatforms(random),
    enemies: [],
    coins: [],
    score: 0,
    maxHeight: 0,
    cameraY: 0,
    platformsCleared: 0,
    isDead: false,
    isPaused: false,
  };
}

/**
 * Advance the game by one fixed tick. Mutates `state` in place and returns
 * events that occurred during the tick (for audio / UI on the client).
 */
export function simulateTick(
  state: GameState,
  activeKeys: ReadonlySet<string>,
  random: () => number
): TickEvents {
  const events: TickEvents = {
    jumped: false,
    died: false,
    coinsCollected: 0,
    scoreChanged: false,
  };

  if (state.isDead || state.isPaused) return events;

  const { player, platforms, enemies } = state;
  const previousScore = state.score;

  // --- Horizontal movement ---
  if (activeKeys.has("ArrowLeft") || activeKeys.has("a") || activeKeys.has("A")) {
    player.velocityX = -5;
    player.facingRight = false;
  } else if (activeKeys.has("ArrowRight") || activeKeys.has("d") || activeKeys.has("D")) {
    player.velocityX = 5;
    player.facingRight = true;
  } else {
    player.velocityX *= 0.85;
  }

  player.x += player.velocityX;

  // Wrap around screen edges
  if (player.x + PLAYER_SIZE < 0) player.x = CANVAS_WIDTH;
  if (player.x > CANVAS_WIDTH) player.x = -PLAYER_SIZE;

  // --- Gravity ---
  player.velocityY += GRAVITY;
  player.y += player.velocityY;

  // --- Platform collision (only when falling) ---
  if (player.velocityY >= 0) {
    for (const platform of platforms) {
      const platformScreenY = platform.y - state.cameraY;

      if (
        player.x + PLAYER_SIZE > platform.x + 2 &&
        player.x < platform.x + platform.width - 2 &&
        player.y + PLAYER_SIZE >= platformScreenY &&
        player.y + PLAYER_SIZE <= platformScreenY + PLATFORM_HEIGHT + 6
      ) {
        // Check if landing on spikes
        if (platform.hasSpikes) {
          const spikeAbsoluteX = platform.x + platform.spikeOffsetX;
          const spikeEnd = spikeAbsoluteX + SPIKE_WIDTH * 2;
          const playerCenter = player.x + PLAYER_SIZE / 2;

          if (playerCenter >= spikeAbsoluteX && playerCenter <= spikeEnd) {
            state.isDead = true;
            events.died = true;
            return events;
          }
        }

        player.y = platformScreenY - PLAYER_SIZE;
        player.velocityY = JUMP_FORCE;
        events.jumped = true;
      }
    }
  }

  // --- Enemy collision ---
  for (const enemy of enemies) {
    const enemyScreenY = enemy.y - state.cameraY;
    if (
      player.x + PLAYER_SIZE > enemy.x + 2 &&
      player.x < enemy.x + ENEMY_SIZE - 2 &&
      player.y + PLAYER_SIZE > enemyScreenY + 2 &&
      player.y < enemyScreenY + ENEMY_SIZE - 2
    ) {
      state.isDead = true;
      events.died = true;
      return events;
    }
  }

  // --- Move enemies ---
  for (const enemy of enemies) {
    const parentPlatform = platforms[enemy.platformIndex];
    if (parentPlatform) {
      enemy.x += ENEMY_SPEED * enemy.direction;
      if (enemy.x <= parentPlatform.x) enemy.direction = 1;
      if (enemy.x + ENEMY_SIZE >= parentPlatform.x + parentPlatform.width) enemy.direction = -1;
    }
  }

  // --- Coin collection ---
  for (const coin of state.coins) {
    if (coin.collected) continue;
    const coinScreenY = coin.y - state.cameraY;
    if (
      player.x + PLAYER_SIZE > coin.x &&
      player.x < coin.x + COIN_SIZE &&
      player.y + PLAYER_SIZE > coinScreenY &&
      player.y < coinScreenY + COIN_SIZE
    ) {
      coin.collected = true;
      state.score += POINTS_PER_COIN;
      events.coinsCollected++;
    }
  }

  // --- Camera follows player upward ---
  const playerScreenY = player.y;
  if (playerScreenY < CANVAS_HEIGHT * 0.4) {
    const cameraDelta = CANVAS_HEIGHT * 0.4 - playerScreenY;
    state.cameraY -= cameraDelta;
    player.y += cameraDelta;

    // Score based on height
    const newHeight = Math.abs(state.cameraY);
    if (newHeight > state.maxHeight) {
      const platformsGained = Math.floor(
        (newHeight - state.maxHeight) / (CANVAS_HEIGHT / PLATFORM_COUNT)
      );
      state.score += platformsGained * POINTS_PER_PLATFORM;
      state.maxHeight = newHeight;
    }
  }

  // --- Remove platforms below screen, add new ones above ---
  while (platforms.length > 0 && platforms[0].y - state.cameraY > CANVAS_HEIGHT + 50) {
    platforms.shift();
    state.platformsCleared++;
    state.enemies = state.enemies.filter((enemy) => enemy.platformIndex > 0);
    state.enemies.forEach((enemy) => enemy.platformIndex--);
  }

  // Remove collected or off-screen coins
  state.coins = state.coins.filter(
    (coin) => !coin.collected && coin.y - state.cameraY <= CANVAS_HEIGHT + 50
  );

  while (platforms.length < PLATFORM_COUNT) {
    const highestPlatform = platforms[platforms.length - 1];
    const gap = 50 + random() * 20;
    const newY = highestPlatform.y - gap;
    const difficulty = state.platformsCleared;
    const newPlatform = generatePlatform(newY, difficulty, random);
    platforms.push(newPlatform);

    if (shouldSpawnEnemy(difficulty, random)) {
      state.enemies.push({
        x: newPlatform.x + newPlatform.width / 2,
        y: newPlatform.y - ENEMY_SIZE,
        direction: random() > 0.5 ? 1 : -1,
        platformIndex: platforms.length - 1,
      });
    }

    if (shouldSpawnCoin(random)) {
      state.coins.push(generateCoin(newPlatform, random));
    }
  }

  // --- Fell below screen = dead ---
  if (player.y > CANVAS_HEIGHT + 40) {
    state.isDead = true;
    events.died = true;
    return events;
  }

  events.scoreChanged = state.score !== previousScore;
  return events;
}

/**
 * Replay an entire game from a seed and recorded input events.
 * Used server-side to verify that the claimed score matches the actual simulation.
 */
export function replayGame(seed: number, inputEvents: InputEvent[]): ReplayResult {
  const random = createSeededRandom(seed);
  const state = createInitialGameState(random);
  const activeKeys = new Set<string>();

  // Input events must be sorted by tick
  const sortedEvents = [...inputEvents].sort((a, b) => a.tick - b.tick);
  let eventIndex = 0;

  for (let tick = 0; tick < MAX_GAME_TICKS; tick++) {
    // Apply all input events for this tick
    while (eventIndex < sortedEvents.length && sortedEvents[eventIndex].tick === tick) {
      const { key, pressed } = sortedEvents[eventIndex];
      if (pressed) {
        activeKeys.add(key);
      } else {
        activeKeys.delete(key);
      }
      eventIndex++;
    }

    simulateTick(state, activeKeys, random);

    if (state.isDead) {
      return { score: state.score, totalTicks: tick + 1, isDead: true };
    }
  }

  // Game ran for the maximum allowed ticks without dying
  return { score: state.score, totalTicks: MAX_GAME_TICKS, isDead: false };
}
