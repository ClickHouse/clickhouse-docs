---
slug: /best-practices/use-materialized-views
sidebar_position: 10
sidebar_label: '使用物化视图'
title: '使用物化视图'
description: '说明物化视图的页面'
keywords: ['materialized views', 'medallion architecture']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import incremental_materialized_view from '@site/static/images/bestpractices/incremental_materialized_view.gif';
import refreshable_materialized_view from '@site/static/images/bestpractices/refreshable_materialized_view.gif';

ClickHouse 支持两种类型的物化视图：[**增量型**](/materialized-view/incremental-materialized-view) 和 [**可刷新的**](/materialized-view/refreshable-materialized-view)。虽然这两种视图都通过预计算并存储结果来加速查询，但它们在底层查询的执行方式和时机、适用的工作负载类型以及数据新鲜度的处理方式上存在显著差异。

**在已经按照最佳实践完成[数据类型选择](/best-practices/select-data-types)和[主键优化](/best-practices/choosing-a-primary-key)之后，用户应针对需要加速的特定查询模式考虑使用物化视图。**

**增量型物化视图**会实时更新。每当有新数据插入到源表时，ClickHouse 会自动将物化视图的查询应用于新的数据块，并将结果写入单独的目标表。随着时间推移，ClickHouse 会合并这些部分结果，从而生成一个完整且最新的视图。这种方式非常高效，因为它将计算成本转移到了插入时，并且只处理新增数据。因此，对目标表执行的 `SELECT` 查询既快速又轻量。增量视图支持所有聚合函数，并且具有良好的扩展性——即使在 PB 级数据规模下——因为每次查询只需处理正在插入数据集中一个较小且最新的子集。

<Image img={incremental_materialized_view} size="lg" alt="Materialized Views" />

**可刷新物化视图**则是按计划更新的。这类视图会定期重新执行其完整查询，并用结果覆盖写入目标表。这类似于传统 OLTP 数据库（如 Postgres）中的物化视图。

<Image img={refreshable_materialized_view} size="lg" alt="Refreshable materialized view diagram" />

在增量型物化视图和可刷新物化视图之间进行选择，很大程度上取决于查询的特性、数据变更的频率，以及视图更新时是否必须反映每一行刚插入的数据，还是可以接受周期性刷新。理解这些权衡对于在 ClickHouse 中设计高性能、可扩展的物化视图至关重要。


## 何时使用增量物化视图 {#when-to-use-incremental-materialized-views}

增量物化视图通常是首选方案,因为当源表接收到新数据时,它们会自动实时更新。它们支持所有聚合函数,对单表聚合尤其有效。通过在插入时增量计算结果,查询所针对的数据子集会显著减小,使这些视图能够轻松扩展至 PB 级数据规模。在大多数情况下,它们不会对集群整体性能产生明显影响。

在以下情况下使用增量物化视图:

- 需要随每次插入实时更新查询结果。
- 需要频繁对大量数据进行聚合或过滤。
- 查询涉及对单表的简单转换或聚合。

有关增量物化视图的示例,请参阅[此处](/materialized-view/incremental-materialized-view)。


## 何时使用可刷新物化视图 {#when-to-use-refreshable-materialized-views}

可刷新物化视图定期执行查询而非增量执行,并存储查询结果集以供快速检索。

当查询性能至关重要(例如亚毫秒级延迟)且可以接受略微过时的结果时,它们最为有用。由于查询会完整重新运行,可刷新视图最适合计算相对较快的查询,或可以按较低频率(例如每小时)计算的查询,例如缓存"top N"结果或查找表。

应仔细调整执行频率以避免系统负载过高。消耗大量资源的极其复杂的查询应谨慎调度——这些查询可能会影响缓存并消耗 CPU 和内存,从而导致整体集群性能下降。相对于刷新间隔,查询应运行得相对较快,以避免集群过载。例如,如果查询本身至少需要 10 秒才能完成计算,则不要将视图调度为每 10 秒更新一次。


## 总结 {#summary}

总结来说,在以下情况下使用可刷新物化视图:

- 需要立即可用的缓存查询结果,且可以接受数据新鲜度的轻微延迟。
- 需要获取查询结果集的前 N 条记录。
- 结果集的大小不会随时间无限增长。否则会导致目标视图的性能下降。
- 正在执行涉及多个表的复杂连接或反规范化操作,需要在任何源表发生变化时进行更新。
- 正在构建批处理工作流、反规范化任务,或创建类似于 DBT DAG 的视图依赖关系。

有关可刷新物化视图的示例,请参见[此处](/materialized-view/refreshable-materialized-view)。

### APPEND 与 REPLACE 模式 {#append-vs-replace-mode}

可刷新物化视图支持两种向目标表写入数据的模式:`APPEND` 和 `REPLACE`。这些模式定义了视图刷新时如何写入视图查询的结果。

`REPLACE` 是默认行为。每次刷新视图时,目标表的先前内容会被最新的查询结果完全覆盖。这适用于视图应始终反映最新状态的场景,例如缓存结果集。

相比之下,`APPEND` 允许将新行添加到目标表的末尾,而不是替换其内容。这支持额外的使用场景,例如捕获周期性快照。当每次刷新代表一个不同的时间点,或者需要历史结果累积时,`APPEND` 特别有用。

在以下情况下选择 `APPEND` 模式:

- 希望保留过去刷新的历史记录。
- 正在构建周期性快照或报告。
- 需要随时间增量收集刷新的结果。

在以下情况下选择 `REPLACE` 模式:

- 只需要最新的结果。
- 过时的数据应完全丢弃。
- 视图表示当前状态或查找表。

用户在构建 [Medallion 架构](https://clickhouse.com/blog/building-a-medallion-architecture-for-bluesky-json-data-with-clickhouse)时可以找到 `APPEND` 功能的应用。
