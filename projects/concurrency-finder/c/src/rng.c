#include <stdint.h>

/* xorshift64* — fast deterministic PRNG */
uint64_t dcf_rng_next(uint64_t *state) {
  uint64_t x = *state;
  if (x == 0) x = 0x9e3779b97f4a7c15ULL;
  x ^= x >> 12;
  x ^= x << 25;
  x ^= x >> 27;
  *state = x;
  return x * 0x2545F4914F6CDD1DULL;
}

int dcf_rng_pick(uint64_t *state, int n) {
  if (n <= 1) return 0;
  return (int)(dcf_rng_next(state) % (uint64_t)n);
}
