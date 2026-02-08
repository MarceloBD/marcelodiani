import { CircuitState } from "@/enums/circuitState";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CircuitBreakerOptions {
  /** Number of consecutive failures before the circuit opens */
  failureThreshold: number;
  /** Milliseconds to wait before transitioning from OPEN to HALF_OPEN */
  resetTimeoutMs: number;
  /** Number of successes in HALF_OPEN needed to close the circuit (default: 1) */
  successThreshold?: number;
}

export interface CircuitBreakerStatus {
  service: string;
  state: CircuitState;
  failureCount: number;
  lastFailureTime: string | null;
}

// ---------------------------------------------------------------------------
// Error thrown when circuit is open
// ---------------------------------------------------------------------------

export class CircuitOpenError extends Error {
  constructor(public readonly serviceName: string) {
    super(`Service "${serviceName}" is temporarily unavailable (circuit breaker open)`);
    this.name = "CircuitOpenError";
  }
}

// ---------------------------------------------------------------------------
// CircuitBreaker
// ---------------------------------------------------------------------------

export class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly successThreshold: number;

  constructor(
    private readonly serviceName: string,
    private readonly options: CircuitBreakerOptions,
  ) {
    this.successThreshold = options.successThreshold ?? 1;
  }

  // -------------------------------------------------------------------------
  // Public API: manual control (for streaming / non-awaitable operations)
  // -------------------------------------------------------------------------

  /**
   * Check if the circuit allows requests through.
   * Also handles the OPEN → HALF_OPEN transition when the cooldown has elapsed.
   */
  isAvailable(): boolean {
    if (this.state === CircuitState.CLOSED) return true;
    if (this.state === CircuitState.HALF_OPEN) return true;

    // OPEN — check if cooldown has elapsed
    const timeSinceLastFailure = Date.now() - this.lastFailureTime;

    if (timeSinceLastFailure >= this.options.resetTimeoutMs) {
      this.transitionTo(CircuitState.HALF_OPEN);
      return true;
    }

    return false;
  }

  /** Record a successful operation */
  onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }

      return;
    }

    // CLOSED state — reset failure counter on success
    this.failureCount = 0;
  }

  /** Record a failed operation */
  onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Any failure in HALF_OPEN immediately re-opens the circuit
      this.transitionTo(CircuitState.OPEN);
      return;
    }

    if (this.failureCount >= this.options.failureThreshold) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  // -------------------------------------------------------------------------
  // Public API: convenience wrapper for simple async operations
  // -------------------------------------------------------------------------

  /**
   * Execute an async operation through the circuit breaker.
   * Throws `CircuitOpenError` if the circuit is open.
   * Automatically records success/failure.
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (!this.isAvailable()) {
      throw new CircuitOpenError(this.serviceName);
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Status
  // -------------------------------------------------------------------------

  getStatus(): CircuitBreakerStatus {
    return {
      service: this.serviceName,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
        ? new Date(this.lastFailureTime).toISOString()
        : null,
    };
  }

  // -------------------------------------------------------------------------
  // Internal
  // -------------------------------------------------------------------------

  private transitionTo(newState: CircuitState): void {
    const previousState = this.state;
    this.state = newState;

    if (newState === CircuitState.OPEN) {
      this.successCount = 0;
      logger.error(
        "circuit-breaker",
        `Circuit OPENED for "${this.serviceName}" after ${this.failureCount} consecutive failures`,
        { metadata: { service: this.serviceName, previousState, failureCount: this.failureCount } },
      );
      return;
    }

    if (newState === CircuitState.HALF_OPEN) {
      this.successCount = 0;
      logger.info(
        "circuit-breaker",
        `Circuit HALF-OPEN for "${this.serviceName}" — testing recovery`,
        { metadata: { service: this.serviceName, previousState } },
      );
      return;
    }

    // CLOSED
    this.failureCount = 0;
    this.successCount = 0;
    logger.info(
      "circuit-breaker",
      `Circuit CLOSED for "${this.serviceName}" — service recovered`,
      { metadata: { service: this.serviceName, previousState } },
    );
  }
}

// ---------------------------------------------------------------------------
// Service registry — one circuit breaker per external service
// ---------------------------------------------------------------------------

export const serviceBreakers = {
  openai: new CircuitBreaker("openai", {
    failureThreshold: 3,
    resetTimeoutMs: 60_000, // 1 minute cooldown
  }),

  piston: new CircuitBreaker("piston", {
    failureThreshold: 3,
    resetTimeoutMs: 30_000, // 30 seconds cooldown
  }),

  e2b: new CircuitBreaker("e2b", {
    failureThreshold: 3,
    resetTimeoutMs: 60_000, // 1 minute cooldown
  }),

  resend: new CircuitBreaker("resend", {
    failureThreshold: 5,
    resetTimeoutMs: 120_000, // 2 minutes cooldown
  }),
};

// ---------------------------------------------------------------------------
// Utility: get all statuses at once
// ---------------------------------------------------------------------------

export function getAllCircuitBreakerStatuses(): CircuitBreakerStatus[] {
  return Object.values(serviceBreakers).map((breaker) => breaker.getStatus());
}
