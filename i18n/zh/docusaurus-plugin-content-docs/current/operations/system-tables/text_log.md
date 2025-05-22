---
'description': '系统表包含日志条目。'
'keywords':
- 'system table'
- 'text_log'
'slug': '/operations/system-tables/text_log'
'title': 'system.text_log'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.text_log

<SystemTableCloud/>

包含日志条目。写入此表的日志级别可以通过 `text_log.level` 服务器设置进行限制。

列：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的 hostname。
- `event_date` (Date) — 条目的日期。
- `event_time` (DateTime) — 条目的时间。
- `event_time_microseconds` (DateTime64) — 精确到微秒的条目时间。
- `microseconds` (UInt32) — 条目的微秒数。
- `thread_name` (String) — 记录日志的线程名称。
- `thread_id` (UInt64) — 操作系统线程 ID。
- `level` (`Enum8`) — 条目级别。可能的值：
    - `1` 或 `'Fatal'`。
    - `2` 或 `'Critical'`。
    - `3` 或 `'Error'`。
    - `4` 或 `'Warning'`。
    - `5` 或 `'Notice'`。
    - `6` 或 `'Information'`。
    - `7` 或 `'Debug'`。
    - `8` 或 `'Trace'`。
- `query_id` (String) — 查询的 ID。
- `logger_name` (LowCardinality(String)) — 日志记录器的名称（即 `DDLWorker`）。
- `message` (String) — 消息内容。
- `revision` (UInt32) — ClickHouse 修订版。
- `source_file` (LowCardinality(String)) — 记录日志的源文件。
- `source_line` (UInt64) — 记录日志的源行。
- `message_format_string` (LowCardinality(String)) — 用于格式化消息的格式字符串。
- `value1` (String) - 用于格式化消息的参数 1。
- `value2` (String) - 用于格式化消息的参数 2。
- `value3` (String) - 用于格式化消息的参数 3。
- `value4` (String) - 用于格式化消息的参数 4。
- `value5` (String) - 用于格式化消息的参数 5。
- `value6` (String) - 用于格式化消息的参数 6。
- `value7` (String) - 用于格式化消息的参数 7。
- `value8` (String) - 用于格式化消息的参数 8。
- `value9` (String) - 用于格式化消息的参数 9。
- `value10` (String) - 用于格式化消息的参数 10。

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
