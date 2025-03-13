---
slug: /engines/table-engines/mergetree-family/replication
sidebar_position: 20
sidebar_label: 数据复制
title: "数据复制"
description: "ClickHouse 中数据复制的概述"
---


# 数据复制

:::note
在 ClickHouse Cloud 中，复制由系统为您管理。请创建表时不要添加参数。例如，在下面的文本中，您将替换：

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

复制仅支持 MergeTree 系列中的表：

- ReplicatedMergeTree
- ReplicatedSummingMergeTree
- ReplicatedReplacingMergeTree
- ReplicatedAggregatingMergeTree
- ReplicatedCollapsingMergeTree
- ReplicatedVersionedCollapsingMergeTree
- ReplicatedGraphiteMergeTree

复制在单个表级别操作，而不是整个服务器级别。一个服务器可以同时存储复制表和非复制表。

复制不依赖于分片。每个分片都有自己的独立复制。

对于 `INSERT` 和 `ALTER` 查询压缩的数据将被复制（更多信息，请参阅 [ALTER](/sql-reference/statements/alter) 文档）。

`CREATE`、`DROP`、`ATTACH`、`DETACH` 和 `RENAME` 查询在单个服务器上执行，并且不会被复制：

- `CREATE TABLE` 查询在运行该查询的服务器上创建一个新的可复制表。如果该表已经存在于其他服务器上，则会添加一个新的副本。
- `DROP TABLE` 查询删除运行该查询的服务器上的副本。
- `RENAME` 查询在其中一个副本上重命名表。换句话说，复制表在不同副本上可以有不同的名称。

ClickHouse 使用 [ClickHouse Keeper](/guides/sre/keeper/index.md) 来存储副本的元信息。可以使用 ZooKeeper 版本 3.4.5 或更高版本，但建议使用 ClickHouse Keeper。

