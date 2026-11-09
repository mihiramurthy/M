#define _POSIX_C_SOURCE 200809L
#include "dcf.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

extern uint64_t dcf_rng_next(uint64_t *state);
extern int dcf_rng_pick(uint64_t *state, int n);

static struct {
  dcf_config_t cfg;
  uint64_t seed;
  uint64_t rng;
  dcf_thread_t threads[DCF_MAX_THREADS];
  int n;
  int schedule[DCF_MAX_SCHEDULE];
  int sched_len;
  int bug_hit;
  char bug_msg[256];
  int replay_mode;
  const int *replay;
  int replay_len;
  int replay_pos;
  int explore_off;
  dcf_example_fn example;
} G;

typedef struct {
  char name[64];
  dcf_example_fn fn;
} ex_t;
static ex_t EX[32];
static int NEX;

void dcf_register_example(const char *name, dcf_example_fn setup) {
  if (NEX >= 32) return;
  snprintf(EX[NEX].name, sizeof(EX[NEX].name), "%s", name);
  EX[NEX].fn = setup;
  NEX++;
}

dcf_example_fn dcf_find_example(const char *name) {
  for (int i = 0; i < NEX; i++)
    if (strcmp(EX[i].name, name) == 0) return EX[i].fn;
  return NULL;
}

void dcf_list_examples(char *buf, size_t n) {
  size_t off = 0;
  buf[0] = 0;
  for (int i = 0; i < NEX; i++) {
    int w = snprintf(buf + off, n > off ? n - off : 0, "%s%s", i ? "," : "", EX[i].name);
    if (w > 0) off += (size_t)w;
  }
}

void dcf_set_current_example(dcf_example_fn fn) { G.example = fn; }

void dcf_init(const dcf_config_t *cfg) {
  dcf_example_fn ex = G.example;
  memset(&G, 0, sizeof(G));
  G.example = ex;
  if (cfg) G.cfg = *cfg;
  if (G.cfg.max_steps <= 0) G.cfg.max_steps = 64;
}

void dcf_reset(uint64_t seed) {
  dcf_example_fn ex = G.example;
  dcf_config_t cfg = G.cfg;
  memset(&G, 0, sizeof(G));
  G.example = ex;
  G.cfg = cfg;
  if (G.cfg.max_steps <= 0) G.cfg.max_steps = 64;
  G.seed = seed ? seed : 1;
  G.rng = G.seed;
}

dcf_thread_t *dcf_add_thread(const char *name, int (*step)(dcf_thread_t *), void *env) {
  if (G.n >= DCF_MAX_THREADS) return NULL;
  dcf_thread_t *t = &G.threads[G.n++];
  memset(t, 0, sizeof(*t));
  snprintf(t->name, sizeof(t->name), "%s", name ? name : "t");
  t->step = step;
  t->env = env;
  t->pc = 0;
  return t;
}

void dcf_bug(const char *msg) {
  if (!G.bug_hit) {
    G.bug_hit = 1;
    snprintf(G.bug_msg, sizeof(G.bug_msg), "%s", msg ? msg : "concurrency bug");
  }
}

uint64_t dcf_current_seed(void) { return G.seed; }

static int collect_ready(int *ready) {
  int n = 0;
  for (int i = 0; i < G.n; i++) {
    if (!G.threads[i].done) ready[n++] = i;
  }
  return n;
}

static int pick(int *ready, int nready) {
  if (nready <= 0) return -1;
  if (G.replay_mode) {
    while (G.replay_pos < G.replay_len) {
      int want = G.replay[G.replay_pos++];
      for (int i = 0; i < nready; i++)
        if (ready[i] == want) return want;
      /* requested thread not ready — skip and try next choice */
    }
    /* After guided prefix: deterministic lowest-id policy (for shrink). */
    return ready[0];
  }
  if (G.cfg.explore) return ready[(G.explore_off++) % nready];
  return ready[dcf_rng_pick(&G.rng, nready)];
}

void dcf_start(void) {
  G.sched_len = 0;
  G.bug_hit = 0;
  G.bug_msg[0] = 0;

  int steps = 0;
  while (!G.bug_hit && steps < G.cfg.max_steps) {
    int ready[DCF_MAX_THREADS];
    int nready = collect_ready(ready);
    if (nready == 0) break;
    int next = pick(ready, nready);
    if (next < 0) break;
    if (G.sched_len < DCF_MAX_SCHEDULE) G.schedule[G.sched_len++] = next;
    dcf_thread_t *t = &G.threads[next];
    int progressed = t->step(t);
    if (!progressed) t->done = 1;
    steps++;
  }
}

