---
'description': 'ClickHouse中数据复制的概述'
'sidebar_label': '数据复制'
'sidebar_position': 20
'slug': '/engines/table-engines/mergetree-family/replication'
'title': '数据复制'
---




# 数据复制

:::note
在 ClickHouse Cloud 中，复制是由系统为您管理的。请创建表时不要添加参数。例如，在下面的文本中，您将替换：

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}',
    ver
)
```

为：

```sql
ENGINE = ReplicatedMergeTree
```
:::

复制仅支持 MergeTree 系列的表：

- ReplicatedMergeTree
- ReplicatedSummingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- ReplicatedGraphiteMergeTree

复制在单个表的层面上工作，而不是在整个服务器上。一个服务器可以同时存储复制和非复制的表。

复制不依赖于分片。每个分片都有自己独立的复制。

对于 `INSERT` 和 `ALTER` 查询，压缩数据是被复制的（有关更多信息，请参见 [ALTER](/sql-reference/statements/alter) 的文档）。

`CREATE`、`DROP`、`ATTACH`、`DETACH` 和 `RENAME` 查询是在单个服务器上执行的，并且不被复制：

- `CREATE TABLE` 查询在执行查询的服务器上创建一个新的可复制表。如果该表在其他服务器上已存在，它会添加一个新的副本。
- `DROP TABLE` 查询删除在执行查询的服务器上找到的副本。
- `RENAME` 查询重命名一个副本上的表。换句话说，被复制的表可以在不同的副本上有不同的名称。

ClickHouse 使用 [ClickHouse Keeper](/guides/sre/keeper/index.md) 来存储副本元信息。可以使用 ZooKeeper 版本 3.4.5 或更新版本，但推荐使用 ClickHouse Keeper。

要使用复制，请在 [zookeeper](/operations/server-configuration-parameters/settings#zookeeper) 服务器配置部分中设置参数。

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

要将表元数据存储在辅助 ZooKeeper 集群而不是默认的 ZooKeeper 集群中，我们可以使用 SQL 来创建具有 ReplicatedMergeTree 引擎的表，如下所示：

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```
您可以指定任何现有的 ZooKeeper 集群，系统将使用它的一个目录来存储自己的数据（该目录在创建可复制表时指定）。

如果在配置文件中没有设置 ZooKeeper，则无法创建复制表，任何现有的复制表将为只读。

在 `SELECT` 查询中，不使用 ZooKeeper，因为复制不会影响 `SELECT` 的性能，查询的执行速度与非复制表是一样的。在查询分布式复制表时，ClickHouse 的行为由设置 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) 和 [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) 控制。

对于每个 `INSERT` 查询，大约有十个条目通过多个事务添加到 ZooKeeper 中。（更准确地说，这是对于每个插入的数据块；一个 INSERT 查询包含一个块或每 `max_insert_block_size = 1048576` 行一个块。）这导致与非复制表相比，`INSERT` 的延迟略长。但是，如果遵循建议以不超过每秒一个 `INSERT` 的批量插入数据，则不会产生任何问题。整个 ClickHouse 集群用于协调一个 ZooKeeper 集群，秒级的 `INSERT` 总数在数百个左右。数据插入的吞吐量（每秒行数）与非复制数据同样高。

对于非常大的集群，可以为不同的分片使用不同的 ZooKeeper 集群。然而，根据我们在大约 300 服务器的生产集群的经验，这似乎并不必要。

