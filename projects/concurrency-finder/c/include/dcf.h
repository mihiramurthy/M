#ifndef DCF_H
#define DCF_H

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#define DCF_MAX_THREADS 8
#define DCF_MAX_SCHEDULE 512

typedef void (*dcf_example_fn)(void);

typedef struct {
  int max_steps;
  int explore; /* 0 seed-random, 1 explore/RR diversify */
  const char *bug_label;
} dcf_config_t;

typedef struct {
  int ok;
  char bug[128];
  uint64_t seed;
  int schedule_len;
  int schedule[DCF_MAX_SCHEDULE];
  int minimal_len;
  int minimal[DCF_MAX_SCHEDULE];
  char message[256];
  char schedule_str[512];
} dcf_result_t;

typedef struct {
  int trials;
  int bugs_found;
  int first_bug_trial;
  double elapsed_ms;
  uint64_t first_bug_seed;
  int first_bug_raw_len;
  int first_bug_shrunk_len;
} dcf_bench_stats_t;

/* Thread step API used by examples */
typedef struct dcf_thread dcf_thread_t;
struct dcf_thread {
  char name[32];
  int pc;     /* program counter / step index */
  int done;
  void *env;  /* example-private state */
  int (*step)(dcf_thread_t *self); /* return 1 if progressed, 0 if blocked/done */
};

void dcf_init(const dcf_config_t *cfg);
void dcf_reset(uint64_t seed);
dcf_thread_t *dcf_add_thread(const char *name, int (*step)(dcf_thread_t *), void *env);
void dcf_start(void);
void dcf_bug(const char *msg);
uint64_t dcf_current_seed(void);
void dcf_get_result(dcf_result_t *out);

void dcf_set_current_example(dcf_example_fn fn);
void dcf_register_example(const char *name, dcf_example_fn setup);
dcf_example_fn dcf_find_example(const char *name);
void dcf_list_examples(char *buf, size_t n);

int dcf_replay(const int *sched, int len, uint64_t seed);
int dcf_shrink(const int *sched, int len, uint64_t seed, int *out, int *out_len);
void dcf_bench_random(int trials, int max_steps, uint64_t base_seed, dcf_bench_stats_t *out);
void dcf_bench_explore(int trials, int max_steps, uint64_t base_seed, dcf_bench_stats_t *out);

void dcf_result_to_json(const dcf_result_t *r, char *buf, size_t n);
void dcf_bench_to_json(const char *mode, const dcf_bench_stats_t *s, char *buf, size_t n);

#ifdef __cplusplus
}
#endif

#endif
