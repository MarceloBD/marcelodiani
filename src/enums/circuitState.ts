export enum CircuitState {
  /** Normal operation — requests pass through */
  CLOSED = "closed",
  /** Service is down — requests are rejected immediately */
  OPEN = "open",
  /** Testing recovery — a single request is allowed through */
  HALF_OPEN = "half_open",
}
