---
sidebar_label: '分布式'
sidebar_position: 10
title: '分布式表引擎'
description: '具有分布式引擎的表不存储自己的任何数据，而是在多个服务器上允许分布式查询处理。读取操作自动并行化。在读取期间，将使用远程服务器上的表索引（如果有的话）。'
slug: /engines/table-engines/special/distributed
---


# 分布式表引擎

:::warning
要在云中创建分布式表引擎，您可以使用 [remote 和 remoteSecure](../../../sql-reference/table-functions/remote) 表函数。`Distributed(...)` 语法不能用于 ClickHouse Cloud。
:::

具有分布式引擎的表不存储自己的任何数据，而是在多个服务器上允许分布式查询处理。读取操作自动并行化。在读取期间，将使用远程服务器上的表索引（如果有的话）。

## 创建表 {#distributed-creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]])
[SETTINGS name=value, ...]
```

### 从表 {#distributed-from-a-table}

当分布式表指向当前服务器上的一个表时，您可以采用该表的模式：

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster] AS [db2.]name2 ENGINE = Distributed(cluster, database, table[, sharding_key[, policy_name]]) [SETTINGS name=value, ...]
```

### 分布式参数 {#distributed-parameters}

#### cluster {#cluster}

`cluster` - 服务器配置文件中的集群名称

#### database {#database}

`database` - 远程数据库的名称

#### table {#table}

`table` - 远程表的名称

#### sharding_key {#sharding_key}

`sharding_key` - （可选）分片键

指定 `sharding_key` 对于以下情况是必要的：

- 对于插入到分布式表中的 `INSERT`（因为表引擎需要 `sharding_key` 来确定如何拆分数据）。但是，如果启用了 `insert_distributed_one_random_shard` 设置，则 `INSERT` 不需要分片键。
- 用于 `optimize_skip_unused_shards`，因为 `sharding_key` 是确定应查询哪些分片所必需的。

#### policy_name {#policy_name}

`policy_name` - （可选）策略名称，将用于存储后台发送的临时文件。

