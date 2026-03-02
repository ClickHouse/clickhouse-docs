---
description: 'ClickHouse의 메모리 할당 프로파일링을 자세히 설명하는 페이지'
sidebar_label: '25.9 이전 버전용 메모리 할당 프로파일링'
slug: /operations/allocation-profiling-old
title: '25.9 이전 버전용 메모리 할당 프로파일링'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 25.9 이전 버전에서의 할당 프로파일링 \{#allocation-profiling-for-versions-before-259\}

ClickHouse는 전역 할당자로 [jemalloc](https://github.com/jemalloc/jemalloc)을 사용합니다. Jemalloc에는 메모리 할당 샘플링 및 프로파일링을 위한 몇 가지 도구가 포함되어 있습니다.  
할당 프로파일링을 보다 편리하게 수행할 수 있도록 Keeper에는 `SYSTEM` 명령과 함께 four letter word(4LW) 명령이 제공됩니다.

## 할당 샘플링과 힙 프로파일 플러시 \{#sampling-allocations-and-flushing-heap-profiles\}

`jemalloc`에서 메모리 할당을 샘플링하고 프로파일링하려면 환경 변수 `MALLOC_CONF`로 프로파일링을 활성화한 상태에서 ClickHouse/Keeper를 시작해야 합니다:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:true
```

`jemalloc`은(는) 메모리 할당을 샘플링하고 해당 정보를 내부에 저장합니다.

다음 명령을 실행하여 `jemalloc`에 현재 프로파일을 플러시하도록 지시할 수 있습니다:

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC FLUSH PROFILE
    ```
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmfp | nc localhost 9181
    ```
  </TabItem>
</Tabs>

기본적으로 힙 프로파일 파일은 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap` 경로에 생성되며, 여기서 `_pid_`는 ClickHouse의 PID이고 `_seqnum_`은 현재 힙 프로파일에 대한 전역 시퀀스 번호입니다.
Keeper의 기본 파일은 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`이며 동일한 규칙을 따릅니다.

`MALLOC_CONF` 환경 변수에 `prof_prefix` 옵션을 추가하여 다른 위치를 지정할 수 있습니다.
예를 들어 `/data` 폴더에 프로파일을 생성하고 파일 이름 접두사를 `my_current_profile`로 지정하려는 경우, 다음과 같이 환경 변수를 설정하여 ClickHouse/Keeper를 실행하면 됩니다:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```

생성된 파일 이름에는 접두사 뒤에 PID와 시퀀스 번호가 붙습니다.


## 힙 프로파일 분석 \{#analyzing-heap-profiles\}

힙 프로파일이 생성된 후에는 이를 분석해야 합니다.
이를 위해 `jemalloc`의 도구인 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)를 사용할 수 있습니다. 이 도구는 다음과 같은 방법으로 설치할 수 있습니다:

* 시스템 패키지 관리자를 사용합니다.
* [jemalloc 저장소](https://github.com/jemalloc/jemalloc)를 클론한 후 루트 폴더에서 `autogen.sh`를 실행합니다. 이렇게 하면 `bin` 폴더 안에 `jeprof` 스크립트가 제공됩니다.

:::note
`jeprof`는 스택 트레이스를 생성하기 위해 `addr2line`을 사용하는데, 이 과정이 매우 느릴 수 있습니다.
이때는 도구의 [대체 구현](https://github.com/gimli-rs/addr2line)을 설치하는 것이 좋습니다.

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

:::

`jeprof`를 사용하여 힙 프로파일(heap profile)에서 생성할 수 있는 형식은 매우 다양합니다.
도구의 사용 방법과 제공되는 다양한 옵션에 대한 정보는 `jeprof --help`를 실행하여 확인하는 것이 좋습니다.

일반적으로 `jeprof` 명령은 다음과 같이 사용합니다:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

두 프로파일 간에 어떤 메모리 할당이 발생했는지 비교하려면 `base` 인자를 설정하십시오:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```


### 예시 \{#examples\}

* 각 프로시저를 한 줄에 하나씩 기록한 텍스트 파일을 생성하려면:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

* 호출 그래프가 포함된 PDF 파일을 생성하려면:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```


### 플레임 그래프 생성 \{#generating-flame-graph\}

`jeprof`를 사용하여 플레임 그래프 생성을 위한 접힌 스택(collapsed stack)을 만들 수 있습니다.

`--collapsed` 옵션을 사용해야 합니다:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

그 후에는 축약된 스택(collapsed stack)을 시각화하기 위해 다양한 도구를 사용할 수 있습니다.

가장 널리 사용되는 도구는 `flamegraph.pl` 스크립트를 포함하는 [FlameGraph](https://github.com/brendangregg/FlameGraph)입니다.

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

또 하나의 유용한 도구로, 수집된 스택을 보다 대화형으로 분석할 수 있게 해주는 [speedscope](https://www.speedscope.app/)가 있습니다.


## 런타임 중 allocation profiler 제어 \{#controlling-allocation-profiler-during-runtime\}

ClickHouse/Keeper를 profiler를 활성화한 상태로 시작한 경우, 런타임 중에 allocation profiling을 비활성화/활성화하기 위한 추가 명령을 사용할 수 있습니다.
이러한 명령을 사용하면 특정 구간만 선택적으로 프로파일링하기가 더 쉽습니다.

profiler를 비활성화하려면:

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC DISABLE PROFILE
    ```
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmdp | nc localhost 9181
    ```
  </TabItem>
</Tabs>

profiler를 활성화하려면:

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC ENABLE PROFILE
    ```
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmep | nc localhost 9181
    ```
  </TabItem>
</Tabs>

또한 기본적으로 활성화되어 있는 `prof_active` 옵션을 설정하여 profiler의 초기 상태를 제어할 수도 있습니다.
예를 들어, 시작 시점에는 메모리 allocation을 샘플링하지 않고 이후부터만 샘플링하려는 경우, profiler를 활성화하도록 설정할 수 있습니다. 다음과 같은 환경 변수를 설정하여 ClickHouse/Keeper를 시작할 수 있습니다:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

프로파일러는 추후에 활성화할 수 있습니다.


## 프로파일러를 위한 추가 옵션 \{#additional-options-for-profiler\}

`jemalloc`에는 프로파일러와 관련된 다양한 옵션이 있습니다. 이러한 옵션은 `MALLOC_CONF` 환경 변수를 수정하여 제어할 수 있습니다.
예를 들어, 할당 샘플 간의 간격은 `lg_prof_sample`로 제어할 수 있습니다.  
힙 프로파일을 N 바이트마다 덤프하려면 `lg_prof_interval`을 사용하여 활성화할 수 있습니다.  

전체 옵션 목록은 `jemalloc` [참조 페이지](https://jemalloc.net/jemalloc.3.html)를 참조하는 것이 좋습니다.

## 기타 자료 \{#other-resources\}

ClickHouse/Keeper는 `jemalloc` 관련 메트릭을 여러 가지 방식으로 노출합니다.

:::warning 경고
이러한 메트릭은 서로 동기화되지 않으며 값이 서로 어긋날 수 있다는 점을 반드시 유의해야 합니다.
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

jemalloc 할당자를 통해 서로 다른 크기 클래스(빈)에서 수행된 메모리 할당 정보를, 모든 arena에서 집계한 형태로 제공합니다.

[참고](/operations/system-tables/jemalloc_bins)

### Prometheus \{#prometheus\}

`asynchronous_metrics`의 모든 `jemalloc` 관련 메트릭은 ClickHouse와 Keeper 모두에서 Prometheus 엔드포인트를 통해서도 노출됩니다.

[참고](/operations/server-configuration-parameters/settings#prometheus)

### Keeper의 `jmst` 4LW 명령 \{#jmst-4lw-command-in-keeper\}

Keeper는 `jmst` 4LW 명령을 지원하며, 이 명령은 [기본 allocator 통계](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)를 반환합니다:

```sh
echo jmst | nc localhost 9181
```