static void format_sched(const int *s, int n, char *buf, size_t cap) {
  size_t off = 0;
  buf[0] = 0;
  for (int i = 0; i < n && off + 8 < cap; i++) {
    const char *name = (s[i] >= 0 && s[i] < G.n) ? G.threads[s[i]].name : "?";
    int w = snprintf(buf + off, cap - off, "%s%s", i ? " → " : "", name);
    if (w > 0) off += (size_t)w;
  }
}

void dcf_get_result(dcf_result_t *out) {
  memset(out, 0, sizeof(*out));
  out->ok = !G.bug_hit;
  out->seed = G.seed;
  out->schedule_len = G.sched_len;
  memcpy(out->schedule, G.schedule, sizeof(int) * (size_t)G.sched_len);
  format_sched(G.schedule, G.sched_len, out->schedule_str, sizeof(out->schedule_str));
  if (G.bug_hit) {
    snprintf(out->bug, sizeof(out->bug), "%s",
             G.cfg.bug_label ? G.cfg.bug_label : "bug");
    snprintf(out->message, sizeof(out->message), "%s", G.bug_msg);
  } else {
    snprintf(out->message, sizeof(out->message), "no bug within step budget");
  }
}

static int run_once(uint64_t seed, const int *sched, int len, int explore, int explore_off) {
  if (!G.example) return 0;
  dcf_example_fn ex = G.example;
  dcf_config_t cfg = G.cfg;
  cfg.explore = explore;
  dcf_init(&cfg);
  G.example = ex;
  dcf_reset(seed);
  G.example = ex;
  G.cfg.explore = explore;
  G.explore_off = explore_off;
  if (sched && len > 0) {
    G.replay_mode = 1;
    G.replay = sched;
    G.replay_len = len;
    G.replay_pos = 0;
  }
  ex();
  dcf_start();
  return G.bug_hit;
}

int dcf_replay(const int *sched, int len, uint64_t seed) {
  return run_once(seed, sched, len, 0, 0);
}

int dcf_shrink(const int *sched, int len, uint64_t seed, int *out, int *out_len) {
  if (!sched || len <= 0) {
    *out_len = 0;
    return 0;
  }
  int *cur = (int *)malloc(sizeof(int) * (size_t)len);
  memcpy(cur, sched, sizeof(int) * (size_t)len);
  int cur_len = len;
  int progress = 1;
  while (progress && cur_len > 1) {
    progress = 0;
    for (int i = 0; i < cur_len; i++) {
      int nlen = 0;
      int *cand = (int *)malloc(sizeof(int) * (size_t)cur_len);
      for (int j = 0; j < cur_len; j++) {
        if (j == i) continue;
        cand[nlen++] = cur[j];
      }
      if (nlen > 0 && run_once(seed, cand, nlen, 0, 0)) {
        free(cur);
        cur = cand;
        cur_len = nlen;
        progress = 1;
        break;
      }
      free(cand);
    }
  }
  /* Re-run minimal choice prefix and capture the concrete full schedule. */
  run_once(seed, cur, cur_len, 0, 0);
  memcpy(out, G.schedule, sizeof(int) * (size_t)G.sched_len);
  *out_len = G.sched_len;
  free(cur);
  return 1;
}

void dcf_bench_random(int trials, int max_steps, uint64_t base_seed, dcf_bench_stats_t *out) {
  memset(out, 0, sizeof(*out));
  out->trials = trials;
  dcf_example_fn ex = G.example;
  struct timespec t0, t1;
  clock_gettime(CLOCK_MONOTONIC, &t0);
  for (int i = 0; i < trials; i++) {
    uint64_t seed = base_seed + (uint64_t)i * 2654435761ULL;
    dcf_config_t cfg = {.max_steps = max_steps, .explore = 0, .bug_label = G.cfg.bug_label};
    dcf_init(&cfg);
    G.example = ex;
    if (!run_once(seed, NULL, 0, 0, 0)) continue;
    out->bugs_found++;
    if (!out->first_bug_trial) {
      out->first_bug_trial = i + 1;
      out->first_bug_seed = seed;
      dcf_result_t r;
      dcf_get_result(&r);
      out->first_bug_raw_len = r.schedule_len;
      int mini[DCF_MAX_SCHEDULE];
      int mlen = 0;
      G.example = ex;
      dcf_shrink(r.schedule, r.schedule_len, seed, mini, &mlen);
      out->first_bug_shrunk_len = mlen;
    }
  }
  clock_gettime(CLOCK_MONOTONIC, &t1);
  out->elapsed_ms = (t1.tv_sec - t0.tv_sec) * 1000.0 + (t1.tv_nsec - t0.tv_nsec) / 1e6;
  G.example = ex;
}

