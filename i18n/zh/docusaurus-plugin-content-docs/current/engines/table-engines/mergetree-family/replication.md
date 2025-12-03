---
description: '基于 ClickHouse 中 Replicated* 系列表引擎的数据复制概述'
sidebar_label: 'Replicated*'
sidebar_position: 20
slug: /engines/table-engines/mergetree-family/replication
title: 'Replicated* 系列表引擎'
doc_type: 'reference'
---

# Replicated* 表引擎 {#replicated-table-engines}

:::note
在 ClickHouse Cloud 中，复制由系统自动管理。请在创建表时不要添加这些参数。例如，在下面的文本中，你应将其替换为：

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

复制仅支持属于 MergeTree 系列的表：

* ReplicatedMergeTree
* ReplicatedSummingMergeTree
* ReplicatedReplacingMergeTree
* ReplicatedAggregatingMergeTree
* ReplicatedCollapsingMergeTree
* ReplicatedVersionedCollapsingMergeTree
* ReplicatedGraphiteMergeTree

复制在单表级别进行，而不是在整个服务器级别进行。单个服务器可以同时存储已复制表和未复制表。

复制不依赖于分片。每个分片都有自己独立的复制。

`INSERT` 和 `ALTER` 查询的压缩数据会被复制（更多信息，参见 [ALTER](/sql-reference/statements/alter) 文档）。

`CREATE`、`DROP`、`ATTACH`、`DETACH` 和 `RENAME` 查询在单个服务器上执行，不会被复制：

* `CREATE TABLE` 查询会在执行该查询的服务器上创建一个新的可复制表。如果此表已经存在于其他服务器上，它会增加一个新的副本。
* `DROP TABLE` 查询会删除位于执行该查询的服务器上的该副本。
* `RENAME` 查询会在其中一个副本上重命名表。换句话说，复制表在不同副本上可以有不同的名称。

ClickHouse 使用 [ClickHouse Keeper](/guides/sre/keeper/index.md) 来存储副本的元信息。也可以使用 3.4.5 或更新版本的 ZooKeeper，但推荐使用 ClickHouse Keeper。

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

ClickHouse 也支持将副本元数据存储在辅助 ZooKeeper 集群中。可以通过在引擎参数中指定 ZooKeeper 集群名称和路径来实现。
换句话说，它支持将不同表的元数据存储在不同的 ZooKeeper 集群中。

辅助 ZooKeeper 集群地址配置示例：

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

要将表元数据存储在辅助 ZooKeeper 集群而不是默认的 ZooKeeper 集群中，可以使用 SQL 创建基于 ReplicatedMergeTree 引擎的表，如下所示：

```sql
CREATE TABLE table_name ( ... ) ENGINE = ReplicatedMergeTree('zookeeper_name_configured_in_auxiliary_zookeepers:path', 'replica_name') ...
```

你可以指定任意现有的 ZooKeeper 集群，系统会在该集群上使用一个目录来存放自身数据（该目录在创建副本表时指定）。

如果在配置文件中未配置 ZooKeeper，你将无法创建副本表，且任何已有的副本表都将变为只读。


