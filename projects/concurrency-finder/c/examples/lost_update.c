#include "dcf.h"

#include <stdint.h>
#include <stdio.h>

/* Two threads: tmp=counter; tmp++; counter=tmp;
 * A lost update leaves final counter == 1 instead of 2.
 */

static int COUNTER;
static int tmp_slot[DCF_MAX_THREADS];
static int stores_done;

static int incr_step(dcf_thread_t *self) {
  int id = (int)(intptr_t)self->env;
  switch (self->pc) {
  case 0: /* load */
    tmp_slot[id] = COUNTER;
    self->pc = 1;
    return 1;
  case 1: /* local incr */
    tmp_slot[id] += 1;
    self->pc = 2;
    return 1;
  case 2: /* store */
    COUNTER = tmp_slot[id];
    stores_done++;
    self->done = 1;
    if (stores_done == 2 && COUNTER != 2) {
      char msg[128];
      snprintf(msg, sizeof(msg), "lost update: counter=%d (expected 2)", COUNTER);
      dcf_bug(msg);
    }
    return 1;
  default:
    self->done = 1;
    return 0;
  }
}

static void setup_lost_update(void) {
  COUNTER = 0;
  stores_done = 0;
  tmp_slot[0] = tmp_slot[1] = 0;
  dcf_add_thread("T0", incr_step, (void *)(intptr_t)0);
  dcf_add_thread("T1", incr_step, (void *)(intptr_t)1);
}

__attribute__((constructor)) static void reg_lost(void) {
  dcf_register_example("lost_update", setup_lost_update);
}
