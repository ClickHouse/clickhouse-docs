---
'slug': '/best-practices/use-materialized-views'
'sidebar_position': 10
'sidebar_label': '使用物化视图'
'title': '使用物化视图'
'description': '描述物化视图的页面'
---

import Image from '@theme/IdealImage';
import incremental_materialized_view from '@site/static/images/bestpractices/incremental_materialized_view.gif';
import refreshable_materialized_view from '@site/static/images/bestpractices/refreshable_materialized_view.gif';

ClickHouse 支持两种类型的物化视图：[**增量**](/materialized-view/incremental-materialized-view) 和 [**可刷新的**](/materialized-view/refreshable-materialized-view)。虽然这两者的设计目的是通过预计算和存储结果来加速查询，但它们在底层查询的执行方式、适用的工作负载以及数据新鲜感的处理上存在显著差异。

**用户应该考虑针对特定查询模式使用物化视图，这些模式需要加速，并假设已经执行了有关类型的最佳实践 [(/best-practices/select-data-types)] 和 [主键优化](/best-practices/choosing-a-primary-key)。**

**增量物化视图** 实时更新。随着新数据插入到源表中，ClickHouse 会自动将物化视图的查询应用于新的数据块，并将结果写入单独的目标表中。随着时间的推移，ClickHouse 会合并这些部分结果以生成完整的、最新的视图。这种方法具有高效性，因为它将计算成本转移到插入时，只处理新数据。因此，对目标表的 `SELECT` 查询快速且轻量。增量视图支持所有聚合函数并且扩展良好——甚至可扩展到 PB 级数据——因为每个查询仅在被插入的数据集的小的、最近的子集上操作。

<Image img={incremental_materialized_view} size="lg" alt="物化视图" />

相比之下，**可刷新的物化视图** 按计划更新时间。这些视图会定期重新执行它们的完整查询并覆盖目标表中的结果。这类似于传统 OLTP 数据库（如 Postgres）中的物化视图。

<Image img={refreshable_materialized_view} size="lg" alt="可刷新物化视图图示" />

在增量和可刷新的物化视图之间的选择在很大程度上取决于查询的性质、数据更改的频率，以及视图的更新是否必须反映每一行的插入，或者周期性刷新是否可接受。理解这些权衡对于在 ClickHouse 中设计高性能、可扩展的物化视图至关重要。

## 何时使用增量物化视图 {#when-to-use-incremental-materialized-views}

增量物化视图通常是首选，因为它们在源表接收新数据时会自动实时更新。它们支持所有聚合函数，并在对单个表的聚合上特别有效。通过在插入时增量计算结果，针对显著较小的数据子集运行的查询允许这些视图轻松扩展，甚至达到 PB 级数据。在大多数情况下，它们对整体集群性能没有显著影响。

在以下情况下使用增量物化视图：

- 您需要随着每次插入更新的实时查询结果。
- 您正在频繁聚合或过滤大量数据。
- 您的查询涉及对单个表的简单转换或聚合。

有关增量物化视图的示例，请参见 [此处](/materialized-view/incremental-materialized-view)。

## 何时使用可刷新的物化视图 {#when-to-use-refreshable-materialized-views}

可刷新的物化视图定期执行其查询，而不是增量执行，存储查询结果集以便快速检索。

当查询性能至关重要（例如，亚毫秒延迟）且轻微过时结果可接受时，它们最为有用。由于查询是完全重新运行的，因此可刷新的视图最适合于计算相对快速或者可以在不频繁的间隔（例如，每小时）计算的查询，如缓存“前 N”结果或查找表。

执行频率应仔细调整，以避免对系统造成过大负担。极其复杂的查询会消耗大量资源，应该谨慎安排——这些查询可能会影响缓存并消耗 CPU 和内存，从而导致整体集群性能下降。查询运行的速度应相对快速，与刷新间隔相比，以避免过载您的集群。例如，如果查询本身需要至少 10 秒才能计算，则不要计划每 10 秒更新一次视图。

## 总结 {#summary}

总之，当满足以下条件时，使用可刷新的物化视图：

- 您需要即时可用的缓存查询结果，并且允许轻微的延迟。
- 您需要查询结果集的前 N 项。
- 结果集的大小不会随时间无限增长。这将导致目标视图的性能下降。
- 您正在执行涉及多个表的复杂连接或反规范化，需要在任何源表更改时进行更新。
- 您正在构建批处理工作流、反规范化任务或创建类似于 DBT DAG 的视图依赖关系。

有关可刷新的物化视图的示例，请参见 [此处](/materialized-view/refreshable-materialized-view)。

### APPEND vs REPLACE 模式 {#append-vs-replace-mode}

可刷新的物化视图支持两种写入数据到目标表的模式：`APPEND` 和 `REPLACE`。这些模式定义了在刷新视图时查询的结果如何写入。

`REPLACE` 是默认行为。每次刷新视图时，目标表的先前内容都会被最新的查询结果完全覆盖。这适用于需始终反映最新状态的用例，如缓存结果集。

相比之下，`APPEND` 允许新行添加到目标表的末尾，而不是替换其内容。这使得额外用例成为可能，例如捕获周期快照。当每次刷新代表一个不同的时间点，或者希望历史结果的累积时，`APPEND` 特别有用。

在以下情况下选择 `APPEND` 模式：

- 您希望保留过去刷新记录的历史。
- 您正在构建定期快照或报告。
- 您需要随着时间的推移逐步收集刷新结果。

在以下情况下选择 `REPLACE` 模式：

- 您只需要最新结果。
- 过时数据应被完全丢弃。
- 视图表示当前状态或查找。

用户可以找到 `APPEND` 功能的应用示例，如果构建 [Medallion 架构](https://clickhouse.com/blog/building-a-medallion-architecture-for-bluesky-json-data-with-clickhouse)。
