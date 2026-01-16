---
description: '该引擎基于 Atomic 引擎构建。它支持通过写入 ZooKeeper 的 DDL 日志来进行元数据复制，并在指定数据库的所有副本上执行。'
sidebar_label: 'Replicated'
sidebar_position: 30
slug: /engines/database-engines/replicated
title: 'Replicated'
doc_type: 'reference'
---

# Replicated \{#replicated\}

该引擎基于 [Atomic](../../engines/database-engines/atomic.md) 引擎。它通过将 DDL 日志写入 ZooKeeper，并在给定数据库的所有副本上执行该日志，从而实现元数据复制。

单个 ClickHouse 服务器可以同时运行并更新多个 Replicated 数据库。但是，同一 Replicated 数据库不能存在多个副本。

## 创建数据库 \{#creating-a-database\}

```sql
CREATE DATABASE testdb [UUID '...'] ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**引擎参数**

* `zoo_path` — ZooKeeper 路径。相同的 ZooKeeper 路径对应同一个数据库。
* `shard_name` — 分片名称。数据库副本根据 `shard_name` 分组到各个分片中。
* `replica_name` — 副本名称。对于同一分片，其所有副本的副本名称必须互不相同。

这些参数可以省略，此时会使用默认值填充缺失的参数。

如果 `zoo_path` 包含宏 `{uuid}`，则必须显式指定 UUID，或者在创建语句中添加 [ON CLUSTER](../../sql-reference/distributed-ddl.md)，以确保所有副本对该数据库使用相同的 UUID。

对于 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 表，如果未提供任何参数，则会使用默认参数：`/clickhouse/tables/{uuid}/{shard}` 和 `{replica}`。可以在服务器设置中通过 [default&#95;replica&#95;path](../../operations/server-configuration-parameters/settings.md#default_replica_path) 和 [default&#95;replica&#95;name](../../operations/server-configuration-parameters/settings.md#default_replica_name) 对其进行修改。宏 `{uuid}` 会展开为表的 uuid，`{shard}` 和 `{replica}` 会展开为服务器配置中的值，而不是数据库引擎参数中的值。不过在未来，将可以使用 Replicated 数据库的 `shard_name` 和 `replica_name`。

## 细节与建议 \{#specifics-and-recommendations\}

使用 `Replicated` 数据库的 DDL 查询与 [ON CLUSTER](../../sql-reference/distributed-ddl.md) 查询的工作方式类似，但存在一些细微差别。

首先，DDL 请求会尝试在发起者（最初从用户接收请求的主机）上执行。如果请求未能完成，用户会立即收到错误，其他主机也不会尝试执行该请求。如果请求在发起者上成功完成，则所有其他主机会自动重试，直到完成该请求。发起者会尝试等待其他主机上的查询执行完毕（最长等待时间不超过 [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)），然后返回一个包含每个主机上查询执行状态的表。

出现错误时的行为由 [distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode) 设置控制。对于 `Replicated` 数据库，建议将其设置为 `null_status_on_timeout` —— 即如果某些主机在 [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout) 内未能及时执行该请求，则不要抛出异常，而是在结果表中为这些主机显示 `NULL` 状态。

[system.clusters](../../operations/system-tables/clusters.md) 系统表中包含一个与该 Replicated 数据库同名的集群，由该数据库的所有副本组成。此集群在创建或删除副本时会自动更新，并可用于 [Distributed](/engines/table-engines/special/distributed) 表。

在创建数据库的新副本时，该副本会自行创建表。如果副本长时间不可用并且落后于复制日志，它会将本地元数据与 ZooKeeper 中的当前元数据进行比较，将多余的带数据的表移动到一个单独的非 Replicated 数据库中（以免误删多余数据），创建缺失的表，并在表被重命名时更新表名。数据在 `ReplicatedMergeTree` 层面进行复制，也就是说，如果表不是基于 Replicated 表引擎的表，则其数据不会被复制（数据库仅负责元数据）。

允许执行 [`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md) 查询，但这些查询不会被复制。数据库引擎只会在当前副本上添加 / 拉取 / 删除分区或数据片段。不过，如果表本身使用的是 Replicated 表引擎，那么在使用 `ATTACH` 之后，数据会进行复制。

