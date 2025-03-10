---
description: '用于实现 `SHOW PROCESSLIST` 查询的系统表。'
slug: /operations/system-tables/processes
title: 'system.processes'
keywords: ['system table', 'processes']
---
import SystemTableCloud from '@site/i18n/zh/docusaurus-plugin-content-docs/current/_snippets/_system_table_cloud.md';

<SystemTableCloud/>

此系统表用于实现 `SHOW PROCESSLIST` 查询。

列：

- `user` (String) – 发起查询的用户。请注意，在分布式处理的情况下，查询会以 `default` 用户的身份发送到远程服务器。该字段包含某个特定查询的用户名，而不是该查询发起的查询的用户名。
- `address` (String) – 请求发起的 IP 地址。在分布式处理的情况下也是如此。要追踪某个分布式查询最初从哪里发起，请查看查询请求服务器上的 `system.processes`。
- `elapsed` (Float64) – 自请求执行开始以来的时间（以秒为单位）。
- `read_rows` (UInt64) – 从表中读取的行数。在请求服务器上，对于分布式处理，这是所有远程服务器的总和。
- `read_bytes` (UInt64) – 从表中读取的未压缩字节数。在请求服务器上，对于分布式处理，这是所有远程服务器的总和。
- `total_rows_approx` (UInt64) – 应该读取的总行数的近似值。在请求服务器上，对于分布式处理，这是所有远程服务器的总和。在请求处理期间，当新的处理源变得可知时，它可以被更新。
- `memory_usage` (Int64) – 请求使用的 RAM 数量。它可能不包括某些类型的专用内存。请参见 [max_memory_usage](../../operations/settings/query-complexity.md#settings_max_memory_usage) 设置。
- `query` (String) – 查询文本。对于 `INSERT`，它不包括要插入的数据。
- `query_id` (String) – 查询 ID（如果已定义）。
- `is_cancelled` (UInt8) – 查询是否被取消。
- `is_all_data_sent` (UInt8) – 是否所有数据已发送到客户端（换句话说，查询在服务器上已完成）。

```sql
SELECT * FROM system.processes LIMIT 10 FORMAT Vertical;
```

```response
Row 1:
──────
is_initial_query:     1
user:                 default
query_id:             35a360fa-3743-441d-8e1f-228c938268da
address:              ::ffff:172.23.0.1
port:                 47588
initial_user:         default
initial_query_id:     35a360fa-3743-441d-8e1f-228c938268da
initial_address:      ::ffff:172.23.0.1
initial_port:         47588
interface:            1
os_user:              bharatnc
client_hostname:      tower
client_name:          ClickHouse
client_revision:      54437
client_version_major: 20
client_version_minor: 7
client_version_patch: 2
http_method:          0
http_user_agent:
quota_key:
elapsed:              0.000582537
is_cancelled:         0
is_all_data_sent:     0
read_rows:            0
read_bytes:           0
total_rows_approx:    0
written_rows:         0
written_bytes:        0
memory_usage:         0
peak_memory_usage:    0
query:                SELECT * from system.processes LIMIT 10 FORMAT Vertical;
thread_ids:           [67]
ProfileEvents:        {'Query':1,'SelectQuery':1,'ReadCompressedBytes':36,'CompressedReadBufferBlocks':1,'CompressedReadBufferBytes':10,'IOBufferAllocs':1,'IOBufferAllocBytes':89,'ContextLock':15,'RWLockAcquiredReadLocks':1}
Settings:             {'background_pool_size':'32','load_balancing':'random','allow_suspicious_low_cardinality_types':'1','distributed_aggregation_memory_efficient':'1','skip_unavailable_shards':'1','log_queries':'1','max_bytes_before_external_group_by':'20000000000','max_bytes_before_external_sort':'20000000000','allow_introspection_functions':'1'}

1 rows in set. Elapsed: 0.002 sec.
```