**另见**

 - [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
 - [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) 示例

### 分布式设置 {#distributed-settings}

#### fsync_after_insert {#fsync_after_insert}

`fsync_after_insert` - 在向分布式表进行后台插入后对文件数据执行 `fsync`。确保操作系统将全部插入的数据刷新到**发起节点**磁盘上的文件中。

#### fsync_directories {#fsync_directories}

`fsync_directories` - 对目录执行 `fsync`。确保操作系统在涉及分布式表的后台插入操作后刷新目录元数据（插入后、将数据发送到分片后等）。

#### skip_unavailable_shards {#skip_unavailable_shards}

`skip_unavailable_shards` - 如果为真，则 ClickHouse 会静默跳过不可用的分片。当以下情况发生时，分片被标记为不可用：1）由于连接失败而无法访问分片。2）通过 DNS 无法解析分片。3）分片上不存在该表。默认值为假。

#### bytes_to_throw_insert {#bytes_to_throw_insert}

`bytes_to_throw_insert` - 如果待处理的后台 INSERT 的压缩字节数超过此值，将抛出异常。0 - 不抛出。默认值为 0。

#### bytes_to_delay_insert {#bytes_to_delay_insert}

`bytes_to_delay_insert` - 如果待处理的后台 INSERT 的压缩字节数超过此值，查询将被延迟。0 - 不延迟。默认值为 0。

#### max_delay_to_insert {#max_delay_to_insert}

`max_delay_to_insert` - 将数据插入到分布式表中的最大延迟（以秒为单位），如果有大量待处理字节用于后台发送。默认值为 60。

#### background_insert_batch {#background_insert_batch}

`background_insert_batch` - 同 [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch)

#### background_insert_split_batch_on_failure {#background_insert_split_batch_on_failure}

`background_insert_split_batch_on_failure` - 同 [distributed_background_insert_split_batch_on_failure](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure)

#### background_insert_sleep_time_ms {#background_insert_sleep_time_ms}

`background_insert_sleep_time_ms` - 同 [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms)

#### background_insert_max_sleep_time_ms {#background_insert_max_sleep_time_ms}

`background_insert_max_sleep_time_ms` - 同 [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms)

#### flush_on_detach {#flush_on_detach}

`flush_on_detach` - 在 DETACH/DROP/服务器关闭时将数据刷新到远程节点。默认值为 true。

:::note
**耐久性设置** (`fsync_...`)：

- 仅影响后台 INSERT（即 `distributed_foreground_insert=false`）时数据首先存储在发起节点磁盘上，随后以后台方式发送到分片。
- 可能显著降低插入性能
- 影响存储在分布式表文件夹中的数据写入到**接受您插入的节点**。如果您需要保证将数据写入底层的 MergeTree 表 - 请参见 `system.merge_tree_settings` 中的耐久性设置 (`...fsync...`)。

有关**插入限制设置** (`..._insert`) 的信息，还请参见：

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
- [prefer_localhost_replica](/operations/settings/settings#prefer_localhost_replica) 设置
- `bytes_to_throw_insert` 在 `bytes_to_delay_insert` 之前处理，因此您不应将其设置为小于 `bytes_to_delay_insert` 的值
:::

**示例**

``` sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

数据将从 `logs` 集群中的所有服务器读取，来自每个服务器的 `default.hits` 表。数据不仅被读取，还在远程服务器上部分处理（在可能的范围内）。例如，对于带有 `GROUP BY` 的查询，数据将在远程服务器上聚合，聚合函数的中间状态将发送到请求服务器。然后数据将进一步聚合。

您可以使用返回字符串的常量表达式来代替数据库名称。例如：`currentDatabase()`。

## 集群 {#distributed-clusters}

集群在 [服务器配置文件](../../../operations/configuration-files.md) 中进行配置：

``` xml
<remote_servers>
    <logs>
        <!-- 用于分布式查询的每个集群的各服务器之间的秘密
             默认：没有秘密（不执行身份验证）

             如果设置，则分布式查询将在分片上进行验证，因此至少：
             - 该分片上应存在该集群，
             - 该集群应具有相同的秘密。

             同样重要的是，initial_user 将被用作查询的当前用户。
        -->
        <!-- <secret></secret> -->
        
        <!-- 可选。是否允许此集群的分布式 DDL 查询（ON CLUSTER 子句）。默认：true（允许）。 -->
        <!-- <allow_distributed_ddl_queries>true</allow_distributed_ddl_queries> -->
        
        <shard>
            <!-- 可选。写入数据时的分片权重。默认：1。 -->
            <weight>1</weight>
            <!-- 可选。分片名称。必须非空且在集群中唯一。如果未指定，将为空。 -->
            <name>shard_01</name>
            <!-- 可选。是否仅向其中一个副本写入数据。默认：false（写入所有副本的数据）。 -->
            <internal_replication>false</internal_replication>
            <replica>
                <!-- 可选。用于负载均衡的副本优先级（另见负载均衡设置）。默认：1（更小的值具有更高优先级）。 -->
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

这里定义了一个名为 `logs` 的集群，它由两个分片组成，每个分片包含两个副本。分片指的是包含不同部分数据的服务器（为了读取所有数据，您必须访问所有分片）。副本是复制服务器（为了读取所有数据，您可以访问任何一个副本的数据）。

集群名称不得包含点。

为每个服务器指定 `host`、`port`，以及可选的 `user`、`password`、`secure`、`compression` 参数：

- `host` - 远程服务器的地址。您可以使用域名、IPv4 或 IPv6 地址。如果您指定域名，服务器在启动时会进行 DNS 请求，结果会在服务器运行期间存储。如果 DNS 请求失败，服务器不会启动。如果您更改 DNS 记录，请重启服务器。
- `port` - 用于消息活动的 TCP 端口（配置中的 `tcp_port`，通常设置为 9000）。不要与 `http_port` 混淆。
- `user` - 连接到远程服务器的用户名称。默认值是 `default` 用户。此用户必须有权连接到指定服务器。访问权限在 `users.xml` 文件中配置。有关更多信息，请参见 [访问权限](../../../guides/sre/user-management/index.md) 部分。
- `password` - 连接到远程服务器的密码（未掩码）。默认值：空字符串。
- `secure` - 是否使用安全的 SSL/TLS 连接。通常还需要指定端口（默认安全端口为 `9440`）。服务器应该监听 `<tcp_port_secure>9440</tcp_port_secure>` 并配置正确的证书。
- `compression` - 使用数据压缩。默认值为 `true`。

在指定副本时，将为每个分片选择其中一个可用的副本进行读取。您可以配置负载均衡的算法（选择访问哪个副本的优先级） - 请参见 [load_balancing](../../../operations/settings/settings.md#load_balancing) 设置。如果与服务器的连接未建立，则会尝试以短时间的超时连接。如果连接失败，将选择下一个副本，依此类推。如果所有副本的连接尝试均失败，将以相同的方式多次重复尝试。这有利于提高弹性，但无法提供完整的故障容错：远程服务器可能接受了连接，但可能无法工作，或工作不良。

您可以只指定一个分片（在这种情况下，查询处理应称为远程查询，而不是分布式查询）或任意数量的分片。在每个分片中，您可以指定从一个到任意数量的副本。您可以为每个分片指定不同数量的副本。

您可以在配置中指定任意数量的集群。

要查看您的集群，请使用 `system.clusters` 表。

`Distributed` 引擎允许将集群视为本地服务器进行操作。然而，集群的配置不能动态指定，必须在服务器配置文件中配置。通常，集群中的所有服务器将具有相同的集群配置（尽管这不是必需的）。来自配置文件的集群在运行时更新，无需重启服务器。

如果您需要每次都向一组未知的分片和副本发送查询，您不需要创建 `Distributed` 表 - 请使用 `remote` 表函数。请参见 [表函数](../../../sql-reference/table-functions/index.md) 部分。

## 写入数据 {#distributed-writing-data}

有两种方法可以将数据写入集群：

首先，您可以定义将哪些数据写入哪些服务器，并直接在每个分片上执行写入。换句话说，在 `Distributed` 表指向的集群中的远程表上执行直接 `INSERT` 语句。这是最灵活的解决方案，因为您可以使用任何分片方案，甚至是由于主题领域的要求而非平凡的方案。这也是最优的解决方案，因为数据可以完全独立地写入不同的分片。

其次，您可以在 `Distributed` 表上执行 `INSERT` 语句。在这种情况下，该表将在服务器之间自行分配插入的数据。为了写入 `Distributed` 表，必须配置 `sharding_key` 参数（除非只有一个分片）。

每个分片都可以在配置文件中定义一个 `<weight>`。默认情况下，权重为 `1`。数据根据分片权重按比例分配到分片。所有分片的权重相加，然后每个分片的权重除以总和以确定每个分片的比例。例如，如果有两个分片，第一个的权重为 1，而第二个的权重为 2，则第一个将接收三分之一（1/3）的插入行，第二个将接收三分之二（2/3）。

每个分片都可以在配置文件中定义 `internal_replication` 参数。如果此参数设置为 `true`，写入操作将选择第一个健康的副本并将数据写入该副本。如果 `Distributed` 表下的表是复制表（例如，任何 `Replicated*MergeTree` 表引擎），则其中一个表副本将接收写入，并自动复制到其他副本。

如果 `internal_replication` 设置为 `false`（默认），则数据将写入所有副本。在这种情况下，`Distributed` 表会自行复制数据。这比使用复制表要糟糕，因为不会检查副本的一致性，随着时间的推移，它们将包含略微不同的数据。

要选择要发送数据行的分片，将分析分片表达式，并取其除以分片总权重后的余数。数据行被发送到与余数范围从 `prev_weights` 到 `prev_weights + weight` 对应的分片，其中 `prev_weights` 是权重最小的分片的总权重，而 `weight` 是此分片的权重。例如，如果有两个分片，且第一个具有权重 9，而第二个具有权重 10，则余数在范围 \[0, 9)中的行将发送到第一个分片，而在范围 \[9, 19)中的行将发送到第二个分片。

分片表达式可以是返回整数的常量和表列的任何表达式。例如，您可以使用表达式 `rand()` 来实现数据的随机分布，或者使用 `UserID` 来通过用户 ID 除以的余数进行分布（这样单个用户的数据将位于单个分片上，这简化了按用户运行 `IN` 和 `JOIN`）。如果某一列的分布不够均匀，您可以将其包装在哈希函数中，例如 `intHash64(UserID)`。

简单的除法余数对于分片是一个有限的解决方案，并不总是合适。它适用于中等和大量的数据（数十台服务器），但不适用于非常大规模的数据（数百台服务器或更多）。在后者的情况下，请使用主题领域所要求的分片方案，而不是在 `Distributed` 表中使用条目。

您应该关注分片方案的情况包括：

- 使用需要根据特定键连接数据的查询（`IN` 或 `JOIN`）。如果数据根据这个键进行了分片，则可以使用本地的 `IN` 或 `JOIN`，而不是 `GLOBAL IN` 或 `GLOBAL JOIN`，这将有效得多。
- 使用大量服务器（数百台或更多）并且有大量小查询，例如针对单个客户的数据查询（例如，网站、广告客户或合作伙伴）。为了使小查询不会影响整个集群，将单个客户的数据放在单个分片上是有意义的。或者，您可以设置双层分片：将整个集群划分为“层”，每层可能包括多个分片。单个客户的数据位于单个层中，但可以根据需要将分片添加到层中，并随机地在其中分布数据。为每个层创建 `Distributed` 表，并为全局查询创建单个共享的分布式表。

数据是以后台方式写入的。当插入到表中时，数据块将仅写入本地文件系统。数据将尽快以后台方式发送到远程服务器。发送数据的周期性由 [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) 和 [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 设置管理。`Distributed` 引擎将每个插入数据的文件单独发送，但您可以通过 [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 设置启用文件的批量发送。此设置通过更好地利用本地服务器和网络资源来改善集群性能。您应该通过检查表目录中的文件列表（待发送数据）来检查数据是否成功发送： `/var/lib/clickhouse/data/database/table/`。执行后台任务的线程数量可以通过 [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置来设置。

如果服务器在向 `Distributed` 表进行 `INSERT` 后消失或发生严重重启（例如，由于硬件故障），则插入的数据可能会丢失。如果在表目录中检测到损坏的数据部分，它将被转移到 `broken` 子目录，并不再使用。

## 读取数据 {#distributed-reading-data}

在查询 `Distributed` 表时，`SELECT` 查询会发送到所有分片，并且无论数据如何分布在分片之间（可以完全随机分布）都能正常工作。当您添加新的分片时，无需将旧数据转移到其中。相反，您可以通过使用更大的权重向其中写入新数据 - 数据将略微不均匀地分配，但查询将正常且高效地工作。

当启用 `max_parallel_replicas` 选项时，查询处理在单个分片内的所有副本之间并行处理。有关更多信息，请参见 [max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) 部分。

要了解有关分布式 `in` 和 `global in` 查询如何处理的更多信息，请参阅 [此]( /sql-reference/operators/in#distributed-subqueries) 文档。

## 虚拟列 {#virtual-columns}

#### _shard_num {#_shard_num}

`_shard_num` — 包含来自表 `system.clusters` 的 `shard_num` 值。类型：[UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
由于 [remote](../../../sql-reference/table-functions/remote.md) 和 [cluster](../../../sql-reference/table-functions/cluster.md) 表函数内部创建临时分布式表，因此 `_shard_num` 也可以在那里使用。
:::

**另见**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns) 描述
- [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置
- [shardNum()](../../../sql-reference/functions/other-functions.md#shardnum) 和 [shardCount()](../../../sql-reference/functions/other-functions.md#shardcount) 函数
