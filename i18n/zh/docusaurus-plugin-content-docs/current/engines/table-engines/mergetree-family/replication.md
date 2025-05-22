
# 数据复制

:::note
在 ClickHouse Cloud 中，复制由系统为您管理。请在创建表时不要添加任何参数。例如，在下面的文本中，您可以将：

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

复制仅支持 MergeTree 家族的表：

- ReplicatedMergeTree
- ReplicatedSummingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- ReplicatedGraphiteMergeTree

复制在单个表级别工作，而不是整个服务器。一个服务器可以同时存储复制表和非复制表。

复制并不依赖于分片。每个分片都有自己的独立复制。

对于 `INSERT` 和 `ALTER` 查询的压缩数据是被复制的（有关更多信息，请参阅 [ALTER](/sql-reference/statements/alter) 文档）。

`CREATE`、`DROP`、`ATTACH`、`DETACH` 和 `RENAME` 查询在单个服务器上执行且不被复制：

- `CREATE TABLE` 查询在运行查询的服务器上创建一个新的可复制表。如果该表已在其他服务器上存在，则会添加一个新副本。
- `DROP TABLE` 查询删除位于运行查询的服务器上的副本。
- `RENAME` 查询重命名其中一个副本上的表。换句话说，复制表可以在不同副本上具有不同的名称。

ClickHouse 使用 [ClickHouse Keeper](/guides/sre/keeper/index.md) 存储副本的元信息。可以使用 3.4.5 或更高版本的 ZooKeeper，但建议使用 ClickHouse Keeper。

