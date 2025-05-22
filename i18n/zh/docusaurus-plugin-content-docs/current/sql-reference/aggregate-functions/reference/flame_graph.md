---
'description': '聚合函数，它使用堆栈跟踪列表构建一个 flamegraph。'
'sidebar_position': 138
'slug': '/sql-reference/aggregate-functions/reference/flame_graph'
'title': 'flameGraph'
---


# flameGraph

聚合函数，使用堆栈跟踪列表构建一个 [flamegraph](https://www.brendangregg.com/flamegraphs.html)。输出一个字符串数组，可由 [flamegraph.pl utility](https://github.com/brendangregg/FlameGraph) 生成火焰图的 SVG。

## Syntax {#syntax}

```sql
flameGraph(traces, [size], [ptr])
```

## Parameters {#parameters}

- `traces` — 一个堆栈跟踪。[Array](../../data-types/array.md)([UInt64](../../data-types/int-uint.md))。
- `size` — 内存分析的分配大小。(可选 - 默认 `1`。[UInt64](../../data-types/int-uint.md))。
- `ptr` — 分配地址。(可选 - 默认 `0`。[UInt64](../../data-types/int-uint.md))。

:::note
当 `ptr != 0` 时，flameGraph 将映射同一大小和 ptr 的分配（size > 0）和释放（size < 0）。 
只显示未释放的分配。未映射的释放被忽略。
:::

## Returned value {#returned-value}

- 一个字符串数组，可与 [flamegraph.pl utility](https://github.com/brendangregg/FlameGraph) 一起使用。[Array](../../data-types/array.md)([String](../../data-types/string.md))。

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

- 1 - 每秒内存使用情况

```sql
SELECT event_time, m, formatReadableSize(max(s) as m) FROM (SELECT event_time, sum(size) OVER (ORDER BY event_time) AS s FROM system.trace_log WHERE query_id = 'xxx' AND trace_type = 'MemorySample') GROUP BY event_time ORDER BY event_time;
```

- 2 - 找到内存使用量最大的时间点

```sql
SELECT argMax(event_time, s), max(s) FROM (SELECT event_time, sum(size) OVER (ORDER BY event_time) AS s FROM system.trace_log WHERE query_id = 'xxx' AND trace_type = 'MemorySample');
```

- 3 - 在固定时间点固定活动分配

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, size, ptr)) FROM (SELECT * FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx' AND event_time <= 'yyy' ORDER BY event_time)" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_pos.svg
```

- 4 - 在固定时间点找到释放情况

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, -size, ptr)) FROM (SELECT * FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx' AND event_time > 'yyy' ORDER BY event_time desc)" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_neg.svg
```
