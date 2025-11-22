---
description: '包含异步插入相关信息的系统表。每条记录表示一条被缓冲为异步插入查询的 INSERT 语句。'
keywords: ['系统表', 'asynchronous_insert_log']
slug: /operations/system-tables/asynchronous_insert_log
title: 'system.asynchronous_insert_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.asynchronous&#95;insert&#95;log

<SystemTableCloud />

包含有关异步插入的信息。每条记录对应一个被缓冲到异步插入队列中的插入查询。

要开始记录日志，请在 [asynchronous&#95;insert&#95;log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) 部分配置相关参数。

数据刷新周期由服务器设置中 [asynchronous&#95;insert&#95;log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) 部分的 `flush_interval_milliseconds` 参数控制。要强制刷新，请使用 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 查询。

ClickHouse 不会自动删除该表中的数据。更多详细信息请参阅[简介](/operations/system-tables/overview#system-tables-introduction)。

列：

* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器主机名。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 发生异步插入的日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 异步插入执行完成的日期和时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 异步插入执行完成的日期和时间，精确到微秒。
* `query` ([String](../../sql-reference/data-types/string.md)) — 查询字符串。
* `database` ([String](../../sql-reference/data-types/string.md)) — 表所在数据库的名称。
* `table` ([String](../../sql-reference/data-types/string.md)) — 表名。
* `format` ([String](/sql-reference/data-types/string.md)) — 格式名称。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 初始查询的 ID。
* `bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 插入的字节数。
* `exception` ([String](../../sql-reference/data-types/string.md)) — 异常信息。
* `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 状态。取值：
  * `'Ok' = 1` — 插入成功。
  * `'ParsingError' = 2` — 解析数据时出现异常。
  * `'FlushError' = 3` — 刷新数据时出现异常。
* `flush_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 发生刷新操作的日期和时间。
* `flush_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 发生刷新操作的日期和时间，精确到微秒。
* `flush_query_id` ([String](../../sql-reference/data-types/string.md)) — 刷新查询的 ID。

**示例**

查询：

```sql
SELECT * FROM system.asynchronous_insert_log LIMIT 1 \G;
```

结果：

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

**另请参阅**

* [system.query&#95;log](../../operations/system-tables/query_log) — `query_log` 系统表的描述，其中包含有关查询执行的通用信息。
* [system.asynchronous&#95;inserts](/operations/system-tables/asynchronous_inserts) — 此表包含队列中待处理异步插入操作的信息。
