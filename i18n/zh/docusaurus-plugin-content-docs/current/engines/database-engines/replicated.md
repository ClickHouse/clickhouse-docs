---
description: '该引擎基于 Atomic 引擎。它通过将 DDL 日志写入 ZooKeeper 并在给定数据库的所有副本上执行，从而实现元数据复制。'
sidebar_label: 'Replicated'
sidebar_position: 30
slug: /engines/database-engines/replicated
title: 'Replicated'
doc_type: 'reference'
---



# Replicated

该引擎基于 [Atomic](../../engines/database-engines/atomic.md) 引擎实现。它通过将 DDL 日志写入 ZooKeeper，并在指定数据库的所有副本上执行，来实现元数据复制。

单个 ClickHouse 服务器可以同时运行并更新多个复制数据库，但同一个复制数据库在同一服务器上不能拥有多个副本。



## 创建数据库 {#creating-a-database}

```sql
CREATE DATABASE testdb [UUID '...'] ENGINE = Replicated('zoo_path', 'shard_name', 'replica_name') [SETTINGS ...]
```

**引擎参数**

- `zoo_path` — ZooKeeper 路径。相同的 ZooKeeper 路径对应同一个数据库。
- `shard_name` — 分片名称。数据库副本通过 `shard_name` 分组到各个分片中。
- `replica_name` — 副本名称。同一分片内所有副本的名称必须各不相同。

参数可以省略,此时缺失的参数将使用默认值替代。

如果 `zoo_path` 包含宏 `{uuid}`,则需要显式指定 UUID 或在创建语句中添加 [ON CLUSTER](../../sql-reference/distributed-ddl.md),以确保所有副本对该数据库使用相同的 UUID。

