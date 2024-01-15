---
title: Jemalloc Profiling for ClickHouse
description: "How to use Jemalloc for memory profiling."
date: 2024-01-15
---

ClickHouse uses [jemalloc](https://github.com/jemalloc/jemalloc) as its global allocator which comes with some tools for heap profiling. Everything described can be applied to ClickHouse Keeper without any changes.

# Necessary tools
For analyzing heap profiles we will need jemalloc’s tool called [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in). There are multiple ways for installing the tool:
- Installing jemalloc using package manager
- Cloning jemalloc [repo](https://github.com/jemalloc/jemalloc) and running autogen.sh from the root folder, this will provide you with jeprof script inside the bin folder

Jeprof uses addr2line to generate stacktraces which can be really slow. If that’s the case, we recommend installing an [alternative implementation](https://github.com/gimli-rs/addr2line) of the tool:

```bash
git clone https://github.com/gimli-rs/addr2line
cd addr2line
cargo b --examples -r
cp ./target/release/examples/addr2line <your-path>
```

We will also use [FlameGraph](https://github.com/brendangregg/FlameGraph) which can be simple cloned to generate flamegraphs after generating collapsed stacks.

# Generating heap profiles

For jemalloc to generate heap profiles, we need to start ClickHouse with specific environment variable set.

```bash
MALLOC_CONF=background_thread:true,prof_final:true,lg_prof_interval:40,prof:true,prof_prefix:/jeprof.out
```

- `background_thread:true`
  - Run workers in a background thread, this is necessary to avoid deadlock.
- `prof:true`
  - Enable jemalloc profiler.
- `prof_prefix:jeprof.out`
  - Which path to use for generating heap dumps.
  - Each new heap dump will append to the defined name PID and sequence number so a unique file will always be generated.
  - It’s possible to define absolute path (e.g. /data/jeprof.out) otherwise the file will be relative to the binary.
- `prof_final:true`
  - Generate a final heap dump after ClickHouse shutdown.
- `lg_prof_interval:40`
  - After how many bytes (log base 2) of allocated memory should a heap profile be generated.
  - This setting heavily depends on the allocation pattern for a specific ClickHouse instance. If the value is too small many files will be generated, if it’s too high, files will be rarely generated.
  - When tuning this settings it’s important to remember that it’s log2 so it’s recommended to increase/decrease the number by small amounts.

Complete reference of the setting can be found here https://jemalloc.net/jemalloc.3.html

# Analyzing heap profiles

After some heap profiles are generated we can analyze them using jeprof.
Basic usage of jeprof can be checked using:

```bash
jeprof --help
```

In general, jeprof command will look like this:

```bash
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

If we want to compare which allocations happened between 2 profiles we can set the base argument:

```bash
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

## Some examples for generating and analyzing results

Generate a text file with each procedure written per line:
```bash
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

Generate a pdf file with call-graph:
```bash
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

Generate collapsed stacks:

```bash
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

We can load the collapsed stacks in the https://www.speedscope.app/ and use different views to analyze the collected stacks.

We can also use the FlameGraph tool to generate a flamegraph using result.collapsed:

```bash
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="malloc() Flame Graph" --width 2400 > result.svg
```

# Future improvements

A few `SYSTEM` commands for easier jemalloc profiling was added as part of the following [PR](https://github.com/ClickHouse/ClickHouse/pull/58665).

Following jemalloc configuration will be enough to run with ClickHouse:

```bash
MALLOC_CONF=background_thread:true,prof_final:true,prof:true
```

The following `SYSTEM` commands can be used:

- `SYSTEM JEMALLOC FLUSH PROFILE`
  - Generate a heap profile file, removing the need to rely on periodic heap profile dumps.
- `SYSTEM JEMALLOC ENABLE/DISABLE PROFILE`
  - If ClickHouse is run with enabled jemalloc profile, sampling can be paused and resumed without restarting by using this command. This allows you to sample only specific time points.

For Keeper, equivalent 4LW commands were introduced:
- `jmfp` - flush jemalloc profile
- `jmep/jmdp` - enable/disable jemalloc profile sampling
- `jmst` - dump current jemalloc stats

# Memory metrics

ClickHouse servers periodically asks jemalloc for metrics and puts them to an internal system.table:

```
SELECT *
FROM system.asynchronous_metrics
WHERE metric ILIKE '%jemalloc%'
FORMAT Vertical

Query id: 6dcdee08-d3f5-4aa4-a008-f69e18a1ec91

Row 1:
──────
metric:      jemalloc.background_thread.num_threads
value:       0
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 2:
──────
metric:      jemalloc.epoch
value:       171
description: An internal incremental update number of the statistics of jemalloc (Jason Evans' memory allocator), used in all other `jemalloc` metrics.

Row 3:
──────
metric:      jemalloc.allocated
value:       349985008
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 4:
──────
metric:      jemalloc.background_thread.num_runs
value:       0
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 5:
──────
metric:      jemalloc.metadata
value:       48655872
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 6:
──────
metric:      jemalloc.arenas.all.pactive
value:       90597
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 7:
──────
metric:      jemalloc.mapped
value:       633438208
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 8:
──────
metric:      jemalloc.retained
value:       370573312
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 9:
───────
metric:      jemalloc.metadata_thp
value:       0
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 10:
───────
metric:      jemalloc.active
value:       371085312
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 11:
───────
metric:      jemalloc.arenas.all.pmuzzy
value:       7085
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 12:
───────
metric:      jemalloc.arenas.all.muzzy_purged
value:       313322
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 13:
───────
metric:      jemalloc.arenas.all.pdirty
value:       33414
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 14:
───────
metric:      jemalloc.arenas.all.dirty_purged
value:       422174
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 15:
───────
metric:      jemalloc.resident
value:       536674304
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html

Row 16:
───────
metric:      jemalloc.background_thread.run_intervals
value:       0
description: An internal metric of the low-level memory allocator (jemalloc). See https://jemalloc.net/jemalloc.3.html
```

Additionally to get a historical view of what was happening with the server please check `system.asynchronous_metric_log`.


Another metric comes from the internal native-ClickHouse memory tracker. It shows you “what ClickHouse thinks how much memory it uses”:

```
SELECT *
FROM system.metrics
WHERE metric ILIKE '%MemoryTracking%'
FORMAT Vertical

Query id: db0f53bd-9aff-42f7-9fb3-6f5d9a26d2ab

Row 1:
──────
metric:      MemoryTracking
value:       -14863238
description: Total amount of memory (bytes) allocated by the server.

Row 2:
──────
metric:      MergesMutationsMemoryTracking
value:       0
description: Total amount of memory (bytes) allocated by background tasks (merges and mutations).
```

# Table `system.jemalloc_bins`

Documentation of this table can be found [here](https://clickhouse.com/docs/en/operations/system-tables/jemalloc_bins).

This table shows the “current state” of the allocator - how many chunks of different sizes were allocated. It is also useful often to compare different sources - RSS, MemoryTracking metrics and jemalloc metrics.

:::warning
Please note, that these metrics are not synchronized with each other and values may drift.
:::
