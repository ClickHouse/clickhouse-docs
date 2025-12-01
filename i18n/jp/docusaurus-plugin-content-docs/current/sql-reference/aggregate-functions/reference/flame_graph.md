---
description: 'スタックトレースのリストからフレームグラフを構築する集約関数。'
sidebar_position: 138
slug: /sql-reference/aggregate-functions/reference/flame_graph
title: 'flameGraph'
doc_type: 'reference'
---



# flameGraph {#flamegraph}

スタックトレースのリストを使用して[フレームグラフ](https://www.brendangregg.com/flamegraphs.html)を構築する集約関数です。[flamegraph.pl ユーティリティ](https://github.com/brendangregg/FlameGraph)でフレームグラフの SVG をレンダリングする際に利用できる文字列配列を出力します。



## 構文 {#syntax}

```sql
flameGraph(traces, [size], [ptr])
```


## パラメータ {#parameters}

- `traces` — スタックトレース。[Array](../../data-types/array.md)([UInt64](../../data-types/int-uint.md))。
- `size` — メモリプロファイリング用のアロケーションサイズ（省略可、既定値は `1`）。[UInt64](../../data-types/int-uint.md)。
- `ptr` — アロケーションアドレス（省略可、既定値は `0`）。[UInt64](../../data-types/int-uint.md)。

:::note
`ptr != 0` の場合、FlameGraph は同じ size と ptr を持つアロケーション（size > 0）とデアロケーション（size < 0）を対応付けます。
解放されていないアロケーションのみが表示されます。対応付けられないデアロケーションは無視されます。
:::



## 戻り値 {#returned-value}

- [flamegraph.pl ユーティリティ](https://github.com/brendangregg/FlameGraph) で使用する文字列の配列。[Array](../../data-types/array.md)([String](../../data-types/string.md))。



## 例 {#examples}

### CPU クエリプロファイラに基づくフレームグラフの作成 {#building-a-flamegraph-based-on-a-cpu-query-profiler}

```sql
SET query_profiler_cpu_time_period_ns=10000000;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "select arrayJoin(flameGraph(arrayReverse(trace))) from system.trace_log where trace_type = 'CPU' and query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl  > flame_cpu.svg
```

### メモリクエリプロファイラに基づいて、すべてのアロケーションを可視化するフレームグラフの作成 {#building-a-flamegraph-based-on-a-memory-query-profiler-showing-all-allocations}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "select arrayJoin(flameGraph(trace, size)) from system.trace_log where trace_type = 'MemorySample' and query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem.svg
```

### メモリクエリプロファイラに基づいて、クエリコンテキスト内で解放されなかったメモリアロケーションを示すフレームグラフを作成する {#building-a-flamegraph-based-on-a-memory-query-profiler-showing-allocations-which-were-not-deallocated-in-query-context}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1, use_uncompressed_cache=1, merge_tree_max_rows_to_use_cache=100000000000, merge_tree_max_bytes_to_use_cache=1000000000000;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, size, ptr)) FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_untracked.svg
```

### メモリクエリプロファイラに基づいてフレームグラフを作成し、ある時点における有効なメモリ割り当てを表示する {#build-a-flamegraph-based-on-memory-query-profiler-showing-active-allocations-at-the-fixed-point-of-time}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

* 1 - メモリ使用量（毎秒）

```sql
SELECT event_time, m, formatReadableSize(max(s) AS m) FROM (SELECT event_time, sum(size) OVER (ORDER BY event_time) AS s FROM system.trace_log WHERE query_id = 'xxx' AND trace_type = 'MemorySample') GROUP BY event_time ORDER BY event_time;
```

* 2 - メモリ使用量が最大となる時刻を特定する

```sql
SELECT argMax(event_time, s), max(s) FROM (SELECT event_time, sum(size) OVER (ORDER BY event_time) AS s FROM system.trace_log WHERE query_id = 'xxx' AND trace_type = 'MemorySample');
```

* 3 - 特定時点におけるアクティブな割り当てを固定する

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, size, ptr)) FROM (SELECT * FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx' AND event_time <= 'yyy' ORDER BY event_time)" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_pos.svg
```

* 4 - 固定時刻におけるメモリ解放を検出する

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, -size, ptr)) FROM (SELECT * FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx' AND event_time > 'yyy' ORDER BY event_time desc)" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_neg.svg
```
