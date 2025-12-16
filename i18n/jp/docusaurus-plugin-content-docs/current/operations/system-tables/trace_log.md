---
description: 'サンプリングクエリプロファイラによって収集されたスタックトレースを含むシステムテーブル。'
keywords: ['システムテーブル', 'trace_log']
slug: /operations/system-tables/trace_log
title: 'system.trace_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.trace&#95;log {#systemtrace&#95;log}

<SystemTableCloud />

[sampling query profiler](../../operations/optimizing-performance/sampling-query-profiler.md) によって収集されたスタックトレースを格納します。

ClickHouse は、サーバー構成セクション [trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log) が設定されている場合にこのテーブルを作成します。あわせて次の設定も参照してください: [query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns)、[query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns)、[memory&#95;profiler&#95;step](../../operations/settings/settings.md#memory_profiler_step)、[memory&#95;profiler&#95;sample&#95;probability](../../operations/settings/settings.md#memory_profiler_sample_probability)、[trace&#95;profile&#95;events](../../operations/settings/settings.md#trace_profile_events)。

ログを分析するには、`addressToLine`、`addressToLineWithInlines`、`addressToSymbol`、`demangle` といったイントロスペクション関数を使用します。

カラム:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。

* `event_date` ([Date](../../sql-reference/data-types/date.md)) — サンプリング時点の日付。

* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — サンプリング時点のタイムスタンプ。

* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のサンプリング時点のタイムスタンプ。

* `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ナノ秒単位のサンプリング時点のタイムスタンプ。

* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse サーバーのビルドリビジョン。

  `clickhouse-client` でサーバーに接続すると、`Connected to ClickHouse server version 19.18.1.` のような文字列が表示されます。このフィールドにはサーバーの `version` ではなく `revision` が格納されます。

* `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — トレースの種類:
  * `Real` はウォールクロック時間に基づくスタックトレース収集を表します。
  * `CPU` は CPU 時間に基づくスタックトレース収集を表します。
  * `Memory` はメモリアロケーションが設定されたウォーターマーク（しきい値）を超えた場合のアロケーションおよびデアロケーションの収集を表します。
  * `MemorySample` はランダムなアロケーションおよびデアロケーションの収集を表します。
  * `MemoryPeak` はピークメモリ使用量の更新の収集を表します。
  * `ProfileEvent` はプロファイルイベントのインクリメントの収集を表します。
  * `JemallocSample` は jemalloc サンプルの収集を表します。
  * `MemoryAllocatedWithoutCheck` は、あらゆるメモリ制限を無視して実行される大きなアロケーション（&gt;16MiB）の収集を表します（ClickHouse 開発者のみ）。
  * `Instrumentation` は XRay によるインストルメンテーションによって収集されたトレースを表します。

* `cpu_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — CPU 識別子。

* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — スレッド識別子。

* `query_id` ([String](../../sql-reference/data-types/string.md)) — 実行中だったクエリの詳細を [query&#95;log](/operations/system-tables/query_log) システムテーブルから取得するために使用できるクエリ識別子。

* `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — サンプリング時点でのスタックトレース。各要素は ClickHouse サーバープロセス内の仮想メモリアドレスです。

* `size` ([Int64](../../sql-reference/data-types/int-uint.md)) - トレースタイプが `Memory`、`MemorySample` または `MemoryPeak` の場合は割り当てられたメモリ量を表し、それ以外のトレースタイプの場合は 0 です。

* `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) - トレースタイプが `ProfileEvent` の場合は更新されたプロファイルイベント名を表し、それ以外のトレースタイプの場合は空文字列です。

* `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) - トレースタイプが `ProfileEvent` の場合はプロファイルイベントのインクリメント量を表し、それ以外のトレースタイプの場合は 0 です。

* `symbols`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), シンボル化が有効な場合、`trace` に対応するデマングル済みシンボル名を格納します。

* `lines`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), シンボル化が有効な場合、`trace` に対応するファイル名と行番号を含む文字列を格納します。

* `function_id` ([Nullable(Int32)](../../sql-reference/data-types/nullable.md)), トレースタイプが Instrumentation の場合、elf-binary の xray&#95;instr&#95;map セクションで関数に割り当てられた ID。

* `function_name` ([Nullable(String)](../../sql-reference/data-types/nullable.md)), トレースタイプが Instrumentation の場合、インストルメンテーション対象関数の名前。

* `handler` ([Nullable(String)](../../sql-reference/data-types/nullable.md)), トレースタイプが Instrumentation の場合、インストルメンテーション対象関数のハンドラー。

* `entry_type` ([Nullable(Enum(&#39;Entry&#39; = 0, &#39;Exit&#39; = 1))](../../sql-reference/data-types/nullable.md)), トレースタイプが Instrumentation の場合、トレースのエントリー種別。

* `duration_nanoseconds` ([Nullable(UInt64)](../../sql-reference/data-types/nullable.md)), トレースタイプが Instrumentation の場合、関数がナノ秒単位で実行されていた時間。

シンボル化はサーバーの構成ファイル内の `trace_log` セクションの `symbolize` で有効または無効を切り替えることができます。

**例**

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

## Chrome Event Trace Format への変換 {#chrome-event-trace-format}

プロファイリングデータは、次のクエリを使用して Chrome の Event Trace Format に変換できます。クエリを `chrome_trace.sql` ファイルとして保存してください：

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

そして、ClickHouse Client でこれを実行して `trace.json` ファイルとしてエクスポートし、そのファイルを [Perfetto](https://ui.perfetto.dev/) または [speedscope](https://www.speedscope.app/) にインポートします。

```bash
echo $(clickhouse client --query "$(cat chrome_trace.sql)") > trace.json
```

よりコンパクトだが情報量の少ないトレースにしたい場合は、スタック部分を省略できます。

**関連項目**

* [SYSTEM INSTRUMENT](../../sql-reference/statements/system.md#instrument) — 計測ポイントを追加または削除します。
* [system.instrumentation](../../operations/system-tables/instrumentation.md) — 計測済みポイントを確認します。
* [system.symbols](../../operations/system-tables/symbols.md) — 計測ポイントを追加するためのシンボルを確認します。
