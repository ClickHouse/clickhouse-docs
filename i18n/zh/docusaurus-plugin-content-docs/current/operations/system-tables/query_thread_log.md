---
'description': '系统表包含有关执行查询的线程的信息，例如，线程名称，线程开始时间，查询处理持续时间。'
'keywords':
- 'system table'
- 'query_thread_log'
'slug': '/operations/system-tables/query_thread_log'
'title': 'system.query_thread_log'
---

import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_thread_log

<SystemTableCloud/>

包含执行查询的线程信息，例如，线程名称、线程开始时间、查询处理持续时间。

要启动日志记录：

1. 在 [query_thread_log](/operations/server-configuration-parameters/settings#query_thread_log) 部分配置参数。
2. 将 [log_query_threads](/operations/settings/settings#log_query_threads) 设置为 1。

数据的刷新周期在 [query_thread_log](/operations/server-configuration-parameters/settings#query_thread_log) 服务器设置部分的 `flush_interval_milliseconds` 参数中设置。要强制刷新，请使用 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 查询。

ClickHouse 不会自动删除表中的数据。有关更多详细信息，请参见 [Introduction](/operations/system-tables/overview#system-tables-introduction)。

您可以使用 [log_queries_probability](/operations/settings/settings#log_queries_probability) 设置来减少在 `query_thread_log` 表中注册的查询数量。

列：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 线程完成查询执行的日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 线程完成查询执行的日期和时间。
- `event_time_microseconds` ([DateTime](../../sql-reference/data-types/datetime.md)) — 线程完成查询执行的日期和时间，精确到微秒。
- `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 查询执行的开始时间。
- `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 查询执行的开始时间，精确到微秒。
- `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 查询执行的持续时间。
- `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 读取的行数。
- `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 读取的字节数。
- `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 对于 `INSERT` 查询，写入的行数。对于其他查询，该列的值为 0。
- `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 对于 `INSERT` 查询，写入的字节数。对于其他查询，该列的值为 0。
- `memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 上下文中分配的内存与释放的内存之间的差额。
- `peak_memory_usage` ([Int64](../../sql-reference/data-types/int-uint.md)) — 上下文中分配的内存与释放的内存之间的最大差额。
- `thread_name` ([String](../../sql-reference/data-types/string.md)) — 线程名称。
- `thread_id` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 操作系统线程 ID。
- `master_thread_id` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 初始线程的操作系统 ID。
- `query` ([String](../../sql-reference/data-types/string.md)) — 查询字符串。
- `is_initial_query` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 查询类型。可能的值：
    - 1 — 查询由客户端发起。
    - 0 — 查询由另一个查询为分布式查询执行发起。
- `user` ([String](../../sql-reference/data-types/string.md)) — 发起当前查询的用户名称。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询的 ID。
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 用于发起查询的 IP 地址。
- `port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — 用于发起查询的客户端端口。
- `initial_user` ([String](../../sql-reference/data-types/string.md)) — 运行初始查询的用户名称（用于分布式查询执行）。
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初始查询的 ID（用于分布式查询执行）。
- `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 父查询启动的 IP 地址。
- `initial_port` ([UInt16](/sql-reference/data-types/int-uint#integer-ranges)) — 用于发起父查询的客户端端口。
- `interface` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 查询发起的接口。可能的值：
    - 1 — TCP。
    - 2 — HTTP。
- `os_user` ([String](../../sql-reference/data-types/string.md)) — 运行 [clickhouse-client](../../interfaces/cli.md) 的操作系统用户名。
- `client_hostname` ([String](../../sql-reference/data-types/string.md)) — 运行 [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的客户端机器的主机名。
- `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端名称。
- `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的修订版。
- `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的主要版本。
- `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的次要版本。
- `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端版本的修补组件。
- `http_method` ([UInt8](/sql-reference/data-types/int-uint#integer-ranges)) — 发起查询的 HTTP 方法。可能的值：
    - 0 — 查询是从 TCP 接口启动的。
    - 1 — 使用了 `GET` 方法。
    - 2 — 使用了 `POST` 方法。
- `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — 在 HTTP 请求中传递的 `UserAgent` 头信息。
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — 在 [quotas](../../operations/quotas.md) 设置中指定的“配额键”（参见 `keyed`）。
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 修订版。
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/array.md)) — 衡量此线程不同指标的 ProfileEvents。它们的描述可以在表 [system.events](/operations/system-tables/events) 中找到。

**示例**

```sql
SELECT * FROM system.query_thread_log LIMIT 1 \G
```

```text
Row 1:
──────
hostname:                      clickhouse.eu-central1.internal
event_date:                    2020-09-11
event_time:                    2020-09-11 10:08:17
event_time_microseconds:       2020-09-11 10:08:17.134042
query_start_time:              2020-09-11 10:08:17
query_start_time_microseconds: 2020-09-11 10:08:17.063150
query_duration_ms:             70
read_rows:                     0
read_bytes:                    0
written_rows:                  1
written_bytes:                 12
memory_usage:                  4300844
peak_memory_usage:             4300844
thread_name:                   TCPHandler
thread_id:                     638133
master_thread_id:              638133
query:                         INSERT INTO test1 VALUES
is_initial_query:              1
user:                          default
query_id:                      50a320fd-85a8-49b8-8761-98a86bcbacef
address:                       ::ffff:127.0.0.1
port:                          33452
initial_user:                  default
initial_query_id:              50a320fd-85a8-49b8-8761-98a86bcbacef
initial_address:               ::ffff:127.0.0.1
initial_port:                  33452
interface:                     1
os_user:                       bharatnc
client_hostname:               tower
client_name:                   ClickHouse
client_revision:               54437
client_version_major:          20
client_version_minor:          7
client_version_patch:          2
http_method:                   0
http_user_agent:
quota_key:
revision:                      54440
ProfileEvents:        {'Query':1,'SelectQuery':1,'ReadCompressedBytes':36,'CompressedReadBufferBlocks':1,'CompressedReadBufferBytes':10,'IOBufferAllocs':1,'IOBufferAllocBytes':89,'ContextLock':15,'RWLockAcquiredReadLocks':1}
```

**另见**

- [system.query_log](/operations/system-tables/query_log) — 描述 `query_log` 系统表的内容，该表包含关于查询执行的常见信息。
- [system.query_views_log](/operations/system-tables/query_views_log) — 该表包含在查询过程中执行的每个视图的信息。
