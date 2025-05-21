---
'slug': '/cloud/reference/shared-merge-tree'
'sidebar_label': '共享MergeTree'
'title': '共享MergeTree'
'keywords':
- 'SharedMergeTree'
'description': '描述了共享MergeTree表引擎'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';


# SharedMergeTree 表引擎

*\* 专为 ClickHouse Cloud（及第一方合作伙伴云服务）提供*

SharedMergeTree 表引擎系列是 ReplicatedMergeTree 引擎的云原生替代品，优化为可在共享存储（如 Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）之上运行。每种特定的 MergeTree 引擎类型都有一个 SharedMergeTree 类似物，例如 ReplacingSharedMergeTree 替代 ReplacingReplicatedMergeTree。

SharedMergeTree 表引擎系列为 ClickHouse Cloud 提供支持。对于最终用户而言，开始使用 SharedMergeTree 引擎系列而不需要改变任何东西，就可以替代基于 ReplicatedMergeTree 的引擎。它提供以下额外的好处：

- 更高的插入吞吐量
- 更好的后台合并吞吐量
- 更好的变更吞吐量
- 更快的扩展和缩减操作
- 对于选择查询，更轻量级的强一致性

SharedMergeTree 带来的显著改进是，相比于 ReplicatedMergeTree，它提供了更深层次的计算与存储分离。你可以在下方看到 ReplicatedMergeTree 如何分离计算和存储：

<Image img={shared_merge_tree} alt="ReplicatedMergeTree 图示" size="md"  />

如你所见，尽管存储在 ReplicatedMergeTree 中的数据在对象存储中，元数据仍然保留在每个 clickhouse-servers 上。这意味着每个复制操作都需要在所有副本上复制元数据。

<Image img={shared_merge_tree_2} alt="带有元数据的 ReplicatedMergeTree 图示" size="md"  />

与 ReplicatedMergeTree 不同，SharedMergeTree 不要求副本之间进行通信。相反，所有通信通过共享存储和 clickhouse-keeper 进行。SharedMergeTree 实现了异步无领导复制，并使用 clickhouse-keeper 进行协调和元数据存储。这意味着元数据在服务扩展和缩减时不需要被复制。这导致了更快的复制、变更、合并和扩展操作。SharedMergeTree 允许每个表拥有数百个副本，使其可以在不使用分片的情况下动态扩展。ClickHouse Cloud 中使用了分布式查询执行方法，以利用更多计算资源来处理查询。

## 反向分析 {#introspection}

大多数用于 ReplicatedMergeTree 反向分析的系统表在 SharedMergeTree 中也存在，除了 `system.replication_queue` 和 `system.replicated_fetches`，因为没有数据和元数据的复制。然而，SharedMergeTree 对这两个表有相应的替代方案。

**system.virtual_parts**

此表作为 SharedMergeTree 的 `system.replication_queue` 的替代。它存储有关最新当前部分的信息，以及正在进行的未来部分，例如合并、变更和已删除分区的信息。

**system.shared_merge_tree_fetches**

此表是 SharedMergeTree 的 `system.replicated_fetches` 的替代。它包含有关当前正在进行的主键和校验和提取到内存的信息。

## 启用 SharedMergeTree {#enabling-sharedmergetree}

默认情况下，`SharedMergeTree` 是启用状态。

对于支持 SharedMergeTree 表引擎的服务，你不需要手动启用任何东西。你可以以与之前相同的方式创建表，它将自动使用与你在 CREATE TABLE 查询中指定的引擎对应的基于 SharedMergeTree 的表引擎。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

这将使用 SharedMergeTree 表引擎创建表 `my_table`。

你不需要在 ClickHouse Cloud 中指定 `ENGINE=MergeTree`，因为 `default_table_engine=MergeTree`。以下查询与上述查询是相同的。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

如果你使用 Replacing、Collapsing、Aggregating、Summing、VersionedCollapsing 或 Graphite MergeTree 表，则会自动转换为相应的基于 SharedMergeTree 的表引擎。

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

对于给定的表，你可以使用 `SHOW CREATE TABLE` 查询查看使用了哪个表引擎来创建表：
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

- `insert_quorum` -- 所有插入到 SharedMergeTree 的操作都是法定插入（写入共享存储），因此使用 SharedMergeTree 表引擎时不需要此设置。
- `insert_quorum_parallel` -- 所有插入到 SharedMergeTree 的操作都是法定插入（写入共享存储），因此使用 SharedMergeTree 表引擎时不需要此设置。
- `select_sequential_consistency` -- 不需要法定插入，将对 `SELECT` 查询触发额外的负载到 clickhouse-keeper。

## 一致性 {#consistency}

SharedMergeTree 提供比 ReplicatedMergeTree 更好的轻量级一致性。在插入到 SharedMergeTree 时，你不需要提供诸如 `insert_quorum` 或 `insert_quorum_parallel` 之类的设置。插入是法定插入，意味着元数据将存储在 ClickHouse-Keeper 中，且该元数据被复制到至少一组 ClickHouse-Keeper 的法定数量。你的集群中的每个副本将异步从 ClickHouse-Keeper 获取新信息。

大多数情况下，你不应该使用 `select_sequential_consistency` 或 `SYSTEM SYNC REPLICA LIGHTWEIGHT`。异步复制应该覆盖大多数场景，并且延迟非常低。在极少数情况下，如果你绝对需要防止过时读取，请按优先级顺序遵循以下建议：

1. 如果你在同一会话或同一节点中执行读写查询，使用 `select_sequential_consistency` 是不必要的，因为你的副本将已经拥有最新的元数据。

2. 如果你对一个副本进行写入并从另一个副本读取，你可以使用 `SYSTEM SYNC REPLICA LIGHTWEIGHT` 强制副本从 ClickHouse-Keeper 获取元数据。

3. 使用 `select_sequential_consistency` 作为查询的一部分设置。

## 相关内容 {#related-content}

- [ClickHouse Cloud 通过 SharedMergeTree 和轻量级更新提升性能](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
