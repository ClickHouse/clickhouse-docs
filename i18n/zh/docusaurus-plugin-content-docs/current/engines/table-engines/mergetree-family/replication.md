---
'description': 'ClickHouse 中数据复制概述'
'sidebar_label': '数据复制'
'sidebar_position': 20
'slug': '/engines/table-engines/mergetree-family/replication'
'title': '数据复制'
---


# 数据复制

:::note
在 ClickHouse Cloud 中，复制由系统为您管理。请在创建表时不要添加参数。例如，您可以将以下文本中的:

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}',
    ver
)
```

替换为：

```sql
ENGINE = ReplicatedMergeTree
```
:::

复制仅支持 MergeTree 家族中的表：

- ReplicatedMergeTree
- ReplicatedSummingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- ReplicatedGraphiteMergeTree

复制在单个表级别上工作，而非整个服务器。一个服务器可以同时存储复制和非复制的表。

复制不依赖于分片。每个分片都有自己独立的复制。

`INSERT` 和 `ALTER` 查询的压缩数据会被复制（有关更多信息，请参见 [ALTER](/sql-reference/statements/alter) 文档）。

`CREATE`、`DROP`、`ATTACH`、`DETACH` 和 `RENAME` 查询仅在单台服务器上执行，并且不被复制：

- `CREATE TABLE` 查询在执行该查询的服务器上创建一个新的可复制表。如果该表在其他服务器上已经存在，则会添加一个新的副本。
- `DROP TABLE` 查询删除位于执行该查询的服务器上的副本。
- `RENAME` 查询在某个副本上重命名该表。换句话说，复制表在不同副本上可以有不同的名称。

ClickHouse 使用 [ClickHouse Keeper](/guides/sre/keeper/index.md) 存储副本元信息。可以使用 ZooKeeper 版本 3.4.5 或更新版本，但推荐使用 ClickHouse Keeper。

要使用复制，请在 [zookeeper](/operations/server-configuration-parameters/settings#zookeeper) 服务器配置部分设置参数。

:::note
不要忽视安全设置。ClickHouse 支持 ZooKeeper 安全子系统的 `digest` [ACL 方案](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)。
:::

设置 ClickHouse Keeper 集群地址的示例：

```xml
<zookeeper>
    <node>
        <host>example1</host>
        <port>2181</port>
    </node>
    <node>
        <host>example2</host>
        <port>2181</port>
    </node>
    <node>
        <host>example3</host>
        <port>2181</port>
    </node>
</zookeeper>
```

ClickHouse 还支持在辅助 ZooKeeper 集群中存储副本元信息。通过提供 ZooKeeper 集群名称和路径作为引擎参数来实现。
换句话说，它支持在不同的 ZooKeeper 集群中存储不同表的元数据。

设置辅助 ZooKeeper 集群地址的示例：

```xml
<auxiliary_zookeepers>
    <zookeeper2>
        <node>
            <host>example_2_1</host>
            <port>2181</port>
        </node>
        <node>
            <host>example_2_2</host>
            <port>2181</port>
        </node>
        <node>
            <host>example_2_3</host>
            <port>2181</port>
        </node>
    </zookeeper2>
    <zookeeper3>
        <node>
            <host>example_3_1</host>
            <port>2181</port>
        </node>
    </zookeeper3>
</auxiliary_zookeepers>
```

要将表元数据存储在辅助 ZooKeeper 集群中而非默认 ZooKeeper 集群，我们可以使用 SQL 创建具有
ReplicatedMergeTree 引擎的表，如下所示：

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```
您可以指定任何现有的 ZooKeeper 集群，系统将使用该目录来存储自己的数据（该目录在创建可复制表时指定）。

如果配置文件中没有设置 ZooKeeper，则无法创建复制表，任何现有的复制表将为只读。

在 `SELECT` 查询中不会使用 ZooKeeper，因为复制不会影响 `SELECT` 的性能，并且查询的运行速度与非复制表一样快。当查询分布式复制表时，ClickHouse 的行为通过设置 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) 和 [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) 进行控制。

