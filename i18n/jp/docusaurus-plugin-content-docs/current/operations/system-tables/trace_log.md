---
description: 'サンプリングクエリプロファイラーで収集されたスタックトレースを格納するシステムテーブル。'
keywords: ['system table', 'trace_log']
slug: /operations/system-tables/trace_log
title: 'system.trace_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.trace&#95;log

<SystemTableCloud />

[サンプリングクエリプロファイラ](../../operations/optimizing-performance/sampling-query-profiler.md)によって収集されたスタックトレースを格納します。

[trace&#95;log](../../operations/server-configuration-parameters/settings.md#trace_log) サーバー設定セクションが設定されている場合に、ClickHouse はこのテーブルを作成します。関連する設定として、[query&#95;profiler&#95;real&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_real_time_period_ns)、[query&#95;profiler&#95;cpu&#95;time&#95;period&#95;ns](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns)、[memory&#95;profiler&#95;step](../../operations/settings/settings.md#memory_profiler_step)、[memory&#95;profiler&#95;sample&#95;probability](../../operations/settings/settings.md#memory_profiler_sample_probability)、[trace&#95;profile&#95;events](../../operations/settings/settings.md#trace_profile_events) も参照してください。

ログを分析するには、`addressToLine`、`addressToLineWithInlines`、`addressToSymbol`、`demangle` といったイントロスペクション関数を使用します。

カラム:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。

* `event_date` ([Date](../../sql-reference/data-types/date.md)) — サンプリング時点の日付。

* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — サンプリング時点のタイムスタンプ。

* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — マイクロ秒精度でのサンプリング時点のタイムスタンプ。

* `timestamp_ns` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ナノ秒単位でのサンプリング時点のタイムスタンプ。

* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse サーバービルドのリビジョン。

  `clickhouse-client` でサーバーに接続すると、`Connected to ClickHouse server version 19.18.1.` のような文字列が表示されます。このフィールドには、サーバーの `version` ではなく `revision` が含まれます。

* `trace_type` ([Enum8](../../sql-reference/data-types/enum.md)) — トレースの種類:
  * `Real` — ウォールクロック時間に基づいてスタックトレースを収集します。
  * `CPU` — CPU 時間に基づいてスタックトレースを収集します。
  * `Memory` — メモリアロケーションが以降のウォーターマークを超えた際に、アロケーションおよびデアロケーションを収集します。
  * `MemorySample` — ランダムなアロケーションおよびデアロケーションを収集します。
  * `MemoryPeak` — ピークメモリ使用量が更新されたときの情報を収集します。
  * `ProfileEvent` — プロファイルイベントのインクリメントを収集します。
  * `JemallocSample` — jemalloc のサンプルを収集します。
  * `MemoryAllocatedWithoutCheck` — あらゆるメモリ制限を無視して行われる大きなアロケーション (&gt;16MiB) を収集します (ClickHouse 開発者専用)。

* `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — スレッド識別子。

* `query_id` ([String](../../sql-reference/data-types/string.md)) — 実行中であったクエリの詳細を [query&#95;log](/operations/system-tables/query_log) システムテーブルから取得するために使用できるクエリ識別子。

* `trace` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — サンプリング時点のスタックトレース。各要素は ClickHouse サーバープロセス内の仮想メモリアドレスです。

* `size` ([Int64](../../sql-reference/data-types/int-uint.md)) - トレースタイプが `Memory`、`MemorySample`、`MemoryPeak` の場合は割り当てられたメモリ量、それ以外のトレースタイプの場合は 0。

* `event` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) - トレースタイプが `ProfileEvent` の場合は更新されたプロファイルイベントの名前、それ以外のトレースタイプの場合は空文字列。

* `increment` ([UInt64](../../sql-reference/data-types/int-uint.md)) - トレースタイプが `ProfileEvent` の場合はプロファイルイベントのインクリメント量、それ以外のトレースタイプの場合は 0。

* `symbols`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), シンボル化が有効な場合、`trace` に対応するデマングルされたシンボル名を含みます。

* `lines`, ([Array(LowCardinality(String))](../../sql-reference/data-types/array.md)), シンボル化が有効な場合、`trace` に対応するファイル名と行番号からなる文字列を含みます。

シンボル化は、サーバーの設定ファイル内の `trace_log` セクションにある `symbolize` で有効または無効を切り替えることができます。

**Example**

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
