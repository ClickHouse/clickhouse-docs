---
'slug': '/best-practices/use-materialized-views'
'sidebar_position': 10
'sidebar_label': '使用物化视图'
'title': '使用物化视图'
'description': '页面描述物化视图'
---

import Image from '@theme/IdealImage';
import incremental_materialized_view from '@site/static/images/bestpractices/incremental_materialized_view.gif';
import refreshable_materialized_view from '@site/static/images/bestpractices/refreshable_materialized_view.gif';

ClickHouse 支持两种类型的物化视图：[**增量**](,/materialized-view/incremental-materialized-view) 和 [**可刷新**](,/materialized-view/refreshable-materialized-view)。虽然这两种视图都旨在通过预先计算和存储结果来加速查询，但它们在执行基础查询的方式和时机、适用的工作负载以及数据新鲜度处理上有显著差异。

**用户应考虑针对特定需要加速的查询模式使用物化视图，假设已执行了有关类型的最佳实践 [最佳实践](,/best-practices/select-data-types) 和 [主键优化](,/best-practices/choosing-a-primary-key)。** 

**增量物化视图** 实时更新。当新数据插入源表时，ClickHouse 会自动将物化视图的查询应用于新数据块，并将结果写入单独的目标表。随着时间推移，ClickHouse 将这些部分结果合并，以生成完整、最新的视图。这种方法非常高效，因为它将计算成本转移到插入时间，并仅处理新数据。因此，针对目标表的 `SELECT` 查询快速且轻量。增量视图支持所有聚合函数，并且表现良好——甚至可扩展到数PB的数据——因为每个查询仅在插入的数据集中操作一个较小、较新的子集。

<Image img={incremental_materialized_view} size="lg" alt="物化视图" />

相对而言，**可刷新物化视图** 依据时间表进行更新。这些视图定期重新执行其完整查询，并覆盖目标表中的结果。这类似于传统 OLTP 数据库（如 Postgres）中的物化视图。

<Image img={refreshable_materialized_view} size="lg" alt="可刷新物化视图图示"/>

增量和可刷新物化视图之间的选择在很大程度上取决于查询的性质、数据变化的频率，以及更新视图时是否必须反映每一行的插入，或者是否可以接受周期性的刷新。理解这些权衡对于设计高效、可扩展的 ClickHouse 物化视图至关重要。

## 何时使用增量物化视图 {#when-to-use-incremental-materialized-views}

增量物化视图通常是首选，因为每当源表接收新数据时，它们会实时自动更新。它们支持所有聚合函数，并且对单一表的聚合特别有效。通过在插入时逐步计算结果，针对显著较小的数据子集运行的查询使得这些视图即使在数PB的数据上也能轻松扩展。在大多数情况下，它们对整体集群性能没有明显影响。

在以下情况下使用增量物化视图：

- 您需要实时查询结果，随着每次插入进行更新。
- 您经常需要对大量数据进行聚合或筛选。
- 您的查询涉及对单表的直接转换或聚合。

有关增量物化视图的示例，请参见 [此处](/materialized-view/incremental-materialized-view)。

## 何时使用可刷新物化视图 {#when-to-use-refreshable-materialized-views}

可刷新物化视图定期执行查询，而不是增量地执行，存储查询结果集以便快速检索。

当查询性能至关重要（例如，亚毫秒延迟）并且可以接受稍微过时的结果时，它们最为有用。由于查询是完全重新运行的，因此可刷新视图最适合使用计算相对快速或每隔一段时间（例如每小时）运行一次的查询，例如缓存“前 N”结果或查找表。

执行频率应谨慎调整，以避免对系统造成过大负载。非常复杂的查询占用大量资源时应谨慎调度——这些查询可能通过影响缓存、消耗 CPU 和内存而导致整体集群性能下降。查询执行的相对速度应该较快，以避免过载集群。例如，如果查询本身至少需要 10 秒来计算，则不要安排视图每 10 秒更新一次。

## 总结 {#summary}

总之，在以下情况下使用可刷新物化视图：

- 您需要即时可用的缓存查询结果，并且可以接受数据新鲜度上的小延迟。
- 您需要查询结果集的前 N 名。
- 结果集的大小不会无限增长。否则，将导致目标视图的性能下降。
- 您正在执行涉及多个表的复杂连接或去规范化，要求在任何源表更改时进行更新。
- 您正在构建批处理工作流、去规范化任务或创建类似于 DBT DAG 的视图依赖关系。

有关可刷新物化视图的示例，请参见 [此处](/materialized-view/refreshable-materialized-view)。

### APPEND 与 REPLACE 模式 {#append-vs-replace-mode}

可刷新物化视图支持两种将数据写入目标表的模式：`APPEND` 和 `REPLACE`。这些模式定义了在刷新视图时查询结果如何写入。

`REPLACE` 是默认行为。每次刷新视图时，目标表的先前内容将被最新的查询结果完全覆盖。这适用于视图始终应反映最新状态的用例，例如缓存结果集。

相反，`APPEND` 允许将新行添加到目标表的末尾，而不是替换其内容。这使得其他用例成为可能，例如捕获定期快照。`APPEND` 在每次刷新表示明确的时间点或希望历史累积结果时特别有用。

选择 `APPEND` 模式的情况：

- 您想保留过去刷新的历史记录。
- 您正在构建定期快照或报告。
- 您需要逐步收集随着时间推移而刷新的结果。

选择 `REPLACE` 模式的情况：

- 您只需要最新的结果。
- 过时的数据应被完全丢弃。
- 该视图代表当前状态或查找。

用户可以在构建 [Medallion 架构](https://clickhouse.com/blog/building-a-medallion-architecture-for-bluesky-json-data-with-clickhouse) 时找到 `APPEND` 功能的应用。
