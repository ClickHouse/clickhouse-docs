---
description: '샘플링 쿼리 프로파일러가 수집한 스택 트레이스를 포함하는 시스템 테이블입니다.'
keywords: ['시스템 테이블', 'trace_log']
slug: /operations/system-tables/trace_log
title: 'system.trace_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.trace_log \{#systemtrace_log\}

<SystemTableCloud />

[sampling query profiler](../../operations/optimizing-performance/sampling-query-profiler.md)가 수집한 스택 트레이스를 포함합니다.

ClickHouse는 [trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log) 서버 구성 섹션이 설정되면 이 테이블을 생성합니다. 또한 다음 설정을 참조하십시오: [query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns), [query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns), [memory&#95;profiler&#95;step](../../operations/settings/settings.md#memory_profiler_step),
[memory&#95;profiler&#95;sample&#95;probability](../../operations/settings/settings.md#memory_profiler_sample_probability), [trace&#95;profile&#95;events](../../operations/settings/settings.md#trace_profile_events).

로그를 분석하려면 `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` 및 `demangle`와 같은 내부 분석 함수(introspection function)를 사용하십시오.

컬럼:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 쿼리를 실행하는 서버의 호스트 이름입니다.

* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 샘플링 시점의 날짜입니다.

* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 샘플링 시점의 타임스탬프입니다.

* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 마이크로초 단위 정밀도를 가진 샘플링 시점의 타임스탬프입니다.

* `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 나노초 단위의 샘플링 시점 타임스탬프입니다.

* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 서버 빌드 리비전입니다.

  `clickhouse-client`로 서버에 연결하면 `Connected to ClickHouse server version 19.18.1.`와 유사한 문자열이 표시됩니다. 이 필드에는 서버의 `version`이 아니라 `revision` 값이 들어 있습니다.

* `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — 트레이스 유형입니다:
  * `Real` — 벽시계 시간(wall-clock time)에 따라 스택 트레이스를 수집합니다.
  * `CPU` — CPU 시간에 따라 스택 트레이스를 수집합니다.
  * `Memory` — 메모리 할당이 다음 워터마크 임계값을 초과할 때 할당 및 해제를 수집합니다.
  * `MemorySample` — 무작위 할당 및 해제를 수집합니다.
  * `MemoryPeak` — 최대 메모리 사용량의 변화를 수집합니다.
  * `ProfileEvent` — 프로파일 이벤트 증가량을 수집합니다.
  * `JemallocSample` — jemalloc 샘플을 수집합니다.
  * `MemoryAllocatedWithoutCheck` — 메모리 제한을 무시하고 수행되는 대규모 할당(&gt;16MiB)을 수집합니다(ClickHouse 개발자 전용).
  * `Instrumentation` — XRay를 통해 수행된 계측으로 수집된 트레이스입니다.

* `cpu_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — CPU 식별자입니다.

* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 스레드 식별자입니다.

* `query_id` ([String](../../sql-reference/data-types/string.md)) — [query&#95;log](/operations/system-tables/query_log) 시스템 테이블에서 실행 중이던 쿼리의 세부 정보를 가져오는 데 사용할 수 있는 쿼리 식별자입니다.

* `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 샘플링 시점의 스택 트레이스입니다. 각 요소는 ClickHouse 서버 프로세스 내의 가상 메모리 주소입니다.

* `size` ([Int64](../../sql-reference/data-types/int-uint.md)) - 트레이스 유형이 `Memory`, `MemorySample` 또는 `MemoryPeak`인 경우 할당된 메모리 양이며, 다른 트레이스 유형의 경우 0입니다.

* `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) - 트레이스 유형이 `ProfileEvent`인 경우 업데이트된 프로파일 이벤트의 이름이며, 다른 트레이스 유형의 경우 빈 문자열입니다.

* `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) - 트레이스 유형이 `ProfileEvent`인 경우 프로파일 이벤트 증가량이며, 다른 트레이스 유형의 경우 0입니다.

* `symbols`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), 심볼라이제이션이 활성화된 경우 `trace`에 해당하는 디맹글된 심볼 이름을 포함합니다.

