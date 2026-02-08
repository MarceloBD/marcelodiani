import {
  type Platform,
  type Coin,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  SPIKE_WIDTH,
  PLATFORM_MIN_WIDTH,
  PLATFORM_MAX_WIDTH,
  PLATFORM_COUNT,
  COIN_SIZE,
} from "./types";

export function computeSpikeOffsetX(platformWidth: number, random: () => number): number {
  const positions = ["left", "right", "center"] as const;
  const position = positions[Math.floor(random() * positions.length)];

  if (position === "left") return 0;
  if (position === "right") return Math.round(platformWidth - SPIKE_WIDTH * 2);
  return Math.round(platformWidth / 2 - SPIKE_WIDTH);
}

export function generatePlatform(y: number, difficulty: number, random: () => number): Platform {
  const width = Math.round(
    PLATFORM_MIN_WIDTH + random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH)
  );
  const x = Math.round(random() * (CANVAS_WIDTH - width));
  const spikeChance = Math.min(0.4, difficulty * 0.05);
  const hasSpikes = random() < spikeChance && difficulty > 2;
  const spikeOffsetX = computeSpikeOffsetX(width, random);

  return { x, y, width, hasSpikes, spikeOffsetX };
}

export function generateInitialPlatforms(random: () => number): Platform[] {
  const platforms: Platform[] = [];
  const startPlatform: Platform = {
    x: CANVAS_WIDTH / 2 - 40,
    y: CANVAS_HEIGHT - 60,
    width: 80,
    hasSpikes: false,
    spikeOffsetX: 0,
  };
  platforms.push(startPlatform);

  for (let index = 1; index < PLATFORM_COUNT; index++) {
    const y = startPlatform.y - index * (CANVAS_HEIGHT / PLATFORM_COUNT);
    platforms.push(generatePlatform(y, 0, random));
  }

  return platforms;
}

export function shouldSpawnEnemy(difficulty: number, random: () => number): boolean {
  const chance = Math.min(0.3, difficulty * 0.03);
  return random() < chance && difficulty > 3;
}

export function shouldSpawnCoin(random: () => number): boolean {
  return random() < 0.45;
}

export function generateCoin(platform: Platform, random: () => number): Coin {
  const x = Math.round(platform.x + random() * (platform.width - COIN_SIZE));
  const y = Math.round(platform.y - 25 - random() * 15);
  return { x, y, collected: false };
}
