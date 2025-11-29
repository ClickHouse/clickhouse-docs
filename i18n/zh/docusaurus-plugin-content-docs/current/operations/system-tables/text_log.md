---
description: '记录日志条目的系统表。'
keywords: ['system table', 'text_log']
slug: /operations/system-tables/text_log
title: 'system.text_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.text&#95;log {#systemtext&#95;log}

<SystemTableCloud />

包含日志记录条目。写入该表的日志级别可以通过服务器设置 `text_log.level` 进行限制。

列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
* `event_date` (Date) — 日志条目的日期。
* `event_time` (DateTime) — 日志条目的时间。
* `event_time_microseconds` (DateTime64) — 具有微秒精度的日志条目时间。
* `microseconds` (UInt32) — 日志条目的微秒数。
* `thread_name` (String) — 执行日志记录的线程名称。
* `thread_id` (UInt64) — 操作系统线程 ID。
* `level` (`Enum8`) — 日志条目级别。可能的取值：
  * `1` 或 `'Fatal'`。
  * `2` 或 `'Critical'`。
  * `3` 或 `'Error'`。
  * `4` 或 `'Warning'`。
  * `5` 或 `'Notice'`。
  * `6` 或 `'Information'`。
  * `7` 或 `'Debug'`。
  * `8` 或 `'Trace'`。
* `query_id` (String) — 查询的 ID。
* `logger_name` (LowCardinality(String)) — 日志记录器名称（例如 `DDLWorker`）。
* `message` (String) — 日志消息本身。
* `revision` (UInt32) — ClickHouse 修订版本号。
* `source_file` (LowCardinality(String)) — 产生该日志记录的源文件。
* `source_line` (UInt64) — 产生该日志记录的源代码行号。
* `message_format_string` (LowCardinality(String)) — 用于格式化消息的格式字符串。
* `value1` (String) — 用于格式化消息的参数 1。
* `value2` (String) — 用于格式化消息的参数 2。
* `value3` (String) — 用于格式化消息的参数 3。
* `value4` (String) — 用于格式化消息的参数 4。
* `value5` (String) — 用于格式化消息的参数 5。
* `value6` (String) — 用于格式化消息的参数 6。
* `value7` (String) — 用于格式化消息的参数 7。
* `value8` (String) — 用于格式化消息的参数 8。
* `value9` (String) — 用于格式化消息的参数 9。
* `value10` (String) — 用于格式化消息的参数 10。

**示例**

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
message:                 更新周期 15 秒
revision:                54440
source_file:             /ClickHouse/src/Interpreters/DNSCacheUpdater.cpp; void DB::DNSCacheUpdater::start()
source_line:             45
message_format_string:   更新周期 {} 秒
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
