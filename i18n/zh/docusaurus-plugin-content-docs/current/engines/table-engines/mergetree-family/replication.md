---
'description': 'ClickHouse 中的数据复制概述'
'sidebar_label': '数据复制'
'sidebar_position': 20
'slug': '/engines/table-engines/mergetree-family/replication'
'title': '数据复制'
'doc_type': 'reference'
---


# 数据复制

:::note
在 ClickHouse Cloud 中，复制由系统自动管理。请在创建表时不添加任何参数。例如，在下面的文本中，请将：

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}'
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

复制在单个表级别上工作，而不是整个服务器。一个服务器可以同时存储复制和非复制表。

复制不依赖于分片。每个分片都有自己独立的复制。

对于 `INSERT` 和 `ALTER` 查询，已压缩的数据会被复制（更多信息，请参阅 [ALTER](/sql-reference/statements/alter) 的文档）。

`CREATE`、`DROP`、`ATTACH`、`DETACH` 和 `RENAME` 查询在单个服务器上执行，并且不被复制：

- `CREATE TABLE` 查询在执行查询的服务器上创建一个新的可复制表。如果该表在其他服务器上已经存在，它将添加一个新的副本。
- `DROP TABLE` 查询删除位于执行查询的服务器上的副本。
- `RENAME` 查询重命名一个副本上的表。换句话说，复制表在不同副本上可以有不同的名称。

ClickHouse 使用 [ClickHouse Keeper](/guides/sre/keeper/index.md) 存储副本的元信息。可以使用 ZooKeeper 版本 3.4.5 或更高版本，但建议使用 ClickHouse Keeper。

