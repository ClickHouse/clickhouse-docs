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

[サンプリングクエリプロファイラ](../../operations/optimizing-performance/sampling-query-profiler.md)によって収集されたスタックトレースを含みます。

ClickHouse は、サーバー設定セクション [trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log) が設定されている場合にこのテーブルを作成します。関連する設定も参照してください: [query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns)、[query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns)、[memory&#95;profiler&#95;step](../../operations/settings/settings.md#memory_profiler_step)、[memory&#95;profiler&#95;sample&#95;probability](../../operations/settings/settings.md#memory_profiler_sample_probability)、[trace&#95;profile&#95;events](../../operations/settings/settings.md#trace_profile_events)。

ログを分析するには、`addressToLine`、`addressToLineWithInlines`、`addressToSymbol`、`demangle` といったイントロスペクション関数を使用します。

列:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。

* `event_date` ([Date](../../sql-reference/data-types/date.md)) — サンプリング時点の日付。

* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — サンプリング時点のタイムスタンプ。

* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度のサンプリング時点のタイムスタンプ。

* `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ナノ秒単位のサンプリング時点のタイムスタンプ。

* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse サーバービルドのリビジョン。

  `clickhouse-client` でサーバーに接続すると、`Connected to ClickHouse server version 19.18.1.` のような文字列が表示されます。このフィールドにはサーバーの `version` ではなく `revision` が格納されます。

* `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — トレースの種類:
  * `Real` はウォールクロック時間に基づくスタックトレース収集を表します。
  * `CPU` は CPU 時間に基づくスタックトレース収集を表します。
  * `Memory` はメモリアロケーションが次のウォーターマークを超えたときのアロケーションおよび解放の収集を表します。
  * `MemorySample` はランダムなアロケーションおよび解放の収集を表します。
  * `MemoryPeak` はピークメモリ使用量の更新の収集を表します。
  * `ProfileEvent` はプロファイルイベントのインクリメントの収集を表します。
  * `JemallocSample` は jemalloc サンプルの収集を表します。
  * `MemoryAllocatedWithoutCheck` は、任意のメモリ制限を無視して行われる大きなアロケーション (&gt;16MiB) の収集を表します (ClickHouse 開発者専用)。

* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — スレッド識別子。

* `query_id` ([String](../../sql-reference/data-types/string.md)) — [query&#95;log](/operations/system-tables/query_log) システムテーブルから、実行されていたクエリの詳細を取得するために使用できるクエリ識別子。

* `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — サンプリング時点のスタックトレース。各要素は ClickHouse サーバープロセス内の仮想メモリアドレスです。

* `size` ([Int64](../../sql-reference/data-types/int-uint.md)) - トレースタイプが `Memory`、`MemorySample`、`MemoryPeak` の場合は割り当てられたメモリ量、それ以外のトレースタイプの場合は 0。

* `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) - トレースタイプが `ProfileEvent` の場合は更新されたプロファイルイベント名、それ以外のトレースタイプの場合は空文字列。

* `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) - トレースタイプが `ProfileEvent` の場合はプロファイルイベントのインクリメント量、それ以外のトレースタイプの場合は 0。

* `symbols`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)) — シンボル化が有効な場合、`trace` に対応するデマングル済みシンボル名を含みます。

* `lines`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)) — シンボル化が有効な場合、`trace` に対応するファイル名と行番号を含む文字列を含みます。

シンボル化は、サーバーの設定ファイル内の `trace_log` 配下の `symbolize` で有効または無効にできます。

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
