---
description: 'ログエントリを含むシステムテーブル。'
keywords: ['system table', 'text_log']
slug: /operations/system-tables/text_log
title: 'system.text_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.text&#95;log

<SystemTableCloud />

ログエントリを含むテーブルです。このテーブルに記録されるログレベルは、サーバー設定 `text_log.level` によって制限できます。

カラム:

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
* `event_date` (Date) — エントリの日付。
* `event_time` (DateTime) — エントリの時刻。
* `event_time_microseconds` (DateTime64) — マイクロ秒精度でのエントリの時刻。
* `microseconds` (UInt32) — エントリのマイクロ秒部分。
* `thread_name` (String) — ログを出力したスレッド名。
* `thread_id` (UInt64) — OS のスレッド ID。
* `level` (`Enum8`) — エントリレベル。取り得る値は次のとおりです:
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
* `source_file` (LowCardinality(String)) — ログを出力したソースファイル。
* `source_line` (UInt64) — ログを出力したソース行番号。
* `message_format_string` (LowCardinality(String)) — メッセージのフォーマットに使用された書式文字列。
* `value1` (String) — メッセージのフォーマットに使用された引数 1。
* `value2` (String) — メッセージのフォーマットに使用された引数 2。
* `value3` (String) — メッセージのフォーマットに使用された引数 3。
* `value4` (String) — メッセージのフォーマットに使用された引数 4。
* `value5` (String) — メッセージのフォーマットに使用された引数 5。
* `value6` (String) — メッセージのフォーマットに使用された引数 6。
* `value7` (String) — メッセージのフォーマットに使用された引数 7。
* `value8` (String) — メッセージのフォーマットに使用された引数 8。
* `value9` (String) — メッセージのフォーマットに使用された引数 9。
* `value10` (String) — メッセージのフォーマットに使用された引数 10。

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
