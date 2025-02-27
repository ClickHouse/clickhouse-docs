---
description: "サンプリングクエリプロファイラによって収集されたスタックトレースを含むシステムテーブル。"
slug: /operations/system-tables/trace_log
title: "trace_log"
keywords: ["システムテーブル", "trace_log"]
---
import SystemTableCloud from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

[サンプリングクエリプロファイラ](../../operations/optimizing-performance/sampling-query-profiler.md)によって収集されたスタックトレースを含みます。

ClickHouseは、[trace_log](../../operations/server-configuration-parameters/settings.md#trace_log)サーバー設定セクションが設定されると、このテーブルを作成します。設定の詳細については、[query_profiler_real_time_period_ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns)、[query_profiler_cpu_time_period_ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns)、[memory_profiler_step](../../operations/settings/settings.md#memory_profiler_step)、[memory_profiler_sample_probability](../../operations/settings/settings.md#memory_profiler_sample_probability)、[trace_profile_events](../../operations/settings/settings.md#trace_profile_events)をご覧ください。

ログを分析するには、`addressToLine`、`addressToLineWithInlines`、`addressToSymbol`、および `demangle`イントロスペクション関数を使用します。

カラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — サンプリング時の日時。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — サンプリング時のタイムスタンプ。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のサンプリング時のタイムスタンプ。
- `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ナノ秒単位のサンプリング時のタイムスタンプ。
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouseサーバーのビルドリビジョン。

    `clickhouse-client`でサーバーに接続すると、`Connected to ClickHouse server version 19.18.1.`のような文字列が表示されます。このフィールドには、サーバーの`revision`が含まれますが、`version`は含まれません。

- `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — トレースのタイプ：
    - `Real` は、ウォールクロック時間によってスタックトレースを収集します。
    - `CPU` は、CPU時間によってスタックトレースを収集します。
    - `Memory` は、メモリ割り当てがその後のウォーターマークを超えたときの割り当ておよび解放を収集します。
    - `MemorySample` は、ランダムな割り当ておよび解放を収集します。
    - `MemoryPeak` は、ピークメモリ使用量の更新を収集します。
    - `ProfileEvent` は、プロファイルイベントのインクリメントを収集します。
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — スレッド識別子。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — [query_log](/operations/system-tables/query_log)システムテーブルから実行中のクエリの詳細を取得するために使用されるクエリ識別子。
- `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — サンプリング時のスタックトレース。各要素はClickHouseサーバープロセス内の仮想メモリアドレスです。
- `size` ([Int64](../../sql-reference/data-types/int-uint.md)) - トレースタイプ`Memory`、`MemorySample`、または`MemoryPeak`の場合は割り当てられたメモリの量、他のトレースタイプでは0。
- `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) - トレースタイプ`ProfileEvent`では更新されたプロファイルイベントの名前、他のトレースタイプでは空文字列。
- `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) - トレースタイプ`ProfileEvent`ではプロファイルイベントのインクリメントの量、他のトレースタイプでは0。
- `symbols`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), シンボル化が有効になっている場合、`trace`に対応するデマングルされたシンボル名を含みます。
- `lines`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), シンボル化が有効になっている場合、`trace`に対応する行番号付きのファイル名を含む文字列を含みます。

シンボル化は、サーバーの設定ファイル内の`trace_log`の下の`symbolize`で有効または無効にできます。

**例**

``` sql
SELECT * FROM system.trace_log LIMIT 1 \G
```

``` text
行 1:
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