要使用复制，请在 [zookeeper](/operations/server-configuration-parameters/settings#zookeeper) 服务器配置部分设置参数。

:::note
请不要忽视安全设置。ClickHouse 支持 ZooKeeper 安全子系统的 `digest` [ACL 方案](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html#sc_ZooKeeperAccessControl)。
:::

设置 ClickHouse Keeper 集群地址的示例：

``` xml
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

ClickHouse 还支持在辅助 ZooKeeper 集群中存储副本的元信息。可以通过提供 ZooKeeper 集群名称和路径作为引擎参数来实现。换句话说，它支持在不同的 ZooKeeper 集群中存储不同表的元数据。

设置辅助 ZooKeeper 集群地址的示例：

``` xml
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

要将表元数据存储在辅助 ZooKeeper 集群中而不是默认的 ZooKeeper 集群中，可以使用 SQL 通过以下方式创建表，使用 ReplicatedMergeTree 引擎：

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```
您可以指定任何现有的 ZooKeeper 集群，系统将使用其上的目录来存储自己的数据（该目录是在创建可复制表时指定的）。

如果配置文件中没有设置 ZooKeeper，您将无法创建复制表，任何现有的复制表将是只读的。

在 `SELECT` 查询中不使用 ZooKeeper，因为复制不影响 `SELECT` 的性能，查询的速度与非复制表一样快。在查询分布式复制表时，ClickHouse 的行为由设置 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) 和 [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) 控制。

对于每个 `INSERT` 查询，大约会通过多次事务向 ZooKeeper 添加十个条目。（更准确地说，这是针对每个插入的数据块；一个 INSERT 查询包含一个数据块或每个 `max_insert_block_size = 1048576` 行一个数据块。）这导致 `INSERT` 的延迟相较于非复制表略长。但如果您遵循建议以每秒不超过一个 `INSERT` 的批量插入数据，它不会造成任何问题。整个 ClickHouse 集群用于协调一个 ZooKeeper 集群，总共每秒有数百个 `INSERTs`。数据插入的吞吐量（每秒的行数）与非复制数据一样高。

对于非常大的集群，您可以为不同的分片使用不同的 ZooKeeper 集群。但是，根据我们的经验，在约 300 台服务器的生产集群中，这并未被证明是必要的。

复制是异步的和多主的。 `INSERT` 查询（以及 `ALTER`）可以发送到任何可用的服务器。数据在运行查询的服务器上插入，然后复制到其他服务器。因为它是异步的，所以最近插入的数据会在其他副本上出现一些延迟。如果部分副本不可用，数据将在它们可用时写入。如果副本可用，则延迟是将压缩数据块传输到网络所需的时间。执行后台任务的线程数量可以通过 [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 设置进行设置。

`ReplicatedMergeTree` 引擎使用一个单独的线程池进行复制获取。池的大小受到 [background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 设置的限制，该设置可以通过重启服务器进行调整。

默认情况下，INSERT 查询只等待一个副本确认写入数据的确认。如果数据只成功写入了一个副本，而拥有该副本的服务器停止存在，则存储的数据将丢失。要启用从多个副本获取数据写入确认，请使用 `insert_quorum` 选项。

每个数据块都是原子写入的。INSERT 查询被分为最多 `max_insert_block_size = 1048576` 行的块。换句话说，如果 `INSERT` 查询少于 1048576 行，则它是原子性的。

数据块会被去重。对于多次写入相同数据块（相同大小且包含相同行的相同顺序的数据块），该块只写入一次。这样做的原因是在网络故障发生时，客户端应用程序不知道数据是否写入到数据库，所以 `INSERT` 查询可以简单地重复执行。无论将 `INSERTs` 发送到哪个副本，数据都是幂等的。去重参数由 [merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) 服务器设置控制。

在复制过程中，仅源插入数据通过网络传输。后续的数据转换（合并）将在所有副本上以相同的方式协调和执行。这最小化了网络使用率，这意味着当副本位于不同数据中心时，复制效果良好。（请注意，在不同数据中心中复制数据是复制的主要目的。）

您可以拥有任意数量的相同数据副本。根据我们的经验，一个相对可靠和方便的解决方案是在生产中使用双重复制，每个服务器使用 RAID-5 或 RAID-6（在某些情况下为 RAID-10）。

系统监控副本的数据同步性，能够在故障后恢复。故障转移是自动的（对于数据的小差异）或半自动的（当数据差异过大，可能表示配置错误）。

## 创建复制表 {#creating-replicated-tables}

:::note
在 ClickHouse Cloud 中，复制由系统为您管理。请创建表时不要添加参数。例如，在下面的文本中，您将替换：
```sql
ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', ver)
```
为：
```sql
ENGINE = ReplicatedMergeTree
```
:::

将 `Replicated` 前缀加到表引擎名称。例如：`ReplicatedMergeTree`。

:::tip
在 ClickHouse Cloud 中添加 `Replicated` 是可选的，因为所有表都是复制的。
:::

### Replicated\*MergeTree 参数 {#replicatedmergetree-parameters}

#### zoo_path {#zoo_path}

`zoo_path` — ClickHouse Keeper 中表的路径。

#### replica_name {#replica_name}

`replica_name` — ClickHouse Keeper 中的副本名称。

#### other_parameters {#other_parameters}

`other_parameters` — 用于创建复制版本的引擎参数，例如 `ReplacingMergeTree` 中的版本。

示例：

``` sql
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

<summary>使用已弃用语法的示例</summary>

``` sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
```

</details>

如示例所示，这些参数可以包含花括号中的替换。替换的值取自配置文件中的 [macros](/operations/server-configuration-parameters/settings.md/#macros) 部分。

示例：

``` xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

在 ClickHouse Keeper 中，表的路径应对每张复制表唯一。不同分片上的表应有不同的路径。
在此情况下，路径由以下部分组成：

`/clickhouse/tables/` 是公共前缀。我们建议使用这个。

`{shard}` 将扩展为分片标识符。

`table_name` 是 ClickHouse Keeper 中表的节点名称。它最好与表名称相同。它是显式定义的，因为与表名称不同，重命名查询后不会改变。
*提示*：您还可以在 `table_name` 前添加数据库名称。例如，`db_name.table_name`

可以使用的两个内置替换 `{database}` 和 `{table}`，分别扩展为表名称和数据库名称（除非在 `macros` 部分定义了这些宏）。因此，ZooKeeper 路径可以指定为 `'/clickhouse/tables/{shard}/{database}/{table}'`。
在使用这些内置替换时，重命名表时要小心。ClickHouse Keeper 中的路径无法更改，当表重命名时，宏将扩展为不同的路径，表将引用 ClickHouse Keeper 中不存在的路径，并进入只读模式。

副本名称标识同一表的不同副本。您可以使用服务器名称，正如示例中所示。该名称只需在每个分片内唯一即可。

您可以显式定义参数，而不是使用替换。这对于测试和配置小型集群可能很方便。但是，在这种情况下，您无法使用分布式 DDL 查询（`ON CLUSTER`）。

在处理大型集群时，我们建议使用替换，因为它们减少了出错的概率。

您可以在服务器配置文件中为 `Replicated` 表引擎指定默认参数。例如：

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

在这种情况下，您在创建表时可以省略参数：

``` sql
CREATE TABLE table_name (
	x UInt32
) ENGINE = ReplicatedMergeTree
ORDER BY x;
```

它等效于：

``` sql
CREATE TABLE table_name (
	x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

在每个副本上运行 `CREATE TABLE` 查询。此查询创建一个新的复制表，或将新副本添加到现有表。

如果您在其他副本上已经有一些数据后添加新副本，则在运行查询后，数据将从其他副本复制到新副本。换句话说，新副本与其他副本同步。

要删除副本，请运行 `DROP TABLE`。然而，仅有一副本被删除——即运行查询的服务器上的副本。

## 故障后的恢复 {#recovery-after-failures}

如果 ClickHouse Keeper 在服务器启动时不可用，复制表将切换为只读模式。系统会定期尝试连接 ClickHouse Keeper。

如果在 `INSERT` 过程中 ClickHouse Keeper 不可用，或在与 ClickHouse Keeper 交互时发生错误，将抛出异常。

连接到 ClickHouse Keeper 后，系统检查本地文件系统中的数据集合是否与预期的数据集合匹配（ClickHouse Keeper 存储此信息）。如果存在小的不一致，系统通过与副本同步数据来解决这些问题。

如果系统检测到损坏的数据部分（文件大小错误）或未识别的部分（写入文件系统但未在 ClickHouse Keeper 中记录的部分），则会将它们移动到 `detached` 子目录（不会被删除）。任何缺失的部分将从副本中复制。

请注意，ClickHouse 不执行任何破坏性操作，例如自动删除大量数据。

当服务器启动（或与 ClickHouse Keeper 建立新会话）时，它只检查所有文件的数量和大小。如果文件大小匹配，但某些地方的字节已更改，这不会立即被检测到，而是在尝试读取 `SELECT` 查询的数据时才会被发现。查询会抛出关于不匹配的校验和或压缩块大小的异常。在这种情况下，数据部分会添加到验证队列中，并在必要时从副本中复制。

如果本地数据集合与预期数据集合的差异过大，安全机制将被触发。服务器将此记录到日志中，并拒绝启动。产生这种情况的原因可能是配置错误，比如将某个分片上的副本错误地配置成与另一个分片上的副本相同。但是，该机制的阈值设置得相当低，这种情况可能在正常的故障恢复期间出现。在这种情况下，数据会以半自动的方式恢复——通过“按按钮”。

要启动恢复，请在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data`，内容可以是任意的，或者运行命令恢复所有复制表：

``` bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

然后重新启动服务器。在启动时，服务器会删除这些标志并开始恢复。

## 完全数据丢失后的恢复 {#recovery-after-complete-data-loss}

如果服务器上的所有数据和元数据消失，请按照以下步骤恢复：

1.  在服务器上安装 ClickHouse。在包含分片标识符和副本的配置文件中正确定义替换（如果使用它们）。
2.  如果您有必须在服务器上手动复制的非复制表，请从副本复制其数据（在目录 `/var/lib/clickhouse/data/db_name/table_name/` 中）。
3.  从副本中复制位于 `/var/lib/clickhouse/metadata/` 中的表定义。如果在表定义中显式定义了分片或副本标识符，请更正为与此副本对应的值。（或者，启动服务器并在 `/var/lib/clickhouse/metadata/` 中执行所有应在 .sql 文件中的 `ATTACH TABLE` 查询。）
4.  要启动恢复，请在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data`，内容可以是任意的，或运行命令恢复所有复制表：`sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

然后启动服务器（如果已在运行，则重启）。数据将从副本下载。

另一种恢复选项是从 ClickHouse Keeper 中删除丢失副本的信息（`/path_to_table/replica_name`），然后按照 "[创建复制表](#creating-replicated-tables)" 中描述的方式重新创建副本。

恢复期间没有网络带宽限制。请记住这一点，特别是如果您同时恢复多个副本时。

## 从 MergeTree 转换为 ReplicatedMergeTree {#converting-from-mergetree-to-replicatedmergetree}

我们使用术语 `MergeTree` 来指代 `MergeTree` 系列中的所有表引擎，和 `ReplicatedMergeTree` 一样。

如果您有一个手动复制的 `MergeTree` 表，您可以将其转换为复制表。如果您已经在 `MergeTree` 表中收集了大量数据而现在想启用复制，您可能需要这样做。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句允许将分离的 `MergeTree` 表附加为 `ReplicatedMergeTree`。

如果在表的数据目录中设置了 `convert_to_replicated` 标志，则在服务器重启时可以自动转换 `MergeTree` 表（`/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/` 对于 `Atomic` 数据库）。创建一个空的 `convert_to_replicated` 文件，在下一次服务器重启时，该表将作为复制表加载。

可以使用以下查询获取表的数据路径。如果表有多个数据路径，您需要使用第一个路径。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

请注意，ReplicatedMergeTree 表将使用 `default_replica_path` 和 `default_replica_name` 设置的值创建。
要在其他副本上创建转换后的表，您需要在 `ReplicatedMergeTree` 引擎的第一个参数中显式指定其路径。可以使用以下查询获取其路径。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

还有一种手动方式来实现。

如果不同副本的数据不同，首先同步这些数据，或者删除所有副本上的这些数据，仅保留一个副本。

重命名现有的 MergeTree 表，然后使用旧名称创建一个 `ReplicatedMergeTree` 表。
将旧表中的数据移到新表数据目录下的 `detached` 子目录中（`/var/lib/clickhouse/data/db_name/table_name/`）。
然后在其中一个副本上运行 `ALTER TABLE ATTACH PARTITION` 以将这些数据部分添加到工作集中。

## 从 ReplicatedMergeTree 转换为 MergeTree {#converting-from-replicatedmergetree-to-mergetree}

使用 [ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句在单个服务器上将分离的 `ReplicatedMergeTree` 表附加为 `MergeTree`。

另一种方法是重启服务器。创建一个不同名称的 MergeTree 表。将 `ReplicatedMergeTree` 表数据目录中的所有数据移动到新表的数据目录中。然后删除 `ReplicatedMergeTree` 表并重启服务器。

如果您想在不启动服务器的情况下删除 `ReplicatedMergeTree` 表：

- 删除元数据目录（`/var/lib/clickhouse/metadata/`）中相应的 `.sql` 文件。
- 删除 ClickHouse Keeper 中对应的路径（`/path_to_table/replica_name`）。

在此之后，您可以启动服务器，创建一个 `MergeTree` 表，将数据移动到其目录中，然后重启服务器。

## 当 ClickHouse Keeper 集群中的元数据丢失或损坏时的恢复 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

如果 ClickHouse Keeper 中的数据丢失或损坏，您可以通过将数据移动到一个非复制表中来保存数据，如上所述。

**参见**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
