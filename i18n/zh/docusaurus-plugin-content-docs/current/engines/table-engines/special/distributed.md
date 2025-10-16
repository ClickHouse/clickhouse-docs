---
'description': '具有 Distributed 引擎的表不存储自身任何数据，但允许在多个服务器上进行分布式查询处理。读取会自动并行化。在读取过程中，如果远程服务器上有表索引，则会使用它们。'
'sidebar_label': 'Distributed'
'sidebar_position': 10
'slug': '/engines/table-engines/special/distributed'
'title': '分布式表引擎'
'doc_type': 'reference'
---


# 分布式表引擎

:::warning Cloud 中的分布式引擎
要在 ClickHouse Cloud 中创建分布式表引擎，您可以使用 [`remote` 和 `remoteSecure`](../../../sql-reference/table-functions/remote) 表函数。
`Distributed(...)` 语法不能在 ClickHouse Cloud 中使用。
:::

具有分布式引擎的表不存储自己的数据，而是允许在多个服务器上进行分布式查询处理。
读取操作会自动并行化。在读取时，如果存在，远程服务器上的表索引将被使用。

## 创建表 {#distributed-creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]])
[SETTINGS name=value, ...]
```

### 从表创建 {#distributed-from-a-table}

当 `Distributed` 表指向当前服务器上的表时，您可以采用该表的模式：

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster] AS [db2.]name2 ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]]) [SETTINGS name=value, ...]
```

### 分布式参数 {#distributed-parameters}

