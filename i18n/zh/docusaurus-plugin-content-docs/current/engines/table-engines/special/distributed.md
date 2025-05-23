---
'description': '使用分布式引擎的表不存储任何自己的数据，但允许在多个服务器上进行分布式查询处理。读取会自动并行化。在读取时，会使用远程服务器上的表索引（如果存在的话）。'
'sidebar_label': 'Distributed'
'sidebar_position': 10
'slug': '/engines/table-engines/special/distributed'
'title': '分布式表引擎'
---


# 分布式表引擎

:::warning
要在云中创建分布式表引擎，可以使用 [remote 和 remoteSecure](../../../sql-reference/table-functions/remote) 表函数。在 ClickHouse Cloud 中无法使用 `Distributed(...)` 语法。
:::

使用分布式引擎的表不存储自己的任何数据，而是允许在多个服务器上进行分布式查询处理。读取会自动并行化。在读取期间，如果远程服务器上有表索引，则会使用它们。

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

当 `Distributed` 表指向当前服务器上的表时，可以采用该表的模式：

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

指定 `sharding_key` 是必要的，具体包括以下情况：

- 用于向分布式表进行 `INSERT`（因为表引擎需要 `sharding_key` 来确定如何拆分数据）。然而，如果启用了 `insert_distributed_one_random_shard` 设置，则 `INSERT` 无需分片键。
- 用于与 `optimize_skip_unused_shards` 一起使用，因为 `sharding_key` 是确定应该查询哪些分片所必需的。

#### policy_name {#policy_name}

`policy_name` - （可选）策略名称，将用于存储后台发送的临时文件。

