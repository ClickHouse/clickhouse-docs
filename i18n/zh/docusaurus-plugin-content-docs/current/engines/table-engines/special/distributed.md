
# 分布式表引擎

:::warning
要在云中创建分布式表引擎，您可以使用 [remote 和 remoteSecure](../../../sql-reference/table-functions/remote) 表函数。`Distributed(...)` 语法不能在 ClickHouse Cloud 中使用。
:::

带有分布式引擎的表不存储自己的任何数据，但允许在多个服务器上进行分布式查询处理。读取操作会自动并行化。在读取过程中，如果远程服务器上存在表索引，则会使用这些索引。

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

### 从表中 {#distributed-from-a-table}

当 `Distributed` 表指向当前服务器上的一个表时，您可以采用该表的模式：

```sql
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

指定 `sharding_key` 是必要的，下面这几种情况需要它：

- 对于对分布式表的 `INSERT`（因为表引擎需要 `sharding_key` 来确定如何拆分数据）。但是，如果启用了 `insert_distributed_one_random_shard` 设置，那么 `INSERT` 不需要分片键。
- 与 `optimize_skip_unused_shards` 一起使用，因为 `sharding_key` 是确定应查询哪些分片所必需的。

#### policy_name {#policy_name}

`policy_name` - （可选）策略名称，将用于存储后台发送的临时文件。

**另见**

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
- [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) 示例

### 分布式设置 {#distributed-settings}

#### fsync_after_insert {#fsync_after_insert}

`fsync_after_insert` - 在后台插入到 Distributed 后，对文件数据执行 `fsync`。保证操作系统将整个插入的数据刷新到 **发起节点** 的磁盘文件中。

#### fsync_directories {#fsync_directories}

`fsync_directories` - 对目录执行 `fsync`。保证在与分布式表相关的后台插入操作（如插入后、将数据发送到分片后等）后，操作系统刷新目录元数据。

#### skip_unavailable_shards {#skip_unavailable_shards}

`skip_unavailable_shards` - 如果为真，ClickHouse 将静默跳过不可用分片。当以下情况发生时，分片标记为不可用：1) 由于连接故障无法访问分片。2) 通过 DNS 无法解析分片。3) 分片上不存在表。默认值为 false。

#### bytes_to_throw_insert {#bytes_to_throw_insert}

`bytes_to_throw_insert` - 如果待处理的压缩字节超过此数，异常将被抛出。0 - 不抛出。默认值为 0。

#### bytes_to_delay_insert {#bytes_to_delay_insert}

`bytes_to_delay_insert` - 如果待处理的压缩字节超过此数，查询将被延迟。0 - 不延迟。默认值为 0。

#### max_delay_to_insert {#max_delay_to_insert}

`max_delay_to_insert` - 插入数据到分布式表的最大延迟（以秒为单位），如果待处理的字节很多。默认值为 60。

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
**耐用性设置**（`fsync_...`）：

- 仅在后台插入（即 `distributed_foreground_insert=false`）时生效，此时数据首先存储在发起节点的磁盘上，然后在后台发送到分片。
- 可能会显著降低插入的性能。
- 影响写入存储在分布式表文件夹中的数据到 **接受您插入的节点**。如果需要保证将数据写入底层的 MergeTree 表，请参阅 `system.merge_tree_settings` 中的耐用性设置（`...fsync...`）。

有关 **插入限制设置**（`..._insert`），另见：

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
- [prefer_localhost_replica](/operations/settings/settings#prefer_localhost_replica) 设置
- `bytes_to_throw_insert` 的处理发生在 `bytes_to_delay_insert` 之前，因此您不应将其设置为比 `bytes_to_delay_insert` 更小的值。
:::

**示例**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

数据将从 `logs` 集群中的所有服务器的 `default.hits` 表中读取。数据不仅被读取，还在远程服务器上部分处理（在可能的范围内）。例如，对于一个带有 `GROUP BY` 的查询，数据将在远程服务器上聚合，聚合函数的中间状态将发送到请求服务器。然后数据将进一步聚合。

您可以使用返回字符串的常量表达式来代替数据库名称。例如：`currentDatabase()`。

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

这里定义了一个名为 `logs` 的集群，由两个分片组成，每个分片包含两个副本。分片是指包含数据不同部分的服务器（为了读取所有数据，您必须访问所有分片）。副本是冗余服务器（为了读取所有数据，您可以访问任何一个副本）。

集群名称中不应包含点。

为每个服务器指定的参数包括 `host`、`port`，以及可选的 `user`、`password`、`secure`、`compression`、`bind_host`：

- `host` – 远程服务器的地址。您可以使用域名或 IPv4 或 IPv6 地址。如果指定了域名，服务器启动时会进行 DNS 请求，结果在服务器运行期间存储。如果 DNS 请求失败，服务器不会启动。如果您更改 DNS 记录，则需要重启服务器。
- `port` – 用于消息活动的 TCP 端口（配置中的 `tcp_port`，通常设置为 9000）。不要和 `http_port` 混淆。
- `user` – 用于连接到远程服务器的用户的名称。默认值是 `default` 用户。该用户必须有权连接到指定的服务器。权限在 `users.xml` 文件中配置。有关更多信息，请参阅 [访问权限](../../../guides/sre/user-management/index.md) 部分。
- `password` – 用于连接到远程服务器的密码（不被掩码）。默认值：空字符串。
- `secure` - 是否使用安全的 SSL/TLS 连接。通常也需要指定端口（默认安全端口为 `9440`）。服务器应该在 `<tcp_port_secure>9440</tcp_port_secure>` 上监听，并配置正确的证书。
- `compression` - 是否使用数据压缩。默认值：`true`。
- `bind_host` - 从此节点连接远程服务器时使用的源地址。仅支持 IPv4 地址。适用于需要设置 ClickHouse 分布式查询使用的源 IP 地址的高级部署用例。

在指定副本时，读取时将为每个分片选择可用副本中的一个。您可以配置负载均衡算法（偏好访问哪个副本） – 请参见 [load_balancing](../../../operations/settings/settings.md#load_balancing) 设置。如果与服务器的连接没有建立，将尝试以短时间的超时进行连接。如果连接失败，将选择下一个副本，依此类推，直至所有副本。如果所有副本的连接请求都失败，则将以同样的方式重新尝试连接几次。这有利于提升弹性，但不提供完全的容错性：远程服务器可能接受连接，但可能无法正常工作或工作不良。

您可以只指定其中一个分片（在这种情况下，查询处理应该称为远程，而不是分布式）或指定任意数量的分片。在每个分片中，您可以指定从一个到任意数量的副本。您可以为每个分片指定不同数量的副本。

您可以在配置中指定任意数量的集群。

要查看您的集群，请使用 `system.clusters` 表。

`Distributed` 引擎允许以像本地服务器一样的方式与集群协作。然而，集群的配置不能动态指定，必须在服务器配置文件中进行。通常，集群中的所有服务器将具有相同的集群配置（尽管这不是必需的）。配置文件中的集群是动态更新的，无需重启服务器。

如果您需要每次向一个未知的分片和副本集发送查询，则无需创建 `Distributed` 表 - 使用 `remote` 表函数即可。请参见 [表函数](../../../sql-reference/table-functions/index.md) 部分。

## 写入数据 {#distributed-writing-data}

有两种方法可以将数据写入集群：

首先，您可以定义要将哪些数据写入到哪些服务器，并直接在每个分片上执行写入。换句话说，直接对 `Distributed` 表指向的集群中的远程表执行 `INSERT` 语句。这是最灵活的解决方案，因为您可以使用任何分片方案，即便是由于主题领域的要求而非常复杂的方案。这也是最优的解决方案，因为数据可以完全独立地写入不同的分片。

其次，您可以对 `Distributed` 表执行 `INSERT` 语句。在这种情况下，表将自行将插入的数据分配到服务器上。要写入 `Distributed` 表，必须配置 `sharding_key` 参数（除非只有一个分片）。

每个分片可以在配置文件中定义一个 `<weight>`。默认情况下，权重为 `1`。数据按与分片权重成比例的数量在分片之间分配。所有分片权重相加，然后每个分片的权重被除以总和以确定每个分片的比例。例如，如果有两个分片，且第一个的权重为 1，第二个的权重为 2，则第一个会发送三分之一 (1 / 3) 的插入行，第二个会发送三分之二 (2 / 3)。

每个分片可以在配置文件中定义 `internal_replication` 参数。如果将该参数设置为 `true`，则写入操作会选择第一个健康的副本并向其写入数据。如果 `Distributed` 表基础上的表是复制表（例如，任何 `Replicated*MergeTree` 表引擎），则其中一个表副本将接收写入，并且该写入将自动复制到其他副本。

如果将 `internal_replication` 设置为 `false`（默认），数据将写入所有副本。在这种情况下，`Distributed` 表会自动复制数据。这比使用复制表要差，因为不会检查副本的一致性，随着时间的推移，它们将包含略有不同的数据。

要选择将数据行发送到哪个分片，会分析分片表达式，并取其与总权重的余数。该行将被送到与余数在 `prev_weights` 到 `prev_weights + weight` 半区间对应的分片，其中 `prev_weights` 是权重最小的分片的总权重，而 `weight` 是该分片的权重。例如，如果有两个分片，第一个的权重为 9，第二个的权重为 10，则该行将在余数范围 \[0, 9) 内发送到第一个分片，在余数范围 \[9, 19) 内发送到第二个分片。

分片表达式可以是返回整数的常量和表列的任意表达式。例如，您可以使用表达式 `rand()` 来随机分配数据，或者使用 `UserID` 来根据用户 ID 进行分配（这样，单个用户的数据将保留在同一分片中，从而简化按用户执行 `IN` 和 `JOIN` 操作）。如果某一列的分配不够均匀，您可以将其包装在哈希函数中，例如 `intHash64(UserID)`。

简单的余数除法是一种有限的分片解决方案，并不总是合适。它适用于中等和大量数据（数十台服务器），但不适用于非常大的数据量（数百台乃至更多服务器）。在后者的情况下，应根据主题领域的要求使用所需的分片方案，而不是依赖于 `Distributed` 表中的条目。

您应关注分片方案的情况包括：

- 使用需要按特定键连接数据的查询（`IN` 或 `JOIN`）。如果数据按该键分片，您可以使用本地的 `IN` 或 `JOIN` 而不是 `GLOBAL IN` 或 `GLOBAL JOIN`，这要高效得多。
- 使用大量服务器（数百台或更多）并且有许多小查询的情况，例如，针对单个客户的数据查询（例如，网站、广告商或合作伙伴）。为了使小查询不影响整个集群，将单个客户的数据放置在单个分片内是有意义的。或者，可以设置双层分片：将整个集群划分为“层”，其中一层可以由多个分片组成。单个客户的数据位于单个层中，但可以根据需要向层中添加分片，数据在其中随机分配。为每个层创建 `Distributed` 表，并为全局查询创建一个共享的分布式表。

数据是以后台模式写入的。当数据插入到表中时，数据块仅写入本地文件系统。数据会尽快在后台发送到远程服务器。发送数据的周期由 [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) 和 [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 设置管理。`Distributed` 引擎分别发送每个插入数据的文件，但您可以通过 [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 设置启用批量发送文件。该设置通过更好地利用本地服务器和网络资源来提高集群性能。您应该通过检查表目录中的文件列表（等待发送的数据）来确认数据是否成功发送：`/var/lib/clickhouse/data/database/table/`。执行后台任务的线程数可以通过 [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置进行配置。

如果服务器在向 `Distributed` 表进行 `INSERT` 之后停止存在或发生了粗重启（例如，由于硬件故障），则已插入的数据可能会丢失。如果在表目录中检测到损坏的数据部分，则该部分将转移到 `broken` 子目录中，并不再使用。

## 读取数据 {#distributed-reading-data}

查询 `Distributed` 表时，`SELECT` 查询会被发送到所有分片，并且无论数据如何在分片中分布（可能完全随机分布），都可以正常工作。当您添加新分片时，无需将旧数据转移到其中。您可以通过使用较重的权重将新数据写入它 - 数据将略微不均匀分配，但查询会正确且高效地工作。

当启用 `max_parallel_replicas` 选项时，查询处理会在单个分片中并行化到所有副本。有关更多信息，请参见 [max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) 部分。

要了解有关分布式 `in` 和 `global in` 查询的处理方式的信息，请参考 [此处](/sql-reference/operators/in#distributed-subqueries) 的文档。

## 虚拟列 {#virtual-columns}

#### _shard_num {#_shard_num}

`_shard_num` — 包含来自 `system.clusters` 表的 `shard_num` 值。类型：[UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
因为 [remote](../../../sql-reference/table-functions/remote.md) 和 [cluster](../../../sql-reference/table-functions/cluster.md) 表函数内部创建临时分布式表，因此 `_shard_num` 在那里也可用。
:::

**另见**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns) 描述
- [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置
- [shardNum()](../../../sql-reference/functions/other-functions.md#shardnum) 和 [shardCount()](../../../sql-reference/functions/other-functions.md#shardcount) 函数
