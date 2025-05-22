import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.asynchronous_insert_log

<SystemTableCloud/>

包含有关异步插入的信息。每个条目表示一个缓冲到异步插入查询中的插入查询。

要开始记录，请在 [asynchronous_insert_log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) 部分配置参数。

数据的刷新周期在 [asynchronous_insert_log](../../operations/server-configuration-parameters/settings.md#asynchronous_insert_log) 服务器设置部分的 `flush_interval_milliseconds` 参数中设置。要强制刷新，请使用 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 查询。

ClickHouse 不会自动从表中删除数据。有关更多详细信息，请参见 [Introduction](/operations/system-tables/overview#system-tables-introduction)。

列：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 异步插入发生的日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 异步插入执行完成的日期和时间。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 异步插入执行完成的日期和时间（微秒精度）。
- `query` ([String](../../sql-reference/data-types/string.md)) — 查询字符串。
- `database` ([String](../../sql-reference/data-types/string.md)) — 表所在的数据库名称。
- `table` ([String](../../sql-reference/data-types/string.md)) — 表名称。
- `format` ([String](/sql-reference/data-types/string.md)) — 格式名称。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 初始查询的 ID。
- `bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 插入的字节数。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 异常消息。
- `status` ([Enum8](../../sql-reference/data-types/enum.md)) — 视图状态。值：
    - `'Ok' = 1` — 插入成功。
    - `'ParsingError' = 2` — 解析数据时发生异常。
    - `'FlushError' = 3` — 刷新数据时发生异常。
- `flush_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 刷新发生的日期和时间。
- `flush_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 刷新发生的日期和时间（微秒精度）。
- `flush_query_id` ([String](../../sql-reference/data-types/string.md)) — 刷新查询的 ID。

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

**另见**

- [system.query_log](../../operations/system-tables/query_log) — 描述 `query_log` 系统表的信息，该表包含关于查询执行的常见信息。
- [system.asynchronous_inserts](/operations/system-tables/asynchronous_inserts) — 此表包含队列中待处理异步插入的信息。
