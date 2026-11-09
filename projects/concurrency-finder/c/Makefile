CC ?= gcc
CFLAGS ?= -O2 -Wall -Wextra -std=c11 -D_POSIX_C_SOURCE=200809L -Iinclude
LDFLAGS ?=

SRC = src/rng.c src/scheduler.c src/cli.c examples/bank_race.c examples/lost_update.c
BIN = dcf

.PHONY: all clean test

all: $(BIN)

$(BIN): $(SRC) include/dcf.h
	$(CC) $(CFLAGS) -o $@ $(SRC) $(LDFLAGS)

clean:
	rm -f $(BIN)

test: $(BIN)
	./$(BIN) list
	./$(BIN) run --example bank_race --seed 16 --shrink; test $$? -le 1
	./$(BIN) run --example lost_update --seed 3 --shrink; test $$? -le 1
	./$(BIN) bench --example bank_race --trials 100 --seed 1
	./$(BIN) replay --example bank_race --seed 16 --schedule 0,1,0,1; test $$? -eq 1
