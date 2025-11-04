---
'slug': '/best-practices/use-materialized-views'
'sidebar_position': 10
'sidebar_label': '使用物化视图'
'title': '使用物化视图'
'description': '页面描述物化视图'
'keywords':
- 'materialized views'
- 'medallion architecture'
'show_related_blogs': true
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import incremental_materialized_view from '@site/static/images/bestpractices/incremental_materialized_view.gif';
import refreshable_materialized_view from '@site/static/images/bestpractices/refreshable_materialized_view.gif';

ClickHouse 支持两种类型的物化视图：[**增量**](/materialized-view/incremental-materialized-view) 和 [**可刷新**](/materialized-view/refreshable-materialized-view)。虽然这两种视图都旨在通过预计算和存储结果来加速查询，但它们在执行底层查询的方式、适用的工作负载和数据新鲜度处理方面存在显著差异。

**用户应该考虑在特定的查询模式下使用物化视图，以加速查询，前提是已遵循之前的最佳实践 [关于数据类型](/best-practices/select-data-types) 和 [主键优化](/best-practices/choosing-a-primary-key)。**

**增量物化视图** 实时更新。当新的数据插入源表时，ClickHouse 会自动将物化视图的查询应用于新数据块，并将结果写入单独的目标表。随着时间的推移，ClickHouse 会合并这些部分结果，以生成完整的、最新的视图。这种方法非常高效，因为它将计算成本转移到插入时间，并且只处理新数据。因此，针对目标表的 `SELECT` 查询速度快且轻量。增量视图支持所有聚合函数，并且能够很好地扩展——甚至达到 PB 级别的数据——因为每个查询都在被插入的数据集的小而新的子集上运行。

<Image img={incremental_materialized_view} size="lg" alt="物化视图" />

**可刷新物化视图** 相反，按计划更新。这些视图定期重新执行完整查询，并覆盖目标表中的结果。这类似于传统 OLTP 数据库（如 Postgres）中的物化视图。

<Image img={refreshable_materialized_view} size="lg" alt="可刷新物化视图图示"/>

在增量和可刷新物化视图之间的选择在很大程度上取决于查询的性质、数据变化的频率以及对视图的更新是否需要在每次插入时反映每一行，或者是否可以接受定期刷新。理解这些权衡对于设计高性能、可扩展的 ClickHouse 物化视图至关重要。

## 何时使用增量物化视图 {#when-to-use-incremental-materialized-views}

增量物化视图通常被优先考虑，因为它们在源表接收到新数据时自动实时更新。它们支持所有聚合函数，并且特别适用于对单个表的聚合操作。通过在插入时以增量方式计算结果，查询将针对显著较小的数据子集运行，从而使这些视图能够毫不费力地扩展到 PB 级别的数据。在大多数情况下，它们对整体集群性能不会产生显着影响。

当你需要增量物化视图时：

- 你需要实时查询结果，每次插入时都会更新。
- 你频繁聚合或过滤大量数据。
- 你的查询涉及对单个表的简单转换或聚合。

有关增量物化视图的示例，请见 [这里](/materialized-view/incremental-materialized-view)。

## 何时使用可刷新物化视图 {#when-to-use-refreshable-materialized-views}

可刷新物化视图定期执行其查询，而不是增量执行，将查询结果集存储以便快速检索。

当查询性能至关重要（例如，亚毫秒延迟）并且稍微过时的结果可以接受时，它们最有用。由于查询会完整重新运行，可刷新视图最适合那些计算相对较快的查询，或者这些查询可以在不频繁的间隔（例如每小时）内计算，比如缓存“前 N”结果或查找表。

执行频率应谨慎调整，以避免对系统造成过大负载。极其复杂、资源消耗较大的查询应谨慎调度——这些查询可能会通过影响缓存和消耗 CPU 和内存来导致整体集群性能下降。相较于刷新间隔，查询的运行速度应该相对较快，以避免对集群的过载。例如，不要安排每 10 秒更新一次视图，假如查询本身至少需要 10 秒才能计算。

## 总结 {#summary}

总之，当你需要可刷新物化视图时：

- 你需要快速获取缓存的查询结果，并且可以接受新鲜度的轻微延迟。
- 你需要查询结果集的前 N 个结果。
- 结果集的大小不应随着时间的推移而无限增长。这会导致目标视图的性能下降。
- 你正在执行涉及多个表的复杂连接或非规范化，需要在任一源表更改时进行更新。
- 你正在构建批处理工作流、非规范化任务，或创建类似于 DBT DAG 的视图依赖关系。

有关可刷新物化视图的示例，请见 [这里](/materialized-view/refreshable-materialized-view)。

### APPEND 与 REPLACE 模式 {#append-vs-replace-mode}

可刷新物化视图支持两种将数据写入目标表的模式：`APPEND` 和 `REPLACE`。这两种模式定义了视图在刷新时查询结果的写入方式。

`REPLACE` 是默认行为。每次刷新视图时，目标表的先前内容将被最新的查询结果完全覆盖。这适用于视图应始终反映最新状态的用例，例如缓存结果集。

相反，`APPEND` 允许向目标表的末尾添加新行，而不是替换其内容。这使得额外的用例成为可能，例如捕获定期快照。当每次刷新表示一个特定的时间点或需要历史结果累计时，`APPEND` 特别有用。

选择 `APPEND` 模式时：

- 你想保留过去刷新的历史。
- 你正在构建定期快照或报告。
- 你需要随着时间的推移逐步收集刷新的结果。

选择 `REPLACE` 模式时：

- 你只需要最新的结果。
- 过时的数据应完全丢弃。
- 视图代表当前状态或查找。

如果构建 [Medallion 架构](https://clickhouse.com/blog/building-a-medallion-architecture-for-bluesky-json-data-with-clickhouse) 的话，用户可以找到 `APPEND` 功能的应用示例。