* `lines`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), 심볼라이제이션이 활성화된 경우 `trace`에 해당하는 파일 이름과 행 번호가 포함된 문자열을 포함합니다.

* `function_id` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)), 트레이스 유형이 Instrumentation인 경우 ELF 바이너리의 xray&#95;instr&#95;map 섹션에서 함수에 할당된 ID입니다.

* `function_name` ([Nullable(String)](../../sql-reference/data-types/nullable.md)), 트레이스 유형이 Instrumentation인 경우 계측된 함수의 이름입니다.

* `handler` ([Nullable(String)](../../sql-reference/data-types/nullable.md)), 트레이스 유형이 Instrumentation인 경우 계측된 함수의 핸들러입니다.

* `entry_type` ([Nullable(Enum(&#39;Entry&#39; = 0, &#39;Exit&#39; = 1))](../../sql-reference/data-types/nullable.md)), 트레이스 유형이 Instrumentation인 경우 트레이스의 진입 유형입니다.

* `duration_nanoseconds` ([Nullable(UInt64)](../../sql-reference/data-types/nullable.md)), 트레이스 유형이 Instrumentation인 경우 함수가 실행된 시간(나노초 단위)입니다.

심볼라이제이션은 서버 구성 파일의 `trace_log` 아래에 있는 `symbolize`에서 활성화하거나 비활성화할 수 있습니다.

**예제**

```sql
SELECT * FROM system.trace_log LIMIT 1 \G
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2025-11-11
event_time:              2025-11-11 11:53:59
event_time_microseconds: 2025-11-11 11:53:59.128333
timestamp_ns:            1762862039128333000
revision:                54504
trace_type:              Instrumentation
cpu_id:                  19
thread_id:               3166432 -- 3.17 million
query_id:                ef462508-e189-4ea2-b231-4489506728e8
trace:                   [350594916,447733712,447742095,447727324,447726659,221642873,450882315,451852359,451905441,451885554,512404306,512509092,612861767,612863269,612466367,612455825,137631896259267,137631896856768]
size:                    0
ptr:                     0
memory_context:          Unknown
memory_blocked_context:  Unknown
event:
increment:               0
symbols:                 ['StackTrace::StackTrace()','DB::InstrumentationManager::createTraceLogElement(DB::InstrumentationManager::InstrumentedPointInfo const&, XRayEntryType, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>) const','DB::InstrumentationManager::profile(XRayEntryType, DB::InstrumentationManager::InstrumentedPointInfo const&)','DB::InstrumentationManager::dispatchHandlerImpl(int, XRayEntryType)','DB::InstrumentationManager::dispatchHandler(int, XRayEntryType)','__xray_FunctionEntry','DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)','DB::logQueryStart(std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>> const&, std::__1::shared_ptr<DB::Context> const&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, unsigned long, std::__1::shared_ptr<DB::IAST> const&, DB::QueryPipeline const&, DB::IInterpreter const*, bool, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, bool)','DB::executeQueryImpl(char const*, char const*, std::__1::shared_ptr<DB::Context>, DB::QueryFlags, DB::QueryProcessingStage::Enum, std::__1::unique_ptr<DB::ReadBuffer, std::__1::default_delete<DB::ReadBuffer>>&, std::__1::shared_ptr<DB::IAST>&, std::__1::shared_ptr<DB::ImplicitTransactionControlExecutor>, std::__1::function<void ()>)','DB::executeQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::shared_ptr<DB::Context>, DB::QueryFlags, DB::QueryProcessingStage::Enum)','DB::TCPHandler::runImpl()','DB::TCPHandler::run()','Poco::Net::TCPServerConnection::start()','Poco::Net::TCPServerDispatcher::run()','Poco::PooledThread::run()','Poco::ThreadImpl::runnableEntry(void*)','start_thread','__clone3']
lines:                   ['./build/../src/Common/StackTrace.cpp:395','./src/Common/StackTrace.h:62','./contrib/llvm-project/libcxx/include/__memory/shared_ptr.h:738','./build/./src/Interpreters/InstrumentationManager.cpp:257','./build/./src/Interpreters/InstrumentationManager.cpp:225','/home/ubuntu/ClickHouse/ClickHouse/build/programs/clickhouse','./build/./src/Interpreters/QueryMetricLog.cpp:0','./contrib/llvm-project/libcxx/include/__memory/shared_ptr.h:667','./build/./src/Interpreters/executeQuery.cpp:0','./build/./src/Interpreters/executeQuery.cpp:0','./contrib/llvm-project/libcxx/include/__memory/shared_ptr.h:744','./contrib/llvm-project/libcxx/include/__memory/shared_ptr.h:583','./build/../base/poco/Net/src/TCPServerConnection.cpp:54','../contrib/llvm-project/libcxx/include/__memory/unique_ptr.h:80','./build/../base/poco/Foundation/src/ThreadPool.cpp:219','../base/poco/Foundation/include/Poco/AutoPtr.h:77','/home/ubuntu/ClickHouse/ClickHouse/build/programs/clickhouse','/home/ubuntu/ClickHouse/ClickHouse/build/programs/clickhouse']
function_id:             231255
function_name:           DB::QueryMetricLog::startQuery(std::__1::basic_string<char, std::__1::char_traits<char>, std::__1::allocator<char>> const&, std::__1::chrono::time_point<std::__1::chrono::system_clock, std::__1::chrono::duration<long long, std::__1::ratio<1l, 1000000l>>>, unsigned long)
handler:                 profile
entry_type:              Exit
duration_nanoseconds:   58435
```

## Chrome Event Trace 형식으로 변환하기 \{#chrome-event-trace-format\}

프로파일링 데이터는 다음 쿼리를 사용하여 Chrome Event Trace 형식으로 변환할 수 있습니다. 이 쿼리를 `chrome_trace.sql` 파일에 저장하십시오:

```sql
WITH traces AS (
    SELECT * FROM system.trace_log
    WHERE event_date >= today() AND trace_type = 'Instrumentation' AND handler = 'profile'
    ORDER BY event_time, entry_type
)
SELECT
    format(
        '{{"traceEvents": [{}\n]}}',
        arrayStringConcat(
            groupArray(
                format(
                    '\n{{"name": "{}", "cat": "clickhouse", "ph": "{}", "ts": {}, "pid": 1, "tid": {}, "args": {{"query_id": "{}", "cpu_id": {}, "stack": [{}]}}}},',
                    function_name,
                    if(entry_type = 0, 'B', 'E'),
                    timestamp_ns/1000,
                    toString(thread_id),
                    query_id,
                    cpu_id,
                    arrayStringConcat(arrayMap((x, y) -> concat('"', x, ': ', y, '", '), lines, symbols))
                )
            )
        )
    )
FROM traces;
```

그리고 ClickHouse Client를 사용해 이를 실행하여 `trace.json` 파일로 내보낸 후, [Perfetto](https://ui.perfetto.dev/) 또는 [speedscope](https://www.speedscope.app/)에서 가져올 수 있습니다.

```bash
echo $(clickhouse client --query "$(cat chrome_trace.sql)") > trace.json
```

더 간결하지만 정보가 적은 트레이스를 원한다면 stack 부분을 생략할 수 있습니다.

**참고**

* [SYSTEM INSTRUMENT](../../sql-reference/statements/system.md#instrument) — 계측 포인트를 추가하거나 제거합니다.
* [system.instrumentation](../../operations/system-tables/instrumentation.md) — 계측된 포인트를 검사합니다.
* [system.symbols](../../operations/system-tables/symbols.md) — 계측 포인트를 추가하기 위해 심볼을 검사합니다.
