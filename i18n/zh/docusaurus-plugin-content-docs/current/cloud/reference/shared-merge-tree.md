slug: /cloud/reference/shared-merge-tree
sidebar_label: SharedMergeTree
title: 'SharedMergeTree'
keywords: ['shared merge tree', 'SharedMergeTree engine']
description: 'SharedMergeTree 引擎，专为云环境优化，提供更高的插入吞吐量和更好的存储计算分离。'
```

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';


# SharedMergeTree 表引擎

*\* 仅在 ClickHouse Cloud（及第一方合作伙伴云服务）中可用*

SharedMergeTree 表引擎系列是 ReplicatedMergeTree 引擎的云原生替代品，经过优化以在共享存储（例如 Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）之上运行。每种特定的 MergeTree 引擎类型都有类似的 SharedMergeTree，例如，ReplacingSharedMergeTree 替代 ReplacingReplicatedMergeTree。

SharedMergeTree 表引擎系列为 ClickHouse Cloud 提供支持。对于最终用户而言，开始使用 SharedMergeTree 引擎系列而不是基于 ReplicatedMergeTree 的引擎不需要进行任何更改。它提供以下额外优点：

- 更高的插入吞吐量
- 改善的后台合并吞吐量
- 改善的变更吞吐量
- 更快的扩展和缩减操作
- 对选择查询而言更轻量的强一致性

SharedMergeTree 带来的一个显著改进是，它提供了比 ReplicatedMergeTree 更深层次的计算和存储分离。您可以在下方看到 ReplicatedMergeTree 如何分离计算和存储：

<img alt="ReplicatedMergeTree Diagram"
  src={shared_merge_tree} />

如您所见，尽管存储在 ReplicatedMergeTree 中的数据位于对象存储中，但元数据仍然驻留在每个 clickhouse-servers 上。这意味着对于每一个复制操作，元数据也需要在所有副本上进行复制。

<img alt="ReplicatedMergeTree Diagram with Metadata"
  src={shared_merge_tree_2} />

与 ReplicatedMergeTree 不同，SharedMergeTree 不需要副本之间进行通信。相反，所有通信通过共享存储和 clickhouse-keeper 进行。SharedMergeTree 实现了异步无领导复制，并使用 clickhouse-keeper 进行协调和元数据存储。这意味着随着您的服务的扩展和缩减，元数据不需要被复制。这导致更快的复制、变更、合并和扩展操作。SharedMergeTree 允许每个表有数百个副本，使得可以在没有分片的情况下动态扩展。ClickHouse Cloud 使用分布式查询执行方法来利用更多计算资源进行查询。

## 自省 {#introspection}

用于自省 ReplicatedMergeTree 的大多数系统表对于 SharedMergeTree 也是存在的，除了 `system.replication_queue` 和 `system.replicated_fetches`，因为没有数据和元数据的复制发生。然而，SharedMergeTree 针对这两个表具有相应的替代。

**system.virtual_parts**

该表作为 SharedMergeTree 的 `system.replication_queue` 的替代。它存储有关当前最近的一组部分的信息，以及正在进行的未来部分，例如合并、变更和丢弃的分区。

**system.shared_merge_tree_fetches**

该表是 SharedMergeTree 的 `system.replicated_fetches` 的替代。它包含有关当前正在进行的主键和校验和取回到内存的信息。

## 启用 SharedMergeTree {#enabling-sharedmergetree}

`SharedMergeTree` 默认启用。

对于支持 SharedMergeTree 表引擎的服务，您无需手动启用任何东西。您可以使用与之前相同的方式创建表，它将自动使用与您在 CREATE TABLE 查询中指定的引擎对应的基于 SharedMergeTree 的表引擎。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

这将使用 SharedMergeTree 表引擎创建表 `my_table`。

您无需在 ClickHouse Cloud 中指定 `ENGINE=MergeTree`，因为 `default_table_engine=MergeTree`。以下查询与上述查询相同。

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

对于给定的表，您可以使用 `SHOW CREATE TABLE` 查看使用的表引擎：

``` sql
SHOW CREATE TABLE myFirstReplacingMT;
```

```sql
CREATE TABLE default.myFirstReplacingMT
( `key` Int64, `someCol` String, `eventTime` DateTime )
ENGINE = SharedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}', '{replica}')
ORDER BY key
SETTINGS index_granularity = 8192
```

## 设置 {#settings}

一些设置的行为发生了显著变化：

- `insert_quorum` -- 所有插入 SharedMergeTree 的操作都是法定插入（写入共享存储），因此在使用 SharedMergeTree 表引擎时不需要此设置。
- `insert_quorum_parallel` -- 所有插入 SharedMergeTree 的操作都是法定插入（写入共享存储），因此在使用 SharedMergeTree 表引擎时不需要此设置。
- `select_sequential_consistency` -- 不需要法定插入，将在 `SELECT` 查询时对 clickhouse-keeper 触发额外负载。

## 一致性 {#consistency}

SharedMergeTree 提供比 ReplicatedMergeTree 更好的轻量级一致性。当插入到 SharedMergeTree 时，您无需提供诸如 `insert_quorum` 或 `insert_quorum_parallel` 的设置。插入是法定插入，这意味着元数据将存储在 ClickHouse-Keeper 中，并且元数据将复制到至少法定数量的 ClickHouse-keepers。您集群中的每个副本将异步从 ClickHouse-Keeper 获取新信息。

大多数情况下，您不应使用 `select_sequential_consistency` 或 `SYSTEM SYNC REPLICA LIGHTWEIGHT`。异步复制应该覆盖大多数场景，并且延迟非常低。在极少数情况下，如果您绝对需要防止陈旧的读取，请按照偏好顺序遵循以下建议：

1. 如果您在同一会话或同一节点中执行读取和写入查询，使用 `select_sequential_consistency` 是不必要的，因为您的副本将已经拥有最新的元数据。

2. 如果您写入一个副本并从另一个副本读取，则可以使用 `SYSTEM SYNC REPLICA LIGHTWEIGHT` 强制副本从 ClickHouse-Keeper 获取元数据。

3. 使用 `select_sequential_consistency` 作为您查询的一部分的设置。

## 相关内容 {#related-content}

- [ClickHouse Cloud 通过 SharedMergeTree 和轻量级更新提升性能](https://clickhouse.com/blog/clickhouse-cloud-boosts-performance-with-sharedmergetree-and-lightweight-updates)
