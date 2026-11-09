#include "dcf.h"

#include <stdint.h>
#include <stdio.h>

/* Check-then-act withdraw race.
 * balance starts at 100; each thread withdraws 75 if balance >= 75.
 * Safe locked behavior: exactly one withdraw succeeds → balance 25.
 * Racy interleaving: both pass the check → balance -50.
 */

typedef struct {
  int balance;
} bank_t;

static bank_t BANK;
static int can_go[DCF_MAX_THREADS];

static int withdraw_step(dcf_thread_t *self) {
  int id = (int)(intptr_t)self->env;
  switch (self->pc) {
  case 0: /* CHECK (yield window opens after this) */
    can_go[id] = (BANK.balance >= 75);
    self->pc = 1;
    return 1;
  case 1: /* ACT */
    if (can_go[id]) BANK.balance -= 75;
    self->done = 1;
    if (BANK.balance < 0) {
      char msg[160];
      snprintf(msg, sizeof(msg),
               "balance=%d after racy withdraws (expected >= 0; safe end-state is 25)",
               BANK.balance);
      dcf_bug(msg);
    }
    return 1;
  default:
    self->done = 1;
    return 0;
  }
}

static void setup_bank_race(void) {
  BANK.balance = 100;
  can_go[0] = can_go[1] = 0;
  dcf_add_thread("A", withdraw_step, (void *)(intptr_t)0);
  dcf_add_thread("B", withdraw_step, (void *)(intptr_t)1);
}

__attribute__((constructor)) static void reg_bank(void) {
  dcf_register_example("bank_race", setup_bank_race);
}
