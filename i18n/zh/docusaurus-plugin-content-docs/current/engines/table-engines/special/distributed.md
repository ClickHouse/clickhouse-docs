---
'description': '具有分布式引擎的表不存储任何数据，但允许在多个服务器上进行分布式查询处理。读取自动并行化。在读取过程中，如果存在远程服务器上的表索引，则会使用。'
'sidebar_label': '分布式'
'sidebar_position': 10
'slug': '/engines/table-engines/special/distributed'
'title': '分布式表引擎'
---




# 分布式表引擎

:::warning
要在云中创建分布式表引擎，您可以使用 [remote 和 remoteSecure](../../../sql-reference/table-functions/remote) 表函数。`Distributed(...)` 语法无法在 ClickHouse Cloud 中使用。
:::

具有分布式引擎的表不存储任何自己的数据，但允许在多个服务器上进行分布式查询处理。读取操作会自动并行化。在读取过程中，如果远程服务器上有表索引，则会使用它们。

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

当 `Distributed` 表指向当前服务器上的表时，您可以采用该表的架构：

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

为了以下情况，需要指定 `sharding_key`：

- 对分布式表进行 `INSERT` 操作时（因为表引擎需要 `sharding_key` 来决定如何拆分数据）。但是，如果启用 `insert_distributed_one_random_shard` 设置，则 `INSERT` 不需要分片键。
- 用于 `optimize_skip_unused_shards`，因为 `sharding_key` 是确定应该查询哪些分片的必要条件。

#### policy_name {#policy_name}

`policy_name` - （可选）策略名称，它将用于存储后台发送的临时文件。

**另请参见**

 - [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
 - [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-multiple-volumes) 的示例

### 分布式设置 {#distributed-settings}

#### fsync_after_insert {#fsync_after_insert}

`fsync_after_insert` - 在后台插入到 Distributed 后对文件数据执行 `fsync` 操作。确保操作系统将整个插入的数据刷新到 **发起节点** 的磁盘上的文件中。

#### fsync_directories {#fsync_directories}

`fsync_directories` - 对目录执行 `fsync` 操作。确保操作系统在与分布式表的后台插入相关的操作后刷新目录元数据（例如插入后、向分片发送数据后等）。

#### skip_unavailable_shards {#skip_unavailable_shards}

`skip_unavailable_shards` - 如果为真，ClickHouse 会静默跳过不可用的分片。当以下情况下，分片被标记为不可用：1) 无法连接到分片。2) 无法通过 DNS 解析分片。3) 分片上不存在表。默认值为 false。

#### bytes_to_throw_insert {#bytes_to_throw_insert}

`bytes_to_throw_insert` - 如果待处理的压缩字节数超过此数字，将抛出异常。0 - 不抛出异常。默认值为 0。

#### bytes_to_delay_insert {#bytes_to_delay_insert}

`bytes_to_delay_insert` - 如果待处理的压缩字节数超过此数字，将延迟查询。0 - 不延迟。默认值为 0。

#### max_delay_to_insert {#max_delay_to_insert}

`max_delay_to_insert` - 向分布式表插入数据的最大延迟，以秒为单位，如果有大量待处理的字节用于后台发送。默认值为 60。

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
**持久性设置** (`fsync_...`)：

- 仅影响后台的 INSERT 操作（即 `distributed_foreground_insert=false`），当数据首先存储在发起节点的磁盘上，然后再在后台发送到分片。
- 可能显著降低插入性能
- 影响将存储在 Distributed 表文件夹中的数据写入 **接受您插入的节点**。如果您需要保证将数据写入基础的 MergeTree 表，请查看 `system.merge_tree_settings` 中的持久性设置 (`...fsync...`)。

有关 **插入限制设置** (`..._insert`)，另请参见：

