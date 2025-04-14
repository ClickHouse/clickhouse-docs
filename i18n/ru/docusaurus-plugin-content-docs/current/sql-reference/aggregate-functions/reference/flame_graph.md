---
description: 'Агрегатная функция, которая строит граф огня с использованием списка стеков.'
sidebar_position: 138
slug: /sql-reference/aggregate-functions/reference/flame_graph
title: 'flameGraph'
---


# flameGraph

Агрегатная функция, которая строит [граф огня](https://www.brendangregg.com/flamegraphs.html) с использованием списка стеков. Возвращает массив строк, который может быть использован утилитой [flamegraph.pl](https://github.com/brendangregg/FlameGraph) для отображения SVG графа огня.

## Syntax {#syntax}

```sql
flameGraph(traces, [size], [ptr])
```

## Parameters {#parameters}

- `traces` — стек вызовов. [Array](../../data-types/array.md)([UInt64](../../data-types/int-uint.md)).
- `size` — размер выделения для профилирования памяти. (необязательно - по умолчанию `1`). [UInt64](../../data-types/int-uint.md).
- `ptr` — адрес выделения. (необязательно - по умолчанию `0`). [UInt64](../../data-types/int-uint.md).

:::note
В случае, если `ptr != 0`, граф огня будет сопоставлять выделения (size > 0) и освобождения (size < 0) с одинаковым размером и ptr. 
Показываются только те выделения, которые не были освобождены. Несопоставленные освобождения игнорируются.
:::

## Returned value {#returned-value}

- Массив строк для использования с утилитой [flamegraph.pl](https://github.com/brendanggregg/FlameGraph). [Array](../../data-types/array.md)([String](../../data-types/string.md)).

## Examples {#examples}

### Building a flamegraph based on a CPU query profiler {#building-a-flamegraph-based-on-a-cpu-query-profiler}

```sql
SET query_profiler_cpu_time_period_ns=10000000;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "select arrayJoin(flameGraph(arrayReverse(trace))) from system.trace_log where trace_type = 'CPU' and query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl  > flame_cpu.svg
```

### Building a flamegraph based on a memory query profiler, showing all allocations {#building-a-flamegraph-based-on-a-memory-query-profiler-showing-all-allocations}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "select arrayJoin(flameGraph(trace, size)) from system.trace_log where trace_type = 'MemorySample' and query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem.svg
```

### Building a flamegraph based on a memory query profiler, showing allocations which were not deallocated in query context {#building-a-flamegraph-based-on-a-memory-query-profiler-showing-allocations-which-were-not-deallocated-in-query-context}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1, use_uncompressed_cache=1, merge_tree_max_rows_to_use_cache=100000000000, merge_tree_max_bytes_to_use_cache=1000000000000;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, size, ptr)) FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_untracked.svg
```

### Build a flamegraph based on memory query profiler, showing active allocations at the fixed point of time {#build-a-flamegraph-based-on-memory-query-profiler-showing-active-allocations-at-the-fixed-point-of-time}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

- 1 - Использование памяти в секунду

```sql
SELECT event_time, m, formatReadableSize(max(s) as m) FROM (SELECT event_time, sum(size) OVER (ORDER BY event_time) AS s FROM system.trace_log WHERE query_id = 'xxx' AND trace_type = 'MemorySample') GROUP BY event_time ORDER BY event_time;
```

- 2 - Найти момент времени с максимальным использованием памяти

```sql
SELECT argMax(event_time, s), max(s) FROM (SELECT event_time, sum(size) OVER (ORDER BY event_time) AS s FROM system.trace_log WHERE query_id = 'xxx' AND trace_type = 'MemorySample');
```

- 3 - Зафиксировать активные выделения в фиксированный момент времени

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, size, ptr)) FROM (SELECT * FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx' AND event_time <= 'yyy' ORDER BY event_time)" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_pos.svg
```

- 4 - Найти освобождения в фиксированный момент времени

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, -size, ptr)) FROM (SELECT * FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx' AND event_time > 'yyy' ORDER BY event_time desc)" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_neg.svg
```
