---
description: 'ログエントリを保持するシステムテーブル。'
keywords: ['system table', 'text_log']
slug: /operations/system-tables/text_log
title: 'system.text_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.text&#95;log \\{#systemtext&#95;log\\}

<SystemTableCloud />

ログエントリを含むテーブルです。このテーブルに出力されるログレベルは、`text_log.level` サーバー設定で制限できます。

列:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
* `event_date` (Date) — エントリの日付。
* `event_time` (DateTime) — エントリの時刻。
* `event_time_microseconds` (DateTime64) — マイクロ秒精度でのエントリの時刻。
* `microseconds` (UInt32) — エントリのマイクロ秒。
* `thread_name` (String) — ログ出力を行ったスレッド名。
* `thread_id` (UInt64) — OS のスレッド ID。
* `level` (`Enum8`) — エントリのレベル。取りうる値:
  * `1` または `'Fatal'`。
  * `2` または `'Critical'`。
  * `3` または `'Error'`。
  * `4` または `'Warning'`。
  * `5` または `'Notice'`。
  * `6` または `'Information'`。
  * `7` または `'Debug'`。
  * `8` または `'Trace'`。
* `query_id` (String) — クエリの ID。
* `logger_name` (LowCardinality(String)) — ロガー名（例: `DDLWorker`）。
* `message` (String) — メッセージ本体。
* `revision` (UInt32) — ClickHouse のリビジョン。
* `source_file` (LowCardinality(String)) — ログ出力を行ったソースファイル。
* `source_line` (UInt64) — ログ出力を行ったソースコード行番号。
* `message_format_string` (LowCardinality(String)) — メッセージの整形に使用されたフォーマット文字列。
* `value1` (String) - メッセージの整形に使用された引数 1。
* `value2` (String) - メッセージの整形に使用された引数 2。
* `value3` (String) - メッセージの整形に使用された引数 3。
* `value4` (String) - メッセージの整形に使用された引数 4。
* `value5` (String) - メッセージの整形に使用された引数 5。
* `value6` (String) - メッセージの整形に使用された引数 6。
* `value7` (String) - メッセージの整形に使用された引数 7。
* `value8` (String) - メッセージの整形に使用された引数 8。
* `value9` (String) - メッセージの整形に使用された引数 9。
* `value10` (String) - メッセージの整形に使用された引数 10。

**例**

```sql
SELECT * FROM system.text_log LIMIT 1 \G
```

```text
Row 1:
──────
hostname:                clickhouse.eu-central1.internal
event_date:              2020-09-10
event_time:              2020-09-10 11:23:07
event_time_microseconds: 2020-09-10 11:23:07.871397
microseconds:            871397
thread_name:             clickhouse-serv
thread_id:               564917
level:                   Information
query_id:
logger_name:             DNSCacheUpdater
message:                 Update period 15 seconds
revision:                54440
source_file:             /ClickHouse/src/Interpreters/DNSCacheUpdater.cpp; void DB::DNSCacheUpdater::start()
source_line:             45
message_format_string:   Update period {} seconds
value1:                  15
value2:                  
value3:                  
value4:                  
value5:                  
value6:                  
value7:                  
value8:                  
value9:                  
value10:                  
```
