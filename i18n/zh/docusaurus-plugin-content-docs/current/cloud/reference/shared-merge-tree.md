---
'slug': '/cloud/reference/shared-merge-tree'
'sidebar_label': 'SharedMergeTree'
'title': 'SharedMergeTree'
'keywords':
- 'SharedMergeTree'
'description': '描述 SharedMergeTree 表引擎'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';


# SharedMergeTree 表引擎

* ** 仅在 ClickHouse Cloud（和第一方合作伙伴云服务）中提供 **

SharedMergeTree 表引擎家族是 ReplicatedMergeTree 引擎的云原生替代品，经过优化以在共享存储（例如 Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）上工作。每种特定的 MergeTree 引擎类型都有一个 SharedMergeTree 的对应类型，即 ReplacingSharedMergeTree 替代 ReplacingReplicatedMergeTree。

SharedMergeTree 表引擎家族支撑 ClickHouse Cloud。对于最终用户，使用 SharedMergeTree 引擎家族代替基于 ReplicatedMergeTree 的引擎无须进行任何更改。它提供以下额外好处：

- 更高的插入吞吐量
- 背景合并的吞吐量提升
- 突变的吞吐量提升
- 更快的扩展和缩减操作
- 对选择查询的更轻量级强一致性

SharedMergeTree 带来的一个显著改进是，与 ReplicatedMergeTree 相比，它提供了更深的计算和存储分离。您可以在下面看到 ReplicatedMergeTree 如何分离计算和存储：

<Image img={shared_merge_tree} alt="ReplicatedMergeTree Diagram" size="md"  />

正如您所看到的，尽管存储在 ReplicatedMergeTree 中的数据在对象存储中，元数据仍驻留在每个 clickhouse-servers 上。这意味着对于每个复制操作，元数据也需要在所有副本上进行复制。

<Image img={shared_merge_tree_2} alt="ReplicatedMergeTree Diagram with Metadata" size="md"  />

与 ReplicatedMergeTree 不同，SharedMergeTree 不需要副本之间进行通信。相反，所有通信通过共享存储和 clickhouse-keeper 进行。SharedMergeTree 实现了异步无领导复制，并使用 clickhouse-keeper 进行协调和元数据存储。这意味着随着服务的扩展和缩减，元数据无需被复制。这导致更快的复制、突变、合并和扩展操作。SharedMergeTree 允许每个表有数百个副本，使其能够在没有分片的情况下动态扩展。ClickHouse Cloud 使用分布式查询执行方法来利用更多的计算资源进行查询。

## 内省 {#introspection}

大多数用于 ReplicatedMergeTree 的系统表在 SharedMergeTree 中都存在，除了 `system.replication_queue` 和 `system.replicated_fetches` 因为没有数据和元数据的复制发生。然而，SharedMergeTree 具有这两个表的相应替代项。

**system.virtual_parts**

该表作为 SharedMergeTree 的 `system.replication_queue` 的替代。它存储有关最新一组当前部分的信息，以及正在进行中的未来部分，例如合并、突变和删除的分区。

**system.shared_merge_tree_fetches**

该表是 SharedMergeTree 的 `system.replicated_fetches` 的替代。它包含有关主键和校验和当前进行中的提取到内存的信息。

## 启用 SharedMergeTree {#enabling-sharedmergetree}

`SharedMergeTree` 默认启用。

对于支持 SharedMergeTree 表引擎的服务，您无需手动启用任何东西。您可以按照以前的方式创建表，它会自动使用与您在 CREATE TABLE 查询中指定的引擎相对应的基于 SharedMergeTree 的表引擎。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

这将使用 SharedMergeTree 表引擎创建表 `my_table`。

在 ClickHouse Cloud 中，您不需要指定 `ENGINE=MergeTree`，因为 `default_table_engine=MergeTree`。以下查询与上述查询是相同的。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

如果您使用 Replacing、Collapsing、Aggregating、Summing、VersionedCollapsing 或 Graphite MergeTree 表，它将自动转换为相应的基于 SharedMergeTree 的表引擎。

```sql
CREATE TABLE myFirstReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime
)
ENGINE = ReplacingMergeTree
ORDER BY key;
```

对于给定的表，您可以使用 `SHOW CREATE TABLE` 检查使用的表引擎：
```sql
SHOW CREATE TABLE myFirstReplacingMT;
```

```sql
CREATE TABLE default.myFirstReplacingMT
( `key` Int64, `someCol` String, `eventTime` DateTime )
ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY key
```

## 设置 {#settings}

某些设置的行为发生了显著变化：

- `insert_quorum` - 所有对 SharedMergeTree 的插入都是法定插入（写入共享存储），因此在使用 SharedMergeTree 表引擎时不需要此设置。
- `insert_quorum_parallel` - 所有对 SharedMergeTree 的插入都是法定插入（写入共享存储），因此在使用 SharedMergeTree 表引擎时不需要此设置。
- `select_sequential_consistency` - 不需要法定插入，将在 `SELECT` 查询时触发对 clickhouse-keeper 的额外负载。

## 一致性 {#consistency}

SharedMergeTree 提供比 ReplicatedMergeTree 更好的轻量级一致性。插入 SharedMergeTree 时，您无需提供诸如 `insert_quorum` 或 `insert_quorum_parallel` 的设置。插入就是法定插入，这意味着元数据将存储在 ClickHouse-Keeper 中，且元数据会复制到至少法定数量的 ClickHouse-Keeper。集群中的每个副本将异步从 ClickHouse-Keeper 获取新信息。

大多数情况下，您不应使用 `select_sequential_consistency` 或 `SYSTEM SYNC REPLICA LIGHTWEIGHT`。异步复制应该涵盖大多数场景，并且延迟非常低。在极少数情况下，如果您确实需要防止过时的读取，请按以下优先顺序遵循这些建议：

1. 如果您在同一会话或同一节点中执行读取和写入查询，则不需要使用 `select_sequential_consistency`，因为您的副本将已经拥有最新的元数据。

2. 如果您在一个副本中写入并在另一个副本中读取，您可以使用 `SYSTEM SYNC REPLICA LIGHTWEIGHT` 来强制副本从 ClickHouse-Keeper 获取元数据。

3. 将 `select_sequential_consistency` 用作查询的一部分。
