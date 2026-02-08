"use client";

import { useEffect, useRef, useCallback, useMemo } from "react";
import {
  createInitialGameState,
  getShape,
  getColor,
  getRotationCount,
  findBestMove,
  isValidPosition,
  placePiece,
  clearLines,
  findFullRows,
  getDropRow,
  getRandomPieceType,
  ROWS,
  COLUMNS,
  type Grid,
  type GameState,
  type ActivePiece,
  type Position,
} from "./tetrisEngine";

// --- Layout constants ---

const CELL_SIZE = 12;
const GAP = 1;
const CELL_STEP = CELL_SIZE + GAP;
const GRID_WIDTH = COLUMNS * CELL_SIZE + (COLUMNS - 1) * GAP;
const GRID_HEIGHT = ROWS * CELL_SIZE + (ROWS - 1) * GAP;
const BORDER = 1;

// --- Timing ---

const TICK_MS = 80;
const SPAWN_DELAY_MS = 250;
const CLEAR_DELAY_MS = 200;
const TRANSITION_DURATION = "75ms";
const WALL_KICK_OFFSETS = [-1, 1, -2, 2];
const CELLS_PER_PIECE = 4;
const EMPTY_CELL_BG = "rgba(5, 5, 8, 0.6)";
const CLEAR_FLASH_COLOR = "rgba(255, 255, 255, 0.85)";

// --- Helpers ---

function getFilledCellOffsets(shape: number[][]): Position[] {
  const offsets: Position[] = [];

  for (let row = 0; row < shape.length; row++) {
    for (let column = 0; column < shape[row].length; column++) {
      if (shape[row][column]) {
        offsets.push({ row, column });
      }
    }
  }

  return offsets;
}

// --- Game state machine ---

function tryRotatePiece(
  grid: Grid,
  piece: ActivePiece
): { rotation: number; position: Position } | null {
  const nextRotation = (piece.rotation + 1) % getRotationCount(piece.type);
  const rotatedShape = getShape(piece.type, nextRotation);

  if (isValidPosition(grid, rotatedShape, piece.position)) {
    return { rotation: nextRotation, position: piece.position };
  }

  for (const offset of WALL_KICK_OFFSETS) {
    const adjusted = {
      ...piece.position,
      column: piece.position.column + offset,
    };

    if (isValidPosition(grid, rotatedShape, adjusted)) {
      return { rotation: nextRotation, position: adjusted };
    }
  }

  return null;
}

function advanceGameState(state: GameState): GameState {
  const { grid, activePiece, target } = state;

  if (!activePiece || !target) {
    const type = getRandomPieceType();
    const shape = getShape(type, 0);
    const startColumn = Math.floor((COLUMNS - shape[0].length) / 2);
    const position: Position = { row: 0, column: startColumn };

    if (!isValidPosition(grid, shape, position)) {
      return createInitialGameState();
    }

    return {
      ...state,
      activePiece: { type, rotation: 0, position },
      target: findBestMove(grid, type),
    };
  }

  // Step 1: Rotate towards target
  const targetRotation = target.rotation % getRotationCount(activePiece.type);

  if (activePiece.rotation !== targetRotation) {
    const result = tryRotatePiece(grid, activePiece);

    if (result) {
      return {
        ...state,
        activePiece: {
          ...activePiece,
          rotation: result.rotation,
          position: result.position,
        },
      };
    }
  }

  // Step 2: Slide horizontally
  if (activePiece.position.column !== target.column) {
    const direction = target.column > activePiece.position.column ? 1 : -1;
    const newColumn = activePiece.position.column + direction;
    const shape = getShape(activePiece.type, activePiece.rotation);
    const newPosition = { ...activePiece.position, column: newColumn };

    if (isValidPosition(grid, shape, newPosition)) {
      return {
        ...state,
        activePiece: { ...activePiece, position: newPosition },
      };
    }
  }

  // Step 3: Drop one row
  const shape = getShape(activePiece.type, activePiece.rotation);
  const nextRow = activePiece.position.row + 1;

  if (
    isValidPosition(grid, shape, {
      row: nextRow,
      column: activePiece.position.column,
    })
  ) {
    return {
      ...state,
      activePiece: {
        ...activePiece,
        position: { ...activePiece.position, row: nextRow },
      },
    };
  }

  // Piece landed — merge into grid but don't clear lines yet (visual flash first)
  const color = getColor(activePiece.type);
  const placedGrid = placePiece(grid, shape, activePiece.position, color);
  const fullRows = findFullRows(placedGrid);

  return {
    ...state,
    grid: placedGrid,
    activePiece: null,
    target: null,
    clearingRows: fullRows,
  };
}

