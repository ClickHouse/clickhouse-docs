---
description: 'Системная таблица, содержащая трассировки стека, собранные профилировщиком запросов с выборочным профилированием.'
keywords: ['системная таблица', 'trace_log']
slug: /operations/system-tables/trace_log
title: 'system.trace_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.trace&#95;log {#systemtrace&#95;log}

<SystemTableCloud />

Содержит стеки трассировки, собираемые [sampling query profiler](../../operations/optimizing-performance/sampling-query-profiler.md).

ClickHouse создаёт эту таблицу, когда задана секция конфигурации сервера [trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log). См. также настройки: [query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns), [query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns), [memory&#95;profiler&#95;step](../../operations/settings/settings.md#memory_profiler_step),
[memory&#95;profiler&#95;sample&#95;probability](../../operations/settings/settings.md#memory_profiler_sample_probability), [trace&#95;profile&#95;events](../../operations/settings/settings.md#trace_profile_events).

Для анализа журналов используйте функции интроспекции `addressToLine`, `addressToLineWithInlines`, `addressToSymbol` и `demangle`.

Столбцы:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — имя хоста сервера, выполняющего запрос.

* `event_date` ([Date](../../sql-reference/data-types/date.md)) — дата момента выборки.

* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — временная метка момента выборки.

* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — временная метка момента выборки с точностью до микросекунд.

* `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — временная метка момента выборки в наносекундах.

* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ревизия сборки сервера ClickHouse.

  При подключении к серверу с помощью `clickhouse-client` вы видите строку, похожую на `Connected to ClickHouse server version 19.18.1.`. Это поле содержит `revision`, но не `version` сервера.

* `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — тип трассировки:
  * `Real` — сбор stack trace по реальному времени (wall-clock time).
  * `CPU` — сбор stack trace по времени работы CPU.
  * `Memory` — сбор аллокаций и освобождений при превышении выделением памяти следующего watermark.
  * `MemorySample` — сбор случайных аллокаций и освобождений.
  * `MemoryPeak` — сбор обновлений пикового потребления памяти.
  * `ProfileEvent` — сбор увеличений profile events.
  * `JemallocSample` — сбор сэмплов jemalloc.
  * `MemoryAllocatedWithoutCheck` — сбор значительных аллокаций (&gt;16MiB), выполняемый с игнорированием любых лимитов памяти (только для разработчиков ClickHouse).
  * `Instrumentation` — трассы, собранные инструментированием, выполняемым через XRay.

* `cpu_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — идентификатор CPU.

* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — идентификатор потока.

* `query_id` ([String](../../sql-reference/data-types/string.md)) — идентификатор запроса, который можно использовать для получения деталей о выполнявшемся запросе из системной таблицы [query&#95;log](/operations/system-tables/query_log).

* `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — stack trace в момент выборки. Каждый элемент — виртуальный адрес памяти внутри процесса сервера ClickHouse.

* `size` ([Int64](../../sql-reference/data-types/int-uint.md)) - для типов трассировки `Memory`, `MemorySample` или `MemoryPeak` — количество выделенной памяти, для остальных типов трассировки — 0.

* `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) - для типа трассировки `ProfileEvent` — имя обновлённого profile event, для остальных типов трассировки — пустая строка.

* `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) - для типа трассировки `ProfileEvent` — величина увеличения profile event, для остальных типов трассировки — 0.

* `symbols`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), если символизация включена, содержит деманглированные имена символов, соответствующих `trace`.

* `lines`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), если символизация включена, содержит строки с именами файлов и номерами строк, соответствующих `trace`.

* `function_id` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)), для типа трассировки Instrumentation — идентификатор, назначенный функции в секции xray&#95;instr&#95;map ELF-бинарного файла.

* `function_name` ([Nullable(String)](../../sql-reference/data-types/nullable.md)), для типа трассировки Instrumentation — имя инструментированной функции.

* `handler` ([Nullable(String)](../../sql-reference/data-types/nullable.md)), для типа трассировки Instrumentation — обработчик инструментированной функции.

* `entry_type` ([Nullable(Enum(&#39;Entry&#39; = 0, &#39;Exit&#39; = 1))](../../sql-reference/data-types/nullable.md)), для типа трассировки Instrumentation — тип события трассы (вход/выход).

* `duration_nanoseconds` ([Nullable(UInt64)](../../sql-reference/data-types/nullable.md)), для типа трассировки Instrumentation — время работы функции в наносекундах.

Символизацию можно включить или отключить в параметре `symbolize` в секции `trace_log` конфигурационного файла сервера.

**Пример**

```sql
SELECT * FROM system.trace_log LIMIT 1 \G
```

```text
Строка 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2025-11-11
event_time:              2025-11-11 11:53:59
event_time_microseconds: 2025-11-11 11:53:59.128333
timestamp_ns:            1762862039128333000
revision:                54504
trace_type:              Instrumentation
cpu_id:                  19
thread_id:               3166432 -- 3,17 млн
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

## Преобразование в формат трассировки событий Chrome {#chrome-event-trace-format}

Данные профилирования можно преобразовать в формат трассировки событий Chrome с помощью следующего запроса. Сохраните запрос в файл `chrome_trace.sql`:

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

И выполнить его в ClickHouse Client, чтобы экспортировать результат в файл `trace.json`, который затем можно импортировать либо в [Perfetto](https://ui.perfetto.dev/), либо в [speedscope](https://www.speedscope.app/).

```bash
echo $(clickhouse client --query "$(cat chrome_trace.sql)") > trace.json
```

Мы можем опустить часть со стеком, если хотим более компактную, но менее информативную трассировку.

**См. также**

* [SYSTEM INSTRUMENT](../../sql-reference/statements/system.md#instrument) — Добавить или удалить точки инструментирования.
* [system.instrumentation](../../operations/system-tables/instrumentation.md) — Просматривать проинструментированные точки.
* [system.symbols](../../operations/system-tables/symbols.md) — Просматривать символы для добавления точек инструментирования.
