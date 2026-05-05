---
description: 'ClickHouse 샘플링 쿼리 프로파일러 도구에 대한 문서'
sidebar_label: '쿼리 프로파일링'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: '샘플링 쿼리 프로파일러'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 샘플링 쿼리 프로파일러 \{#sampling-query-profiler\}

ClickHouse는 쿼리 실행을 분석할 수 있도록 샘플링 프로파일러를 실행합니다.
프로파일러를 사용하면 쿼리 실행 중 가장 자주 사용되는 소스 코드 루틴을 찾을 수 있습니다.
idle 시간을 포함해 사용된 CPU 시간과 실제 경과 시간을 추적할 수 있습니다.

쿼리 프로파일러는 ClickHouse Cloud에서 자동으로 활성화됩니다.
다음 예시 쿼리는 함수 이름과 소스 위치를 해석한 상태에서, 프로파일링된 쿼리의 가장 빈번한 스택 트레이스를 찾습니다.

:::tip
`query_id` 값을 프로파일링할 쿼리의 ID로 바꾸십시오.
:::

<Tabs groupId="deployment">
  <TabItem value="cloud" label="ClickHouse Cloud">
    ClickHouse Cloud에서는 쿼리 결과 테이블 위 막대의 맨 오른쪽(테이블/차트 전환 옆)에 있는 **&quot;...&quot;** 를 클릭하면 쿼리 ID를 얻을 수 있습니다. 그러면 컨텍스트 메뉴가 열리고, 여기서 **&quot;Copy query ID&quot;** 를 클릭할 수 있습니다.

    클러스터의 모든 노드에서 선택하려면 `clusterAllReplicas(default, system.trace_log)`를 사용하십시오:

    ```sql
    SELECT
        count(),
        arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
    FROM clusterAllReplicas(default, system.trace_log)
    WHERE query_id = '<query_id>' AND trace_type = 'CPU' AND event_date = today()
    GROUP BY trace
    ORDER BY count() DESC
    LIMIT 10
    SETTINGS allow_introspection_functions = 1
    ```
  </TabItem>

  <TabItem value="self-managed" label="자가 관리형">
    ```sql
    SELECT
        count(),
        arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
    FROM system.trace_log
    WHERE query_id = '<query_id>' AND trace_type = 'CPU' AND event_date = today()
    GROUP BY trace
    ORDER BY count() DESC
    LIMIT 10
    SETTINGS allow_introspection_functions = 1
    ```
  </TabItem>
</Tabs>

## 자가 관리형 배포에서 쿼리 프로파일러 사용 \{#self-managed-query-profiler\}

자가 관리형 배포에서 쿼리 프로파일러를 사용하려면 아래 단계를 따르십시오.

<VerticalStepper headerLevel="h3">
  ### 디버그 정보가 포함된 ClickHouse 설치 \{#debug-info\}

  `clickhouse-common-static-dbg` 패키지를 설치하십시오.

  1. [&quot;Debian 저장소 설정&quot;](/install/debian_ubuntu#setup-the-debian-repository) 단계의 안내를 따르십시오.
  2. `sudo apt-get install clickhouse-server clickhouse-client clickhouse-common-static-dbg`를 실행하여 디버그 정보가 포함된 ClickHouse 컴파일 바이너리 파일을 설치하십시오.
  3. `sudo service clickhouse-server start`를 실행하여 서버를 시작하십시오.
  4. `clickhouse-client`를 실행하십시오. `clickhouse-common-static-dbg`의 디버그 심볼은 서버에서 자동으로 인식되므로, 이를 활성화하기 위해 별도의 작업은 필요하지 않습니다.

  ### 서버 설정 확인 \{#server-config\}

  [서버 설정 파일](/operations/configuration-files)의 [`trace_log`](../../operations/server-configuration-parameters/settings.md#trace_log) 섹션이 구성되어 있는지 확인하십시오. 기본적으로 활성화되어 있습니다.

  ```xml
  <!-- 추적 로그. 쿼리 프로파일러가 수집한 스택 트레이스를 저장합니다.
       query_profiler_real_time_period_ns 및 query_profiler_cpu_time_period_ns 설정을 참조하십시오. -->
  <trace_log>
      <database>system</database>
      <table>trace_log</table>

      <partition_by>toYYYYMM(event_date)</partition_by>
      <flush_interval_milliseconds>7500</flush_interval_milliseconds>
      <max_size_rows>1048576</max_size_rows>
      <reserved_size_rows>8192</reserved_size_rows>
      <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
      <!-- 충돌 발생 시 로그를 디스크에 덤프할지 여부를 나타냅니다 -->
      <flush_on_crash>false</flush_on_crash>
      <symbolize>true</symbolize>
  </trace_log>
  ```

  이 섹션은 프로파일러 동작 결과가 저장되는 [trace&#95;log](/operations/system-tables/trace_log) 시스템 테이블(system table)을 설정합니다.
  이 테이블의 데이터는 서버가 실행 중인 동안에만 유효하다는 점에 유의하십시오.
  서버를 재시작한 후에도 ClickHouse는 이 테이블을 정리하지 않으므로, 저장된 가상 메모리 주소는 모두 더 이상 유효하지 않을 수 있습니다.

  ### 프로파일러 타이머 설정 \{#configure-profile-timers\}

  [`query_profiler_cpu_time_period_ns`](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) 또는 [`query_profiler_real_time_period_ns`](../../operations/settings/settings.md#query_profiler_real_time_period_ns) 설정을 구성하십시오.
  두 설정은 동시에 사용할 수 있습니다.

  이 설정을 사용하면 프로파일러 타이머를 설정할 수 있습니다.
  이들은 세션 설정이므로 전체 서버, 개별 사용자 또는 사용자 프로필, 대화형 세션, 각 개별 쿼리에 서로 다른 샘플링 빈도를 적용할 수 있습니다.

  기본 샘플링 빈도는 초당 샘플 1개이며, CPU 타이머와 실제 시간 타이머가 모두 활성화되어 있습니다.
  이 빈도는 서버 성능에 영향을 주지 않으면서 ClickHouse 클러스터에 대한 충분한 정보를 수집할 수 있게 해줍니다.
  개별 쿼리를 각각 프로파일링해야 한다면 더 높은 샘플링 빈도를 사용하십시오.

  ### `trace_log` 시스템 테이블 분석 \{#analyze-trace-log-system-table\}

  `trace_log` 시스템 테이블을 분석하려면 [`allow_introspection_functions`](../../operations/settings/settings.md#allow_introspection_functions) 설정으로 인트로스펙션 함수를 허용하십시오.

  ```sql
  SET allow_introspection_functions=1
  ```

  :::note
  보안상의 이유로 인트로스펙션 함수는 기본적으로 비활성화되어 있습니다.
  :::

  `addressToLine`, `addressToLineWithInlines`, `addressToSymbol`, `demangle` [인트로스펙션 함수](../../sql-reference/functions/introspection.md)를 사용하여 ClickHouse 코드에서 함수 이름과 해당 위치를 확인하십시오.
  특정 쿼리의 프로필을 얻으려면 `trace_log` 테이블의 데이터를 집계해야 합니다.
  데이터는 개별 함수별로 또는 전체 스택 트레이스별로 집계할 수 있습니다.

  :::tip
  `trace_log` 정보를 시각화해야 한다면 [flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph)와 [speedscope](https://www.speedscope.app)를 사용해 보십시오.
  :::
</VerticalStepper>

## `flameGraph` 함수로 플레임 그래프 구축하기 \{#flamegraph\}

ClickHouse는 `trace_log`에 저장된 스택 트레이스로부터 직접 플레임 그래프를 구축하는 [`flameGraph`](/sql-reference/aggregate-functions/reference/flame_graph) 집계 함수(aggregate function)를 제공합니다.
출력은 [flamegraph.pl](https://github.com/brendangregg/FlameGraph)과 호환되는 형식의 문자열 배열입니다.

**구문:**

```sql
flameGraph(traces, [size = 1], [ptr = 0])
```

**인수:**

* `traces` — 스택 트레이스입니다. [`Array(UInt64)`](/sql-reference/data-types/array).
* `size` — 메모리 프로파일링을 위한 할당 크기입니다. [`Int64`](/sql-reference/data-types/int-uint).
* `ptr` — 할당 주소입니다. [`UInt64`](/sql-reference/data-types/int-uint).

`ptr`이 0이 아니면 `flameGraph`는 크기와 포인터가 동일한 할당(`size > 0`)과 할당 해제(`size < 0`)를 서로 대응시킵니다.
해제되지 않은 할당만 표시됩니다.
짝이 맞지 않는 할당 해제는 무시됩니다.

### CPU 플레임 그래프 \{#cpu-flame-graph\}

:::note
아래 쿼리를 실행하려면 [flamegraph.pl](https://github.com/brendangregg/FlameGraph)이 설치되어 있어야 합니다.

다음 명령을 실행하십시오:

```bash
git clone https://github.com/brendangregg/FlameGraph
# Then use it as:
# ~/FlameGraph/flamegraph.pl
```

다음 쿼리에서 `flamegraph.pl`을 사용 중인 시스템에서 `flamegraph.pl`이 위치한 경로로 바꾸십시오
:::

```sql
SET query_profiler_cpu_time_period_ns = 10000000;
```

쿼리를 실행한 다음 플레임 그래프를 생성하십시오:

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(arrayReverse(trace)))
        FROM system.trace_log
        WHERE trace_type = 'CPU' AND query_id = '<query_id>'" \
    | flamegraph.pl > flame_cpu.svg
```

### 메모리 플레임 그래프 — 전체 할당 \{#memory-flame-graph-all\}

```sql
SET memory_profiler_sample_probability = 1, max_untracked_memory = 1;
```

쿼리를 실행한 다음, 플레임 그래프를 생성합니다:

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, size))
        FROM system.trace_log
        WHERE trace_type = 'MemorySample' AND query_id = '<query_id>'" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem.svg
```

### 메모리 플레임 그래프 — 해제되지 않은 할당 \{#memory-flame-graph-unfreed\}

이 방식은 포인터를 기준으로 할당과 해제를 매칭하여, 쿼리 실행 중 해제되지 않은 메모리만 표시합니다.

```sql
SET memory_profiler_sample_probability = 1, max_untracked_memory = 1,
    use_uncompressed_cache = 1,
    merge_tree_max_rows_to_use_cache = 100000000000,
    merge_tree_max_bytes_to_use_cache = 1000000000000;
```

플레임 그래프를 생성하려면 다음 쿼리를 실행하십시오:

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, size, ptr))
        FROM system.trace_log
        WHERE trace_type = 'MemorySample' AND query_id = '<query_id>'" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem_unfreed.svg
```

### 메모리 플레임 그래프 — 특정 시점의 활성 할당 \{#memory-flame-graph-time-point\}

이 방법을 사용하면 최대 메모리 사용량을 확인하고 해당 시점에 무엇이 할당되었는지 시각화할 수 있습니다.

```sql
SET memory_profiler_sample_probability = 1, max_untracked_memory = 1;
```

#### 시간에 따른 메모리 사용량 확인 \{#find-memory-usage-over-time\}

```sql
SELECT
    event_time,
    formatReadableSize(max(s)) AS m
FROM (
    SELECT
        event_time,
        sum(size) OVER (ORDER BY event_time) AS s
    FROM system.trace_log
    WHERE query_id = '<query_id>' AND trace_type = 'MemorySample'
)
GROUP BY event_time
ORDER BY event_time;
```

#### 메모리 사용량이 가장 높은 시점을 찾습니다 \{#find-time-point-maximum-memory-usage\}

```sql
SELECT
    argMax(event_time, s),
    max(s)
FROM (
    SELECT
        event_time,
        sum(size) OVER (ORDER BY event_time) AS s
    FROM system.trace_log
    WHERE query_id = '<query_id>' AND trace_type = 'MemorySample'
);
```

#### 해당 시점의 활성 할당 플레임 그래프 구축 \{#build-flame-graph\}

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, size, ptr))
        FROM (
            SELECT * FROM system.trace_log
            WHERE trace_type = 'MemorySample'
              AND query_id = '<query_id>'
              AND event_time <= '<time_point>'
            ORDER BY event_time
        )" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_pos.svg
```

#### 해당 시점 이후 발생한 메모리 해제의 플레임 그래프를 구축합니다(이후에 무엇이 해제되었는지 파악하기 위해) \{#build-flame-graph-deallocations\}

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, -size, ptr))
        FROM (
            SELECT * FROM system.trace_log
            WHERE trace_type = 'MemorySample'
              AND query_id = '<query_id>'
              AND event_time > '<time_point>'
            ORDER BY event_time DESC
        )" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_neg.svg
```

## 예시 \{#example\}

아래 코드 스니펫은 다음을 수행합니다:

* 현재 날짜와 쿼리 식별자로 `trace_log` 데이터를 필터링합니다.
* 스택 트레이스로 집계합니다.
* 인트로스펙션 함수(introspection functions)를 사용하여 다음과 같은 보고서를 얻습니다:
  * 심볼 이름과 해당하는 소스 코드 함수 이름
  * 해당 함수들의 소스 코드 위치

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE (query_id = '<query_id>') AND (event_date = today())
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
```
