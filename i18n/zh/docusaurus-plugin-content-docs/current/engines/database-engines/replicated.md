---
'description': '该引擎基于Atomic引擎。它通过将DDL日志复制到ZooKeeper并在给定数据库的所有副本上执行来支持元数据的复制。'
'sidebar_label': '副本'
'sidebar_position': 30
'slug': '/engines/database-engines/replicated'
'title': 'Replicated'
---




# 复制

该引擎基于 [Atomic](../../engines/database-engines/atomic.md) 引擎。它支持通过将 DDL 日志写入 ZooKeeper 并在给定数据库的所有副本上执行来复制元数据。

一个 ClickHouse 服务器可以同时运行和更新多个复制数据库。但是同一个复制数据库不能有多个副本。

## 创建数据库 {#creating-a-database}
```sql
CREATE DATABASE testdb ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**引擎参数**

- `zoo_path` — ZooKeeper 路径。相同的 ZooKeeper 路径对应于相同的数据库。
- `shard_name` — 分片名称。数据库副本通过 `shard_name` 分组到分片中。
- `replica_name` — 副本名称。对于同一分片的所有副本，副本名称必须不同。

对于 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 表，如果未提供参数，则使用默认参数：`/clickhouse/tables/{uuid}/{shard}` 和 `{replica}`。这些可以在服务器设置 [default_replica_path](../../operations/server-configuration-parameters/settings.md#default_replica_path) 和 [default_replica_name](../../operations/server-configuration-parameters/settings.md#default_replica_name) 中更改。宏 `{uuid}` 会展开为表的 uuid，`{shard}` 和 `{replica}` 会展开为来自服务器配置的值，而不是来自数据库引擎参数的值。但在将来，可以使用复制数据库的 `shard_name` 和 `replica_name`。

## 特性和建议 {#specifics-and-recommendations}

DDL 查询与 `Replicated` 数据库的工作方式类似于 [ON CLUSTER](../../sql-reference/distributed-ddl.md) 查询，但有一些细微的区别。

首先，DDL 请求尝试在发起者（最初从用户接收到请求的主机）上执行。如果请求未能满足，用户将立即收到错误，其他主机不会尝试满足它。如果请求在发起者上成功完成，则所有其他主机将自动重试，直到完成。发起者会尝试等待查询在其他主机上完成（最长不超过 [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)），并将每个主机上的查询执行状态返回为表。

在出现错误的情况下，行为由 [distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode) 设置进行调节，对于 `Replicated` 数据库，最好将其设置为 `null_status_on_timeout` — 即如果某些主机在 [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout) 之前未能执行请求，则不抛出异常，而是在表中显示 `NULL` 状态。

[system.clusters](../../operations/system-tables/clusters.md) 系统表包含一个名为被复制数据库的集群，包含数据库的所有副本。此集群在创建/删除副本时会自动更新，并可用于 [Distributed](/engines/table-engines/special/distributed) 表。

在创建数据库的新副本时，此副本会自行创建表。如果副本长时间不可用并且落后于复制日志 — 它会检查本地元数据与 ZooKeeper 中的当前元数据， 将额外的数据表移到单独的非复制数据库中（以免意外删除多余的内容），创建缺失的表， 并在需要时更新表名。如果表没有被复制，则数据不会被复制（数据库仅对元数据负责）。

[`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md) 查询是允许的，但不会被复制。数据库引擎只会将分区/部分添加/获取/删除到当前副本。但是，如果表本身使用 Replicated 表引擎，则在使用 `ATTACH` 后，数据将被复制。

如果您只需要配置集群而不维护表的复制，请参考 [Cluster Discovery](../../operations/cluster-discovery.md) 功能。

## 使用示例 {#usage-example}

创建一个有三个主机的集群：

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

创建分布式表并插入数据：

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

集群配置将如下所示：

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
