---
'description': '系统表包含有关配置文件中可用的集群和其中定义的服务器的信息。'
'keywords':
- 'system table'
- 'clusters'
'slug': '/operations/system-tables/clusters'
'title': 'system.clusters'
'doc_type': 'reference'
---

包含有关配置文件中可用集群及其服务器的信息。

列：

- `cluster` ([String](../../sql-reference/data-types/string.md)) — 集群名称。
- `shard_num` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 集群中的分片编号，从 1 开始。可能因集群修改而改变。
- `shard_name` ([String](../../sql-reference/data-types/string.md)) — 集群中分片的名称。
- `shard_weight` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 写入数据时分片的相对权重。
- `replica_num` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 分片中的副本编号，从 1 开始。
- `host_name` ([String](../../sql-reference/data-types/string.md)) — 配置中指定的主机名。
- `host_address` ([String](../../sql-reference/data-types/string.md)) — 从 DNS 获得的主机 IP 地址。
- `port` ([UInt16](../../sql-reference/data-types/int-uint.md)) — 用于连接到服务器的端口。
- `is_local` ([UInt8](../../sql-reference/data-types/int-uint.md)) — 指示主机是否为本地的标志。
- `user` ([String](../../sql-reference/data-types/string.md)) — 连接到服务器的用户名。
- `default_database` ([String](../../sql-reference/data-types/string.md)) — 默认数据库名称。
- `errors_count` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 此主机未能到达副本的次数。
- `slowdowns_count` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 由于在通过对冲请求建立连接时导致更改副本的慢响应次数。
- `estimated_recovery_time` ([UInt32](../../sql-reference/data-types/int-uint.md)) — 副本错误计数归零，视为正常所需的剩余秒数。
- `database_shard_name` ([String](../../sql-reference/data-types/string.md)) — `Replicated` 数据库分片的名称（用于属于 `Replicated` 数据库的集群）。
- `database_replica_name` ([String](../../sql-reference/data-types/string.md)) — `Replicated` 数据库副本的名称（用于属于 `Replicated` 数据库的集群）。
- `is_active` ([Nullable(UInt8)](../../sql-reference/data-types/int-uint.md)) — `Replicated` 数据库副本的状态（用于属于 `Replicated` 数据库的集群）：1 表示“副本在线”，0 表示“副本离线”，`NULL` 表示“未知”。
- `name` ([String](../../sql-reference/data-types/string.md)) - 集群的别名。

**示例**

查询：

```sql
SELECT * FROM system.clusters LIMIT 2 FORMAT Vertical;
```

结果：

```text
Row 1:
──────
cluster:                 test_cluster_two_shards
shard_num:               1
shard_name:              shard_01
shard_weight:            1
replica_num:             1
host_name:               127.0.0.1
host_address:            127.0.0.1
port:                    9000
is_local:                1
user:                    default
default_database:
errors_count:            0
slowdowns_count:         0
estimated_recovery_time: 0
database_shard_name:
database_replica_name:
is_active:               NULL

Row 2:
──────
cluster:                 test_cluster_two_shards
shard_num:               2
shard_name:              shard_02
shard_weight:            1
replica_num:             1
host_name:               127.0.0.2
host_address:            127.0.0.2
port:                    9000
is_local:                0
user:                    default
default_database:
errors_count:            0
slowdowns_count:         0
estimated_recovery_time: 0
database_shard_name:
database_replica_name:
is_active:               NULL
```

**另见**

- [表引擎 Distributed](../../engines/table-engines/special/distributed.md)
- [distributed_replica_error_cap 设置](../../operations/settings/settings.md#distributed_replica_error_cap)
- [distributed_replica_error_half_life 设置](../../operations/settings/settings.md#distributed_replica_error_half_life)
