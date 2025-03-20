---
slug: /sql-reference/aggregate-functions/reference/flame_graph
sidebar_position: 138
title: "flameGraph"
description: "スタックトレースのリストを使用してフレームグラフを構築する集約関数。"
---


# flameGraph

スタックトレースのリストを使用して[flamegraph](https://www.brendangregg.com/flamegraphs.html)を構築する集約関数。フレームグラフのSVGをレンダリングするために[flamegraph.pl utility](https://github.com/brendangregg/FlameGraph)で使用できる文字列の配列を出力します。

## Syntax {#syntax}

```sql
flameGraph(traces, [size], [ptr])
```

## Parameters {#parameters}

- `traces` — スタックトレース。[Array](../../data-types/array.md)([UInt64](../../data-types/int-uint.md))。
- `size` — メモリプロファイリングのための割り当てサイズ。（オプション - デフォルト `1`）。[UInt64](../../data-types/int-uint.md)。
- `ptr` — 割り当てアドレス。（オプション - デフォルト `0`）。[UInt64](../../data-types/int-uint.md)。

:::note
`ptr != 0` の場合、flameGraphは同じサイズとptrを持つ割り当て（size > 0）と解放（size < 0）をマッピングします。
解放されていない割り当てのみが表示されます。マッピングされていない解放は無視されます。
:::

## Returned value {#returned-value}

- [flamegraph.pl utility](https://github.com/brendangregg/FlameGraph)で使用するための文字列の配列。[Array](../../data-types/array.md)([String](../../data-types/string.md))。

## Examples {#examples}

### CPUクエリプロファイラに基づいてフレームグラフを構築する {#building-a-flamegraph-based-on-a-cpu-query-profiler}

```sql
SET query_profiler_cpu_time_period_ns=10000000;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "select arrayJoin(flameGraph(arrayReverse(trace))) from system.trace_log where trace_type = 'CPU' and query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl  > flame_cpu.svg
```

### メモリクエリプロファイラに基づいてフレームグラフを構築し、すべての割り当てを表示する {#building-a-flamegraph-based-on-a-memory-query-profiler-showing-all-allocations}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "select arrayJoin(flameGraph(trace, size)) from system.trace_log where trace_type = 'MemorySample' and query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem.svg
```

### メモリクエリプロファイラに基づいてフレームグラフを構築し、クエリコンテキストで解放されていない割り当てを表示する {#building-a-flamegraph-based-on-a-memory-query-profiler-showing-allocations-which-were-not-deallocated-in-query-context}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1, use_uncompressed_cache=1, merge_tree_max_rows_to_use_cache=100000000000, merge_tree_max_bytes_to_use_cache=1000000000000;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, size, ptr)) FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_untracked.svg
```

### メモリクエリプロファイラに基づいてフレームグラフを構築し、特定の時点のアクティブな割り当てを表示する {#build-a-flamegraph-based-on-memory-query-profiler-showing-active-allocations-at-the-fixed-point-of-time}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

- 1 - 毎秒のメモリ使用量

```sql
SELECT event_time, m, formatReadableSize(max(s) as m) FROM (SELECT event_time, sum(size) OVER (ORDER BY event_time) AS s FROM system.trace_log WHERE query_id = 'xxx' AND trace_type = 'MemorySample') GROUP BY event_time ORDER BY event_time;
```

- 2 - 最大メモリ使用量のタイムポイントを見つける

```sql
SELECT argMax(event_time, s), max(s) FROM (SELECT event_time, sum(size) OVER (ORDER BY event_time) AS s FROM system.trace_log WHERE query_id = 'xxx' AND trace_type = 'MemorySample');
```

- 3 - 特定の時点でのアクティブな割り当てを固定する

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, size, ptr)) FROM (SELECT * FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx' AND event_time <= 'yyy' ORDER BY event_time)" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_pos.svg
```

- 4 - 特定の時点での解放を見つける

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, -size, ptr)) FROM (SELECT * FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx' AND event_time > 'yyy' ORDER BY event_time desc)" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_neg.svg
```