如果您只需要配置集群而不需要维护表复制，请参考 [Cluster Discovery](../../operations/cluster-discovery.md) 功能。

## 使用示例 \{#usage-example\}

创建一个由三台主机组成的集群：

```sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

在使用隐式参数的集群上创建数据库：

```sql
CREATE DATABASE r ON CLUSTER default ENGINE=Replicated;
```

执行 DDL 查询：

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

在另一台主机上添加一个副本：

```sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

当在 `zoo_path` 中使用宏 `{uuid}`，并需要在另一台主机上添加副本时：

```sql
node1 :) SELECT uuid FROM system.databases WHERE database='r';
node4 :) CREATE DATABASE r UUID '<uuid from previous query>' ENGINE=Replicated('some/path/{uuid}','other_shard','r2');
```

集群配置如下：

```text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     1     │      2      │   node4   │  127.0.0.1   │ 9003 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

该分布式表也会从新主机接收数据：

```sql
node2 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node2 │  [1,3,5,7,9]  │
│ node4 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```

## 设置 \{#settings\}

支持以下设置：

| Setting（设置项）                                                                 | Default（默认值）                   | Description（说明）                                                  |
| ---------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------- |
| `max_broken_tables_ratio`                                                    | 1                              | 当失效或损坏表占所有表的比例大于该值时，不会自动恢复副本                                     |
| `max_replication_lag_to_enqueue`                                             | 50                             | 当副本复制延迟大于该值时，尝试执行查询将抛出异常                                         |
| `wait_entry_commited_timeout_sec`                                            | 3600                           | 如果超时时间超过该值且发起节点尚未执行该查询，副本将尝试取消该查询                                |
| `collection_name`                                                            |                                | 在 server 配置中定义的集合名称，其中定义了用于集群认证的所有信息                             |
| `check_consistency`                                                          | true                           | 检查本地元数据与 Keeper 中元数据的一致性，如不一致则对副本进行恢复                            |
| `max_retries_before_automatic_recovery`                                      | 10                             | 在将副本标记为丢失并从快照中恢复之前，尝试执行队列条目的最大次数（0 表示无限）                         |
| `allow_skipping_old_temporary_tables_ddls_of_refreshable_materialized_views` | false                          | 如果启用，在处理 Replicated 数据库中的 DDL 时，在可能的情况下会跳过创建和交换可刷新的物化视图的临时表的 DDL |
| `logs_to_keep`                                                               | 1000                           | 在 ZooKeeper 中为 Replicated 数据库保留的默认日志条目数量。                        |
| `default_replica_path`                                                       | `/clickhouse/databases/{uuid}` | ZooKeeper 中数据库的路径。在创建数据库且省略相关参数时使用。                              |
| `default_replica_shard_name`                                                 | `{shard}`                      | 数据库中该副本所属分片的名称。在创建数据库且省略相关参数时使用。                                 |
| `default_replica_name`                                                       | `{replica}`                    | 数据库中该副本的名称。在创建数据库且省略相关参数时使用。                                     |

默认值可以在配置文件中重写。

```xml
<clickhouse>
    <database_replicated>
        <max_broken_tables_ratio>0.75</max_broken_tables_ratio>
        <max_replication_lag_to_enqueue>100</max_replication_lag_to_enqueue>
        <wait_entry_commited_timeout_sec>1800</wait_entry_commited_timeout_sec>
        <collection_name>postgres1</collection_name>
        <check_consistency>false</check_consistency>
        <max_retries_before_automatic_recovery>5</max_retries_before_automatic_recovery>
        <default_replica_path>/clickhouse/databases/{uuid}</default_replica_path>
        <default_replica_shard_name>{shard}</default_replica_shard_name>
        <default_replica_name>{replica}</default_replica_name>
    </database_replicated>
</clickhouse>
```
