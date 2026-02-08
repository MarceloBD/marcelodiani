import {
  type Platform,
  type Enemy,
  type Coin,
  type PlayerState,
  type GameState,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_SIZE,
  PLATFORM_HEIGHT,
  SPIKE_WIDTH,
  SPIKE_HEIGHT,
  ENEMY_SIZE,
  COIN_SIZE,
} from "./types";

function renderBackground(context: CanvasRenderingContext2D): void {
  const gradient = context.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, "#050508");
  gradient.addColorStop(1, "#0a0a1a");
  context.fillStyle = gradient;
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function renderPlatforms(
  context: CanvasRenderingContext2D,
  platforms: Platform[],
  cameraY: number
): void {
  for (const platform of platforms) {
    const screenY = platform.y - cameraY;
    if (screenY < -20 || screenY > CANVAS_HEIGHT + 20) continue;

    context.fillStyle = platform.hasSpikes ? "#2e1a1a" : "#1a1a3e";
    context.fillRect(platform.x, screenY, platform.width, PLATFORM_HEIGHT);
    context.fillStyle = platform.hasSpikes ? "#ef4444" : "#3b82f6";
    context.fillRect(platform.x, screenY, platform.width, 2);

    if (platform.hasSpikes) {
      const spikeBaseX = platform.x + platform.spikeOffsetX;
      context.fillStyle = "#ef4444";
      for (let spikeIndex = 0; spikeIndex < 2; spikeIndex++) {
        const spikeX = spikeBaseX + spikeIndex * SPIKE_WIDTH;
        context.beginPath();
        context.moveTo(spikeX, screenY);
        context.lineTo(spikeX + SPIKE_WIDTH / 2, screenY - SPIKE_HEIGHT);
        context.lineTo(spikeX + SPIKE_WIDTH, screenY);
        context.closePath();
        context.fill();
      }
    }
  }
}

function renderCoins(
  context: CanvasRenderingContext2D,
  coins: Coin[],
  cameraY: number
): void {
  for (const coin of coins) {
    if (coin.collected) continue;
    const coinScreenY = coin.y - cameraY;
    if (coinScreenY < -20 || coinScreenY > CANVAS_HEIGHT + 20) continue;

    const coinCenterX = coin.x + COIN_SIZE / 2;
    const coinCenterY = coinScreenY + COIN_SIZE / 2;

    context.beginPath();
    context.arc(coinCenterX, coinCenterY, COIN_SIZE / 2, 0, Math.PI * 2);
    context.fillStyle = "#fbbf24";
    context.fill();

    context.beginPath();
    context.arc(coinCenterX - 1, coinCenterY - 1, COIN_SIZE / 4, 0, Math.PI * 2);
    context.fillStyle = "#fde68a";
    context.fill();
  }
}

function renderEnemies(
  context: CanvasRenderingContext2D,
  enemies: Enemy[],
  cameraY: number
): void {
  for (const enemy of enemies) {
    const screenY = enemy.y - cameraY;
    if (screenY < -20 || screenY > CANVAS_HEIGHT + 20) continue;

    context.fillStyle = "#dc2626";
    context.fillRect(enemy.x, screenY, ENEMY_SIZE, ENEMY_SIZE);
    context.fillStyle = "#fca5a5";
    context.fillRect(enemy.x + 3, screenY + 4, 3, 3);
    context.fillRect(enemy.x + ENEMY_SIZE - 6, screenY + 4, 3, 3);
    context.fillStyle = "#7f1d1d";
    context.fillRect(enemy.x + 4, screenY + 10, ENEMY_SIZE - 8, 2);
  }
}

function renderPlayer(
  context: CanvasRenderingContext2D,
  player: PlayerState
): void {
  context.fillStyle = "#60a5fa";
  context.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
  context.fillStyle = "#ffffff";
  const eyeOffsetX = player.facingRight ? 10 : 4;
  context.fillRect(player.x + eyeOffsetX, player.y + 5, 3, 3);
  context.fillRect(player.x + eyeOffsetX - 5, player.y + 5, 3, 3);
}

function renderHud(context: CanvasRenderingContext2D, score: number): void {
  context.fillStyle = "#e4e4e7";
  context.font = "bold 14px monospace";
  context.fillText(`${score}`, CANVAS_WIDTH / 2 - 15, 24);
}

function renderPauseOverlay(context: CanvasRenderingContext2D): void {
  context.fillStyle = "rgba(5, 5, 8, 0.7)";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.fillStyle = "#e4e4e7";
  context.font = "bold 16px monospace";
  context.textAlign = "center";
  context.fillText("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);

  context.font = "11px monospace";
  context.fillStyle = "#a1a1aa";
  context.fillText("Click to resume", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 14);

  context.textAlign = "start";
}

export function renderFrame(
  context: CanvasRenderingContext2D,
  state: GameState
): void {
  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  renderBackground(context);
  renderPlatforms(context, state.platforms, state.cameraY);
  renderCoins(context, state.coins, state.cameraY);
  renderEnemies(context, state.enemies, state.cameraY);
  renderPlayer(context, state.player);
  renderHud(context, state.score);

  if (state.isPaused) {
    renderPauseOverlay(context);
  }
}
