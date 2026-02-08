import { type InputEvent } from "./types";

/**
 * Records key press/release events tagged with their simulation tick number.
 * The recorded log is sent to the server for replay verification.
 */
export class InputRecorder {
  private events: InputEvent[] = [];
  private currentTick = 0;
  private activeKeys = new Set<string>();

  /** The set of keys allowed to be recorded (game-relevant keys only). */
  private static readonly ALLOWED_KEYS = new Set([
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "a",
    "A",
    "d",
    "D",
    " ",
  ]);

  recordKeyDown(key: string): void {
    if (!InputRecorder.ALLOWED_KEYS.has(key)) return;
    if (this.activeKeys.has(key)) return; // Avoid duplicate down events from key repeat
    this.activeKeys.add(key);
    this.events.push({ tick: this.currentTick, key, pressed: true });
  }

  recordKeyUp(key: string): void {
    if (!InputRecorder.ALLOWED_KEYS.has(key)) return;
    if (!this.activeKeys.has(key)) return;
    this.activeKeys.delete(key);
    this.events.push({ tick: this.currentTick, key, pressed: false });
  }

  advanceTick(): void {
    this.currentTick++;
  }

  getCurrentTick(): number {
    return this.currentTick;
  }

  getActiveKeys(): ReadonlySet<string> {
    return this.activeKeys;
  }

  getRecordedEvents(): InputEvent[] {
    return [...this.events];
  }

  reset(): void {
    this.events = [];
    this.currentTick = 0;
    this.activeKeys.clear();
  }
}
