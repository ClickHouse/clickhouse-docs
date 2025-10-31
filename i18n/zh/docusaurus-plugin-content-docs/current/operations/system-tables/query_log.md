---
'description': '系统表包含关于执行的查询的信息，例如，开始时间，处理持续时间，错误消息。'
'keywords':
- 'system table'
- 'query_log'
'slug': '/operations/system-tables/query_log'
'title': 'system.query_log'
'doc_type': 'reference'
---

import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';


# system.query_log

<SystemTableCloud/>

存储有关执行查询的元数据和统计信息，例如开始时间、持续时间、错误消息、资源使用情况以及其他执行细节。它不存储查询结果。

您可以在服务器配置的 [query_log](../../operations/server-configuration-parameters/settings.md#query_log) 部分更改查询日志记录的设置。

您可以通过设置 [log_queries = 0](/operations/settings/settings#log_queries) 来禁用查询日志记录。我们不建议关闭日志记录，因为此表中的信息对于解决问题很重要。

数据的刷新周期在 [query_log](../../operations/server-configuration-parameters/settings.md#query_log) 服务器设置部分的 `flush_interval_milliseconds` 参数中设置。要强制刷新，请使用 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 查询。

ClickHouse 不会自动删除表中的数据。有关更多细节，请参见 [Introduction](/operations/system-tables/overview#system-tables-introduction)。

`system.query_log` 表注册了两种类型的查询：

1.  客户端直接运行的初始查询。
2.  由其他查询发起的子查询（用于分布式查询执行）。对于这些类型的查询，父查询的信息显示在 `initial_*` 列中。

每个查询在 `query_log` 表中创建一到两行，具体取决于查询的状态（参见 `type` 列）：

1.  如果查询执行成功，创建两行，类型为 `QueryStart` 和 `QueryFinish`。
2.  如果查询处理期间发生错误，创建两条事件，类型为 `QueryStart` 和 `ExceptionWhileProcessing`。
3.  如果在启动查询之前发生错误，则创建一条事件，类型为 `ExceptionBeforeStart`。

您可以使用 [log_queries_probability](/operations/settings/settings#log_queries_probability) 设置减少在 `query_log` 表中注册的查询数量。

您可以使用 [log_formatted_queries](/operations/settings/settings#log_formatted_queries) 设置将格式化查询记录到 `formatted_query` 列。

## Columns {#columns}

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `type` ([Enum8](../../sql-reference/data-types/enum.md)) — 执行查询时发生的事件类型。值：
  - `'QueryStart' = 1` — 查询执行成功开始。
  - `'QueryFinish' = 2` — 查询执行成功结束。
  - `'ExceptionBeforeStart' = 3` — 查询执行之前的异常。
  - `'ExceptionWhileProcessing' = 4` — 查询执行期间的异常。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 查询开始日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 查询开始时间。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 查询开始时间以微秒精度表示。
- `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 查询执行开始时间。
- `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 查询执行开始时间以微秒精度表示。
- `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 查询执行的持续时间（毫秒）。
- `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 从所有参与查询的表和表函数中读取的总行数。包括常规子查询、`IN` 和 `JOIN` 的子查询。对于分布式查询，`read_rows` 包括所有副本读取的总行数。每个副本发送其 `read_rows` 值，查询的服务器发起者汇总所有接收到的和本地的值。缓存量不影响此值。
- `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 从所有参与查询的表和表函数中读取的字节总数。包括常规子查询、`IN` 和 `JOIN` 的子查询。对于分布式查询，`read_bytes` 包括所有副本读取的字节总数。每个副本发送其 `read_bytes` 值，查询的服务器发起者汇总所有接收到的和本地的值。缓存量不影响此值。
- `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 对于 `INSERT` 查询，写入的行数。对于其他查询，列值为 0。
- `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 对于 `INSERT` 查询，写入的字节数（未压缩）。对于其他查询，列值为 0。
- `result_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `SELECT` 查询结果中的行数，或 `INSERT` 查询中的行数。
- `result_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 用于存储查询结果的RAM字节量。
- `memory_usage` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 查询消耗的内存。
- `current_database` ([String](../../sql-reference/data-types/string.md)) — 当前数据库的名称。
- `query` ([String](../../sql-reference/data-types/string.md)) — 查询字符串。
- `formatted_query` ([String](../../sql-reference/data-types/string.md)) — 格式化查询字符串。
- `normalized_query_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 数字哈希值，对于只通过文字值不同的查询是相同的。
- `query_kind` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 查询的类型。
- `databases` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中存在的数据库名称。
- `tables` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中存在的表名称。
- `columns` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中存在的列名称。
- `partitions` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中存在的分区名称。
- `projections` ([String](../../sql-reference/data-types/string.md)) — 查询执行过程中使用的投影名称。
- `views` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中存在的（物化或实时）视图名称。
- `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 异常代码。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 异常消息。
- `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [堆栈跟踪](https://en.wikipedia.org/wiki/Stack_trace)。如果查询成功完成，则为空字符串。
- `is_initial_query` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 查询类型。可能的值：
  - 1 — 查询由客户端发起。
  - 0 — 查询由另一个查询发起，作为分布式查询执行的一部分。
- `user` ([String](../../sql-reference/data-types/string.md)) — 发起当前查询的用户名称。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询的ID。
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 用于发起查询的IP地址。
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 用于发起查询的客户端端口。
- `initial_user` ([String](../../sql-reference/data-types/string.md)) — 运行初始查询的用户名称（用于分布式查询执行）。
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初始查询的ID（用于分布式查询执行）。
- `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 启动父查询的IP地址。
- `initial_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 用于发起父查询的客户端端口。
- `initial_query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 初始查询开始时间（用于分布式查询执行）。
- `initial_query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 初始查询开始时间以微秒精度表示（用于分布式查询执行）。
- `interface` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 查询发起的接口。可能的值：
  - 1 — TCP。
  - 2 — HTTP。
- `os_user` ([String](../../sql-reference/data-types/string.md)) — 运行 [clickhouse-client](../../interfaces/cli.md) 的操作系统用户名。
- `client_hostname` ([String](../../sql-reference/data-types/string.md)) — 运行 [clickhouse-client](../../interfaces/cli.md) 或其他TCP客户端的客户端计算机的主机名。
- `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他TCP客户端名称。
- `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他TCP客户端的修订版本。
- `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他TCP客户端的主要版本。
- `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他TCP客户端的次要版本。
- `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他TCP客户端版本的补丁组件。
- `script_query_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 在包含多个查询的脚本中对 [clickhouse-client](../../interfaces/cli.md) 的查询编号。
- `script_line_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 在包含多个查询的脚本中查询开始的行号。
- `http_method` (UInt8) — 发起查询的HTTP方法。可能的值：
  - 0 — 查询是从TCP接口发起的。
  - 1 — 使用了 `GET` 方法。
  - 2 — 使用了 `POST` 方法。
- `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — 在HTTP查询中传递的HTTP头 `UserAgent`。
- `http_referer` ([String](../../sql-reference/data-types/string.md)) — 在HTTP查询中传递的HTTP头 `Referer`（包含发起查询的页面的绝对或部分地址）。
- `forwarded_for` ([String](../../sql-reference/data-types/string.md)) — 在HTTP查询中传递的HTTP头 `X-Forwarded-For`。
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — 在 [quotas](../../operations/quotas.md) 设置中指定的 `quota key`（见 `keyed`）。
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 修订版。
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — 测量不同指标的ProfileEvents。它们的描述可以在表 [system.events](/operations/system-tables/events) 中找到。
- `Settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) — 当客户端运行查询时更改的设置。要启用对设置更改的日志记录，请将 `log_query_settings` 参数设置为 1。
- `log_comment` ([String](../../sql-reference/data-types/string.md)) — 日志评论。可以设置为不超过 [max_query_size](../../operations/settings/settings.md#max_query_size) 的任意字符串。如果未定义，则为空字符串。
- `thread_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 参与查询执行的线程ID。这些线程可能不是同时运行的。
- `peak_threads_usage` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 执行查询时的最大并发线程数。
- `used_aggregate_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `aggregate functions` 的规范名称。
- `used_aggregate_function_combinators` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `aggregate functions combinators` 的规范名称。
- `used_database_engines` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `database engines` 的规范名称。
- `used_data_type_families` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `data type families` 的规范名称。
- `used_dictionaries` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `dictionaries` 的规范名称。对于使用XML文件配置的字典而言，这是字典的名称；而对于通过SQL语句创建的字典，其规范名称为完全限定的对象名称。
- `used_formats` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `formats` 的规范名称。
- `used_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `functions` 的规范名称。
- `used_storages` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `storages` 的规范名称。
- `used_table_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `table functions` 的规范名称。
- `used_executable_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `executable user defined functions` 的规范名称。
- `used_sql_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `sql user defined functions` 的规范名称。
- `used_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - 在查询执行期间成功检查的权限。
- `missing_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - 在查询执行期间缺失的权限。
- `query_cache_usage` ([Enum8](../../sql-reference/data-types/enum.md)) — 查询执行期间 [query cache](../query-cache.md) 的使用情况。值：
  - `'Unknown'` = 状态未知。
  - `'None'` = 查询结果既未写入查询缓存，也未从查询缓存读取。
  - `'Write'` = 查询结果已写入查询缓存。
  - `'Read'` = 查询结果已从查询缓存读取。

## Examples {#examples}

**基本示例**

```sql
SELECT * FROM system.query_log WHERE type = 'QueryFinish' ORDER BY query_start_time DESC LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
hostname:                              clickhouse.eu-central1.internal
type:                                  QueryFinish
event_date:                            2021-11-03
event_time:                            2021-11-03 16:13:54
event_time_microseconds:               2021-11-03 16:13:54.953024
query_start_time:                      2021-11-03 16:13:54
query_start_time_microseconds:         2021-11-03 16:13:54.952325
query_duration_ms:                     0
read_rows:                             69
read_bytes:                            6187
written_rows:                          0
written_bytes:                         0
result_rows:                           69
result_bytes:                          48256
memory_usage:                          0
current_database:                      default
query:                                 DESCRIBE TABLE system.query_log
formatted_query:
normalized_query_hash:                 8274064835331539124
query_kind:
databases:                             []
tables:                                []
columns:                               []
projections:                           []
views:                                 []
exception_code:                        0
exception:
stack_trace:
is_initial_query:                      1
user:                                  default
query_id:                              7c28bbbb-753b-4eba-98b1-efcbe2b9bdf6
address:                               ::ffff:127.0.0.1
port:                                  40452
initial_user:                          default
initial_query_id:                      7c28bbbb-753b-4eba-98b1-efcbe2b9bdf6
initial_address:                       ::ffff:127.0.0.1
initial_port:                          40452
initial_query_start_time:              2021-11-03 16:13:54
initial_query_start_time_microseconds: 2021-11-03 16:13:54.952325
interface:                             1
os_user:                               sevirov
client_hostname:                       clickhouse.eu-central1.internal
client_name:                           ClickHouse
client_revision:                       54449
client_version_major:                  21
client_version_minor:                  10
client_version_patch:                  1
http_method:                           0
http_user_agent:
http_referer:
forwarded_for:
quota_key:
revision:                              54456
log_comment:
thread_ids:                            [30776,31174]
ProfileEvents:                         {'Query':1,'NetworkSendElapsedMicroseconds':59,'NetworkSendBytes':2643,'SelectedRows':69,'SelectedBytes':6187,'ContextLock':9,'RWLockAcquiredReadLocks':1,'RealTimeMicroseconds':817,'UserTimeMicroseconds':427,'SystemTimeMicroseconds':212,'OSCPUVirtualTimeMicroseconds':639,'OSReadChars':894,'OSWriteChars':319}
Settings:                              {'load_balancing':'random','max_memory_usage':'10000000000'}
used_aggregate_functions:              []
used_aggregate_function_combinators:   []
used_database_engines:                 []
used_data_type_families:               []
used_dictionaries:                     []
used_formats:                          []
used_functions:                        []
used_storages:                         []
used_table_functions:                  []
used_executable_user_defined_functions:[]
used_sql_user_defined_functions:       []
used_privileges:                       []
missing_privileges:                    []
query_cache_usage:                     None
```

**云示例**

在 ClickHouse Cloud 中，`system.query_log` 是每个节点的本地；要查看所有条目，必须通过 [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 查询。

例如，要聚合“默认”集群中每个副本的 query_log 行，可以写：

```sql
SELECT * 
FROM clusterAllReplicas('default', system.query_log)
WHERE event_time >= now() - toIntervalHour(1)
LIMIT 10
SETTINGS skip_unavailable_shards = 1;
```

**另见**

- [system.query_thread_log](/operations/system-tables/query_thread_log) — 此表包含有关每个查询执行线程的信息。