对于 [ReplicatedMergeTree](/engines/table-engines/mergetree-family/replication) 表,如果未提供参数,则使用默认参数:`/clickhouse/tables/{uuid}/{shard}` 和 `{replica}`。这些参数可以通过服务器设置 [default_replica_path](../../operations/server-configuration-parameters/settings.md#default_replica_path) 和 [default_replica_name](../../operations/server-configuration-parameters/settings.md#default_replica_name) 进行修改。宏 `{uuid}` 会展开为表的 uuid,`{shard}` 和 `{replica}` 会展开为服务器配置中的值,而非数据库引擎参数中的值。但在未来,将可以使用 Replicated 数据库的 `shard_name` 和 `replica_name`。


## 具体说明和建议 {#specifics-and-recommendations}

使用 `Replicated` 数据库的 DDL 查询的工作方式与 [ON CLUSTER](../../sql-reference/distributed-ddl.md) 查询类似,但存在一些细微差异。

首先,DDL 请求会尝试在发起节点(最初从用户接收请求的主机)上执行。如果请求执行失败,用户会立即收到错误信息,其他主机不会尝试执行该请求。如果请求在发起节点上成功完成,则所有其他主机将自动重试直到完成。发起节点将尝试等待查询在其他主机上完成(等待时间不超过 [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout)),并返回一个包含每个主机上查询执行状态的表。

错误情况下的行为由 [distributed_ddl_output_mode](../../operations/settings/settings.md#distributed_ddl_output_mode) 设置控制,对于 `Replicated` 数据库,建议将其设置为 `null_status_on_timeout` — 即如果某些主机在 [distributed_ddl_task_timeout](../../operations/settings/settings.md#distributed_ddl_task_timeout) 时间内未能执行请求,则不抛出异常,而是在表中为这些主机显示 `NULL` 状态。

[system.clusters](../../operations/system-tables/clusters.md) 系统表包含一个与复制数据库同名的集群,该集群由数据库的所有副本组成。此集群在创建/删除副本时会自动更新,并且可用于 [Distributed](/engines/table-engines/special/distributed) 表。

创建数据库的新副本时,该副本会自动创建表。如果副本长时间不可用并且落后于复制日志 — 它会将其本地元数据与 ZooKeeper 中的当前元数据进行比较,将带有数据的多余表移动到单独的非复制数据库中(以避免意外删除任何多余内容),创建缺失的表,如果表已被重命名则更新表名。数据在 `ReplicatedMergeTree` 级别进行复制,即如果表本身不是复制表,则数据不会被复制(数据库仅负责元数据)。

允许执行 [`ALTER TABLE FREEZE|ATTACH|FETCH|DROP|DROP DETACHED|DETACH PARTITION|PART`](../../sql-reference/statements/alter/partition.md) 查询,但不会被复制。数据库引擎只会在当前副本上添加/获取/删除分区/部分。但是,如果表本身使用 Replicated 表引擎,则在使用 `ATTACH` 后数据将被复制。

如果您只需要配置集群而不需要维护表复制,请参阅 [Cluster Discovery](../../operations/cluster-discovery.md) 功能。


## 使用示例 {#usage-example}

创建包含三个主机的集群:

```sql
node1 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','replica1');
node2 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','shard1','other_replica');
node3 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','{replica}');
```

使用隐式参数在集群上创建数据库:

```sql
CREATE DATABASE r ON CLUSTER default ENGINE=Replicated;
```

执行 DDL 查询:

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

查看系统表:

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

创建分布式表并插入数据:

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

在另一个主机上添加副本:

```sql
node4 :) CREATE DATABASE r ENGINE=Replicated('some/path/r','other_shard','r2');
```

如果在 `zoo_path` 中使用了宏 `{uuid}`,在另一个主机上添加副本:

```sql
node1 :) SELECT uuid FROM system.databases WHERE database='r';
node4 :) CREATE DATABASE r UUID '<uuid from previous query>' ENGINE=Replicated('some/path/{uuid}','other_shard','r2');
```

集群配置如下所示:


```text
┌─cluster─┬─shard_num─┬─replica_num─┬─host_name─┬─host_address─┬─port─┬─is_local─┐
│ r       │     1     │      1      │   node3   │  127.0.0.1   │ 9002 │     0    │
│ r       │     1     │      2      │   node4   │  127.0.0.1   │ 9003 │     0    │
│ r       │     2     │      1      │   node2   │  127.0.0.1   │ 9001 │     0    │
│ r       │     2     │      2      │   node1   │  127.0.0.1   │ 9000 │     1    │
└─────────┴───────────┴─────────────┴───────────┴──────────────┴──────┴──────────┘
```

分布式表也会从新主机获取数据：

```sql
node2 :) SELECT materialize(hostName()) AS host, groupArray(n) FROM r.d GROUP BY host;
```

```text
┌─hosts─┬─groupArray(n)─┐
│ node2 │  [1,3,5,7,9]  │
│ node4 │  [0,2,4,6,8]  │
└───────┴───────────────┘
```


## 设置 {#settings}

支持以下设置：

| 设置                                                                      | 默认值                        | 描述                                                                                                                                                                           |
| ---------------------------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `max_broken_tables_ratio`                                                    | 1                              | 如果失效表与所有表的比率超过此值,则不自动恢复副本                                                                           |
| `max_replication_lag_to_enqueue`                                             | 50                             | 如果副本的复制延迟超过此值,则在尝试执行查询时将抛出异常                                                                               |
| `wait_entry_commited_timeout_sec`                                            | 3600                           | 如果超时但发起主机尚未执行查询,副本将尝试取消该查询                                                                       |
| `collection_name`                                                            |                                | 在服务器配置中定义的集合名称,其中包含集群身份验证的所有信息                                                                |
| `check_consistency`                                                          | true                           | 检查本地元数据与 Keeper 中元数据的一致性,在不一致时执行副本恢复                                                                      |
| `max_retries_before_automatic_recovery`                                      | 10                             | 在将副本标记为丢失并从快照恢复之前执行队列条目的最大尝试次数(0 表示无限次)                                         |
| `allow_skipping_old_temporary_tables_ddls_of_refreshable_materialized_views` | false                          | 如果启用,在处理复制数据库中的 DDL 时,将在可能的情况下跳过创建和交换可刷新物化视图临时表的 DDL |
| `logs_to_keep`                                                               | 1000                           | 复制数据库在 ZooKeeper 中保留的默认日志数量。                                                                                                  |
| `default_replica_path`                                                       | `/clickhouse/databases/{uuid}` | 数据库在 ZooKeeper 中的路径。如果省略参数,则在创建数据库时使用此默认值。                                                                        |
| `default_replica_shard_name`                                                 | `{shard}`                      | 数据库中副本的分片名称。如果省略参数,则在创建数据库时使用此默认值。                                                                |
| `default_replica_name`                                                       | `{replica}`                    | 数据库中副本的名称。如果省略参数,则在创建数据库时使用此默认值。                                                                      |

默认值可以在配置文件中覆盖

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
