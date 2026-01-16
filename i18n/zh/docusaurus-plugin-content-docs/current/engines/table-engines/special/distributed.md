---
description: '使用 Distributed 引擎的表自身不存储任何数据，但允许在多台服务器上执行分布式查询处理。查询读取会自动并行化。在读取过程中，如果远程服务器上存在表索引，则会使用这些索引。'
sidebar_label: 'Distributed'
sidebar_position: 10
slug: /engines/table-engines/special/distributed
title: 'Distributed 表引擎'
doc_type: 'reference'
---

# 分布式表引擎 \\{#distributed-table-engine\\}

:::warning 在 Cloud 中使用 Distributed 引擎
要在 ClickHouse Cloud 中创建分布式表引擎，可以使用 [`remote` 和 `remoteSecure`](../../../sql-reference/table-functions/remote) 表函数。
在 ClickHouse Cloud 中不能使用 `Distributed(...)` 语法。
:::

使用 Distributed 引擎的表本身不存储任何数据，但允许在多个服务器上进行分布式查询处理。
读操作会自动并行执行。在读取时，如果远程服务器上存在表索引，则会使用这些索引。

## 创建表 \\{#distributed-creating-a-table\\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]])
[SETTINGS name=value, ...]
```

### 基于现有表 \\{#distributed-from-a-table\\}

当 `Distributed` 表指向当前服务器上的某个表时，你可以沿用该表的表结构：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster] AS [db2.]name2 ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]]) [SETTINGS name=value, ...]
```

### 分布式参数 \\{#distributed-parameters\\}