// --- Overlay painting helpers ---

function positionOverlay(
  container: HTMLDivElement,
  column: number,
  row: number
) {
  container.style.transform = `translate(${column * CELL_STEP}px, ${row * CELL_STEP}px)`;
}

function paintOverlayCells(
  container: HTMLDivElement,
  offsets: Position[],
  color: string,
  glowOpacity: string
) {
  for (let index = 0; index < CELLS_PER_PIECE; index++) {
    const element = container.children[index] as HTMLDivElement;

    if (index < offsets.length) {
      const { row, column } = offsets[index];
      element.style.left = `${column * CELL_STEP}px`;
      element.style.top = `${row * CELL_STEP}px`;
      element.style.backgroundColor = color;
      element.style.boxShadow =
        glowOpacity !== "0"
          ? `inset 0 0 ${CELL_SIZE / 2}px ${color}${glowOpacity}`
          : "";
      element.style.display = "";
    } else {
      element.style.display = "none";
    }
  }
}

// --- Component ---

export function AutoTetris() {
  const gridRef = useRef<HTMLDivElement>(null);
  const pieceRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLParagraphElement>(null);

  const gameStateRef = useRef<GameState>(createInitialGameState());
  const isSpawningRef = useRef(false);
  const isClearingRef = useRef(false);
  const spawnTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousPieceTypeRef = useRef<string | null>(null);
  const previousShapeKeyRef = useRef("");

  const paintGrid = useCallback(() => {
    const gridElement = gridRef.current;
    const pieceElement = pieceRef.current;
    const ghostElement = ghostRef.current;

    if (!gridElement || !pieceElement || !ghostElement) return;

    const { grid, activePiece, totalLinesCleared, clearingRows } =
      gameStateRef.current;
    const clearingRowSet = new Set(clearingRows);

    // 1. Paint placed pieces on the static grid
    for (let index = 0; index < ROWS * COLUMNS; index++) {
      const rowIndex = Math.floor(index / COLUMNS);
      const cellColor = grid[rowIndex][index % COLUMNS];
      const element = gridElement.children[index] as HTMLDivElement;
      if (!element) continue;

      if (clearingRowSet.has(rowIndex)) {
        element.style.backgroundColor = CLEAR_FLASH_COLOR;
        element.style.boxShadow = "0 0 8px rgba(255, 255, 255, 0.5)";
      } else if (cellColor) {
        element.style.backgroundColor = cellColor;
        element.style.boxShadow = `inset 0 0 ${CELL_SIZE / 2}px ${cellColor}40`;
      } else {
        element.style.backgroundColor = EMPTY_CELL_BG;
        element.style.boxShadow = "";
      }
    }

    // 2. Active piece overlay
    if (activePiece) {
      const shape = getShape(activePiece.type, activePiece.rotation);
      const color = getColor(activePiece.type);
      const offsets = getFilledCellOffsets(shape);
      const shapeKey = `${activePiece.type}-${activePiece.rotation}`;
      const isNewPiece = previousPieceTypeRef.current !== activePiece.type;

      // Disable transition for new piece spawn (instant jump to position)
      if (isNewPiece) {
        pieceElement.style.transition = "none";
        ghostElement.style.transition = "none";
        void pieceElement.offsetHeight; // Force reflow to commit
      }

      // Move the overlay container
      positionOverlay(
        pieceElement,
        activePiece.position.column,
        activePiece.position.row
      );
      pieceElement.style.opacity = "1";

      // Re-enable transition after new piece is positioned
      if (isNewPiece) {
        previousPieceTypeRef.current = activePiece.type;
        requestAnimationFrame(() => {
          if (pieceRef.current) {
            pieceRef.current.style.transition = `transform ${TRANSITION_DURATION} linear`;
          }
          if (ghostRef.current) {
            ghostRef.current.style.transition = `transform ${TRANSITION_DURATION} linear`;
          }
        });
      }

      // Update individual cell positions on shape change (rotation or new piece)
      if (shapeKey !== previousShapeKeyRef.current) {
        previousShapeKeyRef.current = shapeKey;
        paintOverlayCells(pieceElement, offsets, color, "40");
        paintOverlayCells(ghostElement, offsets, `${color}20`, "0");
      }

      // 3. Ghost piece (landing preview)
      const ghostRow = getDropRow(grid, shape, activePiece.position);

      if (ghostRow !== activePiece.position.row) {
        positionOverlay(ghostElement, activePiece.position.column, ghostRow);
        ghostElement.style.opacity = "1";
      } else {
        ghostElement.style.opacity = "0";
      }
    } else {
      pieceElement.style.opacity = "0";
      ghostElement.style.opacity = "0";
      previousPieceTypeRef.current = null;
      previousShapeKeyRef.current = "";
    }

    // 4. Lines counter
    if (linesRef.current) {
      if (totalLinesCleared > 0) {
        linesRef.current.textContent = `LINES ${totalLinesCleared}`;
        linesRef.current.style.display = "";
      } else {
        linesRef.current.style.display = "none";
      }
    }
  }, []);

  const tick = useCallback(() => {
    if (isSpawningRef.current || isClearingRef.current) return;

    const currentState = gameStateRef.current;

    // Phase 1: Full rows detected — flash then clear after delay
    if (currentState.clearingRows.length > 0) {
      isClearingRef.current = true;

      clearTimeoutRef.current = setTimeout(() => {
        const { grid: clearedGrid, linesCleared } = clearLines(
          gameStateRef.current.grid
        );
        gameStateRef.current = {
          ...gameStateRef.current,
          grid: clearedGrid,
          totalLinesCleared:
            gameStateRef.current.totalLinesCleared + linesCleared,
          clearingRows: [],
        };
        paintGrid();
        isClearingRef.current = false;
        clearTimeoutRef.current = null;
      }, CLEAR_DELAY_MS);

      return;
    }

    // Phase 2: Spawn new piece after delay
    if (!currentState.activePiece) {
      isSpawningRef.current = true;

      spawnTimeoutRef.current = setTimeout(() => {
        gameStateRef.current = advanceGameState(gameStateRef.current);
        paintGrid();
        isSpawningRef.current = false;
        spawnTimeoutRef.current = null;
      }, SPAWN_DELAY_MS);

      return;
    }

    // Phase 3: Advance active piece
    gameStateRef.current = advanceGameState(currentState);
    paintGrid();
  }, [paintGrid]);

  useEffect(() => {
    const interval = setInterval(tick, TICK_MS);

    return () => {
      clearInterval(interval);

      if (spawnTimeoutRef.current) {
        clearTimeout(spawnTimeoutRef.current);
      }

      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, [tick]);

  // --- Static elements (rendered once, updated via refs) ---

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${COLUMNS}, ${CELL_SIZE}px)`,
      gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
      gap: `${GAP}px`,
      backgroundColor: "rgba(26, 26, 46, 0.3)",
    }),
    []
  );

  const staticCells = useMemo(
    () =>
      Array.from({ length: ROWS * COLUMNS }, (_, index) => (
        <div key={index} style={{ backgroundColor: EMPTY_CELL_BG }} />
      )),
    []
  );

  const overlayCellStyle = useMemo(
    () => ({ width: CELL_SIZE, height: CELL_SIZE }),
    []
  );

  const ghostCells = useMemo(
    () =>
      Array.from({ length: CELLS_PER_PIECE }, (_, index) => (
        <div
          key={index}
          className="absolute"
          style={{ ...overlayCellStyle, display: "none" }}
        />
      )),
    [overlayCellStyle]
  );

  const pieceCells = useMemo(
    () =>
      Array.from({ length: CELLS_PER_PIECE }, (_, index) => (
        <div
          key={index}
          className="absolute"
          style={{ ...overlayCellStyle, display: "none" }}
        />
      )),
    [overlayCellStyle]
  );

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Wrapper clips overlays and holds border / rounded corners */}
      <div
        className="relative overflow-hidden rounded-lg border border-card-border/50"
        style={{
          width: GRID_WIDTH + BORDER * 2,
          height: GRID_HEIGHT + BORDER * 2,
        }}
      >
        {/* Static grid (placed pieces only) */}
        <div ref={gridRef} className="grid" style={gridStyle}>
          {staticCells}
        </div>

        {/* Ghost piece overlay */}
        <div
          ref={ghostRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            opacity: 0,
            willChange: "transform",
            transition: `transform ${TRANSITION_DURATION} linear`,
          }}
        >
          {ghostCells}
        </div>

        {/* Active piece overlay */}
        <div
          ref={pieceRef}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            opacity: 0,
            willChange: "transform",
            transition: `transform ${TRANSITION_DURATION} linear`,
          }}
        >
          {pieceCells}
        </div>
      </div>

      <p
        ref={linesRef}
        className="text-muted text-[10px] font-mono tracking-wider"
        style={{ display: "none" }}
      />
    </div>
  );
}
