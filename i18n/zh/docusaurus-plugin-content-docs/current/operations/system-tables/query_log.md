---
description: '包含已执行查询相关信息的系统表，例如开始时间、处理时长、错误信息。'
keywords: ['系统表', 'query_log']
slug: /operations/system-tables/query_log
title: 'system.query_log'
doc_type: 'reference'
---

import SystemTableCloud from '@site/docs/_snippets/_system_table_cloud.md';


# system.query_log

<SystemTableCloud/>

存储已执行查询的元数据和统计信息，例如开始时间、持续时间、错误消息、资源使用情况以及其他执行细节。它不会存储查询结果。

可以在服务器配置的 [query_log](../../operations/server-configuration-parameters/settings.md#query_log) 部分更改查询日志记录相关设置。

可以通过将 [log_queries = 0](/operations/settings/settings#log_queries) 来禁用查询日志记录。不建议关闭日志记录，因为此表中的信息对于排查问题非常重要。

数据刷新的周期由服务器设置中 [query_log](../../operations/server-configuration-parameters/settings.md#query_log) 部分的 `flush_interval_milliseconds` 参数控制。要强制刷新，请使用 [SYSTEM FLUSH LOGS](/sql-reference/statements/system#flush-logs) 查询。

ClickHouse 不会自动从该表中删除数据。更多详情参见[简介](/operations/system-tables/overview#system-tables-introduction)。

`system.query_log` 表记录两种类型的查询：

1.  由客户端直接运行的初始查询。
2.  由其他查询发起的子查询（用于分布式查询执行）。对于此类查询，父查询的信息显示在 `initial_*` 列中。

每个查询会根据其状态（参见 `type` 列）在 `query_log` 表中创建一行或两行记录：

1.  如果查询执行成功，则会创建两行类型为 `QueryStart` 和 `QueryFinish` 的记录。
2.  如果在查询处理期间发生错误，则会创建两个事件，类型为 `QueryStart` 和 `ExceptionWhileProcessing`。
3.  如果在启动查询之前发生错误，则会创建一个类型为 `ExceptionBeforeStart` 的事件。

可以使用 [log_queries_probability](/operations/settings/settings#log_queries_probability) 设置来减少记录到 `query_log` 表中的查询数量。

可以使用 [log_formatted_queries](/operations/settings/settings#log_formatted_queries) 设置将格式化后的查询记录到 `formatted_query` 列中。



## 列 {#columns}


* `hostname` ([LowCardinality(String)](../../sql-reference/data-types/string.md)) — 执行该查询的服务器的主机名。
* `type` ([Enum8](../../sql-reference/data-types/enum.md)) — 表示在执行查询时发生的事件的类型。可选值：
  * `'QueryStart' = 1` — 成功开始执行查询。
  * `'QueryFinish' = 2` — 成功结束查询执行。
  * `'ExceptionBeforeStart' = 3` — 在查询执行开始前发生异常。
  * `'ExceptionWhileProcessing' = 4` — 在查询执行过程中发生异常。
* `event_date` ([Date](../../sql-reference/data-types/date.md)) — 查询开始日期。
* `event_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 查询的开始时间。
* `event_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 具有微秒级精度的查询开始时间。
* `query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 查询开始执行时间。
* `query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 查询执行的开始时间，具有微秒级精度。
* `query_duration_ms` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 查询执行耗时，单位为毫秒。
* `read_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 从参与查询的所有表和表函数中读取的总行数。它包括普通子查询，以及用于 `IN` 和 `JOIN` 的子查询。对于分布式查询，`read_rows` 包含在所有副本上读取的总行数。每个副本都会发送自己的 `read_rows` 值，查询的发起服务器会汇总所有接收到的值以及本地值。缓存的使用情况不会影响该值。
* `read_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 从参与查询的所有表和表函数中读取的字节总数。包括普通子查询，以及用于 `IN` 和 `JOIN` 的子查询。对于分布式查询，`read_bytes` 为在所有副本上读取的字节总数。每个副本都会发送自己的 `read_bytes` 值，查询发起方服务器会汇总所有接收到的值以及本地值。缓存的数据量不会影响此值。
* `written_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 对于 `INSERT` 查询，表示写入的行数。对于其他查询，该列的值为 0。
* `written_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 对于 `INSERT` 查询，表示写入的字节数（未压缩的）。对于其他查询，该列值为 0。
* `result_rows` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — `SELECT` 查询结果中的行数，或 `INSERT` 查询中要插入的行数。
* `result_bytes` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 在 RAM 中用于存储查询结果的内存字节数。
* `memory_usage` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 查询的内存使用量。
* `current_database` ([String](../../sql-reference/data-types/string.md)) — 当前数据库的名称。
* `query` ([String](../../sql-reference/data-types/string.md)) — 查询字符串。
* `formatted_query` ([String](../../sql-reference/data-types/string.md)) — 格式化的查询字符串。
* `normalized_query_hash` ([UInt64](/sql-reference/data-types/int-uint#integer-ranges)) — 一个数值哈希值，对于仅在字面量值上不同的查询，该哈希值相同。
* `query_kind` ([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md)) — 查询类型。
* `databases` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 出现在查询中的数据库名称。
* `tables` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 出现在查询中的表名。
* `columns` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中包含的列名。
* `partitions` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中出现的分区名称。
* `projections` ([String](../../sql-reference/data-types/string.md)) — 查询执行期间使用的投影名称。
* `views` ([Array](../../sql-reference/data-types/array.md)([LowCardinality(String)](../../sql-reference/data-types/lowcardinality.md))) — 查询中出现的（物化视图或实时视图）的名称。
* `exception_code` ([Int32](../../sql-reference/data-types/int-uint.md)) — 异常代码。
* `exception` ([String](../../sql-reference/data-types/string.md)) — 异常信息。
* `stack_trace` ([String](../../sql-reference/data-types/string.md)) — [堆栈跟踪](https://en.wikipedia.org/wiki/Stack_trace)。如果查询成功完成，则为空字符串。
* `is_initial_query` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 查询类型。可能的取值如下：
  * 1 — 查询由客户端发起。
  * 0 — 查询由其他查询发起，作为分布式查询执行的一部分。
* `user` ([String](../../sql-reference/data-types/string.md)) — 发起当前查询的用户名。
* `query_id` ([String](../../sql-reference/data-types/string.md)) — 查询 ID。
* `address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 用于发出该查询的 IP 地址。
* `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 用于执行该查询的客户端端口。
* `initial_user` ([String](../../sql-reference/data-types/string.md)) — 执行初始查询的用户名（用于分布式查询执行）。
* `initial_query_id` ([String](../../sql-reference/data-types/string.md)) — 初始查询 ID（在分布式查询执行中）。
* `initial_address` ([IPv6](../../sql-reference/data-types/ipv6.md)) — 父查询发起时的源 IP 地址。
* `initial_port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 用于发起父查询的客户端端口。
* `initial_query_start_time` ([DateTime](../../sql-reference/data-types/datetime.md)) — 初始查询开始时间（在分布式查询执行中）。
* `initial_query_start_time_microseconds` ([DateTime64](../../sql-reference/data-types/datetime64.md)) — 初始查询的开始时间，精度为微秒级（用于分布式查询执行）。
* `interface` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 发起该查询的接口。可能的取值：
  * 1 — TCP。
  * 2 — HTTP。
* `os_user` ([String](../../sql-reference/data-types/string.md)) — 运行 [clickhouse-client](../../interfaces/cli.md) 的操作系统用户名。
* `client_hostname` ([String](../../sql-reference/data-types/string.md)) — 运行 [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的客户端主机的主机名。
* `client_name` ([String](../../sql-reference/data-types/string.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端名称。
* `client_revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的修订号。
* `client_version_major` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的主版本号。
* `client_version_minor` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端的次要版本号。
* `client_version_patch` ([UInt32](../../sql-reference/data-types/int-uint.md)) — [clickhouse-client](../../interfaces/cli.md) 或其他 TCP 客户端版本的补丁版本号部分。
* `script_query_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 在包含多个查询的脚本中，用于 [clickhouse-client](../../interfaces/cli.md) 的查询编号。
* `script_line_number` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 在包含多个查询的脚本中，针对 [clickhouse-client](../../interfaces/cli.md) 的查询在脚本中的起始行号。
* `http_method` (UInt8) — 发起该查询的 HTTP 方法。可能的取值如下：
  * 0 — 查询是通过 TCP 接口发起的。
  * 1 — 使用了 `GET` 方法。
  * 2 — 使用了 `POST` 方法。
* `http_user_agent` ([String](../../sql-reference/data-types/string.md)) — 在 HTTP 查询中传入的 HTTP 头 `UserAgent`。
* `http_referer` ([String](../../sql-reference/data-types/string.md)) — 在 HTTP 查询中传递的 HTTP 头 `Referer`（包含发出该查询的页面的绝对或部分地址）。
* `forwarded_for` ([String](../../sql-reference/data-types/string.md)) — 在 HTTP 请求中传递的 HTTP 头部 `X-Forwarded-For`。
* `quota_key` ([String](../../sql-reference/data-types/string.md)) — 在 [quotas](../../operations/quotas.md) 配置中指定的 `quota key`（参见 `keyed`）。
* `revision` ([UInt32](../../sql-reference/data-types/int-uint.md)) — ClickHouse 修订版本号。
* `ProfileEvents` ([Map(String, UInt64)](../../sql-reference/data-types/map.md)) — 用于度量不同指标的 ProfileEvents。其说明可在表 [system.events](/operations/system-tables/events) 中找到
* `Settings` ([Map(String, String)](../../sql-reference/data-types/map.md)) — 客户端执行查询时被更改的设置。要启用对设置更改的日志记录，请将 `log_query_settings` 参数设置为 1。
* `log_comment` ([String](../../sql-reference/data-types/string.md)) — 日志备注。可以设置为任意字符串，但长度不能超过 [max&#95;query&#95;size](../../operations/settings/settings.md#max_query_size)。如果未设置，则为空字符串。
* `thread_ids` ([Array(UInt64)](../../sql-reference/data-types/array.md)) — 参与执行该查询的线程 ID。这些线程可能并未同时运行。
* `peak_threads_usage` ([UInt64)](../../sql-reference/data-types/int-uint.md)) — 同时执行该查询的线程的最大数量。
* `used_aggregate_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行期间使用的 `aggregate functions` 的标准名称。
* `used_aggregate_function_combinators` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行期间所使用的 `aggregate functions combinators` 的规范化名称。
* `used_database_engines` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `database engines` 的规范名称。
* `used_data_type_families` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行期间使用的 `数据类型族` 的规范名称。
* `used_dictionaries` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用到的 `dictionaries` 的规范名称。对于使用 XML 文件配置的字典，该名称就是字典名称；对于通过 SQL 语句创建的字典，其规范名称为全限定对象名。
* `used_formats` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行期间使用的 `formats` 的规范名称。
* `used_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行期间使用的 `functions` 的标准名称。
* `used_storages` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用的 `storages` 的规范名称。
* `used_table_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行期间使用到的 `table functions` 的标准名称。
* `used_executable_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行期间使用的 `executable user defined functions` 的规范名称。
* `used_sql_user_defined_functions` ([Array(String)](../../sql-reference/data-types/array.md)) — 在查询执行过程中使用到的 `SQL 用户自定义函数` 的规范名称。
* `used_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - 在查询执行期间成功通过检查的权限。
* `missing_privileges` ([Array(String)](../../sql-reference/data-types/array.md)) - 查询执行期间缺少的权限。
* `query_cache_usage` ([Enum8](../../sql-reference/data-types/enum.md)) — 查询执行期间 [query cache](../query-cache.md) 的使用方式。可选值：
  * `'Unknown'` = 状态未知。
  * `'None'` = 查询结果既没有写入查询缓存，也没有从查询缓存中读取。
  * `'Write'` = 查询结果已写入查询缓存。
  * `'Read'` = 查询结果已从查询缓存中读取。





## 示例 {#examples}

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

**Cloud 示例**

在 ClickHouse Cloud 中,`system.query_log` 是每个节点的本地表;要查看所有条目,必须通过 [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 进行查询。

例如,要聚合 "default" 集群中每个副本的 query_log 行,可以编写如下查询:

```sql
SELECT *
FROM clusterAllReplicas('default', system.query_log)
WHERE event_time >= now() - toIntervalHour(1)
LIMIT 10
SETTINGS skip_unavailable_shards = 1;
```

**另请参阅**

- [system.query_thread_log](/operations/system-tables/query_thread_log) — 该表包含每个查询执行线程的相关信息。
