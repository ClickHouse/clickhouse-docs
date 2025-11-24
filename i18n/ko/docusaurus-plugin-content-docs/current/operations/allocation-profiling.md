---
'description': 'ClickHouse에서의 할당 프로파일링에 대한 페이지'
'sidebar_label': '할당 프로파일링'
'slug': '/operations/allocation-profiling'
'title': '할당 프로파일링'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 할당 프로파일링

ClickHouse는 전역 할당자로 [jemalloc](https://github.com/jemalloc/jemalloc)을 사용합니다. Jemalloc은 할당 샘플링 및 프로파일링을 위한 몇 가지 도구를 제공합니다.  
할당 프로파일링을 더 편리하게 하기 위해 ClickHouse와 Keeper는 구성, 쿼리 설정, `SYSTEM` 명령 및 Keeper의 네 글자 단어(4LW) 명령을 사용하여 샘플링을 제어할 수 있도록 허용합니다.   
또한 샘플은 `system.trace_log` 테이블의 `JemallocSample` 유형 아래에 수집될 수 있습니다.

:::note

이 가이드는 버전 25.9 이상에 적용됩니다.
이전 버전의 경우 [25.9 이전 버전의 할당 프로파일링](/operations/allocation-profiling-old.md)을 확인하십시오.

:::

## 할당 샘플링 {#sampling-allocations}

`jemalloc`에서 할당을 샘플링하고 프로파일링하려면 `jemalloc_enable_global_profiler` 구성을 활성화하여 ClickHouse/Keeper를 시작해야 합니다.

```xml
<clickhouse>
    <jemalloc_enable_global_profiler>1</jemalloc_enable_global_profiler>
</clickhouse>
```

`jemalloc`은 할당을 샘플링하고 정보를 내부적으로 저장합니다.

`jemalloc_enable_profiler` 설정을 사용하여 쿼리당 할당을 활성화할 수도 있습니다.

:::warning 경고
ClickHouse는 할당이 많은 애플리케이션이므로 jemalloc 샘플링은 성능 오버헤드를 초래할 수 있습니다.
:::

## `system.trace_log`에 jemalloc 샘플 저장 {#storing-jemalloc-samples-in-system-trace-log}

모든 jemalloc 샘플을 `JemallocSample` 유형 아래의 `system.trace_log`에 저장할 수 있습니다.
전역적으로 활성화하려면 `jemalloc_collect_global_profile_samples_in_trace_log` 구성을 사용할 수 있습니다.

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning 경고
ClickHouse는 할당이 많은 애플리케이션이므로 `system.trace_log`에서 모든 샘플을 수집하는 것은 높은 부하를 초래할 수 있습니다.
:::

`jemalloc_collect_profile_samples_in_trace_log` 설정을 사용하여 쿼리당 활성화할 수도 있습니다.

### `system.trace_log`를 사용한 쿼리의 메모리 사용 분석 예제 {#example-analyzing-memory-usage-trace-log}

먼저, jemalloc 프로파일러를 활성화하고 샘플을 `system.trace_log`에 수집하면서 쿼리를 실행해야 합니다:

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
ClickHouse가 `jemalloc_enable_global_profiler`로 시작되었다면, `jemalloc_enable_profiler`를 활성화할 필요가 없습니다.  
`jemalloc_collect_global_profile_samples_in_trace_log`와 `jemalloc_collect_profile_samples_in_trace_log`에 대해서도 마찬가지입니다.
:::

`system.trace_log`를 플러시합니다:

```sql
SYSTEM FLUSH LOGS trace_log
```
그리고 쿼리를 통해 각 시간 지점에서 실행한 쿼리의 메모리 사용량을 가져옵니다:
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

메모리 사용량이 가장 높았던 시간을 찾을 수도 있습니다:

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

그 결과를 사용하여 해당 시점에서 가장 활성화된 할당이 어디에서 발생했는지 확인할 수 있습니다:

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

## 힙 프로파일 플러시하기 {#flushing-heap-profiles}

기본적으로 힙 프로파일 파일은 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`에 생성되며, 여기서 `_pid_`는 ClickHouse의 PID이고, `_seqnum_`은 현재 힙 프로파일의 전역 순서 번호입니다.  
Keeper의 경우, 기본 파일은 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`이며 동일한 규칙을 따릅니다.

현재 프로파일을 플러시하도록 `jemalloc`에 지시하려면 다음을 실행하십시오:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">
    
```sql
SYSTEM JEMALLOC FLUSH PROFILE
```

플러시된 프로파일의 위치를 반환합니다.

</TabItem>
<TabItem value="keeper" label="Keeper">
    
```sh
echo jmfp | nc localhost 9181
```

</TabItem>
</Tabs>

`prof_prefix` 옵션과 함께 `MALLOC_CONF` 환경 변수를 추가하여 다른 위치를 정의할 수 있습니다.  
예를 들어, 프로파일을 `/data` 폴더에 생성하고 파일 이름 접두사가 `my_current_profile`이 되도록 하려면 다음 환경 변수를 사용하여 ClickHouse/Keeper를 실행할 수 있습니다:

```sh
MALLOC_CONF=prof_prefix:/data/my_current_profile
```

생성된 파일은 접두사 PID와 시퀀스 번호가 추가됩니다.

## 힙 프로파일 분석하기 {#analyzing-heap-profiles}

힙 프로파일이 생성된 후, 이를 분석해야 합니다.  
이를 위해 `jemalloc`의 도구인 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)를 사용할 수 있습니다. 여러 가지 방법으로 설치할 수 있습니다:
- 시스템의 패키지 관리자를 사용하여 설치
- [jemalloc 리포지토리](https://github.com/jemalloc/jemalloc)를 클론하고 루트 폴더에서 `autogen.sh`를 실행합니다. 이렇게 하면 `bin` 폴더에 `jeprof` 스크립트가 제공됩니다.

:::note
`jeprof`는 스택 트레이스를 생성하기 위해 `addr2line`을 사용하므로 상당히 느릴 수 있습니다.  
그럴 경우, 도구의 [대체 구현](https://github.com/gimli-rs/addr2line)을 설치하는 것이 좋습니다.   

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

대신, `llvm-addr2line`도 잘 작동합니다.

:::

`jeprof`를 사용하여 힙 프로파일에서 생성할 수 있는 다양한 형식이 있습니다.
도구의 사용 및 다양한 옵션에 대한 정보를 얻으려면 `jeprof --help`를 실행하는 것이 좋습니다. 

일반적으로 `jeprof` 명령은 다음과 같이 사용됩니다:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

두 프로파일 간의 할당을 비교하려면 `base` 인수를 설정할 수 있습니다:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### 예제 {#examples}

- 각 절차가 한 줄에 작성된 텍스트 파일을 생성하려면:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- 호출 그래프가 포함된 PDF 파일을 생성하려면:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### 섬광 그래프 생성하기 {#generating-flame-graph}

`jeprof`는 섬광 그래프 생성을 위해 축약된 스택을 생성할 수 있습니다.

`--collapsed` 인수를 사용해야 합니다:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

그 후, 많은 다양한 도구를 사용하여 축약된 스택을 시각화할 수 있습니다.

가장 인기 있는 도구는 [FlameGraph](https://github.com/brendangregg/FlameGraph)로, `flamegraph.pl`이라는 스크립트를 포함하고 있습니다:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

또 다른 흥미로운 도구는 [speedscope](https://www.speedscope.app/)로, 수집된 스택을 보다 인터랙티브한 방식으로 분석할 수 있습니다.

## 프로파일러에 대한 추가 옵션 {#additional-options-for-profiler}

`jemalloc`에는 프로파일러와 관련된 다양한 옵션이 있습니다. 이들은 `MALLOC_CONF` 환경 변수를 수정하여 제어할 수 있습니다.
예를 들어 할당 샘플 간의 간격은 `lg_prof_sample`로 제어할 수 있습니다.  
N 바이트마다 힙 프로파일을 덤프하려면 `lg_prof_interval`을 사용하여 활성화할 수 있습니다.  

모든 옵션의 완전한 목록은 `jemalloc`의 [참조 페이지](https://jemalloc.net/jemalloc.3.html)를 확인하는 것이 좋습니다.

## 기타 리소스 {#other-resources}

ClickHouse/Keeper는 `jemalloc` 관련 메트릭을 여러 방법으로 공개합니다.

:::warning 경고
이 메트릭이 서로 동기화되어 있지 않으며 값이 달라질 수 있다는 점을 인지하는 것이 중요합니다.
:::

### 시스템 테이블 `asynchronous_metrics` {#system-table-asynchronous_metrics}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric LIKE '%jemalloc%'
FORMAT Vertical
```

[참조](/operations/system-tables/asynchronous_metrics)

### 시스템 테이블 `jemalloc_bins` {#system-table-jemalloc_bins}

다양한 크기 클래스(빈)에서 jemalloc 할당자를 통해 수행된 메모리 할당에 대한 정보를 포함하며, 모든 아레나에서 집계됩니다.

[참조](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

`asynchronous_metrics`의 모든 `jemalloc` 관련 메트릭은 ClickHouse와 Keeper의 Prometheus 엔드포인트를 통해 공개됩니다.

[참조](/operations/server-configuration-parameters/settings#prometheus)

### Keeper의 `jmst` 4LW 명령 {#jmst-4lw-command-in-keeper}

Keeper는 기본 할당자 통계를 반환하는 `jmst` 4LW 명령을 지원합니다.  
[기본 할당자 통계](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics):

```sh
echo jmst | nc localhost 9181
```
