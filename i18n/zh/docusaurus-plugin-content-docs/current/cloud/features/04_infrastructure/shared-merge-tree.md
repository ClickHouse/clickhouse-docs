---
slug: /cloud/reference/shared-merge-tree
sidebar_label: 'SharedMergeTree'
title: 'SharedMergeTree'
keywords: ['SharedMergeTree']
description: 'SharedMergeTree 表引擎说明'
doc_type: 'reference'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';


# SharedMergeTree 表引擎

SharedMergeTree 表引擎系列是云原生的 ReplicatedMergeTree 引擎替代方案，针对共享存储（例如 Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）进行了优化。每一种具体的 MergeTree 引擎类型都有对应的 SharedMergeTree 版本，例如 ReplacingSharedMergeTree 用来替代 ReplacingReplicatedMergeTree。

SharedMergeTree 表引擎系列为 ClickHouse Cloud 提供支撑。对于终端用户而言，无需做任何修改即可从基于 ReplicatedMergeTree 的引擎切换为使用 SharedMergeTree 引擎系列。它提供了如下额外优势：

- 更高的写入吞吐量
- 更高的后台合并吞吐量
- 更高的变更（mutation）吞吐量
- 更快的扩容和缩容操作
- 更轻量的强一致性查询保障

SharedMergeTree 带来的一个重要改进是，与 ReplicatedMergeTree 相比，它在计算和存储之间实现了更彻底的解耦。下图展示了 ReplicatedMergeTree 如何实现计算与存储的分离：

<Image img={shared_merge_tree} alt="ReplicatedMergeTree Diagram" size="md"  />

可以看到，即使 ReplicatedMergeTree 中的数据存储在对象存储中，元数据仍然保存在每个 clickhouse-server 上。这意味着对于每一次复制操作，元数据也必须在所有副本上进行复制。

<Image img={shared_merge_tree_2} alt="ReplicatedMergeTree Diagram with Metadata" size="md"  />

与 ReplicatedMergeTree 不同，SharedMergeTree 不需要副本之间直接通信。相反，所有通信都通过共享存储和 clickhouse-keeper 完成。SharedMergeTree 实现了异步、无主复制，并使用 clickhouse-keeper 进行协调以及元数据存储。这意味着在服务扩容和缩容时，不再需要复制元数据。这带来了更快的复制、变更、合并以及扩容操作。SharedMergeTree 允许每个表拥有数百个副本，从而无需分片即可实现动态扩展。在 ClickHouse Cloud 中采用分布式查询执行方式，以便为单条查询利用更多的计算资源。



## 内省 {#introspection}

用于 ReplicatedMergeTree 内省的大多数系统表在 SharedMergeTree 中同样存在,但 `system.replication_queue` 和 `system.replicated_fetches` 除外,因为 SharedMergeTree 不涉及数据和元数据的复制。然而,SharedMergeTree 为这两个表提供了相应的替代表。

**system.virtual_parts**

此表是 SharedMergeTree 中 `system.replication_queue` 的替代表。它存储关于最新当前数据部分集合的信息,以及正在进行中的未来数据部分的信息,例如合并、变更和已删除的分区。

**system.shared_merge_tree_fetches**

此表是 SharedMergeTree 中 `system.replicated_fetches` 的替代表。它包含关于当前正在进行的主键和校验和加载到内存的信息。


## 启用 SharedMergeTree {#enabling-sharedmergetree}

`SharedMergeTree` 默认已启用。

对于支持 SharedMergeTree 表引擎的服务,无需手动启用任何功能。您可以像以前一样创建表,系统会自动使用与 CREATE TABLE 查询中指定引擎相对应的基于 SharedMergeTree 的表引擎。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ENGINE = MergeTree
ORDER BY key
```

这将使用 SharedMergeTree 表引擎创建表 `my_table`。

在 ClickHouse Cloud 中,由于 `default_table_engine=MergeTree`,您无需指定 `ENGINE=MergeTree`。以下查询与上面的查询完全相同。

```sql
CREATE TABLE my_table(
 key UInt64,
 value String
)
ORDER BY key
```

如果您使用 Replacing、Collapsing、Aggregating、Summing、VersionedCollapsing 或 Graphite MergeTree 表,系统会自动将其转换为相应的基于 SharedMergeTree 的表引擎。

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

对于给定的表,您可以使用 `SHOW CREATE TABLE` 检查 `CREATE TABLE` 语句使用了哪个表引擎:

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

部分设置的行为发生了显著变化:

- `insert_quorum` -- SharedMergeTree 的所有插入操作都是仲裁插入(写入共享存储),因此使用 SharedMergeTree 表引擎时无需此设置。
- `insert_quorum_parallel` -- SharedMergeTree 的所有插入操作都是仲裁插入(写入共享存储),因此使用 SharedMergeTree 表引擎时无需此设置。
- `select_sequential_consistency` -- 无需仲裁插入,但会在执行 `SELECT` 查询时对 clickhouse-keeper 产生额外负载


## 一致性 {#consistency}

SharedMergeTree 相比 ReplicatedMergeTree 提供了更好的轻量级一致性。向 SharedMergeTree 插入数据时,无需配置 `insert_quorum` 或 `insert_quorum_parallel` 等设置。插入操作默认为仲裁插入,即元数据会存储在 ClickHouse Keeper 中,并复制到至少达到仲裁数量的 ClickHouse Keeper 节点。集群中的每个副本会异步从 ClickHouse Keeper 获取最新信息。

大多数情况下,不应使用 `select_sequential_consistency` 或 `SYSTEM SYNC REPLICA LIGHTWEIGHT`。异步复制能够满足大多数场景需求,且延迟极低。在极少数必须防止读取过期数据的情况下,请按优先级顺序遵循以下建议:

1. 如果在同一会话或同一节点上执行读写查询,无需使用 `select_sequential_consistency`,因为该副本已经拥有最新的元数据。

2. 如果向一个副本写入并从另一个副本读取,可以使用 `SYSTEM SYNC REPLICA LIGHTWEIGHT` 强制该副本从 ClickHouse Keeper 获取元数据。

3. 在查询中将 `select_sequential_consistency` 作为设置参数使用。
