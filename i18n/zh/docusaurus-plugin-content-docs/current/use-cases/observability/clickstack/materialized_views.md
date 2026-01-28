---
slug: /use-cases/observability/clickstack/materialized_views
title: 'ClickStack - Materialized Views'
sidebar_label: 'Materialized Views'
description: '使用 materialized view 优化 ClickStack 性能'
doc_type: 'guide'
keywords: ['clickstack', '可观测性', 'materialized views', '性能', '优化', '可视化', '聚合']
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import materializedViewDiagram from '@site/static/images/materialized-view/materialized-view-diagram.png';
import edit_source from '@site/static/images/clickstack/materialized_views/edit_source.png';
import add_view from '@site/static/images/clickstack/materialized_views/add_view.png';
import select_metrics from '@site/static/images/clickstack/materialized_views/select_metrics.png';
import select_time_granularity from '@site/static/images/clickstack/materialized_views/select_time_granularity.png';
import select_min_time from '@site/static/images/clickstack/materialized_views/select_min_time.png';
import save_source from '@site/static/images/clickstack/materialized_views/save_source.png';
import generated_sql from '@site/static/images/clickstack/materialized_views/generated_sql.png';
import accelerated_visual from '@site/static/images/clickstack/materialized_views/accelerated_visual.png';

<BetaBadge />


## 介绍 \{#introduction\}

ClickStack 可以利用 [Incremental Materialized Views (IMV)](/materialized-view/incremental-materialized-view) 来加速依赖重度聚合查询的可视化场景，例如随时间计算每分钟平均请求时长。此功能可以显著提升查询性能，对每天约 10 TB 及以上的数据规模部署尤其有用，并支持扩展到每天 PB 级的数据量。增量materialized view 目前处于 Beta 阶段，应谨慎使用。

:::note
告警同样可以从 materialized view 中受益，并会自动利用它们。
这有助于减少运行大量告警时的计算开销，尤其是这些告警通常以较高频率运行的情况下。
缩短执行时间既有利于提升响应速度，也有助于降低资源消耗。
:::

## 什么是增量materialized view \{#what-are-incremental-materialized-views\}

增量materialized view 允许将计算成本从查询时转移到写入时，从而显著加快 `SELECT` 查询。

与 Postgres 等事务型数据库不同，ClickHouse 的 materialized view 不是存储的快照。相反，它充当触发器，在数据块插入源表时对其执行查询。该查询的输出会被写入单独的目标表。随着更多数据被插入，新的部分结果会被追加并合并到目标表中。合并后的结果等价于对整个原始数据集运行一次聚合。

使用 materialized view 的主要原因在于，写入目标表的数据本身就是聚合、过滤或转换的结果。在 ClickStack 中，它们专门用于聚合。这些结果通常比原始输入数据小得多，往往表示部分聚合状态。结合直接查询预聚合目标表的简便性，相比在查询时对原始数据执行相同计算，这会显著降低查询延迟。

ClickHouse 中的 materialized view 会随着数据流入源表而持续更新，其行为更像始终保持最新的索引。这与许多其他数据库不同，后者的 materialized view 是需要定期刷新的静态快照，类似于 ClickHouse 的 [可刷新materialized view](/materialized-view/refreshable-materialized-view)。

<Image img={materializedViewDiagram} size="md" alt="Materialized view 图示"/>

增量materialized view 只在新数据到达时计算视图的变化，将计算负载前移到写入时。由于 ClickHouse 对摄取高度优化，为每个插入数据块维护视图的增量成本，相比在查询执行过程中节省的开销要小得多。计算聚合的成本被摊分到多次插入中，而不是在每次读取时重复支付。因此，查询预聚合结果的代价远低于重新计算，从而在降低运营成本的同时，即便在 PB 级规模下，也能为下游可视化提供近实时性能。

这种模型与在每次更新时重算整个视图或依赖定时刷新的系统有本质区别。关于 materialized view 的工作原理以及如何创建它们的更深入说明，请参阅上文链接的指南。

每一个 materialized view 都会引入额外的写入时开销，因此应当有选择地使用。

:::tip
仅为最常用的仪表盘和可视化创建视图。
在该功能处于 beta 阶段时，将视图数量限制在 20 个以内。
预计在未来的版本中此上限会提高。
:::

:::note
单个 materialized view 可以为不同分组计算多个指标，例如按服务名在 1 分钟时间桶上的最小值、最大值和 p95 时长。这样，一个视图可以服务于多个可视化，而不是只服务一个。因此，将指标整合到共享视图中，对于最大化每个视图的价值并确保其在仪表盘和工作流之间复用非常重要。
:::

在继续之前，建议先更深入了解 ClickHouse 中的 materialized view。
参阅我们的 [增量materialized view](/materialized-view/incremental-materialized-view) 指南以获得更多细节。

## 选择要加速的可视化 \{#selecting-visualizatons-for-acceleration\}

在创建任何 materialized view 之前，务必要先明确希望加速哪些可视化，以及哪些工作流对你的用户最为关键。

