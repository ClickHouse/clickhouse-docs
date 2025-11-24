---
'description': '스택 트레이스 목록을 사용하여 flamegraph를 생성하는 집계 함수입니다.'
'sidebar_position': 138
'slug': '/sql-reference/aggregate-functions/reference/flame_graph'
'title': 'flameGraph'
'doc_type': 'reference'
---


# flameGraph

스택 추적 목록을 사용하여 [flamegraph](https://www.brendangregg.com/flamegraphs.html)를 구축하는 집계 함수입니다. flamegraph의 SVG를 렌더링하기 위해 [flamegraph.pl utility](https://github.com/brendangregg/FlameGraph)에서 사용할 수 있는 문자열 배열을 출력합니다.

## Syntax {#syntax}

```sql
flameGraph(traces, [size], [ptr])
```

## Parameters {#parameters}

- `traces` — 스택 추적. [Array](../../data-types/array.md)([UInt64](../../data-types/int-uint.md)).
- `size` — 메모리 프로파일링을 위한 할당 크기. (선택 사항 - 기본값 `1`). [UInt64](../../data-types/int-uint.md).
- `ptr` — 할당 주소. (선택 사항 - 기본값 `0`). [UInt64](../../data-types/int-uint.md).

:::note
`ptr != 0`인 경우, flameGraph는 같은 크기와 ptr로 할당(size > 0) 및 메모리 해제(size < 0)를 매핑합니다.
해제되지 않은 할당만 표시됩니다. 매핑되지 않은 해제는 무시됩니다.
:::

## Returned value {#returned-value}

- [flamegraph.pl utility](https://github.com/brendangregg/FlameGraph)와 함께 사용할 문자열 배열입니다. [Array](../../data-types/array.md)([String](../../data-types/string.md)).

## Examples {#examples}

### CPU 쿼리 프로파일러를 기반으로 flamegraph 구축 {#building-a-flamegraph-based-on-a-cpu-query-profiler}

```sql
SET query_profiler_cpu_time_period_ns=10000000;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "select arrayJoin(flameGraph(arrayReverse(trace))) from system.trace_log where trace_type = 'CPU' and query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl  > flame_cpu.svg
```

### 모든 할당을 보여주는 메모리 쿼리 프로파일러 기반 flamegraph 구축 {#building-a-flamegraph-based-on-a-memory-query-profiler-showing-all-allocations}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "select arrayJoin(flameGraph(trace, size)) from system.trace_log where trace_type = 'MemorySample' and query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem.svg
```

### 쿼리 컨텍스트에서 해제되지 않은 할당을 보여주는 메모리 쿼리 프로파일러 기반 flamegraph 구축 {#building-a-flamegraph-based-on-a-memory-query-profiler-showing-allocations-which-were-not-deallocated-in-query-context}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1, use_uncompressed_cache=1, merge_tree_max_rows_to_use_cache=100000000000, merge_tree_max_bytes_to_use_cache=1000000000000;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, size, ptr)) FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx'" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_untracked.svg
```

### 고정된 순간에서 활성 할당을 보여주는 메모리 쿼리 프로파일러 기반 flamegraph 구축 {#build-a-flamegraph-based-on-memory-query-profiler-showing-active-allocations-at-the-fixed-point-of-time}

```sql
SET memory_profiler_sample_probability=1, max_untracked_memory=1;
SELECT SearchPhrase, COUNT(DISTINCT UserID) AS u FROM hits WHERE SearchPhrase <> '' GROUP BY SearchPhrase ORDER BY u DESC LIMIT 10;
```

- 1 - 초당 메모리 사용량

```sql
SELECT event_time, m, formatReadableSize(max(s) AS m) FROM (SELECT event_time, sum(size) OVER (ORDER BY event_time) AS s FROM system.trace_log WHERE query_id = 'xxx' AND trace_type = 'MemorySample') GROUP BY event_time ORDER BY event_time;
```

- 2 - 최대 메모리 사용량의 시간 점 찾기

```sql
SELECT argMax(event_time, s), max(s) FROM (SELECT event_time, sum(size) OVER (ORDER BY event_time) AS s FROM system.trace_log WHERE query_id = 'xxx' AND trace_type = 'MemorySample');
```

- 3 - 고정된 순간에 활성 할당 고정

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, size, ptr)) FROM (SELECT * FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx' AND event_time <= 'yyy' ORDER BY event_time)" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_pos.svg
```

- 4 - 고정된 순간에 해제 찾기

```text
clickhouse client --allow_introspection_functions=1 -q "SELECT arrayJoin(flameGraph(trace, -size, ptr)) FROM (SELECT * FROM system.trace_log WHERE trace_type = 'MemorySample' AND query_id = 'xxx' AND event_time > 'yyy' ORDER BY event_time desc)" | ~/dev/FlameGraph/flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_neg.svg
```