- [distributed_foreground_insert](../../../operations/settings/settings.md#distributed_foreground_insert) 设置
- [prefer_localhost_replica](/operations/settings/settings#prefer_localhost_replica) 设置
- `bytes_to_throw_insert` 在 `bytes_to_delay_insert` 之前处理，因此您不应将其设置为小于 `bytes_to_delay_insert` 的值。
:::

**示例**

```sql
CREATE TABLE hits_all AS hits
ENGINE = Distributed(logs, default, hits[, sharding_key[, policy_name]])
SETTINGS
    fsync_after_insert=0,
    fsync_directories=0;
```

数据将从 `logs` 集群中的所有服务器读取，来自每个服务器上位于 `default.hits` 表的数据。数据不仅被读取，还会在远程服务器上部分处理（在可能的范围内）。例如，对于带有 `GROUP BY` 的查询，数据将在远程服务器上聚合，聚合函数的中间状态将被发送到请求服务器。然后数据将进一步聚合。

您可以使用返回字符串的常量表达式代替数据库名称。例如：`currentDatabase()`。

## 集群 {#distributed-clusters}

集群在 [服务器配置文件](../../../operations/configuration-files.md) 中进行配置：

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

在这里，一个名为 `logs` 的集群被定义，它由两个分片组成，每个分片包含两个副本。分片指的是包含不同数据部分的服务器（为了读取所有数据，必须访问所有分片）。副本是复制服务器（为了读取所有数据，您可以在任何一个副本上访问数据）。

集群名称不得包含点。

为每个服务器指定参数 `host`、`port`，以及可选的 `user`、`password`、`secure`、`compression`、`bind_host`：

- `host` – 远程服务器的地址。您可以使用域名或 IPv4 或 IPv6 地址。如果指定域名，则服务器在启动时会发出 DNS 请求，并将结果存储在服务器运行期间。如果 DNS 请求失败，服务器不会启动。如果您更改 DNS 记录，需要重启服务器。
- `port` – 用于消息传递活动的 TCP 端口（配置中的 `tcp_port`，通常设置为 9000）。不要与 `http_port` 混淆。
- `user` – 连接到远程服务器的用户名称。默认值是 `default` 用户。此用户必须具有访问指定服务器的权限。访问权限在 `users.xml` 文件中进行配置。有关更多信息，请参阅 [访问权限](../../../guides/sre/user-management/index.md) 部分。
- `password` – 连接到远程服务器的密码（未加密）。默认值：空字符串。
- `secure` - 是否使用安全的 SSL/TLS 连接。通常也需要指定端口（默认安全端口为 `9440`）。服务器应在 `<tcp_port_secure>9440</tcp_port_secure>` 上监听，并配置正确的证书。
- `compression` - 使用数据压缩。默认值：`true`。
- `bind_host` - 连接到远程服务器时使用的源地址。仅支持 IPv4 地址。适用于需要设置 ClickHouse 分布式查询所用源 IP 地址的高级部署用例。

在指定副本时，在读取时将为每个分片选择一个可用的副本。您可以配置负载均衡算法（访问哪个副本的偏好） – 请参阅 [load_balancing](../../../operations/settings/settings.md#load_balancing) 设置。如果未建立与服务器的连接，将尝试以较短的超时连接。如果连接失败，将选择下一个副本，以此类推。如果所有副本的连接尝试均失败，将以相同的方式多次重试。这有利于弹性，但并不提供完全的容错：远程服务器可能接受连接，但可能会无响应或表现不佳。

您可以仅指定一个分片（在这种情况下，查询处理应称为远程，而不是分布式）或指定任意数量的分片。在每个分片中，您可以指定从一个到任意数量的副本。您可以为每个分片指定不同数量的副本。

您可以在配置中指定任意数量的集群。

要查看您的集群，请使用 `system.clusters` 表。

`Distributed` 引擎允许像本地服务器一样处理集群。但是，集群的配置不能动态指定，必须在服务器配置文件中配置。通常，集群中的所有服务器将具有相同的集群配置（尽管这不是必需的）。配置文件中的集群在运行时动态更新，无需重启服务器。

如果您需要每次向未知的分片和副本集发送查询，则无须创建 `Distributed` 表 – 请改用 `remote` 表函数。请参阅 [表函数](../../../sql-reference/table-functions/index.md) 部分。

## 向集群写入数据 {#distributed-writing-data}

有两种方法可以将数据写入集群：

首先，您可以定义将哪个数据写入哪些服务器，并直接在每个分片上执行写入。换句话说，在分布式表所指向的集群的远程表上执行直接的 `INSERT` 语句。这是最灵活的解决方案，因为您可以使用任何分片方案，甚至是由于主题领域的要求而非平凡的方案。这也是最优的解决方案，因为数据可以完全独立地写入不同的分片。

其次，您可以在 `Distributed` 表上执行 `INSERT` 语句。在这种情况下，表将自己将插入的数据分配到服务器上。要写入 `Distributed` 表，必须配置 `sharding_key` 参数（如果只有一个分片，则不必配置）。

每个分片可以在配置文件中定义一个 `<weight>`。默认情况下，权重为 `1`。数据根据分片权重的比例分布到各个分片中。所有分片的权重相加，然后将每个分片的权重除以总和，以确定每个分片的比例。例如，如果有两个分片，第一个的权重为 1，第二个的权重为 2，则第一个将发送三分之一（1 / 3）的插入行，第二个将发送三分之二（2 / 3）。

每个分片可以在配置文件中定义 `internal_replication` 参数。如果该参数设置为 `true`，写入操作将选择第一个健康副本并将数据写入其中。如果 `Distributed` 表背后的表是复制表（例如任何的 `Replicated*MergeTree` 表引擎），则将有一个表副本收到写入请求，并会自动复制到其他副本。

如果 `internal_replication` 设置为 `false`（默认），则数据写入所有副本。在这种情况下，`Distributed` 表会自行复制数据。这比使用复制表更糟糕，因为不检查副本的一致性，并且随着时间的推移，它们将包含略有不同的数据。

为了选择将数据行发送到哪个分片，分析分片表达式，并取其对所有分片总权重的余数。此行将被发送到与 `prev_weights` 到 `prev_weights + weight` 之间余数的半区间对应的分片，其中 `prev_weights` 是最小数量分片的总权重，`weight` 是该分片的权重。例如，如果有两个分片，其中第一个的权重为 9，第二个的权重为 10，则该行将发送到第一个分片以处理余数在范围 \[0, 9) 内的情况，而在余数在范围 \[9, 19) 内的情况则发送到第二个分片。

分片表达式可以是返回整数的常量和表列的任意表达式。例如，您可以使用 `rand()` 表达式实现随机数据分配，或使用 `UserID` 来按用户 ID 的余数分配（这样单个用户的数据将位于单个分片中，从而简化按用户运行的 `IN` 和 `JOIN` 查询）。如果某列的分配不够均匀，可以将其包装在哈希函数中，例如 `intHash64(UserID)`。

简单的分割余数对分片来说是一个有限的解决方案，并不总是合适。它对中大型数据量（数十台服务器）有效，但对超大型数据量（数百台服务器或更多）则不然。在后一种情况下，请使用主题领域要求的分片方案，而不是使用 `Distributed` 表中的条目。

在以下情况下，您应该关注分片方案：

- 使用需要根据特定键联接数据的查询（`IN` 或 `JOIN`）。如果数据按此键进行分片，则可以使用局部 `IN` 或 `JOIN`，而不是 `GLOBAL IN` 或 `GLOBAL JOIN`，这将更加高效。
- 使用大量服务器（数百台或更多），并且有大量小查询，例如针对单个客户的数据查询（例如，网站、广告商或合作伙伴）。为了让小查询不影响整个集群，最好将单个客户的数据定位在单个分片内。或者，您可以设置双层分片：将整个集群划分为“层”，其中一层可以包含多个分片。单个客户的数据位于一个层上，但可以根据需要向层中添加分片，数据在其中随机分布。为每层各创建 `Distributed` 表，并为全局查询创建单个共享的分布式表。

数据是在后台写入的。插入到表时，数据块只会写入本地文件系统。数据会尽快在后台发送到远程服务器。发送数据的周期由 [distributed_background_insert_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_sleep_time_ms) 和 [distributed_background_insert_max_sleep_time_ms](../../../operations/settings/settings.md#distributed_background_insert_max_sleep_time_ms) 设置管理。`Distributed` 引擎会单独发送每个包含插入数据的文件，但您可以通过 [distributed_background_insert_batch](../../../operations/settings/settings.md#distributed_background_insert_batch) 设置启用批量发送文件。此设置通过更好地利用本地服务器和网络资源提高了集群性能。您应通过检查表目录中等待发送的文件列表 `/var/lib/clickhouse/data/database/table/` 来确认数据是否成功发送。执行后台任务的线程数可以通过 [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置进行设置。

如果服务器在 `INSERT` 到 `Distributed` 表之后停止存在或发生明显重启（例如，由于硬件故障），则插入的数据可能会丢失。如果在表目录中检测到损坏的数据部分，则会将其转移到 `broken` 子目录中，并不再使用。

## 读取数据 {#distributed-reading-data}

在查询 `Distributed` 表时，`SELECT` 查询会被发送到所有分片，并且无论数据在分片中的分布如何（可以完全随机地分布）都能正常工作。当您添加新分片时，无需将旧数据转移到新分片中。相反，您可以通过使用更高的权重将新数据写入新分片—这样数据的分布会稍显不均，但查询将正常且高效地工作。

启用 `max_parallel_replicas` 选项时，查询处理在单个分片的所有副本中并行化。有关更多信息，请参见 [max_parallel_replicas](../../../operations/settings/settings.md#max_parallel_replicas) 部分。

要了解有关分布式 `in` 和 `global in` 查询的处理方式，请参考 [此]( /sql-reference/operators/in#distributed-subqueries) 文档。

## 虚拟列 {#virtual-columns}

#### _shard_num {#_shard_num}

`_shard_num` — 包含来自表 `system.clusters` 的 `shard_num` 值。类型：[UInt32](../../../sql-reference/data-types/int-uint.md)。

:::note
由于 [remote](../../../sql-reference/table-functions/remote.md) 和 [cluster](../../../sql-reference/table-functions/cluster.md) 表函数内部创建临时的 Distributed 表，因此 `_shard_num` 也可在那里使用。
:::

**另请参见**

- [虚拟列](../../../engines/table-engines/index.md#table_engines-virtual_columns) 描述
- [background_distributed_schedule_pool_size](/operations/server-configuration-parameters/settings#background_distributed_schedule_pool_size) 设置
- [shardNum()](../../../sql-reference/functions/other-functions.md#shardnum) 和 [shardCount()](../../../sql-reference/functions/other-functions.md#shardcount) 函数
