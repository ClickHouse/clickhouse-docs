---
slug: /best-practices/use-materialized-views
sidebar_position: 10
sidebar_label: '使用物化视图'
title: '使用物化视图'
description: '介绍物化视图的页面'
keywords: ['物化视图', 'Medallion 架构']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import incremental_materialized_view from '@site/static/images/bestpractices/incremental_materialized_view.gif';
import refreshable_materialized_view from '@site/static/images/bestpractices/refreshable_materialized_view.gif';

ClickHouse 支持两种类型的物化视图：[**增量型**](/materialized-view/incremental-materialized-view) 和 [**可刷新型**](/materialized-view/refreshable-materialized-view)。二者都通过预计算并存储结果来加速查询，但在底层查询何时以及如何执行、适用的工作负载类型以及数据新鲜度的处理方式等方面存在显著差异。

**在已经遵循前文关于[数据类型](/best-practices/select-data-types)和[主键优化](/best-practices/choosing-a-primary-key)的最佳实践的前提下，用户应针对需要加速的特定查询模式考虑使用物化视图。**

**增量物化视图**会实时更新。当新数据插入源表时，ClickHouse 会自动将物化视图的查询应用到新的数据块上，并将结果写入单独的目标表。随着时间推移，ClickHouse 会合并这些部分结果，以生成完整且最新的视图。这种方式非常高效，因为它将计算开销转移到了写入阶段，并且只处理新增数据。因此，对目标表执行的 `SELECT` 查询既快速又轻量。增量视图支持所有聚合函数，并可良好扩展——即使在 PB 级数据规模下——因为每次查询只处理正在插入的数据集中一小部分最新的数据子集。

<Image img={incremental_materialized_view} size="lg" alt="物化视图" />

**可刷新物化视图**则是按照预定计划更新。这类视图会定期重新执行其完整查询，并用新的结果覆盖目标表中的数据。这类似于传统 OLTP 数据库（如 Postgres）中的物化视图。

<Image img={refreshable_materialized_view} size="lg" alt="可刷新物化视图示意图" />

在增量物化视图和可刷新物化视图之间进行选择，很大程度上取决于查询的性质、数据变更的频率，以及视图更新是否必须对每一行插入做到实时反映，还是周期性刷新即可接受。理解这些权衡，对在 ClickHouse 中设计高性能、可扩展的物化视图至关重要。


## 何时使用增量物化视图 {#when-to-use-incremental-materialized-views}

增量物化视图通常是首选方案,因为当源表接收到新数据时,它们会自动实时更新。它们支持所有聚合函数,对单表聚合尤其有效。通过在插入时增量计算结果,查询所针对的数据子集显著减小,使这些视图能够轻松扩展至 PB 级数据规模。在大多数情况下,它们不会对整体集群性能产生明显影响。

在以下情况下使用增量物化视图:

- 需要随每次插入实时更新的查询结果。
- 需要频繁对大量数据进行聚合或过滤。
- 查询涉及对单表进行简单的转换或聚合操作。

有关增量物化视图的示例,请参阅[此处](/materialized-view/incremental-materialized-view)。


## 何时使用可刷新物化视图 {#when-to-use-refreshable-materialized-views}

可刷新物化视图定期执行查询而非增量执行,并存储查询结果集以供快速检索。

当查询性能至关重要(例如亚毫秒级延迟)且可接受略微过时的结果时,它们最为有用。由于查询会完整重新运行,可刷新视图最适合计算相对较快的查询,或可以按较低频率计算的查询(例如每小时一次),如缓存"Top N"结果或查找表。

应仔细调整执行频率以避免系统负载过高。消耗大量资源的极其复杂的查询应谨慎调度——这些查询可能会影响缓存并消耗 CPU 和内存,从而导致整体集群性能下降。相对于刷新间隔,查询应运行得足够快,以避免集群过载。例如,如果查询本身至少需要 10 秒才能完成计算,则不应将视图调度为每 10 秒更新一次。


## 总结 {#summary}

总而言之,在以下情况下应使用可刷新物化视图:

- 需要立即可用的缓存查询结果,且可以接受数据新鲜度的轻微延迟。
- 需要获取查询结果集的前 N 条记录。
- 结果集的大小不会随时间无限增长。否则会导致目标视图的性能下降。
- 正在执行涉及多个表的复杂连接或反规范化操作,需要在任何源表发生变化时进行更新。
- 正在构建批处理工作流、反规范化任务,或创建类似 DBT DAG 的视图依赖关系。

有关可刷新物化视图的示例,请参见[此处](/materialized-view/refreshable-materialized-view)。

### APPEND 与 REPLACE 模式 {#append-vs-replace-mode}

可刷新物化视图支持两种向目标表写入数据的模式:`APPEND` 和 `REPLACE`。这些模式定义了视图刷新时如何写入查询结果。

`REPLACE` 是默认行为。每次刷新视图时,目标表的原有内容都会被最新的查询结果完全覆盖。这适用于视图需要始终反映最新状态的场景,例如缓存结果集。

相比之下,`APPEND` 允许将新行追加到目标表末尾,而不是替换其内容。这支持更多使用场景,例如捕获周期性快照。当每次刷新代表一个独立的时间点,或者需要累积历史结果时,`APPEND` 特别有用。

在以下情况下选择 `APPEND` 模式:

- 希望保留历史刷新记录。
- 正在构建周期性快照或报告。
- 需要随时间增量收集刷新结果。

在以下情况下选择 `REPLACE` 模式:

- 只需要最新结果。
- 过时数据应完全丢弃。
- 视图表示当前状态或查找表。

用户在构建 [Medallion 架构](https://clickhouse.com/blog/building-a-medallion-architecture-for-bluesky-json-data-with-clickhouse)时可以应用 `APPEND` 功能。
