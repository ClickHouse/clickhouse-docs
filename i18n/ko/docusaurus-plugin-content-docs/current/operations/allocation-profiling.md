---
description: 'ClickHouse의 메모리 할당 프로파일링을 설명하는 페이지'
sidebar_label: '메모리 할당 프로파일링'
slug: /operations/allocation-profiling
title: '메모리 할당 프로파일링'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Allocation profiling \{#allocation-profiling\}

ClickHouse는 전역 할당자(allocator)로 [jemalloc](https://github.com/jemalloc/jemalloc)을 사용합니다. jemalloc은 메모리 할당 샘플링과 프로파일링을 위한 도구를 함께 제공합니다.

ClickHouse와 Keeper에서는 config, 쿼리 설정, `SYSTEM` 명령, Keeper의 four letter word(4LW) 명령을 사용하여 샘플링을 제어할 수 있습니다. 결과를 확인하는 방법은 여러 가지가 있습니다:

- `system.trace_log`에 `JemallocSample` 타입으로 샘플을 수집하여 쿼리 단위로 분석합니다.
- 내장된 [jemalloc web UI](#jemalloc-web-ui)(26.2+)를 통해 실시간 메모리 통계를 확인하고 힙(heap) 프로파일을 가져옵니다.
- SQL에서 [`system.jemalloc_profile_text`](#fetching-heap-profiles-from-sql)(26.2+)를 사용하여 현재 힙 프로파일을 직접 쿼리합니다.
- 힙 프로파일을 디스크로 flush한 후 [`jeprof`](#analyzing-heap-profile-files-with-jeprof)으로 분석합니다.

:::note

이 가이드는 25.9+ 버전에 적용됩니다.  
이전 버전은 [25.9 이전 버전의 allocation profiling](/operations/allocation-profiling-old.md)을 참고하십시오.

:::

## 할당 샘플링 \{#sampling-allocations\}

할당을 샘플링하고 프로파일링하려면 `jemalloc_enable_global_profiler` 설정을 활성화한 상태에서 ClickHouse/Keeper를 시작해야 합니다.

```xml
<clickhouse>
    <jemalloc_enable_global_profiler>1</jemalloc_enable_global_profiler>
</clickhouse>
```

`jemalloc`은(는) 메모리 할당을 샘플링하고 해당 정보를 내부에 저장합니다.

`jemalloc_enable_profiler` 설정을 사용하여 쿼리별 샘플링을 활성화할 수도 있습니다.

:::warning 경고
ClickHouse는 메모리 할당량이 많은 애플리케이션이므로 jemalloc 샘플링을 사용하면 성능 오버헤드가 발생할 수 있습니다.
:::


## `system.trace_log`에 jemalloc 샘플 저장하기 \{#storing-jemalloc-samples-in-system-trace-log\}

jemalloc 샘플을 `JemallocSample` 타입으로 `system.trace_log`에 저장할 수 있습니다.
전역적으로 활성화하려면 `jemalloc_collect_global_profile_samples_in_trace_log` 설정을 사용하십시오:

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning 경고
ClickHouse는 메모리 할당이 많은 애플리케이션이므로, system.trace&#95;log에서 모든 샘플을 수집하면 큰 부하가 발생할 수 있습니다.
:::

`jemalloc_collect_profile_samples_in_trace_log` 설정을 사용하여 쿼리 단위로도 활성화할 수 있습니다.


### 예제: 쿼리 메모리 사용량 분석 \{#example-analyzing-memory-usage-trace-log\}

먼저 jemalloc 프로파일러를 활성화한 상태에서 쿼리를 실행하고, 해당 쿼리에 대한 샘플을 `system.trace_log`에 수집합니다:

```sql
SELECT *
FROM numbers(1000000)
ORDER BY number DESC
SETTINGS max_bytes_ratio_before_external_sort = 0
FORMAT `Null`
SETTINGS jemalloc_enable_profiler = 1, jemalloc_collect_profile_samples_in_trace_log = 1

Query id: 8678d8fe-62c5-48b8-b0cd-26851c62dd75

Ok.

0 rows in set. Elapsed: 0.009 sec. Processed 1.00 million rows, 8.00 MB (108.58 million rows/s., 868.61 MB/s.)
Peak memory usage: 12.65 MiB.
```

:::note
ClickHouse가 `jemalloc_enable_global_profiler` 옵션으로 시작한 경우, `jemalloc_enable_profiler`를 별도로 활성화할 필요가 없습니다.
`jemalloc_collect_global_profile_samples_in_trace_log`와 `jemalloc_collect_profile_samples_in_trace_log`도 마찬가지입니다.
:::

`system.trace_log`를 플러시합니다:

```sql
SYSTEM FLUSH LOGS trace_log
```

그런 다음 이를 쿼리하여 시간 경과에 따른 누적 메모리 사용량을 조회합니다:

```sql
WITH per_bucket AS
(
    SELECT
        event_time_microseconds AS bucket_time,
        sum(size) AS bucket_sum
    FROM system.trace_log
    WHERE trace_type = 'JemallocSample'
      AND query_id = '8678d8fe-62c5-48b8-b0cd-26851c62dd75'
    GROUP BY bucket_time
)
SELECT
    bucket_time,
    sum(bucket_sum) OVER (
        ORDER BY bucket_time ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_size,
    formatReadableSize(cumulative_size) AS cumulative_size_readable
FROM per_bucket
ORDER BY bucket_time
```

메모리 사용량이 가장 높았던 시점을 찾으십시오:

```sql
SELECT
    argMax(bucket_time, cumulative_size),
    max(cumulative_size)
FROM
(
    WITH per_bucket AS
    (
        SELECT
            event_time_microseconds AS bucket_time,
            sum(size) AS bucket_sum
        FROM system.trace_log
        WHERE trace_type = 'JemallocSample'
          AND query_id = '8678d8fe-62c5-48b8-b0cd-26851c62dd75'
        GROUP BY bucket_time
    )
    SELECT
        bucket_time,
        sum(bucket_sum) OVER (
            ORDER BY bucket_time ASC
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_size,
        formatReadableSize(cumulative_size) AS cumulative_size_readable
    FROM per_bucket
    ORDER BY bucket_time
)
```

그 결과를 사용하여 피크 시점에 어떤 할당 스택이 가장 활발하게 동작했는지 확인합니다:

```sql
SELECT
    concat(
        '\n',
        arrayStringConcat(
            arrayMap(
                (x, y) -> concat(x, ': ', y),
                arrayMap(x -> addressToLine(x), allocation_trace),
                arrayMap(x -> demangle(addressToSymbol(x)), allocation_trace)
            ),
            '\n'
        )
    ) AS symbolized_trace,
    sum(s) AS per_trace_sum
FROM
(
    SELECT
        ptr,
        sum(size) AS s,
        argMax(trace, event_time_microseconds) AS allocation_trace
    FROM system.trace_log
    WHERE trace_type = 'JemallocSample'
      AND query_id = '8678d8fe-62c5-48b8-b0cd-26851c62dd75'
      AND event_time_microseconds <= '2025-09-04 11:56:21.737139'
    GROUP BY ptr
    HAVING s > 0
)
GROUP BY ALL
ORDER BY per_trace_sum ASC
```


## Jemalloc 웹 UI \{#jemalloc-web-ui\}

:::note
이 섹션은 버전 26.2 이상에 적용됩니다.
:::

ClickHouse는 `/jemalloc` HTTP 엔드포인트에서 jemalloc 메모리 통계를 확인할 수 있는 내장 웹 UI를 제공합니다.
이 UI는 할당된 메모리, 활성 메모리, 상주(resident) 메모리, 매핑(mapped) 메모리뿐만 아니라 arena별, bin별 통계를 포함한 실시간 메모리 지표를 차트로 표시합니다.
또한 UI에서 전역 및 쿼리별 힙 프로파일을 직접 조회할 수 있습니다.

접속하려면 브라우저에서 다음을 여십시오:

```text
http://localhost:8123/jemalloc
```


## SQL에서 힙 프로파일 가져오기 \{#fetching-heap-profiles-from-sql\}

:::note
이 섹션은 26.2+ 버전에 적용됩니다.
:::

`system.jemalloc_profile_text` 시스템 테이블을 사용하면 외부 도구를 사용하거나 먼저 디스크로 플러시하지 않고도, 현재 jemalloc 힙 프로파일을 SQL에서 직접 가져와 조회할 수 있습니다.

이 테이블에는 컬럼이 하나만 있습니다:

| 컬럼     | Type   | Description                         |
| ------ | ------ | ----------------------------------- |
| `line` | String | 심볼 해석이 적용된 jemalloc 힙 프로파일의 한 줄입니다. |

힙 프로파일을 미리 플러시할 필요 없이, 이 테이블을 바로 쿼리하면 됩니다:

```sql
SELECT * FROM system.jemalloc_profile_text
```


### 출력 형식 \{#output-format\}

출력 형식은 `jemalloc_profile_text_output_format` 설정으로 제어되며, 다음 세 가지 값을 지원합니다:

* `raw` — jemalloc이 생성한 원시(raw) 힙 프로파일입니다.
* `symbolized` — 함수 심볼이 내장된 jeprof 호환 형식입니다. 심볼이 이미 내장되어 있으므로 `jeprof`는 ClickHouse 바이너리 없이도 출력을 분석할 수 있습니다.
* `collapsed` (기본값) — FlameGraph와 호환되는 collapsed 스택 형식으로, 한 줄에 하나의 스택과 바이트 수가 포함됩니다.

예를 들어, raw 프로파일을 얻으려면 다음과 같이 합니다:

```sql
SELECT * FROM system.jemalloc_profile_text
SETTINGS jemalloc_profile_text_output_format = 'raw'
```

심볼이 적용된 출력 결과를 보려면:

```sql
SELECT * FROM system.jemalloc_profile_text
SETTINGS jemalloc_profile_text_output_format = 'symbolized'
```


### 추가 설정 \{#fetching-heap-profiles-settings\}

- `jemalloc_profile_text_symbolize_with_inline` (Bool, 기본값: `true`) — 심볼화할 때 인라인 프레임을 포함할지 여부입니다. 이를 비활성화하면 심볼화 속도는 크게 빨라지지만, 인라인 함수 호출이 스택에 나타나지 않아 정밀도가 떨어집니다. `symbolized` 및 `collapsed` 형식에만 영향을 줍니다.
- `jemalloc_profile_text_collapsed_use_count` (Bool, 기본값: `false`) — `collapsed` 형식을 사용할 때, 바이트 크기 대신 할당 횟수 기준으로 집계합니다.

### 예제: SQL을 사용하여 플레임 그래프 생성 \{#example-flamegraph-from-sql\}

기본 출력 형식이 `collapsed`이므로, 출력을 FlameGraph로 바로 파이프로 전달할 수 있습니다:

```sh
clickhouse-client -q "SELECT * FROM system.jemalloc_profile_text" | flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

바이트 수가 아니라 할당 횟수를 기준으로 flame graph를 생성하려면:

```sh
clickhouse-client -q "SELECT * FROM system.jemalloc_profile_text SETTINGS jemalloc_profile_text_collapsed_use_count = 1" | flamegraph.pl --color=mem --title="Allocation Count Flame Graph" --width 2400 > result.svg
```


## 힙 프로파일을 디스크로 플러시하기 \{#flushing-heap-profiles\}

`jeprof`로 오프라인 분석을 수행하기 위해 힙 프로파일을 파일로 저장해야 하는 경우 디스크로 플러시할 수 있습니다.

기본적으로 힙 프로파일 파일은 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap` 경로에 생성됩니다. 여기서 `_pid_`는 ClickHouse의 PID이며, `_seqnum_`은 현재 힙 프로파일에 대한 전역 시퀀스 번호입니다.
Keeper의 기본 파일은 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`이며, 동일한 규칙을 따릅니다.

현재 프로파일을 플러시하려면 다음과 같이 합니다:

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC FLUSH PROFILE
    ```

    이 명령은 플러시된 프로파일의 위치를 반환합니다.
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmfp | nc localhost 9181
    ```
  </TabItem>
</Tabs>

`MALLOC_CONF` 환경 변수에 `prof_prefix` 옵션을 추가하여 다른 위치를 설정할 수 있습니다.
예를 들어 `/data` 디렉터리에 프로파일을 생성하고 파일명 접두사를 `my_current_profile`로 설정하려는 경우, ClickHouse/Keeper를 다음 환경 변수와 함께 실행하면 됩니다:

```sh
MALLOC_CONF=prof_prefix:/data/my_current_profile
```

생성되는 파일 이름에는 접두사 뒤에 PID와 시퀀스 번호가 추가됩니다.


## `jeprof`로 힙 프로파일 파일 분석 \{#analyzing-heap-profile-files-with-jeprof\}

힙 프로파일을 디스크에 플러시한 후에는 `jemalloc`의 도구인 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)을 사용하여 분석할 수 있습니다. 이 도구는 여러 방법으로 설치할 수 있습니다:

- 시스템 패키지 관리자를 사용
- [jemalloc repo](https://github.com/jemalloc/jemalloc)를 클론한 후 루트 폴더에서 `autogen.sh`를 실행. 이렇게 하면 `bin` 폴더 안에 `jeprof` 스크립트가 제공됩니다

여러 가지 출력 형식을 지원합니다. 전체 옵션 목록은 `jeprof --help`를 실행하여 확인하십시오.

### 심볼화된 힙 프로파일 \{#symbolized-heap-profiles\}

버전 26.1+부터 ClickHouse에서는 `SYSTEM JEMALLOC FLUSH PROFILE`로 프로파일을 플러시할 때 자동으로 심볼화된 힙 프로파일을 생성합니다.
심볼화된 프로파일(확장자가 `.symbolized`인 파일)은 함수 심볼이 내장되어 있어 ClickHouse 바이너리 없이도 `jeprof`로 분석할 수 있습니다.

예를 들어, 다음 명령을 실행하면:

```sql
SYSTEM JEMALLOC FLUSH PROFILE
```

ClickHouse는 심볼화된 프로파일의 경로를 반환합니다 (예: `/tmp/jemalloc_clickhouse.12345.0.heap.symbolized`).

그 후 `jeprof`를 사용하여 직접 분석할 수 있습니다.

```sh
jeprof /tmp/jemalloc_clickhouse.12345.0.heap.symbolized --output_format [ > output_file]
```

:::note

**바이너리 불필요**: 심볼이 적용된 프로파일(`.symbolized` 파일)을 사용할 때는 `jeprof`에 ClickHouse 바이너리 경로를 지정할 필요가 없습니다. 이렇게 하면 서로 다른 머신에서 프로파일을 분석하거나 바이너리가 업데이트된 이후에도 훨씬 더 쉽게 프로파일을 분석할 수 있습니다.

:::

이전의 심볼이 적용되지 않은 heap 프로파일이 있고 여전히 ClickHouse 바이너리에 접근할 수 있는 경우에는 기존 방식을 사용할 수 있습니다:

```sh
jeprof path/to/clickhouse path/to/heap/profile --output_format [ > output_file]
```

:::note

심벌 정보가 없는 프로파일(non-symbolized profiles)에서는 `jeprof`가 `addr2line`을 사용해 스택 트레이스를 생성하며, 이 과정이 매우 느릴 수 있습니다.
이 경우 해당 도구의 [대체 구현체](https://github.com/gimli-rs/addr2line)를 설치하는 것이 좋습니다.

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

또는 `llvm-addr2line`도 동일하게 잘 동작합니다(단, `llvm-objdump`는 `jeprof`와 호환되지 않는다는 점에 유의하십시오).

그리고 이후에는 다음과 같이 실행합니다 `jeprof --tools addr2line:/usr/bin/llvm-addr2line,nm:/usr/bin/llvm-nm,objdump:/usr/bin/objdump,c++filt:/usr/bin/llvm-cxxfilt`

:::

두 프로파일을 비교할 때는 `--base` 인수를 사용할 수 있습니다:

```sh
jeprof --base /path/to/first.heap.symbolized /path/to/second.heap.symbolized --output_format [ > output_file]
```


### 예시 \{#examples\}

심볼 정보가 포함된 프로파일을 사용하는 방법(권장):

* 각 프로시저를 한 줄에 하나씩 적은 텍스트 파일을 생성합니다:

```sh
jeprof /tmp/jemalloc_clickhouse.12345.0.heap.symbolized --text > result.txt
```

* 호출 그래프 PDF 파일을 생성합니다.

```sh
jeprof /tmp/jemalloc_clickhouse.12345.0.heap.symbolized --pdf > result.pdf
```

비심볼화된 프로파일 사용(바이너리 필요):

* 각 프로시저를 한 줄에 하나씩 적은 텍스트 파일을 생성합니다:

```sh
jeprof /path/to/clickhouse /tmp/jemalloc_clickhouse.12345.0.heap --text > result.txt
```

* 호출 그래프가 포함된 PDF 파일을 생성합니다:

```sh
jeprof /path/to/clickhouse /tmp/jemalloc_clickhouse.12345.0.heap --pdf > result.pdf
```


### 플레임 그래프 생성 \{#generating-flame-graph\}

`jeprof`를 사용하면 플레임 그래프 생성을 위한 축약된 스택(collapsed stacks)을 만들 수 있습니다.

`--collapsed` 인자를 사용해야 합니다:

```sh
jeprof /tmp/jemalloc_clickhouse.12345.0.heap.symbolized --collapsed > result.collapsed
```

또는 심볼이 없는 프로파일:

```sh
jeprof /path/to/clickhouse /tmp/jemalloc_clickhouse.12345.0.heap --collapsed > result.collapsed
```

그 다음으로 축약된 스택을 시각화하기 위해 다양한 도구를 사용할 수 있습니다.

가장 널리 사용되는 도구는 `flamegraph.pl`이라는 스크립트를 포함하는 [FlameGraph](https://github.com/brendangregg/FlameGraph)입니다.

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

또 다른 유용한 도구로 [speedscope](https://www.speedscope.app/)가 있으며, 수집된 스택을 보다 상호작용적으로 분석할 수 있습니다.


## 프로파일러에 대한 추가 옵션 \{#additional-options-for-profiler\}

`jemalloc`에는 프로파일러와 관련된 다양한 옵션이 제공됩니다. 이러한 옵션은 `MALLOC_CONF` 환경 변수를 수정하여 제어할 수 있습니다.
예를 들어, 할당 샘플 간의 간격은 `lg_prof_sample`로 제어할 수 있습니다.  
힙 프로파일을 N 바이트마다 덤프하려면 `lg_prof_interval`을 사용하여 이를 활성화하면 됩니다.  

전체 옵션 목록은 `jemalloc`의 [reference page](https://jemalloc.net/jemalloc.3.html)를 참조하기를 권장합니다.

## 기타 자료 \{#other-resources\}

ClickHouse/Keeper는 `jemalloc` 관련 메트릭을 여러 가지 방식으로 노출합니다.

:::warning 경고
이 메트릭들은 서로 동기화되어 있지 않으므로 값이 서로 어긋날 수 있다는 점을 반드시 유의해야 합니다.
:::

### 시스템 테이블 `asynchronous_metrics` \{#system-table-asynchronous_metrics\}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric LIKE '%jemalloc%'
FORMAT Vertical
```

[참고](/operations/system-tables/asynchronous_metrics)


### 시스템 테이블 `jemalloc_bins` \{#system-table-jemalloc_bins\}

서로 다른 크기 클래스(bin)에서 jemalloc 할당자를 통해 수행된 메모리 할당에 대한 정보를, 모든 arena에서 집계하여 포함합니다.

[참고](/operations/system-tables/jemalloc_bins)

### 시스템 테이블 `jemalloc_stats` (26.2+) \{#system-table-jemalloc_stats\}

`malloc_stats_print()`의 전체 출력 결과를 하나의 문자열로 반환합니다. `SYSTEM JEMALLOC STATS` 명령과 동일합니다.

```sql
SELECT * FROM system.jemalloc_stats
```


### Prometheus \{#prometheus\}

`asynchronous_metrics`에 포함된 모든 `jemalloc` 관련 메트릭은 ClickHouse와 Keeper 모두에서 Prometheus 엔드포인트를 통해서도 노출됩니다.

[참고](/operations/server-configuration-parameters/settings#prometheus)

### Keeper의 `jmst` 4LW 명령 \{#jmst-4lw-command-in-keeper\}

Keeper는 `jmst` 4LW 명령을 지원하며, 이 명령은 [기본 allocator 통계](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)를 반환합니다:

```sh
echo jmst | nc localhost 9181
```
