#include "dcf.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void usage(const char *argv0) {
  fprintf(stderr,
          "Usage:\n"
          "  %s run --example NAME [--seed N] [--steps N] [--explore] [--shrink]\n"
          "  %s bench --example NAME [--trials N] [--steps N] [--seed N]\n"
          "  %s list\n"
          "  %s replay --example NAME --seed N --schedule 0,1,0,...\n",
          argv0, argv0, argv0, argv0);
}

static int parse_schedule(const char *s, int *out, int max) {
  int n = 0;
  const char *p = s;
  while (*p && n < max) {
    out[n++] = (int)strtol(p, (char **)&p, 10);
    if (*p == ',') p++;
  }
  return n;
}

static int cmd_run(int argc, char **argv) {
  const char *ex = "bank_race";
  uint64_t seed = 42;
  int steps = 32;
  int explore = 0;
  int do_shrink = 0;
  for (int i = 0; i < argc; i++) {
    if (!strcmp(argv[i], "--example") && i + 1 < argc) ex = argv[++i];
    else if (!strcmp(argv[i], "--seed") && i + 1 < argc) seed = strtoull(argv[++i], NULL, 10);
    else if (!strcmp(argv[i], "--steps") && i + 1 < argc) steps = atoi(argv[++i]);
    else if (!strcmp(argv[i], "--explore")) explore = 1;
    else if (!strcmp(argv[i], "--shrink")) do_shrink = 1;
  }
  dcf_example_fn fn = dcf_find_example(ex);
  if (!fn) {
    fprintf(stderr, "{\"error\":\"unknown example\",\"example\":\"%s\"}\n", ex);
    return 2;
  }
  dcf_config_t cfg = {.max_steps = steps, .explore = explore, .bug_label = ex};
  dcf_init(&cfg);
  dcf_set_current_example(fn);
  dcf_reset(seed);
  dcf_set_current_example(fn);
  fn();
  dcf_start();
  dcf_result_t r;
  dcf_get_result(&r);
  if (!r.ok && do_shrink) {
    dcf_set_current_example(fn);
    dcf_shrink(r.schedule, r.schedule_len, seed, r.minimal, &r.minimal_len);
  }
  char buf[8192];
  dcf_result_to_json(&r, buf, sizeof(buf));
  puts(buf);
  return r.ok ? 0 : 1;
}

static int cmd_bench(int argc, char **argv) {
  const char *ex = "bank_race";
  int trials = 200;
  int steps = 32;
  uint64_t seed = 1;
  for (int i = 0; i < argc; i++) {
    if (!strcmp(argv[i], "--example") && i + 1 < argc) ex = argv[++i];
    else if (!strcmp(argv[i], "--trials") && i + 1 < argc) trials = atoi(argv[++i]);
    else if (!strcmp(argv[i], "--steps") && i + 1 < argc) steps = atoi(argv[++i]);
    else if (!strcmp(argv[i], "--seed") && i + 1 < argc) seed = strtoull(argv[++i], NULL, 10);
  }
  dcf_example_fn fn = dcf_find_example(ex);
  if (!fn) {
    fprintf(stderr, "{\"error\":\"unknown example\"}\n");
    return 2;
  }
  dcf_config_t cfg = {.max_steps = steps, .explore = 0, .bug_label = ex};
  dcf_init(&cfg);
  dcf_set_current_example(fn);

  dcf_bench_stats_t rnd, exp;
  dcf_bench_random(trials, steps, seed, &rnd);
  dcf_set_current_example(fn);
  dcf_bench_explore(trials, steps, seed, &exp);

  char a[1024], b[1024];
  dcf_bench_to_json("random_stress", &rnd, a, sizeof(a));
  dcf_bench_to_json("controlled_explore", &exp, b, sizeof(b));
  printf("{\"example\":\"%s\",\"trials\":%d,\"steps\":%d,\"random\":%s,\"explore\":%s,"
         "\"summary\":\"controlled explore found bug on trial %d vs random trial %d; "
         "shrink %d→%d steps\"}\n",
         ex, trials, steps, a, b, exp.first_bug_trial, rnd.first_bug_trial,
         exp.first_bug_raw_len ? exp.first_bug_raw_len : rnd.first_bug_raw_len,
         exp.first_bug_shrunk_len ? exp.first_bug_shrunk_len : rnd.first_bug_shrunk_len);
  return 0;
}

static int cmd_replay(int argc, char **argv) {
  const char *ex = "bank_race";
  uint64_t seed = 42;
  const char *sched_s = NULL;
  for (int i = 0; i < argc; i++) {
    if (!strcmp(argv[i], "--example") && i + 1 < argc) ex = argv[++i];
    else if (!strcmp(argv[i], "--seed") && i + 1 < argc) seed = strtoull(argv[++i], NULL, 10);
    else if (!strcmp(argv[i], "--schedule") && i + 1 < argc) sched_s = argv[++i];
  }
  if (!sched_s) {
    usage("dcf");
    return 2;
  }
  dcf_example_fn fn = dcf_find_example(ex);
  if (!fn) return 2;
  int sched[DCF_MAX_SCHEDULE];
  int len = parse_schedule(sched_s, sched, DCF_MAX_SCHEDULE);
  dcf_config_t cfg = {.max_steps = 64, .explore = 0, .bug_label = ex};
  dcf_init(&cfg);
  dcf_set_current_example(fn);
  int hit = dcf_replay(sched, len, seed);
  dcf_result_t r;
  dcf_get_result(&r);
  r.ok = !hit;
  char buf[4096];
  dcf_result_to_json(&r, buf, sizeof(buf));
  puts(buf);
  return hit ? 1 : 0;
}

int main(int argc, char **argv) {
  if (argc < 2) {
    usage(argv[0]);
    return 2;
  }
  if (!strcmp(argv[1], "list")) {
    char buf[256];
    dcf_list_examples(buf, sizeof(buf));
    printf("{\"examples\":[");
    /* print as JSON array */
    char *p = buf;
    int first = 1;
    while (*p) {
      char *c = strchr(p, ',');
      if (c) *c = 0;
      printf("%s\"%s\"", first ? "" : ",", p);
      first = 0;
      if (!c) break;
      p = c + 1;
    }
    printf("]}\n");
    return 0;
  }
  if (!strcmp(argv[1], "run")) return cmd_run(argc - 2, argv + 2);
  if (!strcmp(argv[1], "bench")) return cmd_bench(argc - 2, argv + 2);
  if (!strcmp(argv[1], "replay")) return cmd_replay(argc - 2, argv + 2);
  usage(argv[0]);
  return 2;
}
