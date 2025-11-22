---
description: '非同期挿入に関する情報を保持するシステムテーブル。各エントリは、非同期挿入用にバッファリングされた挿入クエリを表します。'
keywords: ['システムテーブル', 'asynchronous_insert_log']
slug: /operations/system-tables/asynchronous_insert_log
title: 'system.asynchronous_insert_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.asynchronous&#95;insert&#95;log

<SystemTableCloud />

非同期インサートに関する情報を保持します。各エントリは、非同期インサートとしてバッファリングされた 1 件のインサートクエリに対応します。

ロギングを開始するには、[asynchronous&#95;insert&#95;log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) セクションのパラメータを設定します。

データのフラッシュ間隔は、サーバー設定セクション [asynchronous&#95;insert&#95;log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) の `flush_interval_milliseconds` パラメータで設定します。強制的にフラッシュするには、[SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) クエリを使用します。

ClickHouse はこのテーブルからデータを自動的には削除しません。詳細は [Introduction](/operations/system-tables/overview#system-tables-introduction) を参照してください。

Columns:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行したサーバーのホスト名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 非同期インサートが行われた日付。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 非同期インサートの実行が完了した日時。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 非同期インサートの実行が完了した日時（マイクロ秒精度）。
* `query` ([String](../../sql-reference/data-types/string.md)) — クエリ文字列。
* `database` ([String](../../sql-reference/data-types/string.md)) — テーブルが属しているデータベース名。
* `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
* `format` ([String](/sql-reference/data-types/string.md)) — フォーマット名。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 元のクエリの ID。
* `bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 挿入されたバイト数。
* `exception` ([String](../../sql-reference/data-types/string.md)) — 例外メッセージ。
* `status` ([Enum8](../../sql-reference/data-types/enum.md)) — ステータス。値:
  * `'Ok' = 1` — インサートが成功。
  * `'ParsingError' = 2` — データのパース時に発生した例外。
  * `'FlushError' = 3` — フラッシュ時に発生した例外。
* `flush_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — フラッシュが行われた日時。
* `flush_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — フラッシュが行われた日時（マイクロ秒精度）。
* `flush_query_id` ([String](../../sql-reference/data-types/string.md)) — フラッシュクエリの ID。

**Example**

Query:

```sql
SELECT * FROM system.asynchronous_insert_log LIMIT 1 \G;
```

結果：

```text
hostname:                clickhouse.eu-central1.internal
event_date:              2023-06-08
event_time:              2023-06-08 10:08:53
event_time_microseconds: 2023-06-08 10:08:53.199516
query:                   INSERT INTO public.data_guess (user_id, datasource_id, timestamp, path, type, num, str) FORMAT CSV
database:                public
table:                   data_guess
format:                  CSV
query_id:                b46cd4c4-0269-4d0b-99f5-d27668c6102e
bytes:                   133223
exception:
status:                  Ok
flush_time:              2023-06-08 10:08:55
flush_time_microseconds: 2023-06-08 10:08:55.139676
flush_query_id:          cd2c1e43-83f5-49dc-92e4-2fbc7f8d3716
```

**関連項目**

* [system.query&#95;log](../../operations/system-tables/query_log) — クエリ実行に関する共通情報を含む `query_log` システムテーブルの説明。
* [system.asynchronous&#95;inserts](/operations/system-tables/asynchronous_inserts) — キュー内の保留中の非同期挿入に関する情報を含むテーブル。
