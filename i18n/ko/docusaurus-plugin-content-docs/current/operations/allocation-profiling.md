---
description: 'ClickHouse의 메모리 할당 프로파일링을 설명하는 페이지'
sidebar_label: '메모리 할당 프로파일링'
slug: /operations/allocation-profiling
title: '메모리 할당 프로파일링'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 할당 프로파일링 \{#allocation-profiling\}

ClickHouse는 전역 할당자로 [jemalloc](https://github.com/jemalloc/jemalloc)을 사용합니다. jemalloc에는 할당 샘플링과 프로파일링을 위한 일부 도구가 포함되어 있습니다.  
할당 프로파일링을 보다 편리하게 하기 위해 ClickHouse와 Keeper에서는 설정 파일(config), 쿼리 설정, `SYSTEM` 명령 및 Keeper의 four letter word(4LW) 명령을 사용해 샘플링을 제어할 수 있습니다.  
또한 샘플은 `JemallocSample` 타입으로 `system.trace_log` 테이블에 수집될 수 있습니다.

:::note

이 가이드는 25.9 이상 버전에 적용됩니다.  
이전 버전의 경우 [25.9 이전 버전의 할당 프로파일링](/operations/allocation-profiling-old.md)을 참고하십시오.

:::

## 할당 샘플링 \{#sampling-allocations\}

`jemalloc`에서 할당을 샘플링하고 프로파일링하려면 `jemalloc_enable_global_profiler` 설정을 활성화한 상태에서 ClickHouse/Keeper를 시작해야 합니다.

```xml
<clickhouse>
    <jemalloc_enable_global_profiler>1</jemalloc_enable_global_profiler>
</clickhouse>
```

`jemalloc`은(는) 메모리 할당을 샘플링하고 해당 정보를 내부에 저장합니다.

`jemalloc_enable_profiler` 설정을 사용하여 쿼리별 메모리 할당 샘플링을 활성화할 수도 있습니다.

:::warning 경고
ClickHouse는 메모리 할당량이 많은 애플리케이션이므로 jemalloc 샘플링을 사용하면 성능 오버헤드가 발생할 수 있습니다.
:::


## `system.trace_log`에 jemalloc 샘플 저장하기 \{#storing-jemalloc-samples-in-system-trace-log\}

모든 jemalloc 샘플을 `JemallocSample` 타입으로 `system.trace_log`에 저장할 수 있습니다.
전역적으로 활성화하려면 `jemalloc_collect_global_profile_samples_in_trace_log` 설정을 사용하십시오.

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning 경고
ClickHouse는 메모리 할당이 많은 애플리케이션이므로, `system.trace_log`에서 모든 샘플을 수집하면 큰 부하가 발생할 수 있습니다.
:::

`jemalloc_collect_profile_samples_in_trace_log` 설정을 사용하여 쿼리 단위로도 활성화할 수 있습니다.


### `system.trace_log`를 사용하여 쿼리 메모리 사용량을 분석하는 예제 \{#example-analyzing-memory-usage-trace-log\}

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

그리고 이를 쿼리하여 각 시점에 실행된 쿼리의 메모리 사용량을 가져옵니다.

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

또한 메모리 사용량이 최대였던 시점을 확인할 수 있습니다:

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

그 결과를 사용하면 해당 시점에 어디에서 활성 할당이 가장 많이 발생했는지 확인할 수 있습니다.

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


## 힙 프로파일 플러시 \{#flushing-heap-profiles\}

기본적으로 힙 프로파일 파일은 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap` 경로에 생성됩니다. 여기서 `_pid_`는 ClickHouse의 PID이며, `_seqnum_`은 현재 힙 프로파일에 대한 전역 시퀀스 번호입니다.
Keeper의 기본 파일은 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`이며, 동일한 규칙을 따릅니다.

다음 명령을 실행하여 `jemalloc`에 현재 프로파일을 플러시하도록 요청할 수 있습니다:

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

생성된 파일에는 접두사 뒤에 PID와 시퀀스 번호가 붙습니다.


## 힙 프로파일 분석 \{#analyzing-heap-profiles\}

힙 프로파일이 생성된 후에는 이를 분석해야 합니다.
이를 위해 `jemalloc`의 도구인 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)을 사용할 수 있습니다. 이 도구는 여러 방법으로 설치할 수 있습니다:

- 시스템 패키지 관리자를 사용
- [jemalloc repo](https://github.com/jemalloc/jemalloc)를 클론한 후 루트 폴더에서 `autogen.sh`를 실행. 이렇게 하면 `bin` 폴더 안에 `jeprof` 스크립트가 제공됩니다

`jeprof`를 사용하면 힙 프로파일로부터 여러 가지 형식의 결과를 생성할 수 있습니다.
도구의 사용 방법과 다양한 옵션에 대한 정보는 `jeprof --help`를 실행하여 확인할 수 있습니다.

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

### Prometheus \{#prometheus\}

`asynchronous_metrics`에 포함된 모든 `jemalloc` 관련 메트릭은 ClickHouse와 Keeper 모두에서 Prometheus 엔드포인트를 통해서도 노출됩니다.

[참고](/operations/server-configuration-parameters/settings#prometheus)

### Keeper의 `jmst` 4LW 명령 \{#jmst-4lw-command-in-keeper\}

Keeper는 `jmst` 4LW 명령을 지원하며, 이 명령은 [기본 allocator 통계](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)를 반환합니다:

```sh
echo jmst | nc localhost 9181
```