要使用复制，请在 [zookeeper](/operations/server-configuration-parameters/settings#zookeeper) 服务器配置部分中设置参数。

:::note
请勿忽视安全设置。ClickHouse 支持 ZooKeeper 安全子系统的 `digest` [ACL 方案](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)。
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

ClickHouse 还支持在辅助 ZooKeeper 集群中存储副本的元信息。通过提供 ZooKeeper 集群名称和路径作为引擎参数来实现。
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

要在辅助 ZooKeeper 集群中存储表的元数据，而不是默认的 ZooKeeper 集群，我们可以使用 SQL 创建具有 ReplicatedMergeTree 引擎的表，如下所示：

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```
您可以指定任何现有的 ZooKeeper 集群，系统将使用该目录中的数据（在创建可复制表时指定目录）。

如果配置文件中未设置 ZooKeeper，则无法创建复制表，任何现有的复制表将为只读。

ZooKeeper 不用于 `SELECT` 查询，因为复制不会影响 `SELECT` 的性能，查询的速度与非复制表一样快。在查询分布式复制表时，ClickHouse 的行为受设置 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) 和 [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) 的控制。

对于每个 `INSERT` 查询，约有十个条目通过多个事务添加到 ZooKeeper。（更准确地说，这是对于每个插入的数据块；一个 INSERT 查询包含一个数据块或每 `max_insert_block_size = 1048576` 行一个块。）这导致与非复制表相比，`INSERT` 的延迟稍长。但是，如果您遵循建议以每秒不超过一个 `INSERT` 的批量插入数据，就不会造成任何问题。协调一个 ZooKeeper 集群的整个 ClickHouse 集群每秒总共会有几百个 `INSERTs`。数据插入的吞吐量（每秒的行数）和非复制数据一样高。

对于非常大的集群，您可以为不同的分片使用不同的 ZooKeeper 集群。然而，根据我们的经验，在大约 300 个服务器的生产集群中，这并没有被证明是必要的。

复制是异步和多主的。`INSERT` 查询（以及 `ALTER`）可以发送给任何可用的服务器。数据在执行查询的服务器上插入，然后复制到其他服务器。由于它是异步的，最近插入的数据会有一些延迟地出现在其他副本上。如果部分副本不可用，数据将在它们变为可用时写入。如果一台副本可用，则延迟是通过网络传输压缩数据块所需的时间。执行复制表的后台任务的线程数可以通过 [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 设置进行调整。

`ReplicatedMergeTree` 引擎使用单独的线程池来进行复制提取。池的大小由 [background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 设置限制，可以通过服务器重启进行调整。

默认情况下，INSERT 查询仅等待来自一个副本的写入数据确认。如果数据仅成功写入一个副本，并且该副本所在的服务器停止存在，则存储的数据将丢失。要启用从多个副本获取数据写入确认，请使用 `insert_quorum` 选项。

每个数据块以原子方式写入。INSERT 查询被分为最多 `max_insert_block_size = 1048576` 行的块。换句话说，如果 INSERT 查询的行数少于 1048576，则它以原子方式进行。

数据块是去重的。对于多次写入相同的数据块（含有相同大小且按照相同顺序包含相同行的数据块），该块仅写入一次。这是因为在网络故障的情况下，客户端应用程序无法确定数据是否已写入数据库，因此可以简单地重复 INSERT 查询。无论发送到哪个副本，INSERTs 都是幂等的。去重参数由 [merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) 服务器设置控制。

在复制过程中，仅源数据会通过网络传输。进一步的数据转换（合并）会在所有副本上以相同的方式协调和执行。这最小化了网络使用，这意味着当副本位于不同数据中心时，复制运行良好。（请注意，在不同数据中心复制数据是复制的主要目标。）

您可以拥有相同数据的任意数量的副本。根据我们的经验，比较可靠和方便的解决方案是在生产中使用双重复制，每个服务器使用 RAID-5 或 RAID-6（在某些情况下使用 RAID-10）。

系统监控副本上的数据同步性，并在发生故障后能够恢复。故障转移是自动的（对于轻微的数据差异）或半自动的（当数据差异过大时，可能表示配置错误）。

## 创建复制表 {#creating-replicated-tables}

:::note
在 ClickHouse Cloud 中，复制会自动处理。

使用 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 创建表时无需复制参数。系统会内部将 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 重写为 [`SharedMergeTree`](/cloud/reference/shared-merge-tree) 以进行复制和数据分配。

避免使用 `ReplicatedMergeTree` 或指定复制参数，因为复制由平台管理。

:::

### Replicated\*MergeTree 参数 {#replicatedmergetree-parameters}

| 参数            | 描述                                                                      |
|-----------------|---------------------------------------------------------------------------|
| `zoo_path`      | ClickHouse Keeper 中表的路径。                                             |
| `replica_name`  | ClickHouse Keeper 中的副本名称。                                          |
| `other_parameters` | 用于创建复制版本的引擎参数，例如 ReplacingMergeTree 中的版本。               |

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

<summary>过时语法示例</summary>

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
```

</details>

如示例所示，这些参数可以包含花括号中的替换。替换的值来自配置文件的 [macros](/operations/server-configuration-parameters/settings.md/#macros) 部分。

示例：

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeper 中的表路径对于每个复制表应是唯一的。不同分片上的表应具有不同路径。
在这种情况下，路径由以下部分组成：

`/clickhouse/tables/` 是公用前缀。我们建议使用这个。

`{shard}` 将展开为分片标识符。

`table_name` 是 ClickHouse Keeper 中表的节点名称。最好将其设为与表名相同。它是显式定义的，因为与表名不同，它在 RENAME 查询后不会变化。
*提示*: 您还可以在 `table_name` 前添加数据库名称。例如 `db_name.table_name`。

两个内置替换 `{database}` 和 `{table}` 可以使用，它们分别展开为表名和数据库名（除非在 `macros` 部分中定义了这些宏）。因此可以将 ZooKeeper 路径指定为 `'/clickhouse/tables/{shard}/{database}/{table}'`。
在使用这些内置替换时，请注意表名的重命名。ClickHouse Keeper 中的路径无法更改，当表被重命名时，宏将扩展为不同的路径，该表将指向一个在 ClickHouse Keeper 中不存在的路径，并进入只读模式。

副本名称标识同一表的不同副本。您可以使用服务器名称作为此名称，如示例所示。该名称仅需在每个分片内是唯一的。

您可以显式定义参数，而不是使用替换。这可能对测试和配置小集群很方便。但是，在这种情况下，您不能使用分布式 DDL 查询（`ON CLUSTER`）。

在处理大型集群时，我们建议使用替换，因为它减少了错误的可能性。

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

它的等效形式为：

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

在每个副本上运行 `CREATE TABLE` 查询。此查询创建一个新的复制表，或将新副本添加到已有副本中。

如果在表已在其他副本上包含一些数据后添加新副本，数据将从其他副本复制到新副本中。换句话说，新副本与其他副本同步。

要删除一个副本，运行 `DROP TABLE`。但是，仅删除一个副本 - 位于您运行查询的服务器上的那个。

## 发生故障后的恢复 {#recovery-after-failures}

如果 ClickHouse Keeper 在服务器启动时不可用，则复制表切换到只读模式。系统会定期尝试连接到 ClickHouse Keeper。

如果 ClickHouse Keeper 在 `INSERT` 期间不可用或在与 ClickHouse Keeper 交互时发生错误，将抛出异常。

连接到 ClickHouse Keeper 后，系统检查本地文件系统中的数据集是否与预期的数据集匹配（ClickHouse Keeper 存储此信息）。如果存在轻微的不一致，系统会通过与副本同步数据来解决它们。

如果系统发现数据部分损坏（文件大小错误）或未识别部分（写入到文件系统但未在 ClickHouse Keeper 中记录的部分），则将它们移动到 `detached` 子目录（它们不会被删除）。任何缺失的部分将从副本中复制。

请注意，ClickHouse 不会执行任何破坏性操作，例如自动删除大量数据。

当服务器启动（或与 ClickHouse Keeper 建立新会话）时，仅检查所有文件的数量和大小。如果文件大小匹配但某些字节在中间被更改，则不会立即检测到，而是在尝试读取 `SELECT` 查询的数据时检测到。该查询抛出一个关于不匹配的校验和或压缩块大小的异常。在这种情况下，数据部分被添加到验证队列中，并在必要时从副本中复制。

如果本地数据集与预期集的差异过大，则会触发安全机制。服务器在日志中记录并拒绝启动。原因是该情况可能指示配置错误，例如，如果分片上的副本意外配置为与另一分片上的副本相同。但是，这种机制的阈值设置得很低，这种情况可能在正常故障恢复时发生。在这种情况下，数据是半自动恢复的 - 通过“按下按钮”。

要开始恢复，请在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data`，内容可以是任何内容，或运行命令以恢复所有复制表：

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

然后重启服务器。启动时，服务器会删除这些标志并开始恢复。

## 完全数据丢失后的恢复 {#recovery-after-complete-data-loss}

如果一台服务器上的所有数据和元数据消失，请按照以下步骤进行恢复：

1.  在该服务器上安装 ClickHouse。正确定义包含分片标识符和副本的配置文件中的替换（如果使用它们）。
2.  如果您有未复制的表必须在服务器上手动复制，请从副本中复制它们的数据（在目录 `/var/lib/clickhouse/data/db_name/table_name/` 中）。
3.  从副本中复制位于 `/var/lib/clickhouse/metadata/` 中的表定义。如果在表定义中显式定义了分片或副本标识符，请更正以使其与该副本相对应。（或者，启动服务器，并进行所有应该在 `/var/lib/clickhouse/metadata/` 中的 .sql 文件中的 `ATTACH TABLE` 查询。）
4.  要开始恢复，在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data`，内容可以是任何内容，或运行命令以恢复所有复制表： `sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

然后启动服务器（如果已在运行，则重启）。数据将从副本下载。

另一种恢复选项是在 ClickHouse Keeper 中删除丢失副本的信息（`/path_to_table/replica_name`），然后按照 "[创建复制表](#creating-replicated-tables)" 中的描述重新创建副本。

在恢复期间没有网络带宽限制。请记住，如果您一次恢复许多副本。

## 从 MergeTree 转换为 ReplicatedMergeTree {#converting-from-mergetree-to-replicatedmergetree}

我们使用术语 `MergeTree` 来指代 `MergeTree family` 中的所有表引擎，与 `ReplicatedMergeTree` 一样。

如果您以前有一个手动复制的 `MergeTree` 表，可以将其转换为复制表。如果您已经在 `MergeTree` 表中收集了大量数据，现在想启用复制，则可能需要这样做。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句允许将脱离的 `MergeTree` 表附加为 `ReplicatedMergeTree`。

如果在表的数据目录中设置了 `convert_to_replicated` 标志，则 `MergeTree` 表可以在服务器重启时自动转换（`/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/` 对于 `Atomic` 数据库）。
创建空的 `convert_to_replicated` 文件，表将在下次服务器重启时以复制方式加载。

可以使用此查询获取表的数据路径。如果表有多个数据路径，则必须使用第一个路径。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

请注意，ReplicatedMergeTree 表将使用 `default_replica_path` 和 `default_replica_name` 设置的值创建。
要在其他副本上创建转换后的表，您需要在 `ReplicatedMergeTree` 引擎的第一个参数中显式指定其路径。可以使用以下查询获取其路径。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

还有一种手动的方法。

如果不同副本上的数据不同，请先同步它，或在所有副本上删除该数据，除了一个。

重命名现有的 MergeTree 表，然后使用旧名称创建一个 `ReplicatedMergeTree` 表。
将数据从旧表移动到新表数据目录中的 `detached` 子目录（`/var/lib/clickhouse/data/db_name/table_name/`）。
然后在其中一个副本上运行 `ALTER TABLE ATTACH PARTITION` 将这些数据部分添加到工作集。

## 从 ReplicatedMergeTree 转换为 MergeTree {#converting-from-replicatedmergetree-to-mergetree}

使用 [ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句将脱离的 `ReplicatedMergeTree` 表附加为单个服务器上的 `MergeTree`。

另一种方法涉及服务器重启。创建一个具有不同名称的 MergeTree 表。将所有数据从 `ReplicatedMergeTree` 表数据目录移动到新表的数据目录中。然后删除 `ReplicatedMergeTree` 表并重启服务器。

如果您想在不启动服务器的情况下删除 `ReplicatedMergeTree` 表：

- 删除元数据目录（`/var/lib/clickhouse/metadata/`）中的相应 `.sql` 文件。
- 删除 ClickHouse Keeper 中的相应路径（`/path_to_table/replica_name`）。

在此之后，您可以启动服务器，创建一个 `MergeTree` 表，将数据移动到其目录中，然后重启服务器。

## 在 ClickHouse Keeper 集群中元数据丢失或损坏时的恢复 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

如果 ClickHouse Keeper 中的数据丢失或损坏，可以通过将其移动到如上所述的未复制表中来保存数据。

**另请参见**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
