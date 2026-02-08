export const ROWS = 16;
export const COLUMNS = 10;

export type CellColor = string | null;
export type Grid = CellColor[][];

export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export interface Position {
  row: number;
  column: number;
}

export interface ActivePiece {
  type: PieceType;
  rotation: number;
  position: Position;
}

export interface BotTarget {
  rotation: number;
  column: number;
}

// --- Tetromino definitions ---

interface TetrominoDef {
  color: string;
  shapes: number[][][];
}

const TETROMINOES: Record<PieceType, TetrominoDef> = {
  I: {
    color: "#06b6d4",
    shapes: [
      [[1, 1, 1, 1]],
      [[1], [1], [1], [1]],
    ],
  },
  O: {
    color: "#eab308",
    shapes: [[[1, 1], [1, 1]]],
  },
  T: {
    color: "#a855f7",
    shapes: [
      [[0, 1, 0], [1, 1, 1]],
      [[1, 0], [1, 1], [1, 0]],
      [[1, 1, 1], [0, 1, 0]],
      [[0, 1], [1, 1], [0, 1]],
    ],
  },
  S: {
    color: "#22c55e",
    shapes: [
      [[0, 1, 1], [1, 1, 0]],
      [[1, 0], [1, 1], [0, 1]],
    ],
  },
  Z: {
    color: "#ef4444",
    shapes: [
      [[1, 1, 0], [0, 1, 1]],
      [[0, 1], [1, 1], [1, 0]],
    ],
  },
  J: {
    color: "#3b82f6",
    shapes: [
      [[1, 0, 0], [1, 1, 1]],
      [[1, 1], [1, 0], [1, 0]],
      [[1, 1, 1], [0, 0, 1]],
      [[0, 1], [0, 1], [1, 1]],
    ],
  },
  L: {
    color: "#f97316",
    shapes: [
      [[0, 0, 1], [1, 1, 1]],
      [[1, 0], [1, 0], [1, 1]],
      [[1, 1, 1], [1, 0, 0]],
      [[1, 1], [0, 1], [0, 1]],
    ],
  },
};

const PIECE_TYPES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

// --- Core helpers ---

export function createEmptyGrid(): Grid {
  return Array.from({ length: ROWS }, () =>
    Array<CellColor>(COLUMNS).fill(null)
  );
}

export function getShape(type: PieceType, rotation: number): number[][] {
  const { shapes } = TETROMINOES[type];
  return shapes[rotation % shapes.length];
}

export function getColor(type: PieceType): string {
  return TETROMINOES[type].color;
}

export function getRotationCount(type: PieceType): number {
  return TETROMINOES[type].shapes.length;
}

export function isValidPosition(
  grid: Grid,
  shape: number[][],
  position: Position
): boolean {
  for (let row = 0; row < shape.length; row++) {
    for (let column = 0; column < shape[row].length; column++) {
      if (!shape[row][column]) continue;

      const gridRow = position.row + row;
      const gridColumn = position.column + column;

      const isOutOfBounds =
        gridRow < 0 ||
        gridRow >= ROWS ||
        gridColumn < 0 ||
        gridColumn >= COLUMNS;

      if (isOutOfBounds || grid[gridRow][gridColumn] !== null) {
        return false;
      }
    }
  }

  return true;
}

export function placePiece(
  grid: Grid,
  shape: number[][],
  position: Position,
  color: string
): Grid {
  const newGrid = grid.map((row) => [...row]);

  for (let row = 0; row < shape.length; row++) {
    for (let column = 0; column < shape[row].length; column++) {
      if (!shape[row][column]) continue;

      const gridRow = position.row + row;
      const gridColumn = position.column + column;

      if (
        gridRow >= 0 &&
        gridRow < ROWS &&
        gridColumn >= 0 &&
        gridColumn < COLUMNS
      ) {
        newGrid[gridRow][gridColumn] = color;
      }
    }
  }

  return newGrid;
}

export function clearLines(grid: Grid): {
  grid: Grid;
  linesCleared: number;
} {
  const remainingRows = grid.filter((row) =>
    row.some((cell) => cell === null)
  );
  const linesCleared = ROWS - remainingRows.length;

  while (remainingRows.length < ROWS) {
    remainingRows.unshift(Array<CellColor>(COLUMNS).fill(null));
  }

  return { grid: remainingRows, linesCleared };
}

export function getDropRow(
  grid: Grid,
  shape: number[][],
  position: Position
): number {
  let dropRow = position.row;

  while (
    isValidPosition(grid, shape, {
      row: dropRow + 1,
      column: position.column,
    })
  ) {
    dropRow++;
  }

  return dropRow;
}

export function getRandomPieceType(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

// --- Bot AI ---

function countHoles(grid: Grid): number {
  let holes = 0;

  for (let column = 0; column < COLUMNS; column++) {
    let hasBlockAbove = false;

    for (let row = 0; row < ROWS; row++) {
      if (grid[row][column] !== null) {
        hasBlockAbove = true;
      } else if (hasBlockAbove) {
        holes++;
      }
    }
  }

  return holes;
}

function getColumnHeights(grid: Grid): number[] {
  return Array.from({ length: COLUMNS }, (_, column) => {
    for (let row = 0; row < ROWS; row++) {
      if (grid[row][column] !== null) {
        return ROWS - row;
      }
    }

    return 0;
  });
}

function totalHeight(heights: number[]): number {
  return heights.reduce((sum, height) => sum + height, 0);
}

function bumpiness(heights: number[]): number {
  let result = 0;

  for (let index = 0; index < heights.length - 1; index++) {
    result += Math.abs(heights[index] - heights[index + 1]);
  }

  return result;
}

export function findBestMove(grid: Grid, pieceType: PieceType): BotTarget {
  const rotationCount = getRotationCount(pieceType);
  let bestTarget: BotTarget = { rotation: 0, column: 0 };
  let bestScore = -Infinity;

  for (let rotation = 0; rotation < rotationCount; rotation++) {
    const shape = getShape(pieceType, rotation);
    const shapeWidth = shape[0].length;

    for (let column = 0; column <= COLUMNS - shapeWidth; column++) {
      const spawnPosition: Position = { row: 0, column };

      if (!isValidPosition(grid, shape, spawnPosition)) continue;

      const landedRow = getDropRow(grid, shape, spawnPosition);
      const placedGrid = placePiece(
        grid,
        shape,
        { row: landedRow, column },
        getColor(pieceType)
      );
      const { grid: clearedGrid, linesCleared } = clearLines(placedGrid);
      const heights = getColumnHeights(clearedGrid);

      const score =
        linesCleared * 100 -
        countHoles(clearedGrid) * 40 -
        totalHeight(heights) * 5 -
        bumpiness(heights) * 3;

      if (score > bestScore) {
        bestScore = score;
        bestTarget = { rotation, column };
      }
    }
  }

  return bestTarget;
}