要使用复制，请在 [zookeeper](/operations/server-configuration-parameters/settings#zookeeper) 服务器配置部分设置参数。

:::note
请不要忽视安全设置。ClickHouse 支持 ZooKeeper 安全子系统的 `digest` [ACL 方案](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)。
:::

设置 ClickHouse Keeper 集群的地址的示例：

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

ClickHouse 还支持在辅助 ZooKeeper 集群中存储副本的元信息。通过提供 ZooKeeper 集群名称和路径作为引擎参数来实现。
换句话说，它支持将不同表的元数据存储在不同的 ZooKeeper 集群中。

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

要将表元数据存储在辅助 ZooKeeper 集群中而不是默认的 ZooKeeper 集群中，我们可以使用 SQL 创建使用 ReplicatedMergeTree 引擎的表，如下所示：

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```
您可以指定任何现有的 ZooKeeper 集群，系统将使用该集群中的目录来存储自己的数据（该目录在创建可复制表时指定）。

如果配置文件中未设置 ZooKeeper，则无法创建复制表，任何现有的复制表将为只读。

在 `SELECT` 查询中不会使用 ZooKeeper，因为复制不会影响 `SELECT` 的性能，查询速度与非复制表一样快。当查询分布式复制表时，ClickHouse 的行为由设置 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) 和 [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) 控制。

对于每个 `INSERT` 查询，大约会通过多次事务向 ZooKeeper 添加十个条目。（准确来说，这是对于每个插入的数据块；一个 INSERT 查询包含一个数据块或者一个块中最多包含 `max_insert_block_size = 1048576` 行。）这导致与非复制表相比，`INSERT` 的延迟稍长。但是，如果遵循每秒不超过一个 `INSERT` 批量插入数据的建议，就不会造成任何问题。整个 ClickHouse 集群在协调一个 ZooKeeper 集群时，每秒会有几百个 `INSERT`。数据插入的吞吐量（每秒的行数）与非复制数据一样高。

对于非常大的集群，您可以为不同的分片使用不同的 ZooKeeper 集群。然而，根据我们的经验，这在大约 300 台服务器的生产集群中并没有被证明是必要的。

复制是异步和多主的。`INSERT` 查询（以及 `ALTER`）可以发送到任何可用的服务器。数据在运行查询的服务器上插入，然后复制到其他服务器。由于是异步的，最近插入的数据在其他副本上会有一定延迟。如果某些副本不可用，数据将在它们变得可用时写入。如果副本可用，延迟就是将压缩数据块通过网络传输所需的时间。执行复制表的后台任务的线程数量可以通过 [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 设置。

`ReplicatedMergeTree` 引擎为复制提取使用单独的线程池。该池的大小受限于 [background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 设置，该设置可以通过服务器重启进行调整。

默认情况下，INSERT 查询仅等待来自一个副本的写入数据确认。如果数据成功写入仅一个副本，而该副本的服务器停止存在，存储的数据将丢失。要启用获取来自多个副本的数据写入确认，请使用 `insert_quorum` 选项。

每个数据块都是原子写入的。INSERT 查询被划分为最多 `max_insert_block_size = 1048576` 行的数据块。换句话说，如果 INSERT 查询包含少于 1048576 行的数据，则是原子进行的。

数据块会去重。对于相同数据块的多次写入（大小相同且包含相同行、顺序相同的数据块），该块只会被写入一次。这样做的原因是在网络故障的情况下，客户端应用程序不知道数据是否已写入数据库，因此 `INSERT` 查询可以简单地重复执行。无论将相同数据发送到哪个副本进行 `INSERT`，结果都是幂等的。去重参数由 [merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) 服务器设置控制。

在复制过程中，仅源数据会通过网络传输。后续的数据转换（合并）会在所有副本之间协调并以相同方式执行。这最大限度地减少了网络使用，这意味着当副本位于不同数据中心时，复制工作得很好。（请注意，在不同数据中心复制数据是复制的主要目的。）

您可以拥有任意数量相同数据的副本。根据我们的经验，相对可靠和方便的解决方案是在生产中使用双重复制，每个服务器使用 RAID-5 或 RAID-6（在某些情况下使用 RAID-10）。

系统监控副本的数据同步性，并能够在故障后恢复。故障转移是自动的（在数据差异较小的情况下）或半自动的（当数据差异过大时，这可能表明配置错误）。

## 创建复制表 {#creating-replicated-tables}

:::note
在 ClickHouse Cloud 中，复制由系统为您管理。请在创建表时不要添加任何参数。例如，在下面的文本中，您可以将：
```sql
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', ver)
```
替换为：
```sql
ENGINE = ReplicatedMergeTree
```
:::

在表引擎名称前添加 `Replicated` 前缀。例如：`ReplicatedMergeTree`。

:::tip
在 ClickHouse Cloud 中，添加 `Replicated` 是可选的，因为所有表都是复制的。
:::

### Replicated\*MergeTree 参数 {#replicatedmergetree-parameters}

#### zoo_path {#zoo_path}

`zoo_path` — ClickHouse Keeper 中表的路径。

#### replica_name {#replica_name}

`replica_name` — ClickHouse Keeper 中的副本名称。

#### other_parameters {#other_parameters}

`other_parameters` — 用于创建复制版本的引擎参数，例如在 `ReplacingMergeTree` 中的版本。

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

<summary>过时语法的示例</summary>

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
```

</details>

如示例所示，这些参数可以包含大括号中的替换。替换的值取自配置文件的 [macros](/operations/server-configuration-parameters/settings.md/#macros) 部分。

示例：

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeper 中表的路径应在每个复制表中唯一。不同分片上的表应具有不同的路径。
在这种情况下，路径由以下部分组成：

`/clickhouse/tables/` 是通用前缀。我们建议使用这个。

`{shard}` 将展开为分片标识符。

`table_name` 是 ClickHouse Keeper 中表的节点名称。最好将其设置为与表名相同。它是明确定义的，因为与表名不同，表名在 RENAME 查询后不会更改。
*提示*: 您还可以在 `table_name` 前添加数据库名。例如：`db_name.table_name`

可以使用两个内置的替换 `{database}` 和 `{table}`，它们分别展开为表名和数据库名（除非在 `macros` 部分中定义了这些宏）。因此，zookeeper 路径可以指定为 `'/clickhouse/tables/{shard}/{database}/{table}'`。
在使用这些内置替换时，请小心表重命名。ClickHouse Keeper 中的路径无法更改，当表被重命名时，宏将展开为不同的路径，该表将引用 ClickHouse Keeper 中不存在的路径，并进入只读模式。

副本名称标识相同表的不同副本。您可以使用服务器名称来表示这一点，如示例所示。该名称仅需要在每个分片内唯一。

您可以显式定义参数，而不是使用替换。这在测试和配置小型集群时可能方便。然而，在这种情况下，您不能使用分布式 DDL 查询（`ON CLUSTER`）。

在处理大型集群时，我们建议使用替换，因为它减少了出错的概率。

您可以在服务器配置文件中指定 `Replicated` 表引擎的默认参数。例如：

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

它等价于：

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

在每个副本上运行 `CREATE TABLE` 查询。此查询创建一个新的复制表，或向现有表添加一个新副本。

如果在其他副本上已经有数据的情况下添加新副本，则运行查询后，数据将从其他副本复制到新副本。换句话说，新副本会与其他副本进行同步。

要删除副本，请运行 `DROP TABLE`。但是，仅删除运行查询的服务器上的一个副本。

## 故障后的恢复 {#recovery-after-failures}

如果服务器启动时 ClickHouse Keeper 不可用，则复制表切换到只读模式。系统会定期尝试连接到 ClickHouse Keeper。

如果在 `INSERT` 期间 ClickHouse Keeper 不可用，或在与 ClickHouse Keeper 交互时发生错误，则会抛出异常。

连接到 ClickHouse Keeper 后，系统检查本地文件系统中的数据集是否与预期的数据集匹配（ClickHouse Keeper 存储此信息）。如果存在轻微的不一致，系统会通过与副本同步数据来解决这些问题。

如果系统检测到损坏的数据部分（文件大小错误）或未识别的部分（写入文件系统但未记录在 ClickHouse Keeper 中的部分），它会将它们移动到 `detached` 子目录中（不会被删除）。任何缺失的部分将从副本中复制。

请注意，ClickHouse 不会执行任何破坏性操作，例如自动删除大量数据。

当服务器启动（或与 ClickHouse Keeper 建立新会话）时，仅检查所有文件的数量和大小。如果文件大小匹配，但某些字节在中间发生了变化，则不会立即被检测到，而是在尝试读取 `SELECT` 查询的数据时才会被发现。该查询会抛出有关不匹配的校验和或压缩块大小的异常。在这种情况下，数据部分将被添加到验证队列中，并在必要时从副本中复制。

如果本地数据集与预期的数据集差异过大，则会触发安全机制。服务器会在日志中记录这一点并拒绝启动。原因是这种情况可能表明配置错误，例如，如果分片上的副本被意外配置为与其他分片的副本相同。但是，这一机制的阈值设置得相对较低，这种情况可能在正常故障恢复期间发生。在这种情况下，数据会通过“按下按钮”进行半自动恢复。

要启动恢复，请在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data`，并添加任何内容，或者运行恢复所有复制表的命令：

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

然后重启服务器。服务器启动后，会删除这些标志并开始恢复。

## 整个数据丢失后的恢复 {#recovery-after-complete-data-loss}

如果其中一台服务器上的所有数据和元数据都消失，请按照以下步骤进行恢复：

1. 在服务器上安装 ClickHouse。如果使用分片标识符和副本，请在配置文件中正确定义替换。
2. 如果您有未复制的表，需要手动在服务器上重复这些表，请从一个副本复制它们的数据（在目录 `/var/lib/clickhouse/data/db_name/table_name/` 中）。
3. 从副本复制位于 `/var/lib/clickhouse/metadata/` 中的表定义。如果表定义中显式定义了分片或副本标识符，请更正以便与此副本一致。（或者，启动服务器并执行应在 `/var/lib/clickhouse/metadata/` 中的 .sql 文件中包含的所有 `ATTACH TABLE` 查询。）
4. 要启动恢复，请在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data`，并添加任何内容，或者运行恢复所有复制表的命令：`sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

然后启动服务器（如果已经在运行，则重启）。数据将从副本中下载。

另一种恢复选项是从 ClickHouse Keeper 中删除有关丢失副本的信息（`/path_to_table/replica_name`），然后按照 “[创建复制表](#creating-replicated-tables)” 的说明重新创建该副本。

在恢复过程中没有网络带宽限制。请记住，如果一次恢复多个副本，请考虑这一点。

## 从 MergeTree 转换为 ReplicatedMergeTree {#converting-from-mergetree-to-replicatedmergetree}

我们使用 `MergeTree` 这个术语来指代所有在 `MergeTree 家族` 中的表引擎，和 `ReplicatedMergeTree` 的定义相同。

如果您有一个手动复制的 `MergeTree` 表，您可以将其转换为复制表。如果您在 `MergeTree` 表中已经收集了大量数据，而现在想启用复制，您可能需要这样做。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句允许将已分离的 `MergeTree` 表附加为 `ReplicatedMergeTree`。

如果在表的数据目录（`/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/`，用于 `Atomic` 数据库）中设置了 `convert_to_replicated` 标志，则在服务器重启时可以自动转换 `MergeTree` 表。
创建空的 `convert_to_replicated` 文件，表将在下次服务器重启时被加载为复制表。

此查询可用于获取表的数据路径。如果表有多个数据路径，您必须使用第一个。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

请注意，ReplicatedMergeTree 表将使用 `default_replica_path` 和 `default_replica_name` 设置的值进行创建。
若要在其他副本上创建转换后的表，您需要在 `ReplicatedMergeTree` 引擎的第一个参数中显式指定其路径。可以使用以下查询获取其路径。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

还有一种手动方法可以做到这一点。

如果不同副本上的数据不同，首先同步这些数据，或在所有副本上删除该数据，保留一个副本。

重命名现有的 MergeTree 表，然后用旧名称创建一个 `ReplicatedMergeTree` 表。
将数据从旧表移动到新表数据目录下的 `detached` 子目录内（`/var/lib/clickhouse/data/db_name/table_name/`）。
然后在其中一个副本上运行 `ALTER TABLE ATTACH PARTITION` 以将这些数据部分添加到工作集中。

## 从 ReplicatedMergeTree 转换为 MergeTree {#converting-from-replicatedmergetree-to-mergetree}

使用 [ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句将已分离的 `ReplicatedMergeTree` 表附加为单个服务器上的 `MergeTree`。

另一种方法是涉及服务器重启。创建一个不同名称的 MergeTree 表。将数据从 `ReplicatedMergeTree` 表的数据目录移动到新表的数据目录中。然后删除 `ReplicatedMergeTree` 表并重启服务器。

如果您想在不启动服务器的情况下删除 `ReplicatedMergeTree` 表：

- 删除元数据目录中相应的 `.sql` 文件（`/var/lib/clickhouse/metadata/`）。
- 删除 ClickHouse Keeper 中相应的路径（`/path_to_table/replica_name`）。

之后，您可以启动服务器，创建一个 `MergeTree` 表，将数据移动到其目录，然后重启服务器。

## 当 ClickHouse Keeper 集群中的元数据丢失或损坏时的恢复 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

如果 ClickHouse Keeper 中的数据丢失或损坏，您可以通过将其移动到未复制的表中来保存数据，如上述所述。

**另请参见**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