在 ClickStack 中，materialized view 旨在**加速以聚合为主的可视化**，也就是那些在一段时间内计算一个或多个指标的查询。例如：**按分钟统计的平均请求时长**、**按服务划分的请求次数**，或是**随时间变化的错误率**。materialized view 中必须始终包含聚合运算以及基于时间的分组，因为它是为时间序列可视化提供服务的。

一般来说，推荐遵循以下原则：

### 识别高影响力的可视化 \{#identify-high-impact-visualizations\}

最适合进行加速的候选对象通常属于以下几类：

- 频繁刷新且持续展示的仪表盘可视化，例如挂在墙上用于高层级监控的仪表盘。
- 运行手册（runbook）中的诊断工作流，其中的特定图表在事故响应期间被反复查看，并且需要快速返回结果。
- 核心 HyperDX 使用体验，包括：
  * 搜索页面中的直方图视图。
  * 预设仪表盘中使用的可视化，例如 APM、Services 或 Kubernetes 视图。

这些可视化通常会在不同用户和时间范围之间被反复执行，非常适合作为将计算从查询时转移到写入阶段的目标。

### 在插入开销与加速收益之间取得平衡 \{#balance-benefit-against-insert-time-cost\}

materialized view 会在插入时引入额外工作，因此应有选择性且经过慎重评估后再创建。并非所有可视化都能从预聚合中获益，而为很少使用的图表做加速通常不值得这部分额外开销。你应将 materialized view 的总数量控制在最多 20 个以内。

