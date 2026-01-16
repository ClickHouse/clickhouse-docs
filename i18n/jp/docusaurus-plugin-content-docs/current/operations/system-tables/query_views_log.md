---
description: 'クエリ実行時に実行された依存ビューに関する情報（ビューの種類や実行時間など）を保持するシステムテーブル。'
keywords: ['system table', 'query_views_log']
slug: /operations/system-tables/query_views_log
title: 'system.query_views_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.query&#95;views&#95;log \\{#systemquery&#95;views&#95;log\\}

<SystemTableCloud />

クエリ実行時に実行された依存ビューに関する情報を保持します。たとえば、ビューの種類や実行時間などです。

ログを有効化するには:

1. [query&#95;views&#95;log](../../operations/server-configuration-parameters/settings.md#query_views_log) セクションでパラメータを設定します。
2. [log&#95;query&#95;views](/operations/settings/settings#log_query_views) を 1 に設定します。

データのフラッシュ周期は、サーバー設定セクション [query&#95;views&#95;log](../../operations/server-configuration-parameters/settings.md#query_views_log) の `flush_interval_milliseconds` パラメータで設定します。フラッシュを強制するには、[SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) クエリを使用します。

ClickHouse はこのテーブルからデータを自動的には削除しません。詳細は [Introduction](/operations/system-tables/overview#system-tables-introduction) を参照してください。

`query_views_log` テーブルに登録されるクエリ数を減らすには、[log&#95;queries&#95;probability](/operations/settings/settings#log_queries_probability) 設定を使用できます。

列:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行したサーバーのホスト名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — ビューで最後のイベントが発生した日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — ビューの実行が終了した日時。
* `event_time_microseconds` ([DateTime](../../sql-reference/data-types/datetime.md)) — ビューの実行がマイクロ秒精度で終了した日時。
* `view_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — ビュー実行時間（すべてのステージの合計）をミリ秒で表したもの。
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初期クエリの ID（分散クエリ実行用）。
* `view_name` ([String](../../sql-reference/data-types/string.md)) — ビュー名。
* `view_uuid` ([UUID](../../sql-reference/data-types/uuid.md)) — ビューの UUID。
* `view_type` ([Enum8](../../sql-reference/data-types/enum.md)) — ビューの種類。値:
  * `'Default' = 1` — [Default views](/sql-reference/statements/create/view#normal-view)。このログには出力されないはずです。
  * `'Materialized' = 2` — [Materialized views](/sql-reference/statements/create/view#materialized-view)。
  * `'Live' = 3` — [Live views](../../sql-reference/statements/create/view.md#live-view)。
* `view_query` ([String](../../sql-reference/data-types/string.md)) — ビューによって実行されたクエリ。
* `view_target` ([String](../../sql-reference/data-types/string.md)) — ビューのターゲットテーブル名。
* `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 読み取った行数。
* `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 読み取ったバイト数。
* `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 書き込まれた行数。
* `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 書き込まれたバイト数。
* `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — このビューのコンテキストにおける、割り当てられたメモリ量と解放されたメモリ量の差分の最大値。
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/array.md)) — さまざまなメトリクスを計測する ProfileEvents。これらの説明はテーブル [system.events](/operations/system-tables/events) に記載されています。
* `status` ([Enum8](../../sql-reference/data-types/enum.md)) — ビューのステータス。値:
  * `'QueryStart' = 1` — ビュー実行の開始に成功。表示されないはずです。
  * `'QueryFinish' = 2` — ビュー実行が正常に終了。
  * `'ExceptionBeforeStart' = 3` — ビュー実行開始前の例外。
  * `'ExceptionWhileProcessing' = 4` — ビュー実行中の例外。
* `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 例外のコード。
* `exception` ([String](../../sql-reference/data-types/string.md)) — 例外メッセージ。
* `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [スタックトレース](https://en.wikipedia.org/wiki/Stack_trace)。クエリが正常に完了した場合は空文字列。

**例**

クエリ:

```sql
SELECT * FROM system.query_views_log LIMIT 1 \G;
```

結果：

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2021-06-22
event_time:              2021-06-22 13:23:07
event_time_microseconds: 2021-06-22 13:23:07.738221
view_duration_ms:        0
initial_query_id:        c3a1ac02-9cad-479b-af54-9e9c0a7afd70
view_name:               default.matview_inner
view_uuid:               00000000-0000-0000-0000-000000000000
view_type:               Materialized
view_query:              SELECT * FROM default.table_b
view_target:             default.`.inner.matview_inner`
read_rows:               4
read_bytes:              64
written_rows:            2
written_bytes:           32
peak_memory_usage:       4196188
ProfileEvents:           {'FileOpen':2,'WriteBufferFromFileDescriptorWrite':2,'WriteBufferFromFileDescriptorWriteBytes':187,'IOBufferAllocs':3,'IOBufferAllocBytes':3145773,'FunctionExecute':3,'DiskWriteElapsedMicroseconds':13,'InsertedRows':2,'InsertedBytes':16,'SelectedRows':4,'SelectedBytes':48,'ContextLock':16,'RWLockAcquiredReadLocks':1,'RealTimeMicroseconds':698,'SoftPageFaults':4,'OSReadChars':463}
status:                  QueryFinish
exception_code:          0
exception:
stack_trace:
```

**関連情報**

{/*AUTOGENERATED_START*/ }

{/*AUTOGENERATED_END*/ }
