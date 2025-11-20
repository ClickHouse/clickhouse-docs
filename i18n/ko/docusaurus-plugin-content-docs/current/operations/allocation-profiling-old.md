---
'description': 'ClickHouse에서의 할당 프로파일링에 대한 페이지'
'sidebar_label': '25.9 이전 버전의 할당 프로파일링'
'slug': '/operations/allocation-profiling-old'
'title': '25.9 이전 버전의 할당 프로파일링'
'doc_type': 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# Allocation profiling for versions before 25.9

ClickHouse는 [jemalloc](https://github.com/jemalloc/jemalloc)을 전역 할당자로 사용합니다. Jemalloc은 할당 샘플링 및 프로파일링을 위한 몇 가지 도구를 제공합니다.  
할당 프로파일링을 보다 편리하게 하기 위해, `SYSTEM` 명령어와 Keeper에서 사용할 수 있는 네 글자 단어(4LW) 명령어가 제공됩니다.

## 샘플링 할당 및 힙 프로파일 플러시 {#sampling-allocations-and-flushing-heap-profiles}

`jemalloc`에서 할당을 샘플링하고 프로파일링하려면, 환경 변수 `MALLOC_CONF`를 사용하여 프로파일링이 활성화된 상태로 ClickHouse/Keeper를 시작해야 합니다:

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc`은 할당을 샘플링하고 정보를 내부적으로 저장합니다.

현재 프로파일을 플러시하도록 `jemalloc`에 지시하려면 다음을 실행합니다:

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

기본적으로 힙 프로파일 파일은 `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`에 생성됩니다. 여기서 `_pid_`는 ClickHouse의 PID이며, `_seqnum_`은 현재 힙 프로파일의 전역 시퀀스 번호입니다.  
Keeper의 경우 기본 파일은 `/tmp/jemalloc_keeper._pid_._seqnum_.heap`이며, 동일한 규칙을 따릅니다.

다른 위치를 정의하려면 `prof_prefix` 옵션과 함께 `MALLOC_CONF` 환경 변수를 추가합니다.  
예를 들어 `/data` 폴더에 파일 이름 접두사가 `my_current_profile`인 프로파일을 생성하려면 다음 환경 변수로 ClickHouse/Keeper를 실행할 수 있습니다:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```

생성된 파일은 접두사 PID와 시퀀스 번호에 추가됩니다.

## 힙 프로파일 분석하기 {#analyzing-heap-profiles}

힙 프로파일이 생성된 후에는 분석해야 합니다.  
이를 위해 `jemalloc`의 도구인 [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)를 사용할 수 있습니다. 여러 가지 방법으로 설치할 수 있습니다:
- 시스템 패키지 관리자를 사용하여 설치
- [jemalloc 리포지토리](https://github.com/jemalloc/jemalloc)를 클론하고 루트 폴더에서 `autogen.sh`를 실행하는 방법입니다. 이렇게 하면 `bin` 폴더에 `jeprof` 스크립트를 제공받습니다.

:::note
`jeprof`는 스택 트레이스를 생성하기 위해 `addr2line`을 사용하며, 이는 매우 느릴 수 있습니다.  
그럴 경우, 도구의 [대체 구현](https://github.com/gimli-rs/addr2line)을 설치하는 것이 좋습니다.

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

`jeprof`를 사용하여 힙 프로파일에서 생성할 수 있는 다양한 형식이 많이 있습니다.
도구의 사용법과 다양한 옵션에 대한 정보는 `jeprof --help`를 실행하여 확인하는 것이 좋습니다.

일반적으로 `jeprof` 명령은 다음과 같이 사용됩니다:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

두 프로파일 간에 어떤 할당이 발생했는지 비교하고 싶다면 `base` 인수를 설정할 수 있습니다:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### 예제들 {#examples}

- 각 프로시저가 줄마다 기록된 텍스트 파일을 생성하려면:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- 호출 그래프가 포함된 PDF 파일을 생성하려면:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### 플레임 그래프 생성하기 {#generating-flame-graph}

`jeprof`는 플레임 그래프 생성을 위한 축약된 스택 생성 기능을 제공합니다.

`--collapsed` 인수를 사용해야 합니다:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

그 후 다양한 도구를 사용하여 축약된 스택을 시각화할 수 있습니다.

가장 인기 있는 도구는 [FlameGraph](https://github.com/brendangregg/FlameGraph)로, `flamegraph.pl`이라는 스크립트를 포함하고 있습니다:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

또 다른 흥미로운 도구는 [speedscope](https://www.speedscope.app/)로, 수집된 스택을 보다 인터랙티브한 방식으로 분석할 수 있습니다.

## 런타임 동안 할당 프로파일러 제어하기 {#controlling-allocation-profiler-during-runtime}

ClickHouse/Keeper가 프로파일러 활성화 상태로 시작되면 런타임 중 할당 프로파일링을 비활성화/활성화하는 추가 명령이 지원됩니다.
이 명령을 사용하면 특정 간격만을 프로파일링하는 것이 더 쉽습니다.

프로파일러를 비활성화하려면:

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

프로파일러를 활성화하려면:

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

프로파일러의 초기 상태를 제어할 수 있는 `prof_active` 옵션을 설정할 수도 있으며, 기본적으로 활성화되어 있습니다.  
예를 들어, 시작할 때 할당을 샘플링하지 않고 그 이후에만 할당을 샘플링하고 싶다면 프로파일러를 활성화할 수 있습니다. 다음 환경 변수로 ClickHouse/Keeper를 시작할 수 있습니다:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

프로파일러는 나중에 활성화할 수 있습니다.

## 프로파일러를 위한 추가 옵션 {#additional-options-for-profiler}

`jemalloc`은 프로파일러와 관련된 다양한 옵션을 제공합니다. 이들은 `MALLOC_CONF` 환경 변수를 수정하여 제어할 수 있습니다.
예를 들어, 할당 샘플 간의 간격은 `lg_prof_sample`로 제어할 수 있습니다.  
N 바이트마다 힙 프로파일을 덤프하려면 `lg_prof_interval`을 사용하여 활성화할 수 있습니다.

모든 옵션의 전체 목록은 `jemalloc`의 [참조 페이지](https://jemalloc.net/jemalloc.3.html)를 확인하는 것이 좋습니다.

## 기타 리소스 {#other-resources}

ClickHouse/Keeper는 다양한 방법으로 `jemalloc` 관련 메트릭을 노출합니다.

:::warning 경고
이 메트릭들은 서로 동기화되지 않으며 값이 변동될 수 있음을 인지하는 것이 중요합니다.
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

`asynchronous_metrics`의 모든 `jemalloc` 관련 메트릭은 ClickHouse와 Keeper의 Prometheus 엔드포인트를 통해 노출됩니다.

[참조](/operations/server-configuration-parameters/settings#prometheus)

### Keeper의 `jmst` 4LW 명령 {#jmst-4lw-command-in-keeper}

Keeper는 [기본 할당자 통계](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)를 반환하는 `jmst` 4LW 명령을 지원합니다:

```sh
echo jmst | nc localhost 9181
```
