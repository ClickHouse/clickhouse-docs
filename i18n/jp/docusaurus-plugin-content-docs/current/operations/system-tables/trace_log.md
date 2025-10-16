---
'description': 'システムテーブルは、サンプリングクエリプロファイラによって収集されたスタックトレースを含みます。'
'keywords':
- 'system table'
- 'trace_log'
'slug': '/operations/system-tables/trace_log'
'title': 'system.trace_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.trace_log

<SystemTableCloud/>

[サンプリングクエリプロファイラ](../../operations/optimizing-performance/sampling-query-profiler.md)によって収集されたスタックトレースが含まれています。

ClickHouseは、[trace_log](../../operations/server-configuration-parameters/settings.md#trace_log)サーバー設定セクションが設定されると、このテーブルを作成します。また、次の設定も参照してください: [query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns), [query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns), [memory_profiler_step](../../operations/settings/settings.md#memory_profiler_step),
[memory_profiler_sample_probability](../../operations/settings/settings.md#memory_profiler_sample_probability), [trace_profile_events](../../operations/settings/settings.md#trace_profile_events)。

ログを分析するには、`addressToLine`、`addressToLineWithInlines`、`addressToSymbol`、および`demangle`イントロスペクション関数を使用します。

カラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — サンプリングの瞬間の日時。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — サンプリングの瞬間のタイムスタンプ。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒の精度でのサンプリングの瞬間のタイムスタンプ。
- `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ナノ秒単位のサンプリングの瞬間のタイムスタンプ。
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouseサーバービルドのリビジョン。

    `clickhouse-client`でサーバーに接続すると、`Connected to ClickHouse server version 19.18.1.`に似た文字列が表示されます。このフィールドにはサーバーの`revision`が含まれていますが、`version`は含まれていません。

- `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — トレースタイプ:
  - `Real` はウォールクロック時間によるスタックトレースの収集を表します。
  - `CPU` はCPU時間によるスタックトレースの収集を表します。
  - `Memory` はメモリアロケーションが次のウォーターマークを超えたときに行われるアロケーションとディアロケーションの収集を表します。
  - `MemorySample` はランダムなアロケーションとディアロケーションの収集を表します。
  - `MemoryPeak` はピークメモリ使用量の更新の収集を表します。
  - `ProfileEvent` はプロファイルイベントの増分の収集を表します。
  - `JemallocSample` はjemallocサンプルの収集を表します。
  - `MemoryAllocatedWithoutCheck` は任意のメモリ制限を無視して行われる重要なアロケーション (>16MiB) の収集を表します (ClickHouse開発者のみ)。
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — スレッド識別子。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — [query_log](/operations/system-tables/query_log)システムテーブルから実行中のクエリの詳細を取得するために使用できるクエリ識別子。
- `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — サンプリングの瞬間のスタックトレース。各要素はClickHouseサーバープロセス内の仮想メモリアドレスです。
- `size` ([Int64](../../sql-reference/data-types/int-uint.md)) - トレースタイプが`Memory`、`MemorySample`、または`MemoryPeak`の場合は割り当てられたメモリの量であり、他のトレースタイプの場合は0です。
- `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) - トレースタイプが`ProfileEvent`の場合は更新されたプロファイルイベントの名前、他のトレースタイプの場合は空文字列です。
- `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) - トレースタイプが`ProfileEvent`の場合はプロファイルイベントの増分の量、他のトレースタイプの場合は0です。
- `symbols`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), シンボル化が有効な場合、`trace`に対応するデマングルされたシンボル名が含まれます。
- `lines`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), シンボル化が有効な場合、`trace`に対応する行番号付きのファイル名を含む文字列が含まれます。

シンボル化は、サーバーの設定ファイル内の`trace_log`の下の`symbolize`で有効または無効にできます。

**例**

```sql
SELECT * FROM system.trace_log LIMIT 1 \G
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2020-09-10
event_time:              2020-09-10 11:23:09
event_time_microseconds: 2020-09-10 11:23:09.872924
timestamp_ns:            1599762189872924510
revision:                54440
trace_type:              Memory
thread_id:               564963
query_id:
trace:                   [371912858,371912789,371798468,371799717,371801313,371790250,624462773,566365041,566440261,566445834,566460071,566459914,566459842,566459580,566459469,566459389,566459341,566455774,371993941,371988245,372158848,372187428,372187309,372187093,372185478,140222123165193,140222122205443]
size:                    5244400
```
