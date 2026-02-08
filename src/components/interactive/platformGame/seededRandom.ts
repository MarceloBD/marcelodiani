/**
 * Mulberry32 seeded PRNG.
 * Produces deterministic pseudo-random floats in [0, 1) given a numeric seed.
 * Identical seeds guarantee identical sequences across all JS engines
 * (relies only on IEEE 754 double arithmetic and 32-bit integer ops).
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed | 0;

  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let intermediate = Math.imul(state ^ (state >>> 15), 1 | state);
    intermediate =
      (intermediate + Math.imul(intermediate ^ (intermediate >>> 7), 61 | intermediate)) ^ intermediate;
    return ((intermediate ^ (intermediate >>> 14)) >>> 0) / 4294967296;
  };
}
