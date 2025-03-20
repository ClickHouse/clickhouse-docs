---
description: "ログエントリを含むシステムテーブル。"
slug: /operations/system-tables/text_log
title: "system.text_log"
keywords: ["システムテーブル", "text_log"]
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

ログエントリを含みます。このテーブルに記録されるログレベルは、`text_log.level` サーバー設定で制限できます。

カラム:

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — クエリを実行しているサーバーのホスト名。
- `event_date` (Date) — エントリの日付。
- `event_time` (DateTime) — エントリの時間。
- `event_time_microseconds` (DateTime64) — マイクロ秒精度のエントリの時間。
- `microseconds` (UInt32) — エントリのマイクロ秒。
- `thread_name` (String) — ロギングが行われたスレッドの名前。
- `thread_id` (UInt64) — OS スレッド ID。
- `level` (`Enum8`) — エントリレベル。可能な値:
    - `1` または `'Fatal'`。
    - `2` または `'Critical'`。
    - `3` または `'Error'`。
    - `4` または `'Warning'`。
    - `5` または `'Notice'`。
    - `6` または `'Information'`。
    - `7` または `'Debug'`。
    - `8` または `'Trace'`。
- `query_id` (String) — クエリの ID。
- `logger_name` (LowCardinality(String)) — ロガーの名前 (例: `DDLWorker`)。
- `message` (String) — メッセージ自体。
- `revision` (UInt32) — ClickHouse のリビジョン。
- `source_file` (LowCardinality(String)) — ロギングが行われたソースファイル。
- `source_line` (UInt64) — ロギングが行われたソース行。
- `message_format_string` (LowCardinality(String)) — メッセージをフォーマットするために使用されたフォーマット文字列。
- `value1` (String) - メッセージをフォーマットするために使用された引数 1。
- `value2` (String) - メッセージをフォーマットするために使用された引数 2。
- `value3` (String) - メッセージをフォーマットするために使用された引数 3。
- `value4` (String) - メッセージをフォーマットするために使用された引数 4。
- `value5` (String) - メッセージをフォーマットするために使用された引数 5。
- `value6` (String) - メッセージをフォーマットするために使用された引数 6。
- `value7` (String) - メッセージをフォーマットするために使用された引数 7。
- `value8` (String) - メッセージをフォーマットするために使用された引数 8。
- `value9` (String) - メッセージをフォーマットするために使用された引数 9。
- `value10` (String) - メッセージをフォーマットするために使用された引数 10。

**例**

``` sql
SELECT * FROM system.text_log LIMIT 1 \G
```

``` text
行 1:
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