void dcf_bench_explore(int trials, int max_steps, uint64_t base_seed, dcf_bench_stats_t *out) {
  memset(out, 0, sizeof(*out));
  out->trials = trials;
  dcf_example_fn ex = G.example;
  struct timespec t0, t1;
  clock_gettime(CLOCK_MONOTONIC, &t0);
  for (int i = 0; i < trials; i++) {
    uint64_t seed = base_seed + (uint64_t)i;
    dcf_config_t cfg = {.max_steps = max_steps, .explore = 1, .bug_label = G.cfg.bug_label};
    dcf_init(&cfg);
    G.example = ex;
    if (!run_once(seed, NULL, 0, 1, i)) continue;
    out->bugs_found++;
    if (!out->first_bug_trial) {
      out->first_bug_trial = i + 1;
      out->first_bug_seed = seed;
      dcf_result_t r;
      dcf_get_result(&r);
      out->first_bug_raw_len = r.schedule_len;
      int mini[DCF_MAX_SCHEDULE];
      int mlen = 0;
      G.example = ex;
      dcf_shrink(r.schedule, r.schedule_len, seed, mini, &mlen);
      out->first_bug_shrunk_len = mlen;
    }
  }
  clock_gettime(CLOCK_MONOTONIC, &t1);
  out->elapsed_ms = (t1.tv_sec - t0.tv_sec) * 1000.0 + (t1.tv_nsec - t0.tv_nsec) / 1e6;
  G.example = ex;
}

static void json_escape(const char *s, char *out, size_t n) {
  size_t o = 0;
  for (const char *p = s; *p && o + 2 < n; p++) {
    if (*p == '"' || *p == '\\') out[o++] = '\\';
    out[o++] = *p;
  }
  out[o] = 0;
}

void dcf_result_to_json(const dcf_result_t *r, char *buf, size_t n) {
  char bug[256], msg[512], sched[512];
  json_escape(r->bug, bug, sizeof(bug));
  json_escape(r->message, msg, sizeof(msg));
  json_escape(r->schedule_str, sched, sizeof(sched));
  size_t off = 0;
  off += (size_t)snprintf(buf + off, n - off,
                          "{\"ok\":%s,\"seed\":%llu,\"bug\":%s%s%s,\"message\":\"%s\","
                          "\"scheduleLen\":%d,\"scheduleStr\":\"%s\",\"schedule\":[",
                          r->ok ? "true" : "false", (unsigned long long)r->seed,
                          r->ok ? "null" : "\"", r->ok ? "" : bug, r->ok ? "" : "\"", msg,
                          r->schedule_len, sched);
  for (int i = 0; i < r->schedule_len && off + 8 < n; i++)
    off += (size_t)snprintf(buf + off, n - off, "%s%d", i ? "," : "", r->schedule[i]);
  off += (size_t)snprintf(buf + off, n - off, "]");
  if (r->minimal_len > 0) {
    off += (size_t)snprintf(buf + off, n - off, ",\"minimalLen\":%d,\"minimal\":[", r->minimal_len);
    for (int i = 0; i < r->minimal_len && off + 8 < n; i++)
      off += (size_t)snprintf(buf + off, n - off, "%s%d", i ? "," : "", r->minimal[i]);
    off += (size_t)snprintf(buf + off, n - off, "]");
  }
  snprintf(buf + off, n > off ? n - off : 0, "}");
}

void dcf_bench_to_json(const char *mode, const dcf_bench_stats_t *s, char *buf, size_t n) {
  snprintf(buf, n,
           "{\"mode\":\"%s\",\"trials\":%d,\"bugsFound\":%d,\"firstBugTrial\":%d,"
           "\"elapsedMs\":%.3f,\"firstBugSeed\":%llu,\"rawScheduleLen\":%d,"
           "\"shrunkScheduleLen\":%d,\"bugsPerSecond\":%.2f}",
           mode, s->trials, s->bugs_found, s->first_bug_trial, s->elapsed_ms,
           (unsigned long long)s->first_bug_seed, s->first_bug_raw_len,
           s->first_bug_shrunk_len,
           s->elapsed_ms > 0 ? (s->bugs_found * 1000.0 / s->elapsed_ms) : 0.0);
}
