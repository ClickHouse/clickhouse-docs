---
slug: /best-practices/use-materialized-views
sidebar_position: 10
sidebar_label: '使用物化视图'
title: '使用物化视图'
description: '介绍物化视图的页面'
keywords: ['materialized views', 'medallion architecture']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import incremental_materialized_view from '@site/static/images/bestpractices/incremental_materialized_view.gif';
import refreshable_materialized_view from '@site/static/images/bestpractices/refreshable_materialized_view.gif';

ClickHouse 支持两种类型的物化视图：[**增量型**](/materialized-view/incremental-materialized-view) 和 [**可刷新型**](/materialized-view/refreshable-materialized-view)。二者都通过预先计算并存储结果来加速查询，但在底层查询的执行方式与时机、适用的工作负载以及数据新鲜度的处理方式等方面存在显著差异。

**在已经遵循关于[数据类型选择](/best-practices/select-data-types)和[主键优化](/best-practices/choosing-a-primary-key)等既有最佳实践的前提下，用户应针对需要加速的特定查询模式来考虑使用物化视图。**

**增量物化视图**会实时更新。随着新数据插入源表，ClickHouse 会自动将该物化视图的查询应用到新数据块，并将结果写入单独的目标表。随着时间推移，ClickHouse 会合并这些部分结果，从而生成完整且最新的视图。这种方式非常高效，因为它将计算成本转移到了写入时，只处理新增数据。因此，对目标表执行的 `SELECT` 查询非常快速且开销较小。增量视图支持所有聚合函数，并且具有良好的扩展性——即使扩展到 PB 级数据也同样适用——因为每次查询只需处理正在被插入的数据集中最新的一小部分子集。

<Image img={incremental_materialized_view} size="lg" alt="Materialized Views" />

**可刷新物化视图**则是按计划更新的。这类视图会定期重新执行其完整查询，并用新结果覆盖目标表中的数据。这类似于传统 OLTP 数据库（如 Postgres）中的物化视图。

<Image img={refreshable_materialized_view} size="lg" alt="Refreshable materialized view diagram" />

在增量物化视图和可刷新物化视图之间进行选择，在很大程度上取决于查询的性质、数据变更的频率，以及视图更新是否必须在每行插入时立即反映出来，还是可以接受定期刷新的方式。理解这些权衡对在 ClickHouse 中设计高性能、可扩展的物化视图至关重要。


## 何时使用增量物化视图 \\{#when-to-use-incremental-materialized-views\\}

增量物化视图通常是首选方案，因为只要源表接收到新数据，它们就会自动实时更新。它们支持所有聚合函数，尤其适用于对单个表进行聚合。通过在插入时增量计算结果，查询只需处理小得多的数据子集，使这些视图即使在 PB 级数据规模下也能轻松扩展。在大多数情况下，它们对整个集群性能几乎没有明显影响。

在以下场景中使用增量物化视图：

- 需要在每次插入后实时更新的查询结果。
- 频繁对海量数据进行聚合或过滤。
- 查询仅对单个表执行简单的转换或聚合操作。

有关增量物化视图的示例，请参见[此处](/materialized-view/incremental-materialized-view)。

## 何时使用可刷新的物化视图 \\{#when-to-use-refreshable-materialized-views\\}

可刷新的物化视图会以固定间隔而非增量方式执行查询，并将查询结果集存储起来以便快速检索。 

当查询性能至关重要（例如需要亚毫秒级延迟），且可以接受结果略有滞后时，它们最为有用。由于查询会被完整地重新执行，可刷新的视图最适合用于计算相对较快，或者可以以较低频率（例如每小时一次）运行的查询，例如缓存“top N”结果或查找表。 

应仔细调优执行频率，以避免对系统造成过高负载。消耗大量资源的极其复杂查询应谨慎调度——这些查询可能通过影响缓存并消耗 CPU 和内存而导致整个集群性能下降。查询的运行时间应明显短于刷新间隔，以避免使集群过载。例如，如果某个查询本身至少需要 10 秒才能计算完成，就不要将视图设置为每 10 秒更新一次。 

## 总结 \\{#summary\\}

总而言之，在以下场景中使用可刷新物化视图：

- 你需要能够立即获取已缓存的查询结果，并且可以接受数据新鲜度存在轻微延迟。
- 你需要查询结果集的前 N 条记录（Top N）。
- 结果集的大小不会随着时间无限增长，否则会导致目标视图的性能下降。
- 你在执行涉及多个表的复杂 `JOIN` 或反规范化操作，并且在任一源表发生变化时都需要更新。
- 你在构建批处理工作流、反规范化任务，或创建类似 dbt DAG 的视图依赖关系。

有关可刷新物化视图的示例，请参见[此处](/materialized-view/refreshable-materialized-view)。

### APPEND 与 REPLACE 模式对比 \\{#append-vs-replace-mode\\}

可刷新物化视图在向目标表写入数据时支持两种模式：`APPEND` 和 `REPLACE`。这些模式定义了在刷新视图时，视图查询结果如何写入目标表。

`REPLACE` 是默认行为。每次刷新视图时，目标表中之前的内容都会被最新的查询结果完全覆盖。该模式适用于需要视图始终反映最新状态的场景，例如缓存查询结果集。

相比之下，`APPEND` 允许将新行追加到目标表的末尾，而不是替换其全部内容。这支持更多用例，例如捕获周期性快照。当每次刷新代表一个不同的时间点，或需要对结果进行历史累积时，`APPEND` 尤其有用。

在以下场景中选择 `APPEND` 模式：

- 你希望保留过去各次刷新的历史记录。
- 你在构建周期性快照或报表。
- 你需要随时间增量累积刷新后的结果。

在以下场景中选择 `REPLACE` 模式：

- 你只需要最新一次的结果。
- 过期数据应被完全丢弃。
- 该视图表示当前状态或查找表（lookup）。

如果你在构建 [Medallion 架构](https://clickhouse.com/blog/building-a-medallion-architecture-for-bluesky-json-data-with-clickhouse)，可以找到 `APPEND` 功能的一个具体应用场景。