ZooKeeper 不参与 `SELECT` 查询，因为复制不会影响 `SELECT` 的性能，查询速度与非复制表一样快。对于分布式复制表的查询，ClickHouse 的行为由 [max_replica_delay_for_distributed_queries](/operations/settings/settings.md/#max_replica_delay_for_distributed_queries) 和 [fallback_to_stale_replicas_for_distributed_queries](/operations/settings/settings.md/#fallback_to_stale_replicas_for_distributed_queries) 这两个设置控制。

对于每个 `INSERT` 查询，会通过若干事务向 ZooKeeper 添加大约十条记录。（更精确地说，这是针对每个被插入的数据块；一个 INSERT 查询包含一个数据块，或者每 `max_insert_block_size = 1048576` 行一个数据块。）这会导致 `INSERT` 相比非复制表有略高的延迟。但如果遵循建议，以每秒不超过一个 `INSERT` 的批量方式插入数据，就不会产生任何问题。一个用于协调单个 ZooKeeper 集群的整个 ClickHouse 集群，总共每秒可处理数百个 `INSERT`。数据插入的吞吐量（每秒行数）与非复制数据一样高。

对于非常大的集群，可以为不同的分片使用不同的 ZooKeeper 集群。不过根据我们的经验，在大约 300 台服务器的生产集群中，还没有发现这种做法是必要的。

复制是异步的，并且是多主（multi-master）。`INSERT` 查询（以及 `ALTER`）可以发送到任何可用服务器。数据会先插入到执行查询的服务器上，然后再复制到其他服务器。由于复制是异步的，新插入的数据会在一定延迟后才出现在其他副本上。如果部分副本不可用，则当这些副本重新可用时数据才会被写入。如果某个副本是可用的，延迟就是在网络上传输压缩数据块所需的时间。用于处理复制表后台任务的线程数量可以通过 [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size) 这个设置来配置。

`ReplicatedMergeTree` 引擎使用单独的线程池来处理复制数据拉取（replicated fetches）。该线程池的大小由 [background_fetches_pool_size](/operations/server-configuration-parameters/settings#background_fetches_pool_size) 设置限制，并且可以在重启服务器时进行调整。

默认情况下，INSERT 查询只等待来自一个副本的数据写入确认。如果数据仅成功写入一个副本，而该副本所在的服务器随之完全宕机，则已存储的数据会丢失。要启用从多个副本获取写入确认的能力，请使用 `insert_quorum` 选项。

每个数据块的写入是原子的。INSERT 查询会被拆分为最多 `max_insert_block_size = 1048576` 行的数据块。换句话说，如果 `INSERT` 查询中少于 1048576 行，则整个查询是以原子方式完成的。

数据块会被去重。对于多次写入同一个数据块（具有相同大小、包含相同行且行顺序相同的数据块），该数据块只会被写入一次。这样设计的原因在于，网络故障时客户端应用可能不知道数据是否已写入数据库，因此可以直接重试 `INSERT` 查询。对于包含相同数据的 INSERT 来说，它被发送到了哪个副本并不重要。`INSERT` 操作是幂等的。去重参数由 [merge_tree](/operations/server-configuration-parameters/settings.md/#merge_tree) 服务器设置控制。

在复制过程中，只有要插入的源数据会通过网络传输。后续的数据转换（合并）会在所有副本上以相同方式进行协调并执行。这样可以最大限度地减少网络使用量，这意味着当副本位于不同数据中心时，复制依然工作良好。（注意，将数据复制到不同数据中心是复制的主要目标。）

同一份数据可以拥有任意数量的副本。根据我们的经验，在生产环境中，一个相对可靠且易于运维的方案是使用双副本（double replication），并在每台服务器上使用 RAID-5 或 RAID-6（在某些情况下使用 RAID-10）。

系统会监控副本上的数据同步情况，并且能够在故障后恢复。对于数据差异较小的情况，故障转移是自动完成的；对于数据差异过大的情况（可能表明存在配置错误），故障转移是半自动完成的。

## 创建复制表 {#creating-replicated-tables}

:::note
在 ClickHouse Cloud 中，复制由系统自动处理。

使用不带复制参数的 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 创建表。系统会在内部将 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 重写为用于复制和数据分布的 [`SharedMergeTree`](/cloud/reference/shared-merge-tree)。

请避免使用 `ReplicatedMergeTree` 或指定复制参数，因为复制由平台统一管理。

:::

### Replicated*MergeTree 参数 {#replicatedmergetree-parameters}

| 参数                 | 描述                                                 |
| ------------------ | -------------------------------------------------- |
| `zoo_path`         | ClickHouse Keeper 中该表的路径。                          |
| `replica_name`     | ClickHouse Keeper 中的副本名称。                          |
| `other_parameters` | 用于创建该副本引擎版本的参数，例如 `ReplacingMergeTree` 中的 version。 |

示例：

```sql
CREATE TABLE table_name
(
    EventDate DateTime,
    CounterID UInt32,
    UserID UInt32,
    ver UInt16
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{layer}-{shard}/table_name', '{replica}', ver)
PARTITION BY toYYYYMM(EventDate)
ORDER BY (CounterID, EventDate, intHash32(UserID))
SAMPLE BY intHash32(UserID);
```

<details markdown="1">
  <summary>已弃用语法示例</summary>

  ```sql
  CREATE TABLE table_name
  (
      EventDate DateTime,
      CounterID UInt32,
      UserID UInt32
  ) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/table_name', '{replica}', EventDate, intHash32(UserID), (CounterID, EventDate, intHash32(UserID), EventTime), 8192);
  ```
</details>

如该示例所示，这些参数可以在花括号中包含可替换的占位符。替换后的值取自配置文件的 [macros](/operations/server-configuration-parameters/settings.md/#macros) 部分。

示例：

```xml
<macros>
    <shard>02</shard>
    <replica>example05-02-1</replica>
</macros>
```

在 ClickHouse Keeper 中，指向表的路径对于每个 Replicated 表都必须是唯一的。不同分片上的表应使用不同的路径。
在本例中，路径由以下部分组成：

`/clickhouse/tables/` 是公共前缀。建议原样使用该前缀。

`{shard}` 将被展开为分片标识符。

`table_name` 是该表在 ClickHouse Keeper 中对应节点的名称。通常将其设置为与表名相同是个好主意。之所以要显式定义，是因为与表名不同的是，它在执行 RENAME 查询后不会改变。
*提示*：也可以在 `table_name` 前加上数据库名，例如 `db_name.table_name`。

可以使用两个内置替换 `{database}` 和 `{table}`，它们分别展开为表名和数据库名（除非在 `macros` 部分中定义了这些宏）。因此，ZooKeeper 路径可以指定为 `'/clickhouse/tables/{shard}/{database}/{table}'`。
在使用这些内置替换时，请谨慎处理表重命名。ClickHouse Keeper 中的路径无法更改，当表被重命名后，宏会展开为不同的路径，表将指向 ClickHouse Keeper 中不存在的路径，并进入只读模式。

副本名称用于标识同一张表的不同副本。可以像示例中那样使用服务器名。该名称只需要在每个分片内保持唯一即可。

可以显式定义这些参数，而不是使用替换。这在测试以及配置小型集群时可能更为方便。但是，在这种情况下将无法使用分布式 DDL 查询（`ON CLUSTER`）。

在处理大型集群时，建议使用替换，因为它们可以降低出错概率。

可以在服务器配置文件中为 `Replicated` 表引擎指定默认参数。例如：

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

它等同于：

```sql
CREATE TABLE table_name (
    x UInt32
) ENGINE = ReplicatedMergeTree('/clickhouse/tables/{shard}/{database}/table_name', '{replica}')
ORDER BY x;
```

在每个副本上运行 `CREATE TABLE` 查询。此查询会创建一个新的复制表，或者将一个新的副本添加到现有表中。

如果是在其他副本上已经存在部分数据之后才添加新的副本，那么在运行该查询后，数据会从其他副本复制到新的副本。换句话说，新副本会与其他副本进行同步。

要删除一个副本，请运行 `DROP TABLE`。但这只会删除一个副本——也就是你运行该查询所在服务器上的那个副本。


## 故障后的恢复 {#recovery-after-failures}

如果在服务器启动时 ClickHouse Keeper 不可用，复制表会切换为只读模式。系统会定期尝试连接 ClickHouse Keeper。

如果在执行 `INSERT` 期间 ClickHouse Keeper 不可用，或者在与 ClickHouse Keeper 交互时发生错误，系统会抛出异常。

连接到 ClickHouse Keeper 之后，系统会检查本地文件系统中的数据集是否与预期的数据集匹配（ClickHouse Keeper 中保存了这些信息）。如果存在轻微不一致，系统会通过与副本同步数据来解决。

如果系统检测到损坏的数据分区片段（文件大小错误）或无法识别的分区片段（已写入文件系统但未在 ClickHouse Keeper 中记录的分区片段），则会将它们移动到 `detached` 子目录中（不会被删除）。任何缺失的分区片段都会从副本中复制。

请注意，ClickHouse 不会执行任何破坏性操作，例如自动删除大量数据。

在服务器启动时（或与 ClickHouse Keeper 建立新会话时），系统只会检查所有文件的数量和大小。如果文件大小匹配，但中间某处的字节发生了更改，则不会立刻被检测到，只有在尝试为 `SELECT` 查询读取数据时才会发现。此时查询会抛出关于校验和不匹配或压缩块大小不匹配的异常。在这种情况下，数据分区片段会被加入验证队列，并在必要时从副本中复制。

如果本地数据集与预期的数据集差异过大，会触发安全机制。服务器会将此写入日志，并拒绝启动。原因是这种情况可能表明存在配置错误，例如某个分片上的副本被误配置为另一个分片上的副本。然而，该机制的阈值设置得相当低，这种情况也可能在正常的故障恢复过程中出现。在这种情况下，数据会通过“按下一个按钮”的方式进行半自动恢复。

要开始恢复，请在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data`（内容任意），或者运行命令以恢复所有复制表：

```bash
sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data
```

随后重启服务器。服务器在启动时会删除这些标志文件并开始恢复。


## 完全数据丢失后的恢复 {#recovery-after-complete-data-loss}

如果某台服务器上的所有数据和元数据都丢失了，请按以下步骤进行恢复：

1.  在该服务器上安装 ClickHouse。在包含分片标识符和副本信息（如使用副本）的配置文件中正确配置 substitutions。
2.  如果有需要在服务器上手动复制的非复制表（unreplicated tables），请从副本中拷贝其数据（目录 `/var/lib/clickhouse/data/db_name/table_name/`）。
3.  从副本中拷贝位于 `/var/lib/clickhouse/metadata/` 的表定义。如果在表定义中显式定义了分片或副本标识符，请更正为与此副本相对应。（或者，启动服务器并执行所有本应位于 `/var/lib/clickhouse/metadata/` 目录下 .sql 文件中的 `ATTACH TABLE` 查询。）
4.  要开始恢复，请在 ClickHouse Keeper 中创建节点 `/path_to_table/replica_name/flags/force_restore_data`（内容任意），或者运行命令以恢复所有复制表：`sudo -u clickhouse touch /var/lib/clickhouse/flags/force_restore_data`

然后启动服务器（如果已经在运行，则重启）。数据会从其他副本中下载。

另一种恢复方式是从 ClickHouse Keeper 中删除与丢失副本相关的信息（`/path_to_table/replica_name`），然后按照“[创建复制表](#creating-replicated-tables)”中的说明重新创建该副本。

恢复过程中对网络带宽没有限制。如果你同时恢复大量副本，请注意这一点。

## 从 MergeTree 转换为 ReplicatedMergeTree {#converting-from-mergetree-to-replicatedmergetree}

我们使用术语 `MergeTree` 指代 `MergeTree family` 中的所有表引擎，对 `ReplicatedMergeTree` 也采用相同的约定。

如果有一个通过手动方式进行复制的 `MergeTree` 表，可以将其转换为复制表。如果已经在某个 `MergeTree` 表中累积了大量数据，并且现在希望启用复制功能，则可能需要这样做。

[ATTACH TABLE ... AS REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句允许将已分离的 `MergeTree` 表附加为 `ReplicatedMergeTree`。

如果在表的数据目录（对于 `Atomic` 数据库为 `/store/xxx/xxxyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy/`）下设置了 `convert_to_replicated` 标记，则在服务器重启时可以自动将 `MergeTree` 表转换为复制表。
创建一个空的 `convert_to_replicated` 文件，下一次服务器重启时，该表将作为复制表加载。

可以使用以下查询获取表的数据路径。如果表有多个数据路径，则必须使用第一个。

```sql
SELECT data_paths FROM system.tables WHERE table = 'table_name' AND database = 'database_name';
```

请注意，ReplicatedMergeTree 表将会使用 `default_replica_path` 和 `default_replica_name` 设置的值来创建。
要在其他副本上创建转换后的表，需要在 `ReplicatedMergeTree` 引擎的第一个参数中显式指定其路径。可以使用以下查询来获取该路径。

```sql
SELECT zookeeper_path FROM system.replicas WHERE table = 'table_name';
```

还有一种手动方式可以实现此操作。

如果各个副本上的数据不一致，请先对其进行同步，或者在除一个副本外的所有副本上删除这些数据。

先重命名现有的 MergeTree 表，然后使用旧表名创建一个 `ReplicatedMergeTree` 表。
将旧表中的数据移动到新表数据目录下的 `detached` 子目录中（`/var/lib/clickhouse/data/db_name/table_name/`）。
然后在其中一个副本上运行 `ALTER TABLE ATTACH PARTITION`，将这些分区片段添加到正在使用的工作集中。


## 从 ReplicatedMergeTree 转换为 MergeTree {#converting-from-replicatedmergetree-to-mergetree}

使用 [ATTACH TABLE ... AS NOT REPLICATED](/sql-reference/statements/attach.md#attach-mergetree-table-as-replicatedmergetree) 语句，在单个服务器上将已分离的 `ReplicatedMergeTree` 表作为 `MergeTree` 表附加。

另一种做法需要重启服务器。先创建一个名称不同的 MergeTree 表。将 `ReplicatedMergeTree` 表数据目录中的所有数据移动到新表的数据目录中。然后删除 `ReplicatedMergeTree` 表并重启服务器。

如果希望在不启动服务器的情况下移除 `ReplicatedMergeTree` 表：

- 删除元数据目录（`/var/lib/clickhouse/metadata/`）中对应的 `.sql` 文件。
- 删除 ClickHouse Keeper 中相应的路径（`/path_to_table/replica_name`）。

完成上述操作后，可以启动服务器，创建一个 `MergeTree` 表，将数据移动到该表的数据目录中，然后重启服务器。

## 当 ClickHouse Keeper 集群中的元数据丢失或损坏时的恢复 {#recovery-when-metadata-in-the-zookeeper-cluster-is-lost-or-damaged}

如果 ClickHouse Keeper 中的数据丢失或损坏，可以按照上文所述，将数据迁移到未复制表中以进行保存。

**另请参阅**

- [background_schedule_pool_size](/operations/server-configuration-parameters/settings.md/#background_schedule_pool_size)
- [background_fetches_pool_size](/operations/server-configuration-parameters/settings.md/#background_fetches_pool_size)
- [execute_merges_on_single_replica_time_threshold](/operations/settings/merge-tree-settings#execute_merges_on_single_replica_time_threshold)
- [max_replicated_fetches_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_fetches_network_bandwidth)
- [max_replicated_sends_network_bandwidth](/operations/settings/merge-tree-settings.md/#max_replicated_sends_network_bandwidth)