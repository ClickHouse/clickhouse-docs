---
'slug': '/cloud/reference/shared-merge-tree'
'sidebar_label': 'SharedMergeTree'
'title': 'SharedMergeTree'
'keywords':
- 'SharedMergeTree'
'description': '描述 SharedMergeTree 表引擎'
'doc_type': 'reference'
---

import shared_merge_tree from '@site/static/images/cloud/reference/shared-merge-tree-1.png';
import shared_merge_tree_2 from '@site/static/images/cloud/reference/shared-merge-tree-2.png';
import Image from '@theme/IdealImage';


# SharedMergeTree 表引擎

SharedMergeTree 表引擎系列是 ReplicatedMergeTree 引擎的云原生替代方案，旨在优化在共享存储（例如 Amazon S3、Google Cloud Storage、MinIO、Azure Blob Storage）上的工作。每种特定的 MergeTree 引擎类型都有一个 SharedMergeTree 的类比，例如，ReplacingSharedMergeTree 替代 ReplacingReplicatedMergeTree。

SharedMergeTree 表引擎系列支持 ClickHouse Cloud。对于最终用户来说，没有任何改动需要，您可以直接使用 SharedMergeTree 引擎系列来替代基于 ReplicatedMergeTree 的引擎。它提供以下额外好处：

- 更高的插入吞吐量
- 改进的后台合并吞吐量
- 改进的变更吞吐量
- 更快的扩展和缩放操作
- 对查询提供更轻量级的强一致性

SharedMergeTree 带来的一个显著改进是，与 ReplicatedMergeTree 相比，它提供了更深入的计算和存储分离。您可以在下面看到 ReplicatedMergeTree 如何分离计算和存储：

<Image img={shared_merge_tree} alt="ReplicatedMergeTree Diagram" size="md"  />

如您所见，尽管存储在 ReplicatedMergeTree 中的数据位于对象存储中，元数据仍然保留在每一个 clickhouse-server 上。这意味着对于每个复制操作，元数据也需要在所有副本上复制。

<Image img={shared_merge_tree_2} alt="ReplicatedMergeTree Diagram with Metadata" size="md"  />

与 ReplicatedMergeTree 不同，SharedMergeTree 不要求副本之间进行通信。相反，所有通信都通过共享存储和 clickhouse-keeper 进行。SharedMergeTree 实现了异步无领导复制，并使用 clickhouse-keeper 进行协调和元数据存储。这意味着随着服务的扩展和缩减，元数据不需要被复制。这导致更快的复制、变更、合并和扩展操作。SharedMergeTree 允许每个表有数百个副本，从而实现无需分片的动态扩展。ClickHouse Cloud 中使用分布式查询执行方法来利用更多计算资源执行查询。

## 内省 {#introspection}

大多数用于 ReplicatedMergeTree 内省的系统表在 SharedMergeTree 中存在，除了 `system.replication_queue` 和 `system.replicated_fetches`，因为没有发生数据和元数据的复制。然而，SharedMergeTree 有这两个表的相应替代品。

**system.virtual_parts**

该表作为 SharedMergeTree 的 `system.replication_queue` 替代品。它存储有关最新的当前分区集的信息，以及正在进行中的未来分区信息，如合并、变更和删除的分区。

**system.shared_merge_tree_fetches**

该表是 SharedMergeTree 的 `system.replicated_fetches` 替代品。它包含有关当前正在进行的主键和校验和获取操作的信息。

## 启用 SharedMergeTree {#enabling-sharedmergetree}

`SharedMergeTree` 默认启用。

对于支持 SharedMergeTree 表引擎的服务，您不需要手动启用任何东西。您可以像以前一样创建表，它将自动使用与您在 CREATE TABLE 查询中指定的引擎相对应的基于 SharedMergeTree 的表引擎。

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

对于给定的表，您可以通过 `SHOW CREATE TABLE` 检查使用的表引擎与 `CREATE TABLE` 语句：
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

一些设置行为显著变化：

- `insert_quorum` -- 所有对 SharedMergeTree 的插入都是法定插入（写入共享存储），因此在使用 SharedMergeTree 表引擎时不需要此设置。
- `insert_quorum_parallel` -- 所有对 SharedMergeTree 的插入都是法定插入（写入共享存储），因此在使用 SharedMergeTree 表引擎时不需要此设置。
- `select_sequential_consistency` -- 不需要法定插入，会对 `SELECT` 查询触发额外负载到 clickhouse-keeper。

## 一致性 {#consistency}

SharedMergeTree 提供比 ReplicatedMergeTree 更好的轻量级一致性。当插入 SharedMergeTree 时，您不需要提供诸如 `insert_quorum` 或 `insert_quorum_parallel` 的设置。插入是法定插入，这意味着元数据将存储在 ClickHouse-Keeper 中，并且元数据复制到至少法定数量的 ClickHouse-keeper。您集群中的每个副本将异步从 ClickHouse-Keeper 获取新信息。

大多数情况下，您不应使用 `select_sequential_consistency` 或 `SYSTEM SYNC REPLICA LIGHTWEIGHT`。异步复制应覆盖大多数场景，并且延迟非常低。在极少数需要防止过时读取的情况下，请按照优先级遵循以下建议：

1. 如果您在同一会话或同一节点中执行读取和写入查询，则不需要使用 `select_sequential_consistency`，因为您的副本将已经拥有最新的元数据。

2. 如果您对一个副本进行写入，而从另一个副本进行读取，则可以使用 `SYSTEM SYNC REPLICA LIGHTWEIGHT` 强制副本从 ClickHouse-Keeper 获取元数据。

3. 将 `select_sequential_consistency` 作为查询的一部分使用设置。
