---
description: '使用调用栈列表生成火焰图的聚合函数。'
sidebar_position: 138
slug: /sql-reference/aggregate-functions/reference/flame_graph
title: 'flameGraph'
doc_type: 'reference'
---



# flameGraph

一个聚合函数，用于根据栈追踪列表构建[火焰图](https://www.brendangregg.com/flamegraphs.html)。输出一个字符串数组，可供 [flamegraph.pl 工具](https://github.com/brendangregg/FlameGraph) 使用，用于渲染该火焰图的 SVG。



## 语法 {#syntax}

```sql
flameGraph(traces, [size], [ptr])
```


## 参数 {#parameters}

- `traces` — 堆栈跟踪。[Array](../../data-types/array.md)([UInt64](../../data-types/int-uint.md))。
- `size` — 内存分析的分配大小。(可选 - 默认值 `1`)。[UInt64](../../data-types/int-uint.md)。
- `ptr` — 分配地址。(可选 - 默认值 `0`)。[UInt64](../../data-types/int-uint.md)。

:::note
当 `ptr != 0` 时,flameGraph 将映射具有相同 size 和 ptr 的内存分配(size > 0)和内存释放(size < 0)。
仅显示未释放的分配。未映射的释放操作将被忽略。
:::


## 返回值 {#returned-value}

- 用于 [flamegraph.pl 工具](https://github.com/brendangregg/FlameGraph) 的字符串数组。[Array](../../data-types/array.md)([String](../../data-types/string.md))。


## 示例 {#examples}

### 基于 CPU 查询分析器构建火焰图 {#building-a-flamegraph-based-on-a-cpu-query-profiler}

```sql
SET query_profiler_cpu_time_period_ns=10000000;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "select arrayJoin(flameGraph(arrayReverse(trace))) from system.trace_log where trace_type = 'CPU' and query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl  > flame_cpu.svg
```

### 基于内存查询分析器构建火焰图,显示所有内存分配 {#building-a-flamegraph-based-on-a-memory-query-profiler-showing-all-allocations}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "select arrayJoin(flameGraph(trace, size)) from system.trace_log where trace_type = 'MemorySample' and query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem.svg
```

### 基于内存查询分析器构建火焰图,显示查询上下文中未释放的内存分配 {#building-a-flamegraph-based-on-a-memory-query-profiler-showing-allocations-which-were-not-deallocated-in-query-context}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1, use_uncompressed_cache=1, merge_tree_max_rows_to_use_cache=100000000000, merge_tree_max_bytes_to_use_cache=1000000000000;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, size, ptr)) FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_untracked.svg
```

### 基于内存查询分析器构建火焰图,显示特定时间点的活跃内存分配 {#build-a-flamegraph-based-on-memory-query-profiler-showing-active-allocations-at-the-fixed-point-of-time}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

- 1 - 每秒内存使用量

```sql
SELECT event_time, m, formatReadableSize(max(s) AS m) FROM (SELECT event_time, sum(size) OVER (ORDER BY event_time) AS s FROM system.trace_log WHERE query_id = 'xxx' AND trace_type = 'MemorySample') GROUP BY event_time ORDER BY event_time;
```

- 2 - 查找内存使用量最大的时间点

```sql
SELECT argMax(event_time, s), max(s) FROM (SELECT event_time, sum(size) OVER (ORDER BY event_time) AS s FROM system.trace_log WHERE query_id = 'xxx' AND trace_type = 'MemorySample');
```

- 3 - 确定特定时间点的活跃内存分配

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, size, ptr)) FROM (SELECT * FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx' AND event_time <= 'yyy' ORDER BY event_time)" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_pos.svg
```

- 4 - 查找特定时间点的内存释放

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, -size, ptr)) FROM (SELECT * FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx' AND event_time > 'yyy' ORDER BY event_time desc)" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_neg.svg
```
