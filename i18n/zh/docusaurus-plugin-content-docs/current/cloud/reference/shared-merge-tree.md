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

*\* 仅在 ClickHouse Cloud（和第一方合作云服务）中提供*

SharedMergeTree 表引擎系列是 ReplicatedMergeTree 引擎的云原生替代品，优化为在共享存储（例如 Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）上工作。每种特定的 MergeTree 引擎类型都有一个 SharedMergeTree 的对应版本，即 ReplacingSharedMergeTree 替代了 ReplacingReplicatedMergeTree。

SharedMergeTree 表引擎系列为 ClickHouse Cloud 提供支持。对于最终用户来说，使用 SharedMergeTree 引擎系列代替基于 ReplicatedMergeTree 的引擎，不需要进行任何更改。它提供了以下附加好处：

- 更高的插入吞吐量
- 改进的后台合并吞吐量
- 改进的变更吞吐量
- 更快速的扩展和缩减操作
- 对选择查询更轻量级的强一致性

SharedMergeTree 带来的一项显著改进是，它提供了比 ReplicatedMergeTree 更深的计算与存储分离。您可以看到下图展示了 ReplicatedMergeTree 如何分离计算与存储：

<Image img={shared_merge_tree} alt="ReplicatedMergeTree Diagram" size="md"  />

如您所见，虽然存储在 ReplicatedMergeTree 中的数据位于对象存储中，元数据仍然保留在每个 clickhouse-servers 上。这意味着对于每个复制操作，元数据也需要在所有副本上进行复制。

<Image img={shared_merge_tree_2} alt="ReplicatedMergeTree Diagram with Metadata" size="md"  />

与 ReplicatedMergeTree 不同，SharedMergeTree 不需要副本之间进行通信。相反，所有通信通过共享存储和 clickhouse-keeper 进行。SharedMergeTree 实现了异步的无领导复制，并使用 clickhouse-keeper 进行协调和元数据存储。这意味着随着服务的扩展和缩减，元数据不需要被复制。这导致更快的复制、变更、合并和扩展操作。SharedMergeTree 允许每个表有数百个副本，使得在不使用分片的情况下可以动态扩展。ClickHouse Cloud 采用分布式查询执行的方法来利用更多的计算资源进行查询。

## 反向分析 {#introspection}

大多数用于 ReplicatedMergeTree 的系统表在 SharedMergeTree 中也是存在的，除了 `system.replication_queue` 和 `system.replicated_fetches`，因为数据和元数据没有进行复制。然而，SharedMergeTree 有这两个表的对应替代。

**system.virtual_parts**

该表作为 SharedMergeTree 的 `system.replication_queue` 替代。它存储有关最新当前分片的集合的信息，以及正在进行的未来分片信息，例如合并、变更和已删除分区。

**system.shared_merge_tree_fetches**

该表是 SharedMergeTree 的 `system.replicated_fetches` 替代。它包含关于当前进行中的主键和校验和加载到内存的信息。

## 启用 SharedMergeTree {#enabling-sharedmergetree}

`SharedMergeTree` 默认启用。

对于支持 SharedMergeTree 表引擎的服务，您不需要手动启用任何内容。您可以与之前相同的方式创建表，它将自动使用与您在 CREATE TABLE 查询中指定的引擎相对应的基于 SharedMergeTree 的表引擎。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

这将使用 SharedMergeTree 表引擎创建表 `my_table`。

您不需要指定 `ENGINE=MergeTree`，因为在 ClickHouse Cloud 中 `default_table_engine=MergeTree`。以下查询与上述查询相同。

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

对于给定的表，您可以使用 `SHOW CREATE TABLE` 语句检查所使用的表引擎：
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

- `insert_quorum` -- 所有插入到 SharedMergeTree 的操作都是 quorum 插入（写入到共享存储），因此在使用 SharedMergeTree 表引擎时不需要此设置。
- `insert_quorum_parallel` -- 所有插入到 SharedMergeTree 的操作都是 quorum 插入（写入到共享存储），因此在使用 SharedMergeTree 表引擎时不需要此设置。
- `select_sequential_consistency` -- 不需要 quorum 插入，在 `SELECT` 查询时会对 clickhouse-keeper 触发额外负载。

## 一致性 {#consistency}

SharedMergeTree 相比 ReplicatedMergeTree 提供了更好的轻量级一致性。在插入到 SharedMergeTree 时，您不需要提供如 `insert_quorum` 或 `insert_quorum_parallel` 这样的设置。插入是 quorum 插入，这意味着元数据将存储在 ClickHouse-Keeper 中，元数据被复制到至少一个 quorum 的 ClickHouse-keeper。您集群中的每个副本将异步从 ClickHouse-Keeper 获取新信息。

大多数时候，您不应使用 `select_sequential_consistency` 或 `SYSTEM SYNC REPLICA LIGHTWEIGHT`。异步复制应涵盖大多数场景，并具有非常低的延迟。在极少情况下，如果您绝对需要防止陈旧读取，请按优先顺序遵循以下建议：

1. 如果您在同一会话或同一节点执行读取和写入查询，则无需使用 `select_sequential_consistency`，因为您的副本已经拥有最新的元数据。

2. 如果您写入一个副本并从另一个副本读取，您可以使用 `SYSTEM SYNC REPLICA LIGHTWEIGHT` 强制副本从 ClickHouse-Keeper 获取元数据。

3. 在查询中将 `select_sequential_consistency` 作为设置使用。

## 相关内容 {#related-content}

- [ClickHouse Cloud 通过 SharedMergeTree 和轻量级更新提升性能](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
