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

ClickHouse 支持两种类型的物化视图：[**增量**](/materialized-view/incremental-materialized-view) 和 [**可刷新的**](/materialized-view/refreshable-materialized-view)。这两种视图都旨在通过预计算和存储结果来加速查询，但在基础查询的执行方式、时机、适用工作负载以及数据新鲜度处理上有显著差异。

**用户应考虑针对需要加速的特定查询模式使用物化视图，前提是已执行有关[类型](/best-practices/select-data-types)和[主键优化](/best-practices/choosing-a-primary-key)的最佳实践。**

**增量物化视图** 实时更新。当新数据插入源表时，ClickHouse 会自动将物化视图的查询应用于新数据块，并将结果写入单独的目标表。随着时间的推移，ClickHouse 会合并这些部分结果以生成完整、最新的视图。这种方法非常高效，因为它将计算成本转移到插入时，仅处理新数据。因此，针对目标表的 `SELECT` 查询快速且轻量。增量视图支持所有聚合函数，并且在处理大量数据（甚至是PB级别）时表现良好，因为每个查询都在插入的数据集的较小、最近的子集上操作。

<Image img={incremental_materialized_view} size="lg" alt="物化视图" />

相比之下，**可刷新的物化视图** 按计划更新。这些视图定期重新执行其完整查询，并覆盖目标表中的结果。这类似于传统 OLTP 数据库（如 Postgres）中的物化视图。

<Image img={refreshable_materialized_view} size="lg" alt="可刷新的物化视图结构图"/>

在增量和可刷新的物化视图之间的选择在很大程度上取决于查询的性质、数据变化的频率，以及视图更新是否必须反映每一行的插入，还是定期刷新可以接受。理解这些权衡对于设计高性能、可扩展的物化视图至关重要。

## 何时使用增量物化视图 {#when-to-use-incremental-materialized-views}

增量物化视图通常是首选，因为它们在源表接收到新数据时会实时自动更新。它们支持所有聚合函数，特别适用于对单个表的聚合。通过在插入时增量计算结果，针对显著较小的数据子集的查询运行，允许这些视图甚至能够轻松扩展到PB级数据。在大多数情况下，它们对整体集群性能没有显著影响。

当满足以下条件时，使用增量物化视图：

- 您需要随着每次插入更新的实时查询结果。
- 您频繁聚合或过滤大量数据。
- 您的查询涉及对单个表的直接转换或聚合。

有关增量物化视图的示例，请见 [这里](/materialized-view/incremental-materialized-view)。

## 何时使用可刷新的物化视图 {#when-to-use-refreshable-materialized-views}

可刷新的物化视图定期执行查询，而非增量执行，存储查询结果集以快速检索。

当查询性能至关重要（例如亚毫秒延迟）并且稍微过时的结果是可以接受时，它们最有用。由于查询会完整重新执行，因此可刷新的视图最适合相对快速计算的查询，或者可以不频繁计算的查询（例如每小时），比如缓存“前N”结果或查找表。

执行频率应仔细调整，以避免对系统造成过大的负担。消耗大量资源的复杂查询应谨慎调度，因为这些查询会影响缓存并消耗CPU和内存，从而导致整体集群性能下降。查询的执行时间应该与刷新间隔相对较短，以避免对集群造成过负荷。例如，如果查询本身至少需要10秒才能计算，请勿将视图刷新调度为每10秒更新一次。

## 总结 {#summary}

总之，当满足以下条件时，使用可刷新的物化视图：

- 您需要即时可用的缓存查询结果，而对新鲜度的轻微延迟是可以接受的。
- 您需要查询结果集的前N名。
- 结果集的大小在时间上不会无限增长，这将导致目标视图的性能下降。
- 您正在执行涉及多个表的复杂联接或反规范化，需要在任何源表发生变化时进行更新。
- 您正在构建批处理工作流、反规范化任务或创建类似于 DBT DAG 的视图依赖关系。

有关可刷新的物化视图的示例，请见 [这里](/materialized-view/refreshable-materialized-view)。

### APPEND 与 REPLACE 模式 {#append-vs-replace-mode}

可刷新的物化视图支持两种模式以写入数据到目标表：`APPEND` 和 `REPLACE`。这两种模式定义了视图的查询结果在刷新时如何写入。

`REPLACE` 是默认行为。每次刷新视图时，目标表的先前内容都会被最新的查询结果完全覆盖。这适用于视图应始终反映最新状态的用例，例如缓存结果集。

相比之下，`APPEND` 允许将新行添加到目标表的末尾，而不是替换其内容。这使得更多用例成为可能，例如捕获定期快照。当每次刷新代表一个独特的时间点或需要结果的历史积累时，`APPEND` 尤其有用。

当满足以下条件时，选择 `APPEND` 模式：

- 您希望保留过去刷新的历史记录。
- 您正在构建定期快照或报告。
- 您需要随着时间的推移逐步收集刷新结果。

当满足以下条件时，选择 `REPLACE` 模式：

- 您只需要最新的结果。
- 过时数据应完全丢弃。
- 视图代表当前状态或查找信息。

用户可以在构建 [Medallion 架构](https://clickhouse.com/blog/building-a-medallion-architecture-for-bluesky-json-data-with-clickhouse) 中找到 `APPEND` 功能的应用。
