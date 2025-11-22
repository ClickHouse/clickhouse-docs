---
description: 'ClickHouse 中 Replicated* 系列表引擎的数据复制概述'
sidebar_label: 'Replicated*'
sidebar_position: 20
slug: /engines/table-engines/mergetree-family/replication
title: 'Replicated* 表引擎'
doc_type: 'reference'
---



# Replicated* 表引擎

:::note
在 ClickHouse Cloud 中，表副本由系统自动管理。请在创建表时不要添加参数。例如，在下文中，您应将：

```sql
ENGINE = ReplicatedMergeTree(
    '/clickhouse/tables/{shard}/table_name',
    '{replica}'
)
```

包括：

```sql
ENGINE = ReplicatedMergeTree
```

:::

复制仅支持 MergeTree 系列表：

* ReplicatedMergeTree
* ReplicatedSummingMergeTree
* ReplicatedReplacingMergeTree
* ReplicatedAggregatingMergeTree
* ReplicatedCollapsingMergeTree
* ReplicatedVersionedCollapsingMergeTree
* ReplicatedGraphiteMergeTree

复制在单个表级别生效，而不是在整个服务器级别。一个服务器可以同时存储已复制和未复制的表。

复制与分片无关。每个分片都有自己独立的复制。

针对 `INSERT` 和 `ALTER` 查询的压缩数据会被复制（更多信息，参见 [ALTER](/sql-reference/statements/alter) 的文档）。

`CREATE`、`DROP`、`ATTACH`、`DETACH` 和 `RENAME` 查询在单个服务器上执行且不会被复制：

* `CREATE TABLE` 查询会在执行该查询的服务器上创建一个新的可复制表。如果该表已经存在于其他服务器上，则会添加一个新的副本。
* `DROP TABLE` 查询会删除位于执行该查询的服务器上的副本。
* `RENAME` 查询会在其中一个副本上重命名表。换句话说，被复制的表在不同副本上可以有不同的名称。

ClickHouse 使用 [ClickHouse Keeper](/guides/sre/keeper/index.md) 来存储副本的元数据信息。也可以使用 ZooKeeper 3.4.5 或更新版本，但推荐使用 ClickHouse Keeper。

