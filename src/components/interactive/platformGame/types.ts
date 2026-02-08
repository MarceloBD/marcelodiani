export const CANVAS_WIDTH = 320;
export const CANVAS_HEIGHT = 480;
export const GRAVITY = 0.35;
export const JUMP_FORCE = -11;
export const PLAYER_SIZE = 18;
export const PLATFORM_HEIGHT = 10;
export const PLATFORM_MIN_WIDTH = 50;
export const PLATFORM_MAX_WIDTH = 80;
export const SPIKE_WIDTH = 8;
export const SPIKE_HEIGHT = 10;
export const ENEMY_SIZE = 16;
export const ENEMY_SPEED = 1.2;
export const PLATFORM_COUNT = 8;
export const POINTS_PER_PLATFORM = 10;
export const COIN_SIZE = 10;
export const POINTS_PER_COIN = 1;

export const TICK_RATE = 60;
export const TICK_MS = 1000 / TICK_RATE;
export const MAX_GAME_TICKS = TICK_RATE * 60 * 30; // 30 minutes max

export interface Platform {
  x: number;
  y: number;
  width: number;
  hasSpikes: boolean;
  spikeOffsetX: number;
}

export interface Enemy {
  x: number;
  y: number;
  direction: number;
  platformIndex: number;
}

export interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  facingRight: boolean;
}

export type GameScreen = "menu" | "playing" | "gameover" | "scoreboard";

export interface GameState {
  player: PlayerState;
  platforms: Platform[];
  enemies: Enemy[];
  coins: Coin[];
  score: number;
  maxHeight: number;
  cameraY: number;
  platformsCleared: number;
  isDead: boolean;
  isPaused: boolean;
}

/** Events emitted by a single simulation tick for the client to react to (audio, UI). */
export interface TickEvents {
  jumped: boolean;
  died: boolean;
  coinsCollected: number;
  scoreChanged: boolean;
}

/** A single recorded input event for replay verification. */
export interface InputEvent {
  tick: number;
  key: string;
  pressed: boolean;
}

/** Response from the server when starting a game session. */
export interface GameSessionResponse {
  sessionId: string;
  seed: number;
}

/** Result of replaying a game on the server. */
export interface ReplayResult {
  score: number;
  totalTicks: number;
  isDead: boolean;
}
