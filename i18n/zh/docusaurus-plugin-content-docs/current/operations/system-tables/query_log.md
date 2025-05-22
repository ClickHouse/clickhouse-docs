import SystemTableCloud from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

# system.query_log

<SystemTableCloud/>

包含有关执行查询的信息，例如，开始时间、处理持续时间、错误消息。

:::note
此表不包含 `INSERT` 查询的摄取数据。
:::

您可以在服务器配置的 [query_log](../../operations/server-configuration-parameters/settings.md#query_log) 部分更改查询日志设置。

您可以通过设置 [log_queries = 0](/operations/settings/settings#log_queries) 来禁用查询日志。我们不建议关闭日志，因为此表中的信息对于解决问题很重要。

数据的刷写周期在服务器设置部分的 `flush_interval_milliseconds` 参数中设置。要强制刷新，请使用 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 查询。

ClickHouse 不会自动删除表中的数据。有关更多详细信息，请参见 [Introduction](/operations/system-tables/overview#system-tables-introduction)。

`system.query_log` 表注册了两种查询：

1.  由客户端直接运行的初始查询。
2.  由其他查询发起的子查询（用于分布式查询执行）。对于这些类型的查询，父查询的信息显示在 `initial_*` 列中。

每个查询在 `query_log` 表中创建一到两行，具体取决于查询的状态（请参见 `type` 列）：

1.  如果查询执行成功，则创建两行类型为 `QueryStart` 和 `QueryFinish`。
2.  如果查询处理过程中发生错误，则会创建两个事件，类型为 `QueryStart` 和 `ExceptionWhileProcessing`。
3.  如果在启动查询之前发生错误，则会创建一个事件，类型为 `ExceptionBeforeStart`。

您可以使用 [log_queries_probability](/operations/settings/settings#log_queries_probability) 设置来减少在 `query_log` 表中注册的查询数量。

您可以使用 [log_formatted_queries](/operations/settings/settings#log_formatted_queries) 设置将格式化查询记录到 `formatted_query` 列中。

列：

- `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行查询的服务器的主机名。
- `type` ([Enum8](../../sql-reference/data-types/enum.md)) — 执行查询时发生的事件类型。值：
    - `'QueryStart' = 1` — 查询执行成功开始。
    - `'QueryFinish' = 2` — 查询执行成功结束。
    - `'ExceptionBeforeStart' = 3` — 查询执行前发生异常。
    - `'ExceptionWhileProcessing' = 4` — 查询执行过程中发生异常。
- `event_date` ([Date](../../sql-reference/data-types/date.md)) — 查询开始日期。
- `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 查询开始时间。
- `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 查询开始时间（微秒精度）。
- `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 查询执行开始时间。
- `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 查询执行开始时间（微秒精度）。
- `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 查询执行的持续时间（以毫秒为单位）。
- `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 从参与查询的所有表和表函数中读取的总行数。它包括常见的子查询、用于 `IN` 和 `JOIN` 的子查询。对于分布式查询，`read_rows` 包含所有副本读取的总行数。每个副本发送其 `read_rows` 值，查询的服务器发起者总结所有接收到的和本地的值。缓存量不会影响这个值。
- `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 从参与查询的所有表和表函数中读取的总字节数。它包括常见的子查询、用于 `IN` 和 `JOIN` 的子查询。对于分布式查询，`read_bytes` 包含所有副本读取的字节数。每个副本发送其 `read_bytes` 值，查询的服务器发起者总结所有接收到的和本地的值。缓存量不会影响这个值。
- `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 对于 `INSERT` 查询，写入的行数。对于其他查询，该列值为 0。
- `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 对于 `INSERT` 查询，写入的字节数（未压缩）。对于其他查询，该列值为 0。
- `result_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `SELECT` 查询结果中的行数，或 `INSERT` 查询中的行数。
- `result_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 用于存储查询结果的 RAM 容量（以字节为单位）。
- `memory_usage` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 查询的内存使用量。
- `current_database` ([String](../../sql-reference/data-types/string.md)) — 当前数据库的名称。
- `query` ([String](../../sql-reference/data-types/string.md)) — 查询字符串。
- `formatted_query` ([String](../../sql-reference/data-types/string.md)) — 格式化的查询字符串。
- `normalized_query_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 一个数字哈希值，当查询仅通过文字值不同而相同时，该值相同。
- `query_kind` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 查询的类型。
- `databases` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中出现的数据库名称。
- `tables` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中出现的表名称。
- `columns` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中出现的列名称。
- `partitions` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中出现的分区名称。
- `projections` ([String](../../sql-reference/data-types/string.md)) — 查询执行期间使用的投影名称。
- `views` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中出现的（物化或实时）视图名称。
- `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 异常代码。
- `exception` ([String](../../sql-reference/data-types/string.md)) — 异常消息。
- `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [堆栈跟踪](https://en.wikipedia.org/wiki/Stack_trace)。如果查询成功完成，则为一个空字符串。
- `is_initial_query` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 查询类型。可能的值：
    - 1 — 查询由客户端发起。
    - 0 — 查询由另一个查询发起，作为分布式查询执行的一部分。
- `user` ([String](../../sql-reference/data-types/string.md)) — 发起当前查询的用户名称。
- `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询的 ID。
- `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 用于发起查询的 IP 地址。
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 用于发起查询的客户端端口。
- `initial_user` ([String](../../sql-reference/data-types/string.md)) — 运行初始查询的用户名称（用于分布式查询执行）。
- `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初始查询的 ID（用于分布式查询执行）。
- `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 父查询发起的 IP 地址。
- `initial_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 用于发起父查询的客户端端口。
- `initial_query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 初始查询的开始时间（用于分布式查询执行）。
- `initial_query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 初始查询的开始时间（微秒精度）（用于分布式查询执行）。
- `interface` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 发起查询的接口。可能的值：
    - 1 — TCP。
    - 2 — HTTP。
- `os_user` ([String](../../sql-reference/data-types/string.md)) — 运行 [clickhouse-client](../../interfaces/cli.md) 的操作系统用户名。
- `client_hostname` ([String](../../sql-reference/data-types/string.md)) — 运行 [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的客户机主机名。
- `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的名称。
- `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的版本。
- `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的主要版本。
- `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的次要版本。
- `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端版本的修补组件。
- `script_query_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 对于多个查询的脚本中的查询编号，适用于 [clickhouse-client](../../interfaces/cli.md)。
- `script_line_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 对于多个查询的脚本中查询开始的行号，适用于 [clickhouse-client](../../interfaces/cli.md)。
- `http_method` (UInt8) — 发起查询的 HTTP 方法。可能的值：
    - 0 — 从 TCP 接口发起查询。
    - 1 — 使用 `GET` 方法。
    - 2 — 使用 `POST` 方法。
- `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — 在 HTTP 查询中传递的 HTTP 头 `UserAgent`。
- `http_referer` ([String](../../sql-reference/data-types/string.md)) — 在 HTTP 查询中传递的 HTTP 头 `Referer`（包含发起查询的页面的绝对或部分地址）。
- `forwarded_for` ([String](../../sql-reference/data-types/string.md)) — 在 HTTP 查询中传递的 HTTP 头 `X-Forwarded-For`。
- `quota_key` ([String](../../sql-reference/data-types/string.md)) — 在 [quotas](../../operations/quotas.md) 设置中指定的 `quota key`（请参见 `keyed`）。
- `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 修订版。
- `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — 测量不同指标的 ProfileEvents。它们的描述可以在表 [system.events](/operations/system-tables/events) 中找到。
- `Settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) — 当客户端运行查询时更改的设置。要启用对设置更改的日志记录，请将 `log_query_settings` 参数设置为 1。
- `log_comment` ([String](../../sql-reference/data-types/string.md)) — 日志评论。可以设置为不超过 [max_query_size](../../operations/settings/settings.md#max_query_size) 的任意字符串。如果未定义，则为空字符串。
- `thread_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 参与查询执行的线程 ID。这些线程可能未同时运行。
- `peak_threads_usage` ([UInt64](/sql-reference/data-types/int-uint.md)) — 执行查询时最大同时线程数。
- `used_aggregate_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 查询执行期间使用的 `aggregate functions` 的规范名称。
- `used_aggregate_function_combinators` ([Array(String)](../../sql-reference/data-types/array.md)) — 查询执行期间使用的 `aggregate functions combinators` 的规范名称。
- `used_database_engines` ([Array(String)](../../sql-reference/data-types/array.md)) — 查询执行期间使用的 `database engines` 的规范名称。
- `used_data_type_families` ([Array(String)](../../sql-reference/data-types/array.md)) — 查询执行期间使用的 `data type families` 的规范名称。
- `used_dictionaries` ([Array(String)](../../sql-reference/data-types/array.md)) — 查询执行期间使用的 `dictionaries` 的规范名称。对于使用 XML 文件配置的字典，这是字典的名称；对于通过 SQL 语句创建的字典，规范名称是完全限定的对象名称。
- `used_formats` ([Array(String)](../../sql-reference/data-types/array.md)) — 查询执行期间使用的 `formats` 的规范名称。
- `used_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 查询执行期间使用的 `functions` 的规范名称。
- `used_storages` ([Array(String)](../../sql-reference/data-types/array.md)) — 查询执行期间使用的 `storages` 的规范名称。
- `used_table_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 查询执行期间使用的 `table functions` 的规范名称。
- `used_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - 在查询执行期间成功检查的权限。
- `missing_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - 在查询执行期间缺失的权限。
- `query_cache_usage` ([Enum8](../../sql-reference/data-types/enum.md)) — 查询执行期间 [query cache](../query-cache.md) 的使用情况。值：
    - `'Unknown'` = 状态未知。
    - `'None'` = 查询结果既未写入查询缓存，也未从查询缓存读取。
    - `'Write'` = 查询结果已写入查询缓存。
    - `'Read'` = 查询结果已从查询缓存读取。

**示例**

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
used_privileges:                       []
missing_privileges:                    []
query_cache_usage:                     None
```

**另请参见**

- [system.query_thread_log](/operations/system-tables/query_thread_log) — 此表包含有关每个查询执行线程的信息。