要使用复制功能，请在服务器配置的 [zookeeper](/operations/server-configuration-parameters/settings#zookeeper) 部分设置相关参数。

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

ClickHouse 还支持将副本元数据存储在辅助 ZooKeeper 集群中。可以通过将 ZooKeeper 集群名称和路径作为引擎参数来实现。
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

要将表元数据存储在辅助 ZooKeeper 集群中，而不是默认的 ZooKeeper 集群中，可以使用如下 SQL 创建基于 ReplicatedMergeTree 引擎的表：

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```

你可以指定任意现有的 ZooKeeper 集群，系统会在其上使用一个目录来存储自身数据（该目录在创建复制表时指定）。

如果在配置文件中未配置 ZooKeeper，则无法创建新的复制表，且任何已有的复制表都将是只读的。


在 `SELECT` 查询中不会使用 ZooKeeper，因为复制不会影响 `SELECT` 的性能，查询的执行速度与非复制表一样快。对分布式复制表进行查询时，ClickHouse 的行为由 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) 和 [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) 这两个设置控制。

对于每个 `INSERT` 查询，通过多个事务大约会向 ZooKeeper 添加十条记录。（更精确地说，这是针对每一个插入的数据块；一个 INSERT 查询包含一个数据块，或每 `max_insert_block_size = 1048576` 行一个数据块。）这会导致与非复制表相比，`INSERT` 的延迟略有增加。但如果按照建议，以每秒不超过一次 `INSERT` 的批次方式插入数据，则不会产生任何问题。整个 ClickHouse 集群在使用同一个 ZooKeeper 集群进行协调时，总体上每秒可以处理数百个 `INSERT`。数据插入的吞吐量（每秒行数）与非复制数据一样高。

对于非常大的集群，可以为不同的分片使用不同的 ZooKeeper 集群。然而根据我们的经验，在大约 300 台服务器的生产集群中，还没有发现有这种必要。

复制是异步的并且是多主（multi-master）的。`INSERT` 查询（以及 `ALTER`）可以发送到任意可用的服务器。数据首先写入执行查询的那台服务器，然后复制到其他服务器。由于是异步的，最近插入的数据在其他副本上可见会有一定延迟。如果部分副本不可用，则会在它们重新可用时写入数据。如果某个副本可用，延迟主要取决于通过网络传输压缩数据块所需的时间。用于复制表后台任务的线程数量可以通过 [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 设置进行配置。

`ReplicatedMergeTree` 引擎为复制拉取操作使用单独的线程池。该线程池的大小受 [background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 设置限制，并且可以通过重启服务器进行调优。

默认情况下，INSERT 查询只等待来自一个副本的数据写入确认。如果数据只成功写入了一个副本，而包含该副本的服务器不再存在，则存储的数据将丢失。要启用来自多个副本的数据写入确认，请使用 `insert_quorum` 选项。

每个数据块都会以原子方式写入。INSERT 查询会被拆分成最多 `max_insert_block_size = 1048576` 行的数据块。换句话说，如果 `INSERT` 查询中少于 1048576 行，则整个插入操作是原子的。

数据块会进行去重。对于多次写入相同的数据块（具有相同大小、包含相同行且顺序一致的数据块），该数据块只会被写入一次。这样设计的原因是在发生网络故障时，客户端应用程序可能无法确定数据是否已写入数据库，因此可以简单地重试 `INSERT` 查询。对于具有相同数据的 `INSERT`，发送到哪个副本并不重要。`INSERTs` 是幂等的。去重参数由 [merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) 服务器设置控制。

在复制过程中，只有要插入的源数据会通过网络传输。后续的数据转换（合并）会在所有副本上以相同方式进行协调和执行。这将网络使用量降到最低，这意味着当副本位于不同的数据中心时，复制依然可以良好工作。（注意，在不同数据中心间复制数据是复制的主要目标。）

可以配置为具有任意数量的相同数据副本。根据我们的经验，在生产环境中，一个相对可靠且易于运维的方案是使用双重复制，并且每台服务器使用 RAID-5 或 RAID-6（在某些情况下使用 RAID-10）。

系统会监控各副本上的数据同步情况，并能够在发生故障后进行恢复。故障转移可以是自动的（当数据差异较小时），也可以是半自动的（当数据差异过大时，这可能表明存在配置错误）。



## 创建复制表 {#creating-replicated-tables}

:::note
在 ClickHouse Cloud 中,复制功能由系统自动处理。

使用 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 创建表时无需指定复制参数。系统会在内部将 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 重写为 [`SharedMergeTree`](/cloud/reference/shared-merge-tree) 以实现复制和数据分发。

请避免使用 `ReplicatedMergeTree` 或指定复制参数,因为复制功能由平台统一管理。

:::

### Replicated\*MergeTree 参数 {#replicatedmergetree-parameters}

| 参数               | 描述                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------- |
| `zoo_path`         | 表在 ClickHouse Keeper 中的路径。                                                                                |
| `replica_name`     | 副本在 ClickHouse Keeper 中的名称。                                                                              |
| `other_parameters` | 用于创建复制版本的引擎参数,例如 `ReplacingMergeTree` 中的版本参数。                                                |

示例:

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

<summary>已弃用语法的示例</summary>

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
```

</details>

如示例所示,这些参数可以包含花括号中的替换变量。替换值取自配置文件的 [macros](/operations/server-configuration-parameters/settings.md/#macros) 部分。

示例:

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

每个复制表在 ClickHouse Keeper 中的路径都应该是唯一的。不同分片上的表应该使用不同的路径。
在本例中,路径由以下部分组成:

`/clickhouse/tables/` 是通用前缀。我们建议使用此前缀。

`{shard}` 将扩展为分片标识符。

`table_name` 是表在 ClickHouse Keeper 中的节点名称。建议将其设置为与表名相同。它需要显式定义,因为与表名不同,它在执行 RENAME 查询后不会改变。
_提示_: 您也可以在 `table_name` 前面添加数据库名称。例如 `db_name.table_name`

可以使用两个内置替换变量 `{database}` 和 `{table}`,它们分别扩展为表名和数据库名(除非这些宏在 `macros` 部分中已定义)。因此 zookeeper 路径可以指定为 `'/clickhouse/tables/{shard}/{database}/{table}'`。
使用这些内置替换变量时要注意表重命名操作。ClickHouse Keeper 中的路径无法更改,当表被重命名时,宏将扩展为不同的路径,表将引用 ClickHouse Keeper 中不存在的路径,并进入只读模式。

副本名称用于标识同一表的不同副本。您可以使用服务器名称作为副本名称,如示例所示。该名称只需在每个分片内唯一即可。

您可以显式定义参数而不使用替换变量。这对于测试和配置小型集群可能比较方便。但是,在这种情况下无法使用分布式 DDL 查询(`ON CLUSTER`)。

在使用大型集群时,我们建议使用替换变量,因为它们可以降低出错的可能性。

您可以在服务器配置文件中为 `Replicated` 表引擎指定默认参数。例如:

```xml
<default_replica_path>/clickhouse/tables/{shard}/{database}/{table}</default_replica_path>
<default_replica_name>{replica}</default_replica_name>
```

在这种情况下,创建表时可以省略参数:

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree
ORDER BY x;
```

这等同于:


```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

在每个副本上执行 `CREATE TABLE` 查询。该查询会创建一个新的复制表，或者为现有的复制表添加一个新的副本。

如果在其他副本的表中已经包含数据后再添加新副本，那么在执行查询后，这些数据会从其他副本复制到新的副本上。换句话说，新副本会自动与其他副本同步。

要删除某个副本，请执行 `DROP TABLE`。不过，这只会删除一个副本——也就是你执行该查询所在服务器上的那个副本。


## 故障后恢复 {#recovery-after-failures}

如果服务器启动时 ClickHouse Keeper 不可用,复制表将切换到只读模式。系统会定期尝试连接 ClickHouse Keeper。

如果在执行 `INSERT` 操作期间 ClickHouse Keeper 不可用,或者在与 ClickHouse Keeper 交互时发生错误,系统将抛出异常。

连接到 ClickHouse Keeper 后,系统会检查本地文件系统中的数据集是否与预期的数据集匹配(ClickHouse Keeper 存储此信息)。如果存在轻微的不一致,系统会通过与副本同步数据来解决。

如果系统检测到损坏的数据分区(文件大小错误)或无法识别的分区(已写入文件系统但未在 ClickHouse Keeper 中记录),它会将这些分区移动到 `detached` 子目录(不会删除)。任何缺失的分区都会从副本中复制。

请注意,ClickHouse 不会执行任何破坏性操作,例如自动删除大量数据。

当服务器启动(或与 ClickHouse Keeper 建立新会话)时,它只检查所有文件的数量和大小。如果文件大小匹配但中间某处的字节已被更改,这不会立即被检测到,而只会在尝试通过 `SELECT` 查询读取数据时才会发现。查询会抛出关于校验和不匹配或压缩块大小不匹配的异常。在这种情况下,数据分区会被添加到验证队列中,并在必要时从副本复制。

如果本地数据集与预期数据集差异过大,将触发安全机制。服务器会将此情况记录到日志中并拒绝启动。这是因为这种情况可能表明存在配置错误,例如某个分片上的副本被意外配置成了另一个分片上的副本。然而,此机制的阈值设置得相当低,这种情况可能在正常的故障恢复过程中发生。在这种情况下,数据通过半自动方式恢复 - 即"按下按钮"。

要启动恢复,请在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data` 并填入任意内容,或运行以下命令来恢复所有复制表:

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

然后重启服务器。启动时,服务器会删除这些标志并开始恢复。


## 完全数据丢失后的恢复 {#recovery-after-complete-data-loss}

如果某台服务器上的所有数据和元数据都丢失了,请按照以下步骤进行恢复:

1.  在服务器上安装 ClickHouse。如果使用了分片标识符和副本,请在配置文件中正确定义相应的替换项。
2.  如果您有必须在服务器上手动复制的非复制表,请从副本复制其数据(位于目录 `/var/lib/clickhouse/data/db_name/table_name/` 中)。
3.  从副本复制位于 `/var/lib/clickhouse/metadata/` 中的表定义。如果表定义中明确定义了分片或副本标识符,请将其修正为与当前副本相对应。(或者,启动服务器并执行所有本应位于 `/var/lib/clickhouse/metadata/` 中 .sql 文件内的 `ATTACH TABLE` 查询。)
4.  要开始恢复,请创建包含任意内容的 ClickHouse Keeper 节点 `/path_to_table/replica_name/flags/force_restore_data`,或运行以下命令来恢复所有复制表:`sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

然后启动服务器(如果已在运行则重启)。数据将从副本下载。

另一种恢复方式是从 ClickHouse Keeper 中删除有关丢失副本的信息(`/path_to_table/replica_name`),然后按照"[创建复制表](#creating-replicated-tables)"中的描述重新创建副本。

恢复期间对网络带宽没有限制。如果您同时恢复多个副本,请注意这一点。


## 从 MergeTree 转换为 ReplicatedMergeTree {#converting-from-mergetree-to-replicatedmergetree}

我们使用术语 `MergeTree` 来指代 `MergeTree 系列`中的所有表引擎,`ReplicatedMergeTree` 也是如此。

如果您有一个手动复制的 `MergeTree` 表,可以将其转换为复制表。如果您已经在 `MergeTree` 表中收集了大量数据,现在希望启用复制功能,则可能需要执行此操作。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句允许将已分离的 `MergeTree` 表附加为 `ReplicatedMergeTree`。

如果在表的数据目录(对于 `Atomic` 数据库为 `/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/`)中设置了 `convert_to_replicated` 标志,则 `MergeTree` 表可以在服务器重启时自动转换。
创建一个空的 `convert_to_replicated` 文件,该表将在下次服务器重启时以复制表的形式加载。

此查询可用于获取表的数据路径。如果表有多个数据路径,则必须使用第一个路径。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

请注意,ReplicatedMergeTree 表将使用 `default_replica_path` 和 `default_replica_name` 设置的值创建。
要在其他副本上创建转换后的表,您需要在 `ReplicatedMergeTree` 引擎的第一个参数中显式指定其路径。可以使用以下查询获取其路径。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

还有一种手动方式来执行此操作。

如果各个副本上的数据不同,请首先同步数据,或者删除除一个副本外所有副本上的数据。

重命名现有的 MergeTree 表,然后使用旧名称创建一个 `ReplicatedMergeTree` 表。
将旧表中的数据移动到新表数据目录内的 `detached` 子目录(`/var/lib/clickhouse/data/db_name/table_name/`)中。
然后在其中一个副本上运行 `ALTER TABLE ATTACH PARTITION` 以将这些数据部分添加到工作集中。


## 从 ReplicatedMergeTree 转换为 MergeTree {#converting-from-replicatedmergetree-to-mergetree}

使用 [ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句可在单个服务器上将已分离的 `ReplicatedMergeTree` 表附加为 `MergeTree` 表。

另一种方法需要重启服务器。首先创建一个不同名称的 MergeTree 表,然后将 `ReplicatedMergeTree` 表数据目录中的所有数据移动到新表的数据目录,最后删除 `ReplicatedMergeTree` 表并重启服务器。

如果您想在不启动服务器的情况下移除 `ReplicatedMergeTree` 表:

- 删除元数据目录(`/var/lib/clickhouse/metadata/`)中对应的 `.sql` 文件。
- 删除 ClickHouse Keeper 中对应的路径(`/path_to_table/replica_name`)。

完成上述操作后,您可以启动服务器,创建 `MergeTree` 表,将数据移动到其目录,然后重启服务器。


## 当 ClickHouse Keeper 集群中的元数据丢失或损坏时的恢复 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

如果 ClickHouse Keeper 中的数据丢失或损坏,可以按照上述方法将数据迁移到非复制表以保存数据。

**另请参阅**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)