| Parameter                 | Description                                                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cluster`                 | 服务器配置文件中的集群名称                                                                                                                                                                                                                                                |
| `database`                | 远程数据库的名称                                                                                                                                                                                                                                                     |
| `table`                   | 远程表的名称                                                                                                                                                                                                                                                       |
| `sharding_key` (Optional) | 分片键。<br />在以下场景中必须指定 `sharding_key`：<ul><li>对分布式表执行 `INSERT` 时（因为表引擎需要 `sharding_key` 来确定如何拆分数据）。但是，如果启用了 `insert_distributed_one_random_shard` 设置，则 `INSERT` 不需要分片键。</li><li>与 `optimize_skip_unused_shards` 配合使用时，因为需要 `sharding_key` 来确定应查询哪些分片</li></ul> |
| `policy_name` (Optional)  | 策略名称，将用于存储后台发送的临时文件                                                                                                                                                                                                                                          |

**另请参阅**

* [distributed&#95;foreground&#95;insert](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
* [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) 使用示例

### 分布式设置 \\{#distributed-settings\\}

| Setting                                    | Description                                                                                                                                                 | Default value |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `fsync_after_insert`                       | 在对 Distributed 执行后台插入后，对文件数据执行 `fsync`。保证操作系统已将本次插入的全部数据刷新到**发起节点**磁盘上的文件中。                                                                                 | `false`       |
| `fsync_directories`                        | 对目录执行 `fsync`。保证操作系统在执行与 Distributed 表后台插入相关的操作之后（插入之后、将数据发送到分片之后等）刷新了目录元数据。                                                                                | `false`       |
| `skip_unavailable_shards`                  | 如果为 true，ClickHouse 会静默跳过不可用的分片。分片在以下情况下会被标记为不可用：1）由于连接失败无法访问该分片。2）无法通过 DNS 解析该分片。3）该分片上不存在目标表。                                                             | `false`       |
| `bytes_to_throw_insert`                    | 如果待后台 `INSERT` 处理的压缩字节数超过该值，将抛出异常。`0` 表示不抛出。                                                                                                                | `0`           |
| `bytes_to_delay_insert`                    | 如果待后台 `INSERT` 处理的压缩字节数超过该值，查询将被延迟。`0` 表示不延迟。                                                                                                               | `0`           |
| `max_delay_to_insert`                      | 当存在大量待后台发送的字节时，将数据插入 Distributed 表的最大延迟时间（秒）。                                                                                                               | `60`          |
| `background_insert_batch`                  | 等同于 [`distributed_background_insert_batch`](../../../operations/settings/settings.md#distributed_background_insert_batch)                                   | `0`           |
| `background_insert_split_batch_on_failure` | 等同于 [`distributed_background_insert_split_batch_on_failure`](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure) | `0`           |
| `background_insert_sleep_time_ms`          | 等同于 [`distributed_background_insert_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms)                   | `0`           |
| `background_insert_max_sleep_time_ms`      | 等同于 [`distributed_background_insert_max_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms)           | `0`           |
| `flush_on_detach`                          | 在执行 `DETACH` / `DROP` / 服务器关闭时，将数据刷新到远程节点。                                                                                                                  | `true`        |

:::note
**耐久性设置**（`fsync_...`）：

* 仅影响后台 `INSERT`（即 `distributed_foreground_insert=false`），当数据首先存储在发起节点磁盘上，随后在后台被发送到各分片时生效。
* 可能显著降低 `INSERT` 性能
* 影响将存储在 Distributed 表目录中的数据写入到**接收你插入请求的节点**。如果你需要对底层 MergeTree 表的写入提供保证，请参阅 `system.merge_tree_settings` 中的耐久性设置（`...fsync...`）

关于**插入限制设置**（`..._insert`）另见：

* [`distributed_foreground_insert`](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
* [`prefer_localhost_replica`](/operations/settings/settings#prefer_localhost_replica) 设置
* `bytes_to_throw_insert` 会在 `bytes_to_delay_insert` 之前处理，因此不应将其设置为小于 `bytes_to_delay_insert` 的值
  :::

**示例**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

数据将从 `logs` 集群中的所有服务器读取，来源是集群中每台服务器上的 `default.hits` 表。数据不仅会被读取，还会在远程服务器上进行部分处理（在可能的范围内）。例如，对于带有 `GROUP BY` 的查询，数据会先在远程服务器上聚合，然后将聚合函数的中间状态发送到发起查询的服务器，在该服务器上再进一步聚合。

在数据库名的位置上，你可以使用返回字符串的常量表达式。例如：`currentDatabase()`。

## 集群 \\{#distributed-clusters\\}

集群是在[服务器配置文件](../../../operations/configuration-files.md)中配置的：

```xml
<remote_servers>
    <logs>
        <!-- Inter-server per-cluster secret for Distributed queries
             default: no secret (no authentication will be performed)

             If set, then Distributed queries will be validated on shards, so at least:
             - such cluster should exist on the shard,
             - such cluster should have the same secret.

             And also (and which is more important), the initial_user will
             be used as current user for the query.
        -->
        <!-- <secret></secret> -->
        
        <!-- Optional. Whether distributed DDL queries (ON CLUSTER clause) are allowed for this cluster. Default: true (allowed). -->        
        <!-- <allow_distributed_ddl_queries>true</allow_distributed_ddl_queries> -->
        
        <shard>
            <!-- Optional. Shard weight when writing data. Default: 1. -->
            <weight>1</weight>
            <!-- Optional. The shard name.  Must be non-empty and unique among shards in the cluster. If not specified, will be empty. -->
            <name>shard_01</name>
            <!-- Optional. Whether to write data to just one of the replicas. Default: false (write data to all replicas). -->
            <internal_replication>false</internal_replication>
            <replica>
                <!-- Optional. Priority of the replica for load balancing (see also load_balancing setting). Default: 1 (less value has more priority). -->
                <priority>1</priority>
                <host>example01-01-1</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>example01-01-2</host>
                <port>9000</port>
            </replica>
        </shard>
        <shard>
            <weight>2</weight>
            <name>shard_02</name>
            <internal_replication>false</internal_replication>
            <replica>
                <host>example01-02-1</host>
                <port>9000</port>
            </replica>
            <replica>
                <host>example01-02-2</host>
                <secure>1</secure>
                <port>9440</port>
            </replica>
        </shard>
    </logs>
</remote_servers>
```

这里定义了一个名为 `logs` 的集群，它由两个分片组成，其中每个分片包含两个副本。分片指的是包含不同数据部分的服务器（要读取全部数据，必须访问所有分片）。副本是用于数据冗余的复制服务器（要读取全部数据，可以访问任意一个副本上的数据）。

集群名称中不能包含句点（.）字符。

参数 `host`、`port`，以及可选的 `user`、`password`、`secure`、`compression`、`bind_host` 需要为每台服务器单独指定：

| Parameter     | Description                                                                                                                                                                                                                                                                                                                              | Default Value |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `host`        | 远程服务器的地址。可以使用域名或 IPv4/IPv6 地址。如果指定域名，服务器在启动时会发起一次 DNS 请求，并在服务器运行期间缓存该结果。如果 DNS 请求失败，服务器将无法启动。如果更改了 DNS 记录，需要重启服务器。 | -            |
| `port`        | 用于客户端通信的 TCP 端口（配置中的 `tcp_port`，通常设置为 9000）。不要与 `http_port` 混淆。                                                                                                                                                                                                                                              | -            |
| `user`        | 用于连接远程服务器的用户名。该用户必须拥有连接到指定服务器的权限。访问控制在 `users.xml` 文件中配置。更多信息，参见 [Access rights](../../../guides/sre/user-management/index.md) 部分。                                                                                                                | `default`    |
| `password`    | 用于连接远程服务器的密码（不会被掩码）。                                                                                                                                                                                                                                                                                                  | ''           |
| `secure`      | 是否使用安全的 SSL/TLS 连接。通常还需要显式指定端口（默认安全端口为 `9440`）。服务器应监听 `<tcp_port_secure>9440</tcp_port_secure>`，并正确配置证书。                                                                                                                                                | `false`      |
| `compression` | 是否使用数据压缩。                                                                                                                                                                                                                                                                                                                        | `true`       |
| `bind_host`   | 从当前节点连接到远程服务器时使用的源地址。仅支持 IPv4 地址。适用于需要为 ClickHouse 分布式查询设置源 IP 地址的高级部署场景。                                                                                                                                                                         | -            |

在指定副本时，读取时会为每个分片选择一个可用的副本。可以配置负载均衡算法（优先访问哪一个副本）——参见 [load_balancing](../../../operations/settings/settings.md#load_balancing) 设置。如果无法与服务器建立连接，将以较短的超时时间尝试建立连接。如果连接失败，将选择下一个副本，对所有副本依次尝试。如果对所有副本的连接尝试都失败，则会以相同方式重复多次尝试。这有助于提升系统的可靠性，但不能提供完全的容错能力：远程服务器可能会接受连接，但可能无法正常工作，或工作不佳。

可以只指定一个分片（在这种情况下，该查询处理应称为 remote，而不是 distributed），也可以指定任意数量的分片。在每个分片内，可以指定从一个到任意数量的副本。对于每个分片，都可以指定不同数量的副本。

可以在配置中指定任意数量的集群。

要查看集群，请使用 `system.clusters` 表。

`Distributed` 引擎允许像操作本地服务器一样操作集群。但是，集群的配置不能动态指定，必须在服务器配置文件中进行配置。通常，集群中的所有服务器会使用相同的集群配置（但这不是强制要求）。来自配置文件的集群会在运行时被更新，无需重启服务器。

如果每次都需要向一组未知的分片和副本发送查询，则不需要创建 `Distributed` 表——改用 `remote` 表函数。参见 [Table functions](../../../sql-reference/table-functions/index.md) 部分。

## 写入数据 \\{#distributed-writing-data\\}

向集群写入数据有两种方法：

第一种方法是：可以自行定义每台服务器上写入哪些数据，并在每个分片上直接执行写入。换句话说，在 `Distributed` 表所指向的集群远程表上直接执行 `INSERT` 语句。这是最灵活的方案，因为可以使用任意分片方案，即便该方案由于业务领域需求而非常复杂。同时，这也是最优的方案，因为数据可以完全独立地写入不同的分片。

第二种方法是：在 `Distributed` 表上执行 `INSERT` 语句。在这种情况下，表会自行将插入的数据分发到各个服务器。要向 `Distributed` 表写入数据，必须为其配置 `sharding_key` 参数（除非只有一个分片）。

每个分片都可以在配置文件中定义一个 `<weight>`。默认权重为 `1`。数据会按照与分片权重成比例的方式分布到各个分片。会先对所有分片的权重求和，然后用每个分片的权重除以该总和，以确定该分片的占比。例如，如果有两个分片，第一个的权重为 1，第二个的权重为 2，则第一分片会接收三分之一 (1 / 3) 的插入行，第二分片会接收三分之二 (2 / 3)。

每个分片还可以在配置文件中定义 `internal_replication` 参数。如果该参数设置为 `true`，写入操作会选择第一个健康副本并将数据写入其中。如果 `Distributed` 表所依赖的底层表是复制表（例如任意 `Replicated*MergeTree` 表引擎），请使用此方式。表的某一个副本会接收写入，然后数据会自动复制到其他副本。

如果 `internal_replication` 设置为 `false`（默认值），数据会写入所有副本。在这种情况下，由 `Distributed` 表自身来复制数据。这比使用复制表要差，因为不会检查副本之间的一致性，随着时间推移，各副本中会包含略有不同的数据。

为了选择某一行数据要发送到哪个分片，系统会先计算分片表达式，然后将其对所有分片总权重取余。该行会被发送到与余数对应的从 `prev_weights` 到 `prev_weights + weight` 的半开区间内的分片，其中 `prev_weights` 是编号更小的分片的权重总和，`weight` 是当前分片的权重。例如，如果有两个分片，第一个分片的权重为 9，第二个分片的权重为 10，则余数在区间 \[0, 9) 的行会被发送到第一个分片，而余数在区间 \[9, 19) 的行会被发送到第二个分片。

分片表达式可以是任何由常量和表列构成且返回整数的表达式。例如，可以使用表达式 `rand()` 来随机分布数据，或者使用 `UserID` 按用户 ID 取余来分布数据（这样单个用户的数据会位于同一个分片上，便于基于用户执行 `IN` 和 `JOIN`）。如果某个列的分布不够均匀，可以将其包裹在哈希函数中，例如 `intHash64(UserID)`。

简单的取余分片方案是一种受限的解决方案，并不总是合适。它适用于中等和大规模数据量（数十台服务器），但不适用于超大规模数据量（数百台服务器或更多）。在后一种情况下，应根据业务领域需求设计分片方案，而不是依赖 `Distributed` 表中的记录。

在以下情况中，需要特别关注分片方案：

- 在执行需要按特定键进行数据关联（`IN` 或 `JOIN`）的查询时，如果数据按该键进行了分片，就可以使用本地的 `IN` 或 `JOIN` 来代替 `GLOBAL IN` 或 `GLOBAL JOIN`，这样效率要高得多。
- 在使用大量服务器（数百台或更多）并伴随大量小查询的场景下，例如针对单个客户（如网站、广告主或合作伙伴）数据的查询，为了避免这些小查询影响整个集群，将单个客户的数据放置在单个分片上是合理的选择。或者，可以设置两级分片：将整个集群划分为多个“层”，每一层可以由多个分片组成。单个客户的数据位于单个层中，但可以按需向该层添加分片，数据在该层内的分片之间随机分布。为每个层创建各自的 `Distributed` 表，同时为全局查询创建一个共享的分布式表。

数据在后台写入。当向表中执行插入操作时，数据块只是被写入本地文件系统。数据会在后台尽快发送到远程服务器。发送数据的周期由 [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) 和 [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 设置进行管理。`Distributed` 引擎会分别发送每个插入数据的文件，但可以通过 [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 设置启用批量发送文件。该设置能够通过更好地利用本地服务器和网络资源来提升集群性能。应当通过检查表目录中待发送数据文件列表来确认数据是否已成功发送：`/var/lib/clickhouse/data/database/table/`。执行后台任务的线程数量可以通过 [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置来指定。

如果服务器在对 `Distributed` 表执行 `INSERT` 之后宕机或发生了异常重启（例如由于硬件故障），插入的数据可能会丢失。如果在表目录中检测到损坏的数据部分，它会被移动到 `broken` 子目录中并不再使用。

## 读取数据 \\{#distributed-reading-data\\}

在查询 `Distributed` 表时，`SELECT` 查询会被发送到所有分片，并且无论数据如何分布在这些分片上（可以是完全随机分布），都可以正常工作。添加新分片时，无需将旧数据迁移到其中。相反，你可以通过为该分片指定更大的权重，将新数据写入其中——这样数据分布会略有不均，但查询仍能正确且高效地执行。

当启用 `max_parallel_replicas` 选项时，查询处理会在单个分片内的所有副本之间并行化。有关更多信息，请参阅 [max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) 一节。

要了解分布式 `in` 和 `global in` 查询的处理方式，请参阅[此处](/sql-reference/operators/in#distributed-subqueries)的文档。

## 虚拟列 \\{#virtual-columns\\}

#### _Shard_num \\{#_shard_num\\}

`_shard_num` — 包含表 `system.clusters` 中的 `shard_num` 值。类型：[UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
由于 [`remote`](../../../sql-reference/table-functions/remote.md) 和 [`cluster](../../../sql-reference/table-functions/cluster.md) 表函数在内部会创建临时的 Distributed 表，`_shard_num` 在这些临时表中同样可用。
:::

**另请参阅**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns) 说明
- [`background_distributed_schedule_pool_size`](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置
- [`shardNum()`](../../../sql-reference/functions/other-functions.md#shardNum) 和 [`shardCount()`](../../../sql-reference/functions/other-functions.md#shardCount) 函数