对于每个 `INSERT` 查询，大约会通过几次事务向 ZooKeeper 添加十个条目。（更确切地说，这是针对每个插入的数据块；一个 INSERT 查询包含一个数据块或每 `max_insert_block_size = 1048576` 行一个数据块。）这导致相比于非复制表，`INSERT` 的延迟略长。但是，如果您遵循每秒不超过一次 `INSERT` 的建议，便不会产生任何问题。用于协调一个 ZooKeeper 集群的整个 ClickHouse 集群的 `INSERTs` 每秒总数为几百。数据插入的吞吐量（每秒行数）与非复制数据一样高。

对于非常大的集群，您可以为不同的分片使用不同的 ZooKeeper 集群。然而，根据我们在大约 300 台服务器的生产集群中的经验，这似乎并不必要。

复制是异步的，多主的。`INSERT` 查询（以及 `ALTER`）可以发送到任何可用的服务器。数据是在执行查询的服务器上进行插入，然后复制到其他服务器。由于它是异步的，最近插入的数据会以某种延迟出现在其他副本上。如果部分副本不可用，数据将在它们变得可用时写入。如果有一个副本可用，延迟是传输压缩数据块所需的时间。执行复制表的后台任务的线程数量可以通过设置 [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 来设定。

`ReplicatedMergeTree` 引擎使用一个单独的线程池来执行复制提取。线程池的大小由设置 [background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 限制，可以通过服务器重启进行调整。

默认情况下，INSERT 查询只等待来自一个副本的写入确认。如果数据只成功写入一个副本，而该副本所在的服务器停止存在，则存储的数据将丢失。要启用从多个副本获取数据写入确认，请使用 `insert_quorum` 选项。

每个数据块都是原子性写入的。INSERT 查询被分为最多 `max_insert_block_size = 1048576` 行的块。换句话说，如果 `INSERT` 查询的行数少于 1048576 行，它将被原子性地处理。

数据块是去重的。对于多次写入相同数据块（相同大小的数据块包含相同顺序的相同行），该块只会写入一次。原因是在网络故障的情况下，客户端应用程序无法知道数据是否已写入数据库，因此 `INSERT` 查询可以简单地重复执行。数据发送到哪个副本是无关紧要的，`INSERT` 操作是幂等的。去重参数通过 [merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) 服务器设置进行控制。

在复制过程中，只有要插入的源数据通过网络传输。进一步的数据转换（合并）在所有副本上以相同方式协调并执行。这最小化了网络使用，这意味着在不同的数据中心之间进行复制时效果良好。（请注意，在不同数据中心中重复数据是复制的主要目标。）

您可以拥有任何数量的相同数据的副本。根据我们的经验，相对可靠且方便的解决方案是在生产环境中使用双重复制，每台服务器使用 RAID-5 或 RAID-6（在某些情况下使用 RAID-10）。

该系统监控副本上的数据同步，并能够在故障后恢复。故障转移是自动的（对于较小的数据差异）或半自动的（当数据差异过大，可能指示配置错误时）。

## 创建复制表 {#creating-replicated-tables}

:::note
在 ClickHouse Cloud 中，复制由系统为您管理。请在创建表时不要添加参数。例如，您将以下文本中的：
```sql
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', ver)
```
替换为：
```sql
ENGINE = ReplicatedMergeTree
```
:::

在表引擎名称前加上 `Replicated` 前缀。例如：`ReplicatedMergeTree`。

:::tip
在 ClickHouse Cloud 中添加 `Replicated` 是可选的，因为所有表都是复制的。
:::

### Replicated\*MergeTree 参数 {#replicatedmergetree-parameters}

#### zoo_path {#zoo_path}

`zoo_path` — ClickHouse Keeper 中表的路径。

#### replica_name {#replica_name}

`replica_name` — ClickHouse Keeper 中的副本名称。

#### other_parameters {#other_parameters}

`other_parameters` — 用于创建复制版本的引擎参数，例如，`ReplacingMergeTree` 中的版本。

示例：

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32,
    ver UInt16
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{layer}-{shard}/table_name', '{replica}', ver)
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate, intHash32(UserID))
SAMPLE BY intHash32(UserID);
```

<details markdown="1">

<summary>旧语法的示例</summary>

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
```

</details>

如例所示，这些参数可以包含大括号中的替换。替换的值取自配置文件的 [macros](/operations/server-configuration-parameters/settings.md/#macros) 部分。

示例：

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeper 中表的路径对于每个复制表应该是唯一的。不同分片上的表应该有不同的路径。
在此情况下，路径由以下部分组成：

`/clickhouse/tables/` 是公共前缀。我们建议使用这个前缀。

`{shard}` 会扩展为分片标识符。

`table_name` 是 ClickHouse Keeper 中表的节点名称。最好与表名相同。它是显式定义的，因为与表名不同，它在执行 RENAME 查询后不会更改。
*提示*：您也可以在 `table_name` 前添加数据库名称。例如：`db_name.table_name`

两个内置替换 `{database}` 和 `{table}` 可以使用，它们分别扩展为表名和数据库名（除非在 `macros` 部分定义了这些宏）。因此 ZooKeeper 路径可以指定为 `'/clickhouse/tables/{shard}/{database}/{table}'`。
在使用这些内置替换时，请小心表重命名。ClickHouse Keeper 中的路径无法更改，当表被重命名时，宏将扩展为不同的路径，表将引用 ClickHouse Keeper 中不存在的路径，并进入只读模式。

副本名称标识同一表的不同副本。您可以使用服务器名称来标识，如例中所示。名称仅需在每个分片内唯一。

您可以显式定义参数，而不是使用替换。这在测试和配置小集群时可能是方便的。然而，这种情况下您无法使用分布式 DDL 查询（ `ON CLUSTER`）。

在处理大型集群时，我们建议使用替换，因为它们减少了出错的可能性。

您可以在服务器配置文件中为 `Replicated` 表引擎指定默认参数。例如：

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

在这种情况下，创建表时可以省略参数：

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree
ORDER BY x;
```

这等同于：

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

在每个副本上运行 `CREATE TABLE` 查询。此查询创建一个新的复制表，或向现有表添加新的副本。

如果在其他副本上表已经包含一些数据后添加新的副本，查询运行后数据将从其他副本复制到新副本。换句话说，新副本与其他副本同步。

要删除一个副本，请运行 `DROP TABLE`。但是，只有运行该查询的服务器上的一个副本会被删除。

## 故障后的恢复 {#recovery-after-failures}

如果 ClickHouse Keeper 在服务器启动时不可用，复制表将切换到只读模式。系统会定期尝试连接 ClickHouse Keeper。

如果在 `INSERT` 期间 ClickHouse Keeper 不可用，或与 ClickHouse Keeper 交互时发生错误，则会抛出异常。

连接到 ClickHouse Keeper 后，系统检查本地文件系统中的数据集是否与预期数据集匹配（ClickHouse Keeper 存储此信息）。如果存在小的不一致，系统会通过与副本同步数据来解决它们。

如果系统检测到损坏的数据部分（文件大小不正确）或未识别的部分（写入文件系统但未记录在 ClickHouse Keeper 中的部分），它会将它们移动到 `detached` 子目录（不会被删除）。任何缺失的部分将从副本复制。

请注意，ClickHouse 不会执行任何破坏性操作，例如自动删除大量数据。

当服务器启动（或与 ClickHouse Keeper 建立新会话）时，它只检查所有文件的数量和大小。如果文件大小匹配，但字节在中间某处被更改，这不会立即被检测到，而仅在尝试读取 `SELECT` 查询的数据时才检测到。查询会抛出关于不匹配的校验和或压缩块大小的异常。在这种情况下，数据部分将被添加到验证队列，必要时将从副本中复制。

如果本地数据集与预期数据集之间的差异过大，则会触发安全机制。服务器将此记录在日志中并拒绝启动。发生这种情况的原因可能是配置错误，比如某个分片上的副本被意外配置为另一个分片上的副本。然而，该机制的阈值设置得相当低，这种情况可能发生在正常的故障恢复过程中。在这种情况下，数据会半自动恢复 - 通过“按下按钮”。

要开始恢复，在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data`，内容可以是任意的，或者运行命令恢复所有复制表：

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

然后重启服务器。启动时，服务器会删除这些标志并开始恢复。

## 完全数据丢失后的恢复 {#recovery-after-complete-data-loss}

如果某个服务器上的所有数据和元数据消失，请按照以下步骤进行恢复：

1.  在该服务器上安装 ClickHouse。如果使用替换，请在配置文件中正确定义替换，这些配置文件应包含分片标识符和副本。
2.  如果您有未复制的表需要手动复制到服务器上，请从副本复制其数据（目录 `/var/lib/clickhouse/data/db_name/table_name/` 中）。
3.  从副本复制位于 `/var/lib/clickhouse/metadata/` 中的表定义。如果在表定义中显式定义了分片或副本标识符，请进行更正，以使其与此副本对应。（或者，启动服务器并执行所有应在 `/var/lib/clickhouse/metadata/` 中的 .sql 文件中的 `ATTACH TABLE` 查询。）
4.  要开始恢复，在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data`，内容可以是任意的，或者运行命令恢复所有复制表：`sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

然后启动服务器（如果已经在运行，则重新启动）。数据将从副本下载。

另一种恢复选项是从 ClickHouse Keeper 删除关于丢失副本的信息（`/path_to_table/replica_name`），然后如 "[创建复制表](#creating-replicated-tables)" 中所述重新创建副本。

在恢复过程中没有网络带宽限制。如果您同时恢复多个副本，请记住这一点。

## 从 MergeTree 转换为 ReplicatedMergeTree {#converting-from-mergetree-to-replicatedmergetree}

我们使用术语 `MergeTree` 来指代所有 `MergeTree 家族` 中的表引擎，和 `ReplicatedMergeTree` 一样。

如果您有一个手动复制的 `MergeTree` 表，可以将其转换为复制表。如果您在 `MergeTree` 表中已经收集了大量数据，现在想要启用复制，您可能需要这样做。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句允许将分离的 `MergeTree` 表附加为 `ReplicatedMergeTree`。

如果表的数据目录中设置了 `convert_to_replicated` 标志，则 `MergeTree` 表可以在服务器重启时自动转换（`/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/` 中适用于 `Atomic` 数据库）。
创建空的 `convert_to_replicated` 文件，表将在下次服务器重启时以复制表的形式加载。

此查询可用于获取表的数据路径。如果表有多个数据路径，您必须使用第一个。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

请注意，ReplicatedMergeTree 表将使用 `default_replica_path` 和 `default_replica_name` 设置的值进行创建。
要在其他副本上创建转换表，您需要在 `ReplicatedMergeTree` 引擎的第一个参数中明确指定其路径。可以使用以下查询获取其路径。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

还有一种手动方法来实现此操作。

如果不同副本上的数据不同，首先同步数据，或者在除了一个副本之外的所有副本上删除该数据。

重命名现有的 MergeTree 表，然后创建一个具有旧名称的 `ReplicatedMergeTree` 表。
将旧表的数据移动到新表数据目录中的 `detached` 子目录（`/var/lib/clickhouse/data/db_name/table_name/`）。
然后在其中一个副本上运行 `ALTER TABLE ATTACH PARTITION` 以将这些数据部分添加到工作集中。

## 从 ReplicatedMergeTree 转换为 MergeTree {#converting-from-replicatedmergetree-to-mergetree}

使用 [ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句在单个服务器上附加分离的 `ReplicatedMergeTree` 表为 `MergeTree`。

另一种方法涉及服务器重启。创建一个不同名称的 MergeTree 表。将 `ReplicatedMergeTree` 表数据目录中的所有数据移动到新表的数据目录中。然后删除 `ReplicatedMergeTree` 表并重启服务器。

如果您想要在不启动服务器的情况下摆脱 `ReplicatedMergeTree` 表：

- 删除元数据目录（`/var/lib/clickhouse/metadata/`）中对应的 `.sql` 文件。
- 删除 ClickHouse Keeper 中对应的路径（`/path_to_table/replica_name`）。

完成后，您可以启动服务器，创建一个 `MergeTree` 表，将数据移至其目录，然后重启服务器。

## 当 ClickHouse Keeper 集群中的元数据丢失或损坏时的恢复 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

如果 ClickHouse Keeper 中的数据丢失或损坏，您可以按上述所述将数据转移到未复制的表中以保存数据。

**另请参见**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