复制是异步的，支持多主。`INSERT` 查询（以及 `ALTER`）可以发送到任何可用的服务器。数据在执行查询的服务器上被插入，然后复制到其他服务器。由于它是异步的，最近插入的数据在其他副本上会有一些延迟。如果部分副本不可用，则数据会在它们变得可用时写入。如果某个副本可用，则延迟是将压缩数据块通过网络传输所需的时间。执行复制表的后台任务的线程数可以通过 [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 设置来进行配置。

`ReplicatedMergeTree` 引擎使用一个单独的线程池来进行复制提取。池的大小受限于 [background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 设置，可以通过重启服务器进行调整。

默认情况下，INSERT 查询只等待确认数据已写入一个副本。如果数据仅成功写入一个副本，并且该副本所在的服务器停止存在，则存储的数据将丢失。要启用从多个副本获取数据写入确认，请使用 `insert_quorum` 选项。

每个数据块都是原子写入的。INSERT 查询被分为最多 `max_insert_block_size = 1048576` 行的块。换句话说，如果 `INSERT` 查询的行数少于 1048576，它是以原子的方式进行的。

数据块会去重。对于相同数据块的多次写入（相同大小的数据块包含相同的行并且顺序相同），该块只会写入一次。原因是在网络故障情况下，客户端应用程序不知道数据是否已写入数据库，因此 `INSERT` 查询可以简单地重复。将数据发送到哪个副本进行相同数据的 INSERT 是无关紧要的。`INSERTs` 是幂等的。去重参数由 [merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) 服务器设置控制。

在复制过程中，只有要插入的原始数据通过网络传输。后续的数据转换（合并）在所有副本间以相同的方式进行协调和执行。这最小化了网络使用，这意味着当副本位于不同数据中心时，复制效果良好。（请注意，跨不同数据中心复制数据是复制的主要目标。）

您可以拥有相同数据的任意数量的副本。根据我们的经验，生产中相对可靠和方便的解决方案可能使用双重复制，每台服务器使用 RAID-5 或 RAID-6（在某些情况下使用 RAID-10）。

系统监控副本上的数据同步，并能够在故障后恢复。故障切换是自动的（对于数据的小差异）或半自动的（当数据差异过大时，可能表明配置错误）。

## 创建复制表 {#creating-replicated-tables}

:::note
在 ClickHouse Cloud 中，复制是由系统为您管理的。请创建表时不要添加参数。例如，在下面的文本中，您将替换：
```sql
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', ver)
```
为：
```sql
ENGINE = ReplicatedMergeTree
```
:::

在表引擎名称前添加 `Replicated` 前缀。例如：`ReplicatedMergeTree`。

:::tip
在 ClickHouse Cloud 中，添加 `Replicated` 是可选的，因为所有表都是被复制的。
:::

### Replicated\*MergeTree 参数 {#replicatedmergetree-parameters}

#### zoo_path {#zoo_path}

`zoo_path` — ClickHouse Keeper 中表的路径。

#### replica_name {#replica_name}

`replica_name` — ClickHouse Keeper 中的副本名称。

#### other_parameters {#other_parameters}

`other_parameters` — 创建复制版本时所用引擎的参数，例如 `ReplacingMergeTree` 的版本。

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

如示例所示，这些参数可以包含大括号内的替换。替换的值来自配置文件的 [macros](/operations/server-configuration-parameters/settings.md/#macros) 部分。

示例：

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

ClickHouse Keeper 中的每个复制表的路径应唯一。不同分片上的表应具有不同的路径。
在这种情况下，路径由以下部分组成：

`/clickhouse/tables/` 是共同的前缀。我们建议使用的正是这个。

`{shard}` 将展开为分片标识符。

`table_name` 是 ClickHouse Keeper 中表的节点名称。最好与表名相同。它是显式定义的，因为与表名不同，在 RENAME 查询后不会改变。
*提示*：您也可以在 `table_name` 前添加数据库名称。例如 `db_name.table_name`

内置的两种替换 `{database}` 和 `{table}` 可以使用，它们分别展开为表名和数据库名（除非这些宏在 `macros` 部分中定义）。所以 zookeeper 路径可以指定为 `'/clickhouse/tables/{shard}/{database}/{table}'`。
使用这些内置替换时，对表重命名要小心。ClickHouse Keeper 中的路径无法更改，当表被重命名时，宏会展开为不同的路径，表将引用 ClickHouse Keeper 中不存在的路径，并进入只读模式。

副本名称标识同一表的不同副本。您可以为此使用服务器名称，如示例所示。名称只需要在每个分片内唯一即可。

您可以显式定义参数，而不是使用替换。这在测试和配置小集群时可能很方便。但是，在这种情况下，您无法使用分布式 DDL 查询（`ON CLUSTER`）。

在处理大集群时，我们建议使用替换，因为它们降低了错误的可能性。

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

这等同于：

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

在每个副本上运行 `CREATE TABLE` 查询。此查询创建一个新的复制表，或者向现有表添加一个新的副本。

如果在表已经在其他副本上包含一些数据的情况下添加了新的副本，则在运行查询后，数据将从其他副本复制到新的副本。换句话说，新副本会与其他副本同步。

要删除一个副本，请运行 `DROP TABLE`。但是，只有一个副本被删除 - 即在您运行查询的服务器上的副本。

## 故障后的恢复 {#recovery-after-failures}

如果在服务器启动时 ClickHouse Keeper 不可用，则复制表将切换为只读模式。系统会定期尝试连接 ClickHouse Keeper。

如果在 `INSERT` 过程中 ClickHouse Keeper 不可用，或者与 ClickHouse Keeper 交互时发生错误，则会抛出异常。

连接到 ClickHouse Keeper 后，系统检查本地文件系统中的数据集是否与预期的数据集匹配（ClickHouse Keeper 存储此信息）。如果存在轻微不一致，系统通过与副本同步数据来解决它们。

如果系统检测到损坏的数据部分（文件大小错误）或未记录的部分（部分写入文件系统但未记录在 ClickHouse Keeper 中），它将将其移动到 `detached` 子目录（不会删除）。任何缺失的部分将从副本中复制。

请注意，ClickHouse 不执行任何破坏性操作，例如自动删除大量数据。

当服务器启动时（或者与 ClickHouse Keeper 建立新会话时），它只检查所有文件的数量和大小。如果文件大小匹配，但某些字节在中间发生了变化，系统不会立即检测到，而是在尝试读取 `SELECT` 查询数据时才会检测到。查询会抛出关于不匹配的校验和或压缩块大小的异常。在这种情况下，数据部分会被添加到验证队列，并在必要时从副本中复制。

如果本地数据集与预期的数据集差异过大，安全机制会被触发。服务器会在日志中记录此信息并拒绝启动。这是因为这种情况可能表明配置错误，例如，如果某个分片上的副本意外配置为不同分片上的副本。然而，此机制的阈值设置得相对较低，在正常故障恢复期间可能会发生这种情况。在这种情况下，数据将半自动地恢复 - 通过“按下按钮”。

要开始恢复，请在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data`，内容可以是任意的，或者运行命令以恢复所有复制表：

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

然后重启服务器。启动时，服务器会删除这些标志并开始恢复。

## 完全数据丢失后的恢复 {#recovery-after-complete-data-loss}

如果某个服务器上的所有数据和元数据消失，请按照以下步骤进行恢复：

1.  在服务器上安装 ClickHouse。如果您使用替换，正确地在配置文件中定义包含分片标识符和副本的替换。
2.  如果 you 有必须手动复制到服务器上的非复制表，请从副本复制它们的数据（在目录 `/var/lib/clickhouse/data/db_name/table_name/` 中）。
3.  从副本中复制位于 `/var/lib/clickhouse/metadata/` 中的表定义。如果在表定义中显式定义了分片或副本标识符，请更正以使其对应于该副本。（其他方法是先启动服务器，然后执行所有在 `/var/lib/clickhouse/metadata/` 中应存在的 `ATTACH TABLE` 查询。）
4.  要开始恢复，请在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data`，内容可以是任意的，或者运行命令以恢复所有复制表：`sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

然后启动服务器（如果已经在运行，则重启）。数据将从副本下载。

另一种恢复选项是从 ClickHouse Keeper 中删除有关丢失副本的信息（`/path_to_table/replica_name`），然后按照 “[创建复制表](#creating-replicated-tables)” 中描述的方式再次创建该副本。

在恢复过程中没有网络带宽的限制。请记住，如果您一次恢复多个副本。

## 从 MergeTree 转换为 ReplicatedMergeTree {#converting-from-mergetree-to-replicatedmergetree}

我们使用术语 `MergeTree` 指代所有属于 `MergeTree` 系列的表，和 `ReplicatedMergeTree` 一样。

如果您有一个手动复制的 `MergeTree` 表，则可以将其转换为复制表。如果您已经在 `MergeTree` 表中收集了大量数据，现在想启用复制，则可能需要执行此操作。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句允许将分段的 `MergeTree` 表附加为 `ReplicatedMergeTree`。

如果在表的数据目录（`/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/` 对于 `Atomic` 数据库）设置了 `convert_to_replicated` 标志，则在服务器重启时 `MergeTree` 表可以自动转换。
创建空的 `convert_to_replicated` 文件，表将在下次服务器重启时以复制的形式加载。

此查询可用于获取表的数据路径。如果表有多个数据路径，您必须使用第一个。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

请注意，ReplicatedMergeTree 表将使用 `default_replica_path` 和 `default_replica_name` 设置的值创建。
要在其他副本上创建转换后的表，您需要在 `ReplicatedMergeTree` 引擎的第一个参数中显式指定其路径。以下查询可用于获取路径。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

还有一种手动方法。

如果各副本上的数据不同，首先同步它，或删除除一个副本以外的所有副本上的数据。

重命名现有的 MergeTree 表，然后创建一个名称相同的 `ReplicatedMergeTree` 表。
将旧表中的数据移动到新表数据目录中的 `detached` 子目录内（`/var/lib/clickhouse/data/db_name/table_name/`）。
然后在一个副本上运行 `ALTER TABLE ATTACH PARTITION` 将这些数据部分添加到工作集。

## 从 ReplicatedMergeTree 转换为 MergeTree {#converting-from-replicatedmergetree-to-mergetree}

使用 [ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句在单个服务器上将分段的 `ReplicatedMergeTree` 表附加为 `MergeTree`。

另一种方法涉及重启服务器。创建一个不同名称的 MergeTree 表。将所有数据从 `ReplicatedMergeTree` 表数据的目录移动到新表的数据目录中。然后删除 `ReplicatedMergeTree` 表并重启服务器。

如果您希望在不启动服务器的情况下删除 `ReplicatedMergeTree` 表：

- 删除元数据目录中相应的 `.sql` 文件（`/var/lib/clickhouse/metadata/`）。
- 删除 ClickHouse Keeper 中的相应路径（`/path_to_table/replica_name`）。

在此之后，您可以启动服务器，创建一个 `MergeTree` 表，将数据移动到其目录中，然后重启服务器。

## 在 ClickHouse Keeper 集群中元数据丢失或损坏时的恢复 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

如果 ClickHouse Keeper 中的数据丢失或损坏，您可以通过将数据移动到一个非复制表中来保存数据，如上所述。

**另见**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