**另见**

 - [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
 - [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) 的示例

### 分布式设置 {#distributed-settings}

#### fsync_after_insert {#fsync_after_insert}

`fsync_after_insert` - 在向分布式进行后台插入后对文件数据执行 `fsync`。确保操作系统在 **发起节点** 磁盘上刷新整个插入的数据。

#### fsync_directories {#fsync_directories}

`fsync_directories` - 对目录执行 `fsync`。确保操作系统在与分布式表的后台插入相关的操作（例如插入、发送数据到分片等）之后刷新目录元数据。

#### skip_unavailable_shards {#skip_unavailable_shards}

`skip_unavailable_shards` - 如果为真，ClickHouse 会静默跳过不可用的分片。当以下情况发生时，分片标记为不可用：1）由于连接失败无法访问分片。2）通过 DNS 无法解析分片。3）分片上不存在表。默认值为 false。

#### bytes_to_throw_insert {#bytes_to_throw_insert}

`bytes_to_throw_insert` - 如果待处理的压缩字节数超过此数，则将引发异常。0 - 不引发。默认值为 0。

#### bytes_to_delay_insert {#bytes_to_delay_insert}

`bytes_to_delay_insert` - 如果待处理的压缩字节数超过此数，查询将被延迟。0 - 不延迟。默认值为 0。

#### max_delay_to_insert {#max_delay_to_insert}

`max_delay_to_insert` - 在后台发送有很多待处理字节的情况下，将数据插入分布式表的最大延迟，单位为秒。默认值为 60。

#### background_insert_batch {#background_insert_batch}

`background_insert_batch` - 同 [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch)

#### background_insert_split_batch_on_failure {#background_insert_split_batch_on_failure}

`background_insert_split_batch_on_failure` - 同 [distributed_background_insert_split_batch_on_failure](../../../operations/settings/settings.md#distributed_background_insert_split_batch_on_failure)

#### background_insert_sleep_time_ms {#background_insert_sleep_time_ms}

`background_insert_sleep_time_ms` - 同 [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms)

#### background_insert_max_sleep_time_ms {#background_insert_max_sleep_time_ms}

`background_insert_max_sleep_time_ms` - 同 [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms)

#### flush_on_detach {#flush_on_detach}

`flush_on_detach` - 在 DETACH/DROP/服务器关闭时刷新数据到远程节点。默认值为 true。

:::note
**耐久性设置** (`fsync_...`):

- 仅影响后台插入（即 `distributed_foreground_insert=false`），数据首先存储在发起节点磁盘上，然后在后台发送到分片。
- 可能显著降低插入性能。
- 影响写入存储在分布式表文件夹中的数据到 **接收您插入的节点**。如果需要对底层 MergeTree 表写入数据的保证 - 请参见 `system.merge_tree_settings` 中的耐久性设置 (`...fsync...`)。

有关 **插入限制设置** (`..._insert`)，请另见：

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
- [prefer_localhost_replica](/operations/settings/settings#prefer_localhost_replica) 设置
- `bytes_to_throw_insert` 在 `bytes_to_delay_insert` 之前处理，因此不应将其设置为小于 `bytes_to_delay_insert` 的值。
:::

**示例**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

数据将从 `logs` 集群中的所有服务器读取，来自每个服务器上位于 `default.hits` 表的数据。数据不仅会被读取，还会在远程服务器上部分处理（到一定程度）。例如，对于一个带有 `GROUP BY` 的查询，数据会在远程服务器上聚合，并将聚合函数的中间状态发送给请求者服务器。然后数据将进一步聚合。

可以使用返回字符串的常量表达式代替数据库名称。例如：`currentDatabase()`。

## 集群 {#distributed-clusters}

集群在 [服务器配置文件](../../../operations/configuration-files.md)中配置：

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

这里定义了一个名为 `logs` 的集群，该集群由两个分片组成，每个分片包含两个副本。分片指的是包含数据不同部分的服务器（为了读取所有数据，必须访问所有分片）。副本是复制服务器（为了读取所有数据，可以访问任何一个副本上的数据）。

集群名称不得包含点。

为每个服务器指定参数 `host`、`port`，可选的 `user`、`password`、`secure`、`compression`、`bind_host`：

- `host` - 远程服务器的地址。可以使用域名或 IPv4 或 IPv6 地址。如果指定了域名，服务器启动时会进行 DNS 请求，结果会在服务器运行期间保留。如果 DNS 请求失败，服务器不会启动。如果更改 DNS 记录，请重新启动服务器。
- `port` - 用于通讯活动的 TCP 端口（配置中的 `tcp_port`，通常设置为 9000）。不要与 `http_port` 混淆。
- `user` - 连接到远程服务器的用户名称。默认值为 `default` 用户。该用户必须有权限连接到指定的服务器。权限在 `users.xml` 文件中配置。有关更多信息，请参见 [访问权限](../../../guides/sre/user-management/index.md) 部分。
- `password` - 连接到远程服务器的密码（未屏蔽）。默认值：空字符串。
- `secure` - 是否使用安全的 SSL/TLS 连接。通常还需要指定端口（默认安全端口是 `9440`）。服务器应在 `<tcp_port_secure>9440</tcp_port_secure>` 上侦听，并配置正确的证书。
- `compression` - 使用数据压缩。默认值：`true`。
- `bind_host` - 从此节点连接到远程服务器时使用的源地址。仅支持 IPv4 地址。适用于需要设置 ClickHouse 分布式查询所用源 IP 地址的高级部署用例。

在指定副本时，读取时将为每个分片选择一个可用的副本。您可以配置负载均衡算法（选择访问哪个副本的偏好） - 请参见 [load_balancing](../../../operations/settings/settings.md#load_balancing) 设置。如果与服务器的连接未建立，将尝试快速连接。如果连接失败，将选择下一个副本，依此类推。如果所有副本的连接请求均失败，则会以相同的方式重复尝试几次。这有利于提高弹性，但并不提供完全的容错能力：远程服务器可能接受连接，但可能无法正常工作或工作不良。

您可以仅指定一个分片（在这种情况下，查询处理应称为远程查询，而不是分布式查询），或者指定任意数量的分片。在每个分片中，您可以指定从一个到任意数量的副本。每个分片可以指定不同数量的副本。

您可以在配置中指定尽可能多的集群。

要查看集群，请使用 `system.clusters` 表。

`Distributed` 引擎允许像本地服务器一样与集群进行交互。然而，集群的配置不能动态指定，必须在服务器配置文件中配置。通常，集群中的所有服务器将具有相同的集群配置（尽管这不是必需的）。来自配置文件的集群在不重新启动服务器的情况下实时更新。

如果您需要每次发送查询到未知的分片和副本集合，则无需创建 `Distributed` 表 - 请使用 `remote` 表函数。请参见 [表函数](../../../sql-reference/table-functions/index.md) 部分。

## 写入数据 {#distributed-writing-data}

有两种方法可以将数据写入集群：

首先，您可以定义哪些服务器写入哪些数据，并直接在每个分片上执行写入。换句话说，在 `Distributed` 表指向的集群中的远程表上执行直接的 `INSERT` 语句。这是最灵活的解决方案，因为您可以使用任何分片方案，即使由于主题领域的要求而变得不平凡。这也是最优的解决方案，因为数据可以完全独立地写入不同的分片。

其次，您可以在 `Distributed` 表上执行 `INSERT` 语句。在这种情况下，表会将插入的数据分配到服务器上。为了写入 `Distributed` 表，它必须配置 `sharding_key` 参数（除非只有一个分片）。

每个分片可以在配置文件中定义 `<weight>`。默认情况下，权重为 `1`。数据根据分片权重按比例分配到分片。所有分片的权重相加，然后每个分片的权重除以总和以确定每个分片的比例。例如，如果有两个分片，第一个的权重为 1，而第二个的权重为 2，则第一个将接收三分之一（1 / 3）的插入行，第二个将接收三分之二（2 / 3）。

每个分片可以在配置文件中定义 `internal_replication` 参数。如果将此参数设置为 `true`，则写入操作将选择第一个健康的副本并向其写入数据。如果 `Distributed` 表底层的表是副本表（例如任何 `Replicated*MergeTree` 表引擎），则会接收写入，并自动复制到其他副本。

如果 `internal_replication` 设置为 `false`（默认值），则数据将写入所有副本。在这种情况下，`Distributed` 表将自己复制数据。这比使用副本表更糟糕，因为副本的一致性未被检查，随着时间的推移，它们将包含略微不同的数据。

要选择将数据行发送到的分片，分析分片表达式，并计算其余数，除以分片总权重。行会被发送到对应于 `prev_weights` 到 `prev_weights + weight` 的余数的半区间的分片，其中 `prev_weights` 是权重最小的分片的总权重，而 `weight` 是该分片的权重。例如，如果有两个分片，第一个的权重为 9，而第二个的权重为 10，则对于余数在范围 \[0, 9) 的行，将发送到第一个分片，对于余数在范围 \[9, 19) 的行，将发送到第二个分片。

分片表达式可以是任何返回整数的常量和表列的表达式。例如，您可以使用表达式 `rand()` 进行随机数据分配，或 `UserID` 进行按用户 ID 除法余数分配（这样单个用户的数据将位于单个分片上，从而简化按用户运行的 `IN` 和 `JOIN`）。如果某一列分布不够均匀，您可以将其包裹在哈希函数中，比如 `intHash64(UserID)`。

简单的除法余数是一个有限的分片解决方案，并不总是合适。它适用于中等和大卷数（数十个服务器），但不适用于非常大的卷数（数百个服务器或更多）。在后者的情况下，更应使用主题领域所需的分片方案，而不是使用在 `Distributed` 表中的记录。

在以下情况下，您应关注分片方案：

- 使用需要按特定键连接数据的查询（`IN` 或 `JOIN`）。如果数据按此键分片，则可以使用本地的 `IN` 或 `JOIN` 而不是全球的 `IN` 或 `GLOBAL JOIN`，效率将高得多。
- 使用大量服务器（数百台或更多），并伴随大量小查询，例如对单个客户的数据查询（例如网站、广告客户或合作伙伴）。为了使小查询不影响整个集群，将单个客户的数据放在单个分片上是有意义的。或者，您可以设置双层分片：将整个集群分为“层”，其中一层可能由多个分片组成。单个客户的数据位于单个层上，但可以根据需要向层中添加分片，并且数据在其中随机分布。每层创建 `Distributed` 表，并为全局查询创建一个共享的分布式表。

数据以后台方式写入。当插入到表中时，数据块只会写入本地文件系统。数据会尽快在后台发送到远程服务器。发送数据的周期性由 [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) 和 [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 设置管理。`Distributed` 引擎单独发送每个包含插入数据的文件，但您可以通过 [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 设置启用批量发送。此设置通过更好地利用本地服务器和网络资源来提高集群性能。您应检查数据是否成功发送，方法是在表目录中检查文件列表（等待发送的数据）：`/var/lib/clickhouse/data/database/table/`。后台任务的线程数可以由 [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置。

如果服务器不存在或在对 `Distributed` 表执行 `INSERT` 后因故障重启而导致损坏，则可能会丢失插入的数据。如果表目录中检测到损坏的数据部分，则会将其转移到 `broken` 子目录中，并不再使用。

## 读取数据 {#distributed-reading-data}

查询 `Distributed` 表时，`SELECT` 查询将发送到所有分片，并且无论数据在分片中的分布如何（它们可以完全随机分布）都能正常工作。当您添加新的分片时，您无需将旧数据转移到它中。相反，您可以通过使用更大的权重将新数据写入其中 - 数据将稍微不均匀分配，但查询将正确且高效地运行。

当启用 `max_parallel_replicas` 选项时，查询处理将在单个分片内的所有副本之间并行化处理。有关更多信息，请参见 [max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) 部分。

要了解有关分布式 `in` 和 `global in` 查询如何处理的更多信息，请参阅 [此处](/sql-reference/operators/in#distributed-subqueries) 文档。

## 虚拟列 {#virtual-columns}

#### _shard_num {#_shard_num}

`_shard_num` - 包含来自表 `system.clusters` 的 `shard_num` 值。类型：[UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
由于 [remote](../../../sql-reference/table-functions/remote.md) 和 [cluster](../../../sql-reference/table-functions/cluster.md) 表函数在内部创建临时的分布式表，因此 `_shard_num` 在那里也可以使用。
:::

**另见**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns) 说明
- [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置
- [shardNum()](../../../sql-reference/functions/other-functions.md#shardnum) 和 [shardCount()](../../../sql-reference/functions/other-functions.md#shardcount) 函数
