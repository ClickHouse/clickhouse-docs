
# Replicated

该引擎基于 [Atomic](../../engines/database-engines/atomic.md) 引擎。通过将 DDL 日志写入 ZooKeeper 并在给定数据库的所有副本上执行，支持元数据的复制。

一个 ClickHouse 服务器可以同时运行并更新多个复制数据库。但是，不允许有相同复制数据库的多个副本。

## 创建数据库 {#creating-a-database}
```sql
CREATE DATABASE testdb ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**引擎参数**

- `zoo_path` — ZooKeeper 路径。相同的 ZooKeeper 路径对应相同的数据库。
- `shard_name` — 分片名称。数据库副本通过 `shard_name` 进行分组。
- `replica_name` — 副本名称。相同分片的所有副本名称必须不同。

对于 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 表，如果未提供参数，则使用默认参数：`/clickhouse/tables/{uuid}/{shard}` 和 `{replica}`。这些可以在服务器设置 [default_replica_path](../../operations/server-configuration-parameters/settings.md#default_replica_path) 和 [default_replica_name](../../operations/server-configuration-parameters/settings.md#default_replica_name) 中更改。宏 `{uuid}` 被展开为表的 uuid，`{shard}` 和 `{replica}` 被展开为来自服务器配置的值，而不是来自数据库引擎参数。但是在未来，可以使用复制数据库的 `shard_name` 和 `replica_name`。

## 细节与建议 {#specifics-and-recommendations}

与 [ON CLUSTER](../../sql-reference/distributed-ddl.md) 查询类似，DDL 查询在 `Replicated` 数据库中以相似的方式工作，但存在一些细微差别。

首先，DDL 请求尝试在发起者（最初接收到用户请求的主机）上执行。如果请求未得到满足，则用户立即收到错误，其他主机则不尝试满足该请求。如果请求在发起者上成功完成，则所有其他主机将自动重试直到其完成。发起者将尝试等待查询在其他主机上完成（不超过 [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)），并将返回一个表，其中包含每个主机的查询执行状态。

在发生错误时的行为由 [distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode) 设置管理，对于 `Replicated` 数据库，最好将其设置为 `null_status_on_timeout` — 即如果某些主机没有在 [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout) 内执行请求，则不要抛出异常，而是显示它们在表中的 `NULL` 状态。

[system.clusters](../../operations/system-tables/clusters.md) 系统表包含一个与复制数据库同名的集群，包含数据库的所有副本。此集群在创建/删除副本时自动更新，并可以用于 [Distributed](/engines/table-engines/special/distributed) 表。

当创建数据库的新副本时，该副本会自行创建表。如果副本长时间不可用并且滞后于复制日志 — 它会检查其本地元数据与 ZooKeeper 中的当前元数据，将多余的具有数据的表移至一个单独的非复制数据库（以防止意外删除多余内容），创建缺少的表，如果表名已更改，则更新表名。数据在 `ReplicatedMergeTree` 级别进行复制，即如果表未被复制，数据将不会被复制（数据库仅负责元数据）。

[`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md) 查询是被允许的但不被复制。数据库引擎只会将分区/部分添加/获取/移除到当前副本中。然而，如果表本身使用的是复制表引擎，则在使用 `ATTACH` 后数据将被复制。

如果只需要配置一个集群而不维护表的复制，请参阅 [Cluster Discovery](../../operations/cluster-discovery.md) 功能。

## 使用示例 {#usage-example}

创建一个包含三个主机的集群：

```sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

运行 DDL 查询：

```sql
CREATE TABLE r.rmt (n UInt64) ENGINE=ReplicatedMergeTree ORDER BY n;
```

```text
┌─────hosts────────────┬──status─┬─error─┬─num_hosts_remaining─┬─num_hosts_active─┐
│ shard1|replica1      │    0    │       │          2          │        0         │
│ shard1|other_replica │    0    │       │          1          │        0         │
│ other_shard|r1       │    0    │       │          0          │        0         │
└──────────────────────┴─────────┴───────┴─────────────────────┴──────────────────┘
```

显示系统表：

```sql
SELECT cluster, shard_num, replica_num, host_name, host_address, port, is_local
FROM system.clusters WHERE cluster='r';
```

```text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

创建一个分布式表并插入数据：

```sql
node2 :) CREATE TABLE r.d (n UInt64) ENGINE=Distributed('r','r','rmt', n % 2);
node3 :) INSERT INTO r.d SELECT * FROM numbers(10);
node1 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node3 │  [1,3,5,7,9]  │
│ node2 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```

在另一台主机上添加副本：

```sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

集群配置将看起来像这样：

```text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     1     │      2      │   node4   │  127.0.0.1   │ 9003 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

分布式表也将从新主机获取数据：

```sql
node2 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node2 │  [1,3,5,7,9]  │
│ node4 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```