| 参数                     | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster`                | 服务器配置文件中的集群名称                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `database`               | 远程数据库的名称                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `table`                  | 远程表的名称                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `sharding_key` (可选)   | 分片键。 <br/> 指定 `sharding_key` 对于以下操作是必要的：<ul><li>对于分布式表的 `INSERT`（因为表引擎需要 `sharding_key` 来确定如何拆分数据）。但是，如果启用了 `insert_distributed_one_random_shard` 设置，则 `INSERT` 不需要分片键。</li><li>与 `optimize_skip_unused_shards` 一起使用，因为需要 `sharding_key` 来确定应该查询哪些分片</li></ul> |
| `policy_name` (可选)    | 策略名称，将用于存储后台发送的临时文件                                                                                                                                                                                                                                                                                                                                                                                                                          |

**另见**

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) 的示例
### 分布式设置 {#distributed-settings}

| 设置                                     | 描述                                                                                                                                                                                                                                                                                                   | 默认值      |
|------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `fsync_after_insert`                     | 在背景插入分布式表后对文件数据执行 `fsync`。确保操作系统将整个插入的数据刷新到 **发起节点** 的磁盘上。                                                                                                                                                | `false`     |
| `fsync_directories`                      | 对目录执行 `fsync`。确保操作系统在与分布式表的后台插入相关的操作之后刷新目录元数据（插入后、将数据发送到分片后等）。                                                                                                                      | `false`     |
| `skip_unavailable_shards`                | 如果为 true，ClickHouse 将悄无声息地跳过不可用的分片。当满足以下条件时，分片被标记为不可用：1) 由于连接失败无法访问分片；2) 通过 DNS 无法解析分片；3) 分片上不存在该表。                                                                | `false`     |
| `bytes_to_throw_insert`                  | 如果待插入的压缩字节数超过此值，将抛出异常。`0` - 不抛出。                                                                                                                                                                                                                 | `0`         |
| `bytes_to_delay_insert`                  | 如果待插入的压缩字节数超过此值，则查询将被延迟。`0` - 不延迟。                                                                                                                                                                                                                | `0`         |
| `max_delay_to_insert`                    | 向分布式表插入数据的最大延迟（秒），如果有大量待发送的字节。                                                                                                                                                                                                                               | `60`        |
| `background_insert_batch`                 | 与 [`distributed_background_insert_batch`](../../../operations/settings/settings.md#distributed_background_insert_batch) 相同                                                                                                                                                                               | `0`         |
| `background_insert_split_batch_on_failure`| 与 [`distributed_background_insert_split_batch_on_failure`](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure) 相同                                                                                                                                                          | `0`         |
| `background_insert_sleep_time_ms`         | 与 [`distributed_background_insert_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) 相同                                                                                                                                                                        | `0`         |
| `background_insert_max_sleep_time_ms`     | 与 [`distributed_background_insert_max_sleep_time_ms`](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 相同                                                                                                                                                                            | `0`         |
| `flush_on_detach`                        | 在 `DETACH`/`DROP`/服务器关闭时将数据刷新到远程节点。                                                                                                                                                                                                                                               | `true`      |

:::note
**持久性设置** (`fsync_...`):

- 仅影响后台 `INSERT`（即 `distributed_foreground_insert=false`），数据首先存储在发起节点的磁盘上，然后在后台发送到分片。
- 可能会显著降低 `INSERT` 性能
- 影响写入存储在分布式表文件夹中的数据到 **接收您插入的节点**。如果您需要确保写入数据到底层 MergeTree 表，则请参见 `system.merge_tree_settings` 中的持久性设置（`...fsync...`）

有关 **插入限制设置** (`..._insert`)，另见：

- [`distributed_foreground_insert`](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
- [`prefer_localhost_replica`](/operations/settings/settings#prefer_localhost_replica) 设置
- `bytes_to_throw_insert` 在 `bytes_to_delay_insert` 之前处理，因此您不应将其设置为小于 `bytes_to_delay_insert` 的值
:::

**示例**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

数据将从 `logs` 集群中的所有服务器读取，来自每个服务器上位于 `default.hits` 表中的数据。数据不仅被读取，而且在远程服务器上部分处理（在可能的范围内）。例如，对于包含 `GROUP BY` 的查询，数据将在远程服务器上聚合，聚合函数的中间状态将发送到请求服务器。然后，对数据进行进一步聚合。

您可以使用返回字符串的常量表达式来替代数据库名称。例如：`currentDatabase()`。

## 集群 {#distributed-clusters}

集群在 [服务器配置文件](../../../operations/configuration-files.md) 中配置：

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

在此处定义了一个名为 `logs` 的集群，该集群由两个分片组成，每个分片包含两个副本。分片指的是包含不同数据部分的服务器（为了读取所有数据，您必须访问所有分片）。副本是复制服务器（为了读取所有数据，您可以访问任何一个副本上的数据）。

集群名称不得包含点。

为每个服务器指定 `host`、`port`，以及可选的 `user`、`password`、`secure`、`compression`、`bind_host` 参数：

| 参数         | 描述                                                                                                                                                                                                                                                                                                                                          | 默认值      |
|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `host`       | 远程服务器的地址。您可以使用域名或 IPv4 或 IPv6 地址。如果指定域名，服务器在启动时会进行 DNS 请求，并将结果存储，直到服务器关闭。如果 DNS 请求失败，服务器将不会启动。如果您更改了 DNS 记录，请重启服务器。                                                                              | -           |
| `port`       | 用于消息传递活动的 TCP 端口（配置中的 `tcp_port`，通常设置为 9000）。请勿与 `http_port` 混淆。                                                                                                                                                                                                                                            | -           |
| `user`       | 连接到远程服务器的用户名称。此用户必须具有访问指定服务器的权限。在 `users.xml` 文件中配置访问。有关更多信息，请参见 [访问权限](../../../guides/sre/user-management/index.md) 部分。                                                                                             | `default`   |
| `password`   | 连接到远程服务器的密码（未加密）。                                                                                                                                                                                                                                                                                                          | ''          |
| `secure`     | 是否使用安全的 SSL/TLS 连接。通常还需要指定端口（默认安全端口是 `9440`）。服务器应该在 `<tcp_port_secure>9440</tcp_port_secure>` 上监听，并正确配置证书。                                                                                                                              | `false`     |
| `compression`| 使用数据压缩。                                                                                                                                                                                                                                                                                                                                  | `true`      |
| `bind_host`  | 从此节点连接到远程服务器时使用的源地址。仅支持 IPv4 地址。旨在用于需要设置 ClickHouse 分布式查询所用源 IP 地址的高级部署用例。                                                                                                                                                                            | -           |

在指定副本时，读取时会为每个分片选择一个可用副本。您可以配置负载均衡算法（访问哪个副本的偏好）– 请参见 [load_balancing](../../../operations/settings/settings.md#load_balancing) 设置。如果无法与服务器建立连接，将尝试进行短时间的连接。如果连接失败，将选择下一个副本，依此类推。如果所有副本的连接尝试都失败，将重复相同的尝试多次。这有利于恢复，但并不提供完整的故障容错性：远程服务器可能接受连接，但可能无法正常工作或工作不良。

您可以只指定一个分片（在这种情况下，查询处理应称为远程，而不是分布式）或任意数量的分片。在每个分片中，您可以指定从一个到任意数量的副本。您可以为每个分片指定不同数量的副本。

您可以在配置中指定任意数量的集群。

要查看您的集群，请使用 `system.clusters` 表。

`Distributed` 引擎允许像本地服务器一样与集群一起工作。然而，集群的配置不能动态指定，必须在服务器配置文件中配置。通常，集群中的所有服务器将具有相同的集群配置（尽管这不是必需的）。来自配置文件的集群可以在不停机的情况下动态更新。

如果您需要每次都将查询发送到未知的分片和副本集合，则无需创建一个 `Distributed` 表 - 请改用 `remote` 表函数。请参见 [表函数](../../../sql-reference/table-functions/index.md) 部分。

## 写入数据 {#distributed-writing-data}

有两种方法可以向集群写入数据：

首先，您可以定义哪些服务器写入哪些数据，并在每个分片上直接执行写入。换句话说，直接在指向的集群的远程表上执行 `INSERT` 语句。这是最灵活的解决方案，因为您可以使用任何分片方案，甚至可以使用由于主题领域的要求而非平凡的方案。这也是最优的解决方案，因为数据可以完全独立地写入不同的分片。

其次，您可以在 `Distributed` 表上执行 `INSERT` 语句。在这种情况下，表将自行在服务器之间分配插入的数据。为了写入 `Distributed` 表，必须配置 `sharding_key` 参数（除非只有一个分片）。

每个分片在配置文件中可以定义一个 `<weight>`。默认情况下，权重为 `1`。数据根据分片权重的比例在分片之间分配。所有分片的权重相加，然后每个分片的权重除以总权重以确定每个分片的比例。例如，如果有两个分片，第一个的权重为 1，而第二个的权重为 2，则第一个将发送三分之一（1 / 3）的插入行，而第二个将发送三分之二（2 / 3）。

每个分片可以在配置文件中定义 `internal_replication` 参数。如果该参数设置为 `true`，则写入操作选择第一个健康的副本并将数据写入其中。如果 `Distributed` 表底层的表是复制表（例如，任何 `Replicated*MergeTree` 表引擎），则将有一个表副本接收写入，并且将自动复制到其他副本。

如果 `internal_replication` 设置为 `false`（默认），数据会写入所有副本。在这种情况下，`Distributed` 表自行复制数据。这比使用复制表更糟糕，因为没有检查副本的一致性，并且随着时间的推移，它们将包含略有不同的数据。

要选择将行数据发送到哪个分片，分析分片表达式并取其余数，而其余数是通过将其除以所有分片的总权重得到的。该行被发送到对应于从 `prev_weights` 到 `prev_weights + weight` 的余数的半区间的分片，其中 `prev_weights` 是最小编号的分片的总权重，`weight` 是该分片的权重。例如，如果有两个分片，第一个的权重为 9，第二个的权重为 10，则该行将在余数范围 \[0, 9) 中发送到第一个分片，而在余数范围 \[9, 19) 中发送到第二个分片。

分片表达式可以是返回整数的常量和表列的任何表达式。例如，您可以使用表达式 `rand()` 来随机分配数据，或者使用 `UserID` 根据用户 ID 的余数进行分配（这样单个用户的数据将位于单个分片中，这简化了基于用户的 `IN` 和 `JOIN` 的运行）。如果某一列的分布不够均匀，您可以将其嵌入哈希函数，例如 `intHash64(UserID)`。

简单的余数除法是一种有限的分片解决方案，并不总是合适。它适用于中等和大容量的数据（数十台服务器），但不适用于非常大容量的数据（数百台服务器或更多）。在后者的情况下，请使用主题领域所需的分片方案，而不是在 `Distributed` 表中使用条目。

在以下情况下，您应关注分片方案：

- 使用需要通过特定键连接数据的查询（`IN` 或 `JOIN`）。如果数据根据该键分片，您可以使用本地 `IN` 或 `JOIN`，而不是 `GLOBAL IN` 或 `GLOBAL JOIN`，这会高效得多。
- 使用了大量服务器（数百台或更多）和大量小查询，例如单个客户（例如网站、广告客户或合作伙伴）的数据查询。为了使小查询不影响整个集群，将单个客户的数据放在单个分片上是有意义的。或者，您可以设置双层分片：将整个集群分为“层”，每层可以包含多个分片。单个客户的数据位于单个层上，但可以根据需要向层中添加分片，数据在其中随机分配。为每层创建 `Distributed` 表，并为全局查询创建一个共享的分布式表。

数据在后台写入。在表中插入时，数据块仅写入本地文件系统。数据会尽快在后台发送到远程服务器。发送数据的周期由 [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) 和 [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 设置来管理。`Distributed` 引擎单独发送每个插入数据的文件，但是您可以通过 [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 设置启用批量发送文件。此设置通过更好地利用本地服务器和网络资源来改善集群性能。您应该通过检查表目录中的文件列表（待发送的数据）来检查数据是否成功发送：`/var/lib/clickhouse/data/database/table/`。执行后台任务的线程数量可以通过 [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置进行设置。

如果服务器在向 `Distributed` 表执行 `INSERT` 后消失或发生了粗暴重启（例如，因硬件故障），则插入的数据可能会丢失。如果在表目录中检测到损坏的数据部分，它将被转移到 `broken` 子目录并不再使用。

## 读取数据 {#distributed-reading-data}

在查询 `Distributed` 表时，`SELECT` 查询会发送到所有分片，并且无论数据如何在分片中分配（它们可以完全随机分配），都可以工作。当您添加新分片时，不必将旧数据转移到其中。相反，您可以通过使用更大的权重向其中写入新数据——数据的分配会略显不均，但查询将有效且正确地工作。

当启用 `max_parallel_replicas` 选项时，查询处理在单个分片内并行化到所有副本。有关更多信息，请参见 [max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) 部分。

要了解有关分布式 `in` 和 `global in` 查询如何处理的更多信息，请参阅 [此处](/sql-reference/operators/in#distributed-subqueries) 的文档。

## 虚拟列 {#virtual-columns}

#### _Shard_num {#_shard_num}

`_shard_num` — 包含表 `system.clusters` 中的 `shard_num` 值。类型：[UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
由于 [`remote`](../../../sql-reference/table-functions/remote.md) 和 [`cluster`](../../../sql-reference/table-functions/cluster.md) 表函数内部创建临时的分布式表，因此 `_shard_num` 在那里也可以使用。
:::

**另见**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns) 描述
- [`background_distributed_schedule_pool_size`](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置
- [`shardNum()`](../../../sql-reference/functions/other-functions.md#shardnum) 和 [`shardCount()`](../../../sql-reference/functions/other-functions.md#shardcount) 函数