:::note
在迁移到生产环境之前，务必验证 materialized view 引入的资源开销，特别是 CPU 使用率、磁盘 I/O，以及[合并活动](/docs/tips-and-tricks/too-many-parts)。每个 materialized view 都会增加插入时的工作量并产生额外的分区片段，因此需要确保合并过程能够跟上，并保持分区片段数量稳定。你可以通过[系统表](/operations/system-tables/tables)以及开源 ClickHouse 中的[内置可观测性仪表板](/operations/monitoring#built-in-advanced-observability-dashboard)，或者通过 ClickHouse Cloud 中的内置指标和[监控仪表板](/cloud/manage/monitor/advanced-dashboard)进行监控。关于过多分区片段的诊断与缓解方法，请参见 [Too many parts](/guides/best-practices/too-many-parts)。
:::

一旦你识别出最重要的可视化，下一步就是进行整合。

### 将可视化整合到共享视图中 \{#consolidate-visualizations-into-shared-views\}

ClickStack 中的所有 materialized view 都应使用诸如 [`toStartOfMinute`](/sql-reference/functions/date-time-functions#toStartOfMinute) 之类的函数按时间区间对数据进行分组。不过，许多可视化还会共享其他分组键，例如服务名、span 名称或状态码。当多个可视化使用相同的分组维度时，它们通常可以由单个 materialized view 来支撑。

例如（针对 traces）：

* 按服务名随时间统计平均耗时 - `SELECT avg(Duration), toStartOfMinute(Timestamp) as time, ServiceName FROM otel_traces GROUP BY ServiceName, time`
* 按服务名随时间统计请求次数 - `SELECT count() count, toStartOfMinute(Timestamp) as time, ServiceName FROM otel_traces GROUP BY ServiceName, time`
* 按状态码随时间统计平均耗时 - `SELECT avg(Duration), toStartOfMinute(Timestamp) as time, StatusCode FROM otel_traces GROUP BY StatusCode, time`
* 按状态码随时间统计请求次数 - `SELECT count() count, toStartOfMinute(Timestamp) as time, StatusCode FROM otel_traces GROUP BY StatusCode, time`

与其为每个查询和图表分别创建单独的 materialized view，不如将它们合并为一个按服务名和状态码聚合的 materialized view。该单个视图可以计算多个指标，如 count、平均耗时、最大耗时以及分位数，然后在多个可视化之间复用。下面展示了一个合并上述内容的示例查询：

```sql
SELECT avg(Duration), max(Duration), count(), quantiles(0.95,0.99)(Duration), toStartOfMinute(Timestamp) as time, ServiceName, StatusCode
FROM otel_traces
GROUP BY time, ServiceName, StatusCode
```

以这种方式整合视图可以减少写入时开销，限制 materialized view 的总数，减少与数据分片数量相关的问题，并简化后续维护工作。

在这个阶段，**请重点关注将由你想要加速的可视化发起的查询**。在下一节中，你将看到一个示例，展示如何将多个聚合查询整合到单个 materialized view 中。


## 创建 materialized view \{#creating-a-materialized-view\}

在确定了需要加速的可视化，或一组可视化之后，下一步是确定其底层查询。实际操作中，这意味着检查可视化配置并审阅生成的 SQL，特别要关注所使用的聚合指标以及所应用的函数。

<Image img={generated_sql} size="lg" alt="Generated SQL"/>

:::note
在 HyperDX 中某些组件没有可用调试面板时，用户可以查看浏览器控制台，其中会记录所有查询。
:::

在整理出所需的查询后，应先熟悉 ClickHouse 中的 [**aggregate state 函数**](/sql-reference/data-types/aggregatefunction)。materialized view 依赖这些函数，将计算从查询时刻转移到插入时刻。materialized view 不存储最终的聚合值，而是计算并存储**中间聚合状态**，这些状态会在查询时合并并最终计算得到结果。这些状态通常比原始表要小得多。这些状态具有专用的数据类型，必须在目标表的 schema 中显式表示。

作为参考，ClickHouse 文档中提供了 aggregate state 函数的详细概览与示例，以及用于存储它们的表引擎 `AggregatingMergeTree`：

- [Aggregate functions and states](/sql-reference/aggregate-functions)
- [AggregatingMergeTree engine](/engines/table-engines/mergetree-family/aggregatingmergetree)

可以在下面的视频中看到一个使用 AggregatingMergeTree 和 Aggregate 函数的示例：

<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="Aggregation States in ClickHouse" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

**强烈建议**在继续之前先熟悉这些概念。

### 示例 materialized view \{#example-materialized-view\}

请看以下原始查询，它按服务名称和状态码分组，计算每分钟的平均持续时间、最大持续时间、事件数量以及各个分位数：

```sql
SELECT
    toStartOfMinute(Timestamp),
    ServiceName,
    StatusCode,
    count() AS count,
    avg(Duration),
    max(Duration),
    quantiles(0.95, 0.99)(Duration)
FROM otel_traces
GROUP BY
    time,
    ServiceName,
    StatusCode
```

为加速该查询，请创建一个目标表 `otel_traces_1m`，用于存储相应的聚合状态：

```sql
CREATE TABLE otel_traces_1m
(
    `Timestamp` DateTime,
    `ServiceName` LowCardinality(String),
    `StatusCode` LowCardinality(String),
    `count` SimpleAggregateFunction(sum, UInt64),
    `avg__Duration` AggregateFunction(avg, UInt64),
    `max__Duration` SimpleAggregateFunction(max, Int64),
    `quantiles__Duration` AggregateFunction(quantiles(0.95, 0.99), Int64)
)
ENGINE = AggregatingMergeTree
ORDER BY (Timestamp, ServiceName, StatusCode);
```

`materialized view` - `otel_traces_1m_mv` - 的定义会在插入新数据时计算并写入这些状态：

```sql
CREATE MATERIALIZED VIEW otel_traces_1m_mv TO otel_traces_1m
AS
SELECT
    toStartOfMinute(Timestamp) AS Timestamp,
    ServiceName,
    StatusCode,
    count() AS count,
    avgState(Duration) AS avg__Duration,
    maxSimpleState(Duration) AS max__Duration,
    quantilesState(0.95, 0.99)(Duration) AS quantiles__Duration
FROM otel_v2.otel_traces
GROUP BY
    Timestamp,
    ServiceName,
    StatusCode;
```

This materialized view 由两部分组成：

1. 目标表，用于定义存储中间结果的模式（schema）和聚合状态类型。必须使用 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 引擎，以确保这些状态在后台能够被正确合并。
2. 在插入数据时自动执行的 materialized view 查询。与原始查询相比，它使用 `avgState`、`quantilesState` 等状态函数，而不是最终聚合函数。

最终得到的是一张紧凑的表，用于按分钟存储每个服务名和状态码的聚合状态。它的大小会随时间和基数可预测地增长，并且在完成后台合并之后，其表示的结果与在原始明细数据上直接运行初始聚合查询相同。对这张表进行查询的成本远低于直接从源 `traces` 表做聚合，从而在大规模场景下实现快速且稳定的可视化性能。


## 在 ClickStack 中使用 materialized view \{#materialized-view-usage-in-clickstack\}

在 ClickHouse 中创建完成 materialized view 之后，必须将其注册到 ClickStack 中，这样可视化、仪表盘和告警就能自动使用它们。

### 注册 materialized view 以便使用 \{#registering-a-view\}

materialized view 应该注册到 HyperDX 中与其 **原始源表** 对应的 **source** 上。

<VerticalStepper headerLevel="h4">

#### 编辑 source \{#edit-the-source\}

导航到 HyperDX 中相关的 **source** 并打开 **Edit configuration** 对话框。滚动到 materialized view 部分。

<Image img={edit_source} size="lg" alt="Edit sources"/>

#### 添加 materialized view \{#add-the-materialized-view\}

选择 **Add materialized view**，然后选择作为该 materialized view 底层存储的数据库和目标表。

<Image img={add_view} size="lg" alt="Edit sources"/>

#### 选择指标 \{#select-metrics\}

在大多数情况下，时间戳、维度和指标列会被自动推断。如果没有，则需要手动指定。

对于指标，你必须完成如下映射：
- 原始列名，例如 `Duration`
- materialized view 中对应的聚合列，例如 `avg__Duration`

对于维度，指定除时间戳以外，view 按其进行分组的所有列。

<Image img={select_metrics} size="lg" alt="Select Metrics"/>

#### 选择时间粒度 \{#select-time-granularity\}

选择该 materialized view 的 **时间粒度**，例如一分钟。

<Image img={select_time_granularity} size="lg" alt="Select Time Granularity"/>

#### 选择最小日期 \{#specify-the-minimum-date\}

指定该 materialized view 包含数据的最小日期。这表示该 view 中可用的最早时间戳，通常是创建 view 的时间，前提是摄取过程一直持续不断。

:::note
materialized view 在创建时 **不会自动回填**，因此它们只包含在创建之后插入的数据所生成的行。
关于回填 materialized view 的完整指南，请参见 ["Backfilling Data."](/data-modeling/backfilling#scenario-2-adding-materialized-views-to-existing-tables)
:::

<Image img={select_min_time} size="lg" alt="Select Min Time"/>

如果确切的起始时间不明确，可以通过查询目标表中的最小时间戳来确定，例如：

```sql
SELECT min(Timestamp) FROM otel_traces_1m
```

#### 保存 source \{#save-the-source\}

保存该 source 的配置。

<Image img={save_source} size="lg" alt="Save Source"/>

</VerticalStepper>

一旦 materialized view 被注册，ClickStack 会在查询符合条件时自动使用它，而无需对仪表盘、可视化或告警做任何修改。ClickStack 会在执行时评估每个查询，并确定是否可以应用某个 materialized view。

### 在仪表盘和可视化中验证加速 \{#verifying-acceleration-in-dashboards-and-visualizations\}

需要牢记的是，增量materialized view 只包含在**创建该 view 之后插入的**数据。它们不会自动回填历史数据，从而保持轻量且维护成本低。基于这一点，用户在注册 view 时必须显式指定其有效时间范围。

:::note
ClickStack 仅当某个 materialized view 的最小时间戳小于或等于查询时间范围的开始时间时才会使用该 view，以确保 view 中包含所有所需数据。尽管查询在内部会被拆分为按时间划分的子查询，但 materialized view 要么应用于整个查询，要么完全不使用。未来的改进可能会允许仅对符合条件的子查询选择性地使用这些 view。
:::

ClickStack 提供了清晰的可视化指示器，用于确认是否正在使用某个 materialized view。

1. **检查优化状态** 在查看仪表盘或可视化时，查找闪电图标或 `Accelerated` 图标：

- **绿色闪电** 表示该查询已通过 materialized view 加速。
- **橙色闪电** 表示该查询是直接在源表上执行的。

<Image img={accelerated_visual} size="lg" alt="Accelerated Visualization"/>

2. **查看优化详情** 单击闪电图标以打开详细信息面板，其中显示：

- **活动 materialized view**：为该查询选中的 view，包括其预估行数。
- **被跳过的 materialized view**：兼容但未被选中的 view，以及它们的预估扫描数据量。
- **不兼容的 materialized view**：无法使用的 view 以及具体原因。

3. **了解常见不兼容原因** 在以下情况下，某个 materialized view 可能不会被使用：

- **查询时间范围** 的开始时间早于该 view 的最小时间戳。
- **可视化粒度** 不是该 view 粒度的整数倍。
- 查询所需的 **聚合函数** 在该 view 中不存在。
- 查询使用了无法从 view 的聚合状态中推导的 **自定义计数表达式**，例如 `count(if(...))`。

这些指示器可以帮助轻松确认某个可视化是否已加速、理解为何选中了特定的 view，并诊断某个 view 为何不符合使用条件。

### 如何为可视化选择 materialized view \{#how-views-are-selected\}

当执行可视化时，ClickStack 可能会有多个可选对象，包括基础表以及多个 materialized view。为确保最佳性能，ClickStack 会使用 ClickHouse 的 [`EXPLAIN ESTIMATE`](/sql-reference/statements/explain#explain-estimate) 机制自动评估并选择最高效的选项。

选择过程遵循一个明确定义的顺序：

1. **验证兼容性**  
   ClickStack 首先通过检查以下内容来确定某个 materialized view 是否可用于该查询：
   - **时间覆盖范围**：查询的时间范围必须完全落在该 materialized view 可用数据的范围内。
   - **粒度**：可视化的时间分桶必须与该 view 的粒度相同或更粗。
   - **聚合**：请求的指标必须在该 view 中存在，并且可以由其聚合状态计算得到。

2. **转换查询**  
   对于兼容的 view，ClickStack 会重写查询以针对该 materialized view 所对应的表：
   - 将聚合函数映射到 view 中相应的列。
   - 对聚合状态应用 `-Merge` 组合器。
   - 调整时间分桶以与该 view 的粒度对齐。

3. **选择最佳候选**  
   如果存在多个兼容的 materialized view，ClickStack 会对每个候选运行一次 [`EXPLAIN ESTIMATE`](/sql-reference/statements/explain#explain-estimate) 查询，并比较估算的扫描行数和 granule 数量。估算扫描成本最低的 view 会被选中。

4. **优雅回退**  
   如果没有任何 materialized view 兼容，ClickStack 会自动回退为查询源表。

这种方法能够持续最小化被扫描的数据量，并在无需修改可视化定义的前提下，提供可预测的低延迟性能。

只要 view 中包含所有所需维度，即使可视化中包含过滤器、搜索约束或时间分桶，materialized view 仍然是可用的。这样可以在无需更改可视化定义的情况下，加速仪表盘、直方图和带过滤条件的图表。

#### 选择 materialized view 的示例 \{#example-of-choosing-materialized-view\}

考虑在同一个 trace 源上创建的两个 materialized view：

* `otel_traces_1m`，按分钟、`ServiceName` 和 `StatusCode` 分组
* `otel_traces_1m_v2`，按分钟、`ServiceName`、`StatusCode` 和 `SpanName` 分组

第二个 materialized view 含有更多的分组键，因此会产生更多的行并扫描更多的数据。

如果某个可视化请求**随时间变化的每个服务的平均持续时间**，从技术上讲这两个 materialized view 都是有效的。ClickStack 会对每个候选项发出一个 [`EXPLAIN ESTIMATE`](/sql-reference/statements/explain#explain-estimate) 查询，并比较估算的 granule 数量，即：

```sql
EXPLAIN ESTIMATE
SELECT
    toStartOfHour(Timestamp) AS hour,
    ServiceName,
    avgMerge(avg__Duration) AS avg__Duration
FROM otel_v2.otel_traces_1m
GROUP BY
    hour,
    ServiceName
ORDER BY hour DESC

┌─database─┬─table──────────┬─parts─┬──rows─┬─marks─┐
│ otel_v2  │ otel_traces_1m │     1 │ 49385 │     6 │
└──────────┴────────────────┴───────┴───────┴───────┘

1 row in set. Elapsed: 0.009 sec.

EXPLAIN ESTIMATE
SELECT
    toStartOfHour(Timestamp) AS hour,
    ServiceName,
    avgMerge(avg__Duration) AS avg__Duration
FROM otel_v2.otel_traces_1m_v2
GROUP BY
    hour,
    ServiceName
ORDER BY hour DESC

┌─database─┬─table─────────────┬─parts─┬───rows─┬─marks─┐
│ otel_v2  │ otel_traces_1m_v2 │     1 │ 212519 │    26 │
└──────────┴───────────────────┴───────┴────────┴───────┘

1 row in set. Elapsed: 0.004 sec.
```

由于 `otel_traces_1m` 更小且需要扫描的数据块更少，因此会被自动选用。

这两个 materialized view 的性能都优于直接查询基础表，但选择满足需求的最小视图可以获得最佳性能。


### 告警 \{#alerts\}

在兼容的情况下，告警查询会自动使用 materialized view。会应用相同的优化逻辑，从而加快告警评估速度。

## 回填 materialized view \{#backfilling-a-materialized-view\}

如前所述，增量materialized view 仅包含在**视图创建之后插入**的数据，并不会自动回填。这一设计使视图保持轻量、维护成本低，但也意味着当查询需要早于视图最小时间戳的数据时，将无法使用该视图。

在大多数情况下，这是可以接受的。常见的 ClickStack 工作负载主要关注最近的数据（例如最近 24 小时），这意味着新创建的视图在创建后一天内就能完全可用。然而，对于跨越更长时间范围的查询，在足够的时间过去之前，该视图可能一直不可用。

在这些场景下，用户可以考虑使用历史数据对 materialized view 进行**回填（backfilling）**。

回填可能会**计算开销很大**。在正常运行状态下，materialized view 会随着数据到达而增量填充，将计算成本均匀地分摊在时间维度上。

回填则会把这些工作压缩到一个更短的时间段内，**显著提高单位时间内的 CPU 和内存使用率。**

根据数据集规模和数据保留窗口的不同，这可能需要临时扩展集群规模——无论是纵向扩容，还是在 ClickHouse Cloud 中进行横向扩容——以在合理的时间内完成回填。

如果没有额外预留资源，回填可能会对生产工作负载产生负面影响，包括查询延迟上升和摄取吞吐量下降。对于**非常大的数据集或很长的历史时间范围，回填可能并不现实，甚至完全不可行**。

总而言之，回填往往不值得其带来的成本和运维风险。只有在历史查询加速至关重要的特殊场景下才应考虑实施回填。如果确需执行，建议遵循下文所述的受控方案，在性能、成本与生产影响之间取得平衡。

### 回填方法 \{#backfilling-approaches\}

:::note 避免使用 POPULATE
除非是在摄取已暂停的小型数据集上进行操作，否则不建议使用 [POPULATE](/sql-reference/statements/create/view#materialized-view) 命令来为 materialized view 执行回填。该操作可能会遗漏在其源表中插入的部分行，因为 materialized view 是在 POPULATE 的哈希计算完成之后才创建的。此外，此操作会对全部数据运行，在大型数据集上容易受到中断或内存限制的影响。
:::

假设要为下述聚合所对应的 materialized view 执行回填，该聚合按服务名称和状态码分组计算每分钟的指标：

```sql
SELECT
    toStartOfMinute(Timestamp),
    ServiceName,
    StatusCode,
    count() AS count,
    avg(Duration),
    max(Duration),
    quantiles(0.95, 0.99)(Duration)
FROM otel_traces
GROUP BY
    time,
    ServiceName,
    StatusCode
```

如前文所述，增量materialized view 不会自动回填历史数据。建议采用以下流程，在保持新数据增量处理行为的同时，安全地回填历史数据。


#### 使用 `INSERT INTO SELECT` 进行直接回填 \{#direct-backfill\}

此方法最适用于**较小的数据集**或**相对轻量级的聚合查询**，在这种情况下，可以在合理时间内完成全量回填且不会耗尽集群资源。通常当回填查询可以在几分钟、最多数小时内完成，并且可以接受 CPU 与 I/O 使用的临时升高时，这种方式是合适的。对于更大的数据集或计算成本更高的聚合，请改用下面的增量或基于数据块的回填方式。

<VerticalStepper headerLevel="h5">

##### 确定当前 view 的覆盖范围 \{#determine-current-coverage-of-view\}

在尝试任何回填之前，先确定该 materialized view 当前已经包含哪些数据。可以通过查询目标表中存在的最小时间戳来完成：

```sql
SELECT min(Timestamp)
FROM otel_traces_1m;
```

该时间戳表示该 view 能够满足查询的最早时间点。来自 ClickStack、请求早于此时间戳数据的任何查询，都会回退到基础表。

##### 判断是否有必要进行回填 \{#decide-whether-backfilling-is-neccessary\}

在大多数 ClickStack 部署中，查询主要关注最近的数据，例如最近 24 小时。在这种情况下，新创建的 view 会在创建后不久即完全可用，无需进行回填。

如果上一步返回的时间戳对你的使用场景来说已经足够久远，则不需要回填。只有在以下情况下才应考虑回填：

- 查询经常跨越较长的历史时间范围。
- 在这些时间范围内，该 view 对性能至关重要。
- 数据集规模和聚合成本使回填在资源上是可行的。

##### 回填缺失的历史数据 \{#backfill-missing-historical-data\}

如果需要回填，请使用来自该 view 的查询，并将其修改为仅读取早于上述时间戳的数据，以填充 materialized view 的目标表中早于当前最小时间戳的部分。由于目标表使用 AggregatingMergeTree，回填查询**必须插入聚合状态而不是最终值**。

:::warning
该查询可能会处理大批量数据，并且会消耗大量资源。在执行回填之前，务必确认可用的 CPU、内存和 I/O 容量。一个有用的技巧是先使用 `FORMAT Null` 执行该查询，以估算运行时间和资源占用。

如果预计查询本身将运行数小时以上，则**不推荐**使用此方法。
:::

注意以下查询如何添加 `WHERE` 子句，将聚合限制为早于该 view 中最早时间戳的数据：

```sql
INSERT INTO otel_traces_1m
SELECT
    toStartOfMinute(Timestamp) AS Timestamp,
    ServiceName,
    StatusCode,
    count() AS count,
    avgState(Duration) AS avg__Duration,
    maxSimpleState(Duration) AS max__Duration,
    quantilesState(0.95, 0.99)(Duration) AS quantiles__Duration
FROM otel_traces
WHERE Timestamp < (
    SELECT min(Timestamp) FROM otel_traces_1m
)
GROUP BY
    Timestamp,
    ServiceName,
    StatusCode;
```
</VerticalStepper>

#### 使用 Null 表进行增量回填 \{#incremental-backfill-null-table\}

对于更大的数据集或资源消耗更高的聚合查询，使用单个 `INSERT INTO SELECT` 进行直接回填可能既不切实际也不安全。在这些情况下，推荐使用**增量回填**方法。该方法更贴近增量materialized view的常规运行方式，以可管理的数据块进行处理，而不是一次性聚合整个历史数据集。

在以下场景中适用此方法：

- 否则回填查询将需要运行许多小时。
- 完整聚合的峰值内存占用过高。
- 您希望在回填期间严格控制 CPU 和内存消耗。
- 您需要一个在中断后可以安全重启的、更健壮的流程。

核心思路是使用一个 [**Null 表**](/engines/table-engines/special/null)作为摄取缓冲区。虽然 Null 表本身不存储数据，但附加到它的任何 materialized view 仍会执行，从而在数据流经时增量计算聚合状态。

<VerticalStepper headerLevel="h5">

##### 为回填创建一个 Null 表 \{#create-null-table\}

创建一个轻量级的 Null 表，仅包含 materialized view 聚合所需的列。这样可以最大程度减少 I/O 和内存使用。

```sql
CREATE TABLE otel_traces_backfill
(
    Timestamp DateTime64(9),
    ServiceName LowCardinality(String),
    StatusCode LowCardinality(String),
    Duration UInt64
)
ENGINE = Null;
```

##### 将一个 materialized view 附加到 Null 表 \{#attach-mv-to-null-table\}

接下来，在 Null 表上创建一个 materialized view，使其写入与主 materialized view 使用的聚合表相同的目标表。

```sql
CREATE MATERIALIZED VIEW otel_traces_1m_mv_backfill
TO otel_traces_1m
AS
SELECT
    toStartOfMinute(Timestamp) AS Timestamp,
    ServiceName,
    StatusCode,
    count() AS count,
    avgState(Duration) AS avg__Duration,
    maxSimpleState(Duration) AS max__Duration,
    quantilesState(0.95, 0.99)(Duration) AS quantiles__Duration
FROM otel_traces_backfill
GROUP BY
    Timestamp,
    ServiceName,
    StatusCode;
```

当向 Null 表插入行时，这个 materialized view 会以增量方式执行，以小数据块的形式生成聚合状态。

##### 增量回填数据 \{#incremental-backfill\}

最后，将历史数据插入到 Null 表中。materialized view 将按数据块处理数据，将聚合状态写入目标表，而不持久化原始行。

```sql
INSERT INTO otel_traces_backfill
SELECT
    Timestamp,
    ServiceName,
    StatusCode,
    Duration
FROM otel_traces
WHERE Timestamp < (
    SELECT min(Timestamp) FROM otel_traces_1m
);
```

由于数据是增量处理的，内存使用保持有界且可预测，其行为与正常摄取非常接近。

:::note
为了进一步提高安全性，可以考虑将回填用的 materialized view 指向一个临时目标表（例如 `otel_traces_1m_v2`）。一旦回填成功完成，可以将[分区移动](/sql-reference/statements/alter/partition#move-partition-to-table)到主目标表，例如 `ALTER TABLE otel_traces_1m_v2 MOVE PARTITION '2026-01-02' TO otel_traces_1m`。如果回填因资源限制而中断或失败，这样可以更容易恢复。
:::

关于如何调优此过程（包括提升插入性能以及减少和控制资源使用）的更多详情，请参阅 [“Backfilling”](/data-modeling/backfilling#tuning-performance--resources)。

</VerticalStepper>

## 建议 \{#recommendations\}

以下建议总结了在 ClickStack 中设计和运维 materialized views 的最佳实践。遵循这些指南有助于确保 materialized views 高效、可预测且具备良好的成本效益。

### 粒度选择与对齐 \{#granularity-selection-and-alignment\}

只有当可视化或告警的粒度是 materialized view 粒度的**整数倍**时，才会使用这些 materialized view。粒度的确定方式取决于图表类型：

- **时间图表**（x 轴为时间的折线图或柱状图）：
  图表显式设置的粒度必须是 materialized view 粒度的倍数。
  例如，10 分钟粒度的图表可以使用粒度为 10、5、2 或 1 分钟的 materialized view，但不能使用 20 分钟或 3 分钟粒度的 materialized view。

- **非时间图表**（数值、表格或汇总图表）：
  有效粒度由 `(time range / 80)` 推导得到，并向上取整为 HyperDX 支持的最近粒度。该推导出的粒度也必须是 materialized view 粒度的倍数。

基于以上规则：

- **不要创建粒度为 10 分钟的 materialized view**。
  ClickStack 在图表和告警中支持 15 分钟粒度，但不支持 10 分钟。10 分钟的 materialized view 因此与常见的 15 分钟可视化和告警不兼容。
- 建议优先使用 **1 分钟**或**1 小时**粒度，它们可以与大多数图表和告警配置良好组合。

更粗的粒度（例如 1 小时）会生成更小的 materialized view，且存储开销更低；而更细的粒度（例如 1 分钟）则为细粒度分析提供了更高的灵活性。请选择能够支持关键工作流的最小粒度。

### 限制并整合 materialized views \{#limit-and-consolidate-materialized-views\}

每个 materialized view 都会引入额外的插入时开销，并增加数据分片与合并压力。
建议遵循以下准则：

- **每个源表不超过 20 个 materialized view**。
- **大约 10 个 materialized view** 通常是较优的选择。
- 当多个可视化共享相同维度时，将它们整合到单个视图中。

在可行的情况下，从同一个 materialized view 中计算多个指标，并支持多张图表。

### 谨慎选择维度 \{#choose-dimensions-carefully\}

只包含在分组或过滤中经常使用的维度：

- 每增加一个用于分组的列，都会增加 VIEW 的大小。
- 在查询灵活性与存储和写入（插入）成本之间权衡。
- 对视图中不存在的列进行过滤时，ClickStack 会回退到源表。

:::note 提示
一个常见且几乎总是有用的基线做法是使用按 **service name 分组并包含 count 指标** 的 materialized view，这样可以在搜索和仪表板中快速生成直方图并提供服务级别总览。
:::

### 聚合列的命名约定 \{#naming-conventions-for-aggregation-columns\}

materialized view 的聚合列必须遵循严格的命名约定，以支持自动推断：

- 命名模式：`<aggFn>__<sourceColumn>`
- 示例：
  - `avg__Duration`
  - `max__Duration`
  - `count__` 表示行计数

ClickStack 依赖这一约定，将查询正确映射到 materialized view 的列。

### 分位数与 sketch 选择 \{#quantiles-and-sketch-selection\}

不同的分位数函数在性能和存储方面具有不同的特性：

- `quantiles` 会在磁盘上生成更大的 sketch，但在插入时的计算开销更低。
- `quantileTDigest` 在插入时计算成本更高，但会生成更小的 sketch，通常能带来更快的视图查询。

你可以在插入时为这两个函数指定 sketch 大小（例如使用 `quantile(0.5)`）。生成的 sketch 之后仍然可以用于查询其他分位数值，例如 `quantile(0.95)`。建议通过试验为你的工作负载找到最合适的平衡点。

### 持续验证效果 \{#validate-effectiveness-continously\}

务必持续验证 materialized view 是否确实带来了实际收益：

- 通过 UI 中的加速指示器确认其实际使用情况。
- 比较启用该 materialized view 前后的查询性能。
- 监控资源使用情况和合并（merge）行为。

应将 materialized view 视为性能优化机制，需随着查询模式的演变进行定期审查和调整。

### 高级配置 \{#advanced-configurations\}

对于更复杂的工作负载，可以使用多个 materialized view 来支持不同的访问模式。示例如下：

- **对近期数据使用高精度视图，对历史数据使用粗粒度视图**
- **面向服务级别的概览视图以及面向端点级别的深度诊断视图**

在有选择地应用时，这些模式可以显著提升性能，但应仅在验证了更简单的配置之后再引入。

遵循这些建议将有助于确保 materialized view 持续高效、易于维护，并与 ClickStack 的执行模型保持一致。

## 局限性 \{#limitations\}

### 常见不兼容原因 \{#common-incompatibility-reasons\}

如果满足以下任一条件，materialized view **将不会** 被使用：

- **查询时间范围**  
  查询时间范围的起始时间早于 materialized view 的最小时间戳。由于 materialized view 不会自动回填，它只能用于满足其完全覆盖时间范围内的查询。

- **粒度不匹配**  
  可视化的有效粒度必须是 materialized view 粒度的整数倍。具体来说：

  * 对于 **时间图表**（x 轴为时间的折线图或柱状图），图表选定的粒度必须是 materialized view 粒度的整数倍。例如，一个 10 分钟的图表可以使用 10、5、2 或 1 分钟粒度的 materialized view，但不能使用 20 分钟或 3 分钟粒度的 materialized view。
  * 对于 **非时间图表**（数字或表格图表），有效粒度按 `(time range / 80)` 计算，并向上取整到最接近的 HyperDX 支持的粒度，同时也必须是 materialized view 粒度的整数倍。

- **不支持的聚合函数**  
  查询请求了 materialized view 中不存在的聚合函数。只能使用在 materialized view 中显式计算并存储的聚合函数。

- **自定义计数表达式**  
  使用 `count(if(...))` 或其他条件计数表达式的查询，无法从标准聚合状态派生，因此无法使用 materialized view。

### 设计与运维约束 \{#design-and-operational-constraints\}

- **无自动回填**
  增量materialized view 仅包含在创建之后插入的数据。要加速历史数据，需要显式执行回填，这对于大型数据集来说可能代价高昂或不切实际。

- **粒度权衡**
  粒度非常细的视图会增加存储规模和插入时的开销，而粒度较粗的视图则会降低灵活性。必须谨慎选择粒度，以匹配预期的查询模式。

- **维度爆炸**
  添加大量分组维度会显著增加视图大小，并可能降低其效果。视图应仅包含常用的分组和过滤列。

- **视图数量的可扩展性有限**
  每个 materialized view 都会增加插入时的开销，并加剧合并压力。创建过多视图会对摄取和后台合并产生负面影响。

了解这些限制有助于确保仅在 materialized view 能带来实际收益的场景中使用它们，并避免出现悄然回退到较慢源表查询的配置。

## 故障排查 \{#troubleshooting\}

### Materialized view 未被使用 \{#materialied-view-not-being-used\}

**检查 1：日期范围**

- 打开优化弹窗，查看是否显示 "Date range not supported."。
- 确保查询的日期范围晚于 materialized view 的最小日期。
- 如果 materialized view 覆盖了全部历史数据，则移除最小日期限制。

**检查 2：粒度**

- 验证图表粒度是否为 MV 粒度的倍数。
- 尝试将图表设置为 "Auto"，或手动选择兼容的粒度。

**检查 3：聚合**

- 检查图表是否使用了 MV 中已定义的聚合方式。
- 在优化弹窗中查看 "Available aggregated columns"。

**检查 4：维度**

- 确保 GROUP BY 列包含在 MV 的维度列中。
- 在优化弹窗中查看 "Available group/filter columns"。

### materialized view 查询缓慢 \{#slow-mv-queries\}

**问题 1：materialized view 粒度过细**

- 由于粒度过细（例如 1 秒），MV 包含过多行。
- 解决方案：创建粒度更粗的 MV（例如 1 分钟或 1 小时）。

**问题 2：维度过多**

- 由于维度列过多，MV 的基数过高。
- 解决方案：将维度列减少到最常用的列。

**问题 3：多个 MV 行数过高**

- 系统会对每个 MV 运行 `EXPLAIN`。
- 解决方案：移除很少使用或总是被跳过的 MV。

### 配置错误 \{#config-errors\}

**错误："At least one aggregated column is required"**

- 在 MV 配置中至少添加一个聚合列。

**错误："Source column is required for non-count aggregations"**

- 指定要聚合的列（只有 count 可以省略源列）。

**错误："Invalid granularity format"**

- 从下拉列表中选择一个预设粒度。
- 格式必须是有效的 SQL interval（例如 `1 hour`，而不是 `1 h`）。