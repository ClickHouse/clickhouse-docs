import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

包含关于系统中发生的事件数量的信息。例如，在该表中，您可以找到自 ClickHouse 服务器启动以来处理了多少个 `SELECT` 查询。

列：

- `event` ([String](../../sql-reference/data-types/string.md)) — 事件名称。
- `value` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 发生的事件数量。
- `description` ([String](../../sql-reference/data-types/string.md)) — 事件描述。
- `name` ([String](../../sql-reference/data-types/string.md)) — `event` 的别名。

您可以在源文件 [src/Common/ProfileEvents.cpp](https://github.com/ClickHouse/ClickHouse/blob/master/src/Common/ProfileEvents.cpp) 中找到所有支持的事件。

**示例**

```sql
SELECT * FROM system.events LIMIT 5
```

```text
┌─event─────────────────────────────────┬─value─┬─description────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Query                                 │    12 │ Number of queries to be interpreted and potentially executed. Does not include queries that failed to parse or were rejected due to AST size limits, quota limits or limits on the number of simultaneously running queries. May include internal queries initiated by ClickHouse itself. Does not count subqueries.                  │
│ SelectQuery                           │     8 │ Same as Query, but only for SELECT queries.                                                                                                                                                                                                                │
│ FileOpen                              │    73 │ Number of files opened.                                                                                                                                                                                                                                    │
│ ReadBufferFromFileDescriptorRead      │   155 │ Number of reads (read/pread) from a file descriptor. Does not include sockets.                                                                                                                                                                             │
│ ReadBufferFromFileDescriptorReadBytes │  9931 │ Number of bytes read from file descriptors. If the file is compressed, this will show the compressed data size.                                                                                                                                              │
└───────────────────────────────────────┴───────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**另请参见**

- [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics) — 包含定期计算的度量。
- [system.metrics](/operations/system-tables/metrics) — 包含即时计算的度量。
- [system.metric_log](/operations/system-tables/metric_log) — 包含来自 `system.metrics` 和 `system.events` 表的度量值历史记录。
- [Monitoring](../../operations/monitoring.md) — ClickHouse 监控的基本概念。
