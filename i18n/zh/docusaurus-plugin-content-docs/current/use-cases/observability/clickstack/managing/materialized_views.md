---
slug: /use-cases/observability/clickstack/materialized_views
title: 'ClickStack - Materialized Views'
sidebar_label: 'Materialized Views'
description: '使用 Materialized Views 优化 ClickStack 性能'
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

ClickStack 可以利用 [增量materialized view（Incremental Materialized Views，IMV）](/materialized-view/incremental-materialized-view) 来加速依赖聚合开销较大查询的可视化，例如随时间计算每分钟平均请求时长。此功能可以显著提高查询性能，通常在较大的部署（每天约 10 TB 及以上）中收益最大，同时支持扩展到每天 PB 级的数据量。增量materialized view 目前处于 Beta 阶段，使用时应谨慎。

:::note
告警同样可以从 materialized view 中获益，并且会自动使用它们。
这可以降低运行大量告警时的计算开销，特别是因为这些告警通常执行得非常频繁。
缩短执行时间有助于提升响应性并降低资源消耗。
:::

## 什么是增量materialized view \{#what-are-incremental-materialized-views\}

增量materialized view 允许你将计算成本从查询时刻转移到写入时刻，从而显著加快 `SELECT` 查询。

与 Postgres 等事务型数据库不同，ClickHouse 的 materialized view 不是一个存储的快照。相反，它充当一个触发器，在数据块写入源表时对其运行查询。该查询的输出会写入一个单独的目标表。随着更多数据被写入，新的部分结果会被追加并合并到目标表中。合并后的结果等价于在整个原始数据集上运行聚合。

使用 materialized view 的主要动机在于，写入目标表的数据代表了聚合、过滤或转换的结果。在 ClickStack 中，它们专门用于聚合。这些结果通常远小于原始输入数据，往往表示部分聚合状态。再加上直接查询预聚合目标表的简单性，相比在查询时对原始数据执行相同的计算，这会显著降低查询延迟。

ClickHouse 中的 materialized view 会在数据流入源表时持续更新，更像是始终最新的索引。这不同于许多其他数据库，其中的 materialized view 是必须定期刷新的静态快照，类似于 ClickHouse 的 [Refreshable Materialized Views](/materialized-view/refreshable-materialized-view)。

<Image img={materializedViewDiagram} size="md" alt="Materialized view diagram"/>

增量materialized view 只在新数据到达时计算视图中的增量变化，将计算前移到写入时刻。由于 ClickHouse 针对摄取进行了高度优化，为每个写入数据块维护视图的增量成本，相对于在查询执行期间获得的节省而言非常小。计算聚合的成本被分摊到多次写入上，而不是在每次读取时反复支付。因此，查询预聚合结果的代价远低于重新计算它们，从而在降低运营成本的同时，为下游可视化提供近实时性能，即便在 PB 级规模下也是如此。

这种模型与每次更新都重新计算整个视图或依赖定期刷新的系统有本质区别。要更深入地了解 materialized view 的工作原理以及如何创建它们，请参考上文链接的指南。

每个 materialized view 都会引入额外的写入时开销，因此应有选择地使用。

:::tip
仅为最常用的仪表盘和可视化创建视图。
在该功能处于 beta 阶段时，将使用限制在少于 20 个视图。
预计在未来的版本中这一阈值会提高。
:::

:::note
单个 materialized view 可以为不同分组计算多个指标，例如按服务名在一分钟时间桶上的最小值、最大值和 p95 持续时间。这样，一个视图就可以服务于多个可视化，而不仅仅是一个。因此，将多个指标整合到共享视图中对于最大化每个视图的价值并确保它在仪表盘和工作流之间复用非常重要。
:::

在继续之前，建议你更深入地熟悉 ClickHouse 中的 materialized view。
请参阅我们的 [Incremental materialized views](/materialized-view/incremental-materialized-view) 指南以获取更多详细信息。

## 选择要加速的可视化 \{#selecting-visualizatons-for-acceleration\}

在创建任何 materialized views 之前，首先要明确你希望加速哪些可视化，以及哪些工作流对你的用户最为关键。

在 ClickStack 中，materialized views 被设计用于**加速以聚合为主的可视化**，也就是那些随时间计算一个或多个指标的查询。例如，**每分钟的平均请求时长**、**按服务划分的请求次数**或**随时间变化的错误率**。materialized view 必须始终包含聚合以及基于时间的分组，因为它旨在用于支撑时间序列类可视化。

通常，建议如下：

### 识别高影响力的可视化 \{#identify-high-impact-visualizations\}

最适合进行加速的对象通常属于以下几类之一：

- 频繁刷新并持续展示的仪表盘可视化，例如挂在墙面大屏上的高层级监控仪表盘。
- 在运行手册（runbook）中使用的诊断工作流，其中某些图表在故障响应期间被反复查看，并且需要快速返回结果。
- 核心 HyperDX 体验，包括：
  * 搜索页面上的直方图视图。
  * 预设仪表盘中使用的可视化，例如 APM、Services 或 Kubernetes 视图。

这些可视化通常会在不同用户和时间范围内被反复执行，非常适合将计算从查询时转移到写入（插入）时。

### 在插入时在收益与成本之间取得平衡 \{#balance-benefit-against-insert-time-cost\}

materialized view 会在插入阶段引入额外工作量，因此应当有选择性且慎重地创建。并非所有可视化都能从预聚合中获益，而为很少使用的图表加速通常不值得付出这部分开销。应将 materialized view 的总数量控制在不超过 20 个。

:::note
在迁移到生产环境之前，务必验证 materialized view 引入的资源开销，尤其是 CPU 使用率、磁盘 I/O 和 [merge 活动](/docs/tips-and-tricks/too-many-parts)。每个 materialized view 都会增加插入时的工作量并产生额外的分区片段，因此确保 merge 能够跟上并且分区片段数量保持稳定非常重要。你可以通过 [system tables](/operations/system-tables/tables) 和开源 ClickHouse 中的[内置可观测性仪表盘](/operations/monitoring#built-in-advanced-observability-dashboard)，或者使用 ClickHouse Cloud 中的内置指标和[监控仪表盘](/cloud/manage/monitor/advanced-dashboard)进行监控。关于诊断和缓解分区片段数量过多的问题，请参阅 [Too many parts](/knowledgebase/exception-too-many-parts)。
:::

一旦你识别出最重要的可视化，下一步就是将它们整合到共享视图中。

### 将可视化整合到共享视图中 \{#consolidate-visualizations-into-shared-views\}

ClickStack 中的所有 materialized view 都应当使用诸如 [`toStartOfMinute`](/sql-reference/functions/date-time-functions#toStartOfMinute) 之类的函数按时间间隔对数据进行分组。不过，许多可视化还会共享额外的分组键，例如服务名称、span 名称或状态码。当多个可视化使用相同的分组维度时，通常可以由单个 materialized view 来支撑。

例如（针对 traces）：

* 按服务名称随时间变化的平均持续时间 - `SELECT avg(Duration), toStartOfMinute(Timestamp) as time, ServiceName FROM otel_traces GROUP BY ServiceName, time`
* 按服务名称随时间变化的请求数量 - `SELECT count() count, toStartOfMinute(Timestamp) as time, ServiceName FROM otel_traces GROUP BY ServiceName, time`
* 按状态码随时间变化的平均持续时间 - `SELECT avg(Duration), toStartOfMinute(Timestamp) as time, StatusCode FROM otel_traces GROUP BY StatusCode, time`
* 按状态码随时间变化的请求数量 - `SELECT count() count, toStartOfMinute(Timestamp) as time, StatusCode FROM otel_traces GROUP BY StatusCode, time`

与其为每个查询和图表分别创建 materialized view，不如将这些需求合并到一个按服务名称和状态码聚合的单个 view 中。这个单个 view 可以计算多种指标，例如 count、平均持续时间、最大持续时间，以及各个分位数，并在多个可视化之间复用。下面展示了一个将上述查询合并在一起的示例查询：

```sql
SELECT avg(Duration), max(Duration), count(), quantiles(0.95,0.99)(Duration), toStartOfMinute(Timestamp) as time, ServiceName, StatusCode
FROM otel_traces
GROUP BY time, ServiceName, StatusCode
```

以这种方式整合 view 可以减少写入阶段的开销、限制 materialized view 的总数量、降低与 part 数量相关的问题，并简化后续维护工作。

在这个阶段，**重点关注这些查询本身**——也就是那些将由你希望加速的可视化所发起的查询。在下一节中，你将看到一个示例，展示如何将多个聚合查询合并到单个 materialized view 中。


## 创建 materialized view \{#creating-a-materialized-view\}

一旦确定了想要加速的可视化或一组可视化，下一步就是找出其背后的查询。在实践中，这意味着检查可视化配置并审阅生成的 SQL，特别要关注所使用的聚合度量以及应用的函数。

<Image img={generated_sql} size="lg" alt="生成的 SQL"/>

:::note
在 HyperDX 中某个组件没有可用调试面板时，用户可以检查浏览器控制台，所有查询都会记录在那里。
:::

在整理出所需的查询后，应当先熟悉 ClickHouse 中的[**aggregate state functions**](/sql-reference/data-types/aggregatefunction)。materialized view 依赖这些函数将计算从查询时转移到写入时。materialized view 不再存储最终的聚合值，而是计算并存储**中间聚合状态**，这些状态会在查询时被合并并最终计算得到结果。这些状态通常比原始表小得多。它们有专门的数据类型，必须在目标表的 schema 中显式定义。

作为参考，ClickHouse 在文档中提供了关于 aggregate state functions 及用于存储它们的表引擎 `AggregatingMergeTree` 的详细概述和示例：

- [聚合函数及其状态](/sql-reference/aggregate-functions)
- [AggregatingMergeTree 引擎](/engines/table-engines/mergetree-family/aggregatingmergetree)

可以在下面的视频中看到如何使用 AggregatingMergeTree 和 Aggregate 函数的示例：

<div class='vimeo-container'>
<iframe width="1030" height="579" src="https://www.youtube.com/embed/pryhI4F_zqQ" title="ClickHouse 中的聚合状态" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

**强烈建议**在继续之前先熟悉这些概念。

### materialized view 示例 \{#example-materialized-view\}

考虑下面的原始查询，它按分钟计算平均持续时间、最大持续时间、事件数量以及分位数，并按服务名称和状态码分组：

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

为加速该查询，创建一个目标表 `otel_traces_1m`，用于存储相应的聚合状态：

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

`materialized view`——`otel_traces_1m_mv`——的定义会在插入新数据时计算并写入这些状态：

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

这个 materialized view 由两部分组成：

1. 目标表，用于定义存储中间结果所使用的 schema 和聚合状态类型。需要使用 [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree) 引擎，以确保在后台正确合并这些状态。
2. materialized view 的查询会在插入数据时自动执行。与原始查询相比，它使用 `avgState` 和 `quantilesState` 等状态函数，而不是最终聚合函数。

最终得到的是一个紧凑的表，用于按分钟存储每个服务名称和状态码的聚合状态。其大小会随时间和基数以可预期的方式增长，并且在后台合并完成后，其所表示的结果与在原始明细数据上运行聚合得到的结果相同。对该表进行查询的开销明显低于直接从源 traces 表进行聚合，从而在大规模场景下实现快速且稳定的一致可视化性能。


## 在 ClickStack 中使用 materialized view \{#materialized-view-usage-in-clickstack\}

在 ClickHouse 中创建好 materialized views 之后，必须在 ClickStack 中对其进行注册，这样可视化、仪表板和告警就可以自动使用它们。

### 注册要使用的 materialized view \{#registering-a-view\}

materialized view 应该在 HyperDX 中注册到与其派生所用**原始源表**对应的那个 **source** 上。

<VerticalStepper headerLevel="h4">

#### 编辑 source \{#edit-the-source\}

导航到 HyperDX 中对应的 **source**，并打开 **Edit configuration** 对话框。向下滚动到 materialized view 部分。

<Image img={edit_source} size="lg" alt="编辑 sources"/>

#### 添加 materialized view \{#add-the-materialized-view\}

选择 **Add materialized view**，然后选择为该 materialized view 提供存储的数据库和目标表。

<Image img={add_view} size="lg" alt="编辑 sources"/>

#### 选择指标 \{#select-metrics\}

在大多数情况下，时间戳、维度和指标列会被自动推断。如果没有，则需要手动指定。

对于指标，你必须映射：
- 原始列名，例如，将 `Duration` 映射到
- materialized view 中对应的聚合列，例如 `avg__Duration`

对于维度，指定除时间戳之外，该 view 在 group by 中使用的所有列。

<Image img={select_metrics} size="lg" alt="选择 Metrics"/>

#### 选择时间粒度 \{#select-time-granularity\}

选择 materialized view 的时间粒度，例如 1 分钟。

<Image img={select_time_granularity} size="lg" alt="选择 Time Granularity"/>

#### 选择最小日期 \{#specify-the-minimum-date\}

指定 materialized view 包含数据的最小日期。这表示该 view 中可用的最早时间戳，通常是创建该 view 的时间，前提是摄取一直在持续进行。

:::note
materialized view 在创建时**不会自动回填**，因此只包含在创建之后插入的数据所生成的行。
关于为 materialized view 进行回填的完整指南，请参见 ["Backfilling Data."](/data-modeling/backfilling#scenario-2-adding-materialized-views-to-existing-tables)
:::

<Image img={select_min_time} size="lg" alt="选择 Min Time"/>

如果不清楚精确的开始时间，可以通过查询目标表中的最小时间戳来确定，例如：

```sql
SELECT min(Timestamp) FROM otel_traces_1m
```

#### 保存 source \{#save-the-source\}

保存该 source 的配置。

<Image img={save_source} size="lg" alt="保存 Source"/>

</VerticalStepper>

一旦 materialized view 完成注册，ClickStack 会在查询符合条件时自动使用它，而无需对仪表盘、可视化或告警做任何修改。ClickStack 会在每次执行查询时评估该查询，并决定是否可以应用某个 materialized view。

### 在仪表板和可视化中验证加速效果 \{#verifying-acceleration-in-dashboards-and-visualizations\}

需要牢记的是，增量materialized view 只包含在**视图创建之后插入**的数据。它们不会自动回填历史数据，这有助于保持其轻量且维护成本低。因此，用户在注册视图时必须显式指定视图的有效时间范围。

:::note
ClickStack 只会在 materialized view 的最小时间戳小于等于查询时间范围起始时间时才使用该视图，以确保视图包含所有所需数据。尽管查询在内部会被拆分为基于时间的子查询，materialized view 要么应用于整个查询，要么完全不使用。未来的改进可能会允许仅对符合条件的子查询有选择地使用视图。
:::

ClickStack 提供了清晰的可视化标识，用于确认当前是否正在使用 materialized view。

1. **检查优化状态** 在查看仪表板或可视化图表时，查找闪电图标或 `Accelerated` 标识：

- **绿色闪电图标** 表示该查询已通过 materialized view 加速。
- **橙色闪电图标** 表示该查询是直接在源表上执行的。

<Image img={accelerated_visual} size="lg" alt="加速的可视化图表"/>

2. **查看优化详情** 点击闪电图标打开详情面板，可以看到：

- **正在使用的 materialized view**：为该查询选中的视图，以及其预估行数。
- **被跳过的 materialized view**：兼容但未被选中的视图，以及其预估扫描量。
- **不兼容的 materialized view**：无法使用的视图以及具体原因。

3. **了解常见的不兼容原因** 在以下情况下，materialized view 可能不会被使用：

- **查询时间范围** 的起始时间早于视图的最小时间戳。
- **可视化的粒度** 不是视图粒度的整数倍。
- 查询请求的 **聚合函数** 在视图中不存在。
- 查询使用了 **自定义计数表达式**，例如 `count(if(...))`，这些无法从视图中的聚合状态推导出来。

这些指示器可以帮助轻松确认某个可视化是否已被加速，理解为何选中了特定视图，并诊断某个视图为何不符合使用条件。

### 在可视化中如何选择 materialized view \{#how-views-are-selected\}

当执行可视化时，ClickStack 可能有多个可选项可用，包括基础表和多个 materialized view。为确保最佳性能，ClickStack 会使用 ClickHouse 的 [`EXPLAIN ESTIMATE`](/sql-reference/statements/explain#explain-estimate) 机制自动评估并选择最高效的选项。

选择流程遵循一个明确的顺序：

1. **验证兼容性**  
   ClickStack 首先通过检查以下内容来确定某个 materialized view 是否可用于该查询：
   - **时间覆盖范围**：查询的时间范围必须完全落在该 materialized view 可用数据范围之内。
   - **粒度**：可视化使用的时间分桶必须等于或粗于该 view 的粒度。
   - **聚合**：请求的指标必须在该 view 中存在，并且可以由其聚合状态计算得到。

2. **转换查询**  
   对于兼容的 view，ClickStack 会重写查询，使其针对该 materialized view 的表：
   - 将聚合函数映射到相应的物化列。
   - 将 `-Merge` 组合器应用于聚合状态。
   - 调整时间分桶以与该 view 的粒度对齐。

3. **选择最佳候选项**  
   如果存在多个兼容的 materialized view，ClickStack 会对每个候选项运行一次 [`EXPLAIN ESTIMATE`](/sql-reference/statements/explain#explain-estimate) 查询，并比较其预估扫描的行数和 granule 数量，选择预估扫描成本最低的 view。

4. **平滑回退**  
   如果没有任何 materialized view 兼容，ClickStack 会自动回退为查询基础表。

这种方法能够持续最小化扫描数据量，并在无需修改可视化定义的前提下提供可预测的低延迟性能。

只要 view 中包含所有必需的维度，即使可视化中包含过滤器、搜索约束或时间分桶，materialized view 仍然符合使用条件。这样一来，无需更改可视化定义，view 也可以加速仪表盘、直方图和带过滤的图表。

#### 选择 materialized view 的示例 \{#example-of-choosing-materialized-view\}

考虑在同一个 trace 源上创建的两个 materialized view：

* `otel_traces_1m`，按分钟、`ServiceName` 和 `StatusCode` 分组
* `otel_traces_1m_v2`，按分钟、`ServiceName`、`StatusCode` 和 `SpanName` 分组

第二个视图包含了额外的分组键，因此会产生更多的行并扫描更多的数据。

如果某个可视化图表请求的是**随时间变化的每个服务的平均持续时间**，那么这两个视图在技术上都是可用的。ClickStack 会针对每个候选视图发出一个 [`EXPLAIN ESTIMATE`](/sql-reference/statements/explain#explain-estimate) 查询，并比较预估的 granule 数量，即：

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

由于 `otel_traces_1m` 更小且需要扫描的 granule 更少，因此会被自动选中。

这两个 materialized view 的性能仍然优于直接查询基础表，不过选择满足需求的最小 view 可以获得最佳性能。


### 告警 \{#alerts\}

在兼容的情况下，告警查询会自动使用 materialized view。相同的优化逻辑同样适用，从而加快告警评估速度。

## 回填 materialized view \{#backfilling-a-materialized-view\}

如前所述，增量materialized view 只包含在**创建该视图之后插入**的数据，并不会自动进行回填。这种设计使视图保持轻量且维护成本低，但也意味着当查询需要早于该视图最小时间戳的数据时，就无法依赖该视图。

在大多数情况下，这是可以接受的。常见的 ClickStack 工作负载聚焦于最近数据，例如最近 24 小时，这意味着新建视图通常会在创建后一日内就可以被完整使用。然而，对于跨越更长时间范围的查询，在足够时间过去之前，该视图可能一直无法使用。

在这些场景中，用户可以考虑使用历史数据对该 materialized view 进行**回填（backfill）**。

回填可能**计算成本很高**。在正常运行时，materialized view 会随着数据到达而增量填充，将计算成本均匀地摊到时间轴上。

回填则将这项工作压缩到更短的时间段内，**显著增加单位时间的 CPU 和内存使用量。**

根据数据集规模和数据保留时间窗口，可能需要临时扩容集群——在 ClickHouse Cloud 中可以纵向或横向扩展——以在合理的时间范围内完成回填。

如果没有预留额外资源，回填会对生产工作负载造成负面影响，包括查询延迟增加以及摄取吞吐量下降。对于**非常大的数据集或很长的历史时间范围，回填可能不切实际，甚至完全不可行**。

总而言之，回填往往不值得其成本和运维风险。只有在历史数据加速查询至关重要的特殊场景下才应考虑。如果你决定继续执行，建议遵循下文所述的受控方法，在性能、成本和对生产的影响之间取得平衡。

### 回填方法 \{#backfilling-approaches\}

:::note 避免使用 POPULATE
除非是在暂停摄取、且数据集较小的场景，否则不建议使用 [POPULATE](/sql-reference/statements/create/view#materialized-view) 命令来为 materialized view 执行回填。该操作可能会遗漏在其源表中插入的部分行，因为 materialized view 是在 POPULATE 阶段的哈希计算完成之后才创建的。此外，POPULATE 会在全量数据上运行，在大型数据集上很容易受到中断或内存限制的影响。
:::

假设你希望为一个与下列聚合对应的 materialized view 执行回填，该聚合计算按服务名和状态码分组的每分钟指标：

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

如前所述，增量materialized view 不会自动进行回填。建议使用以下流程，在保持新数据增量处理行为的同时，安全地为历史数据回填。


#### 使用 `INSERT INTO SELECT` 直接回填 \{#direct-backfill\}

此方法最适合用于**较小的数据集**或**相对轻量的聚合查询**，即可以在合理时间内完成完整回填且不会耗尽集群资源的场景。当回填查询可以在几分钟、或至多数小时内完成，并且可以接受 CPU 和 I/O 使用的临时升高时，通常就可以采用该方法。对于更大规模的数据集或开销更高的聚合，请考虑下面的增量或分块回填方法。

<VerticalStepper headerLevel="h5">

##### 确定当前视图的覆盖范围 \{#determine-current-coverage-of-view\}

在尝试任何回填之前，首先要确定 materialized view 当前已经包含了哪些数据。可以通过查询目标表中存在的最小时间戳来完成：

```sql
SELECT min(Timestamp)
FROM otel_traces_1m;
```

该时间戳表示该视图能够满足查询的最早时间点。任何来自 ClickStack 且请求早于此时间戳的数据的查询，都会回退到基础表。

##### 判断是否有必要进行回填 \{#decide-whether-backfilling-is-neccessary\}

在大多数 ClickStack 部署中，查询主要聚焦于最近的数据，例如最近 24 小时。在这种情况下，新创建的视图会在创建后不久就变得完全可用，因此无需回填。

如果上一步返回的时间戳对你的使用场景来说已经足够久远，则不需要回填。只有在以下情况时才应考虑回填：

- 查询经常跨越较长的历史时间范围。
- 该视图对这些时间范围内的性能至关重要。
- 数据集规模和聚合成本使回填在资源上是可行的。

##### 回填缺失的历史数据 \{#backfill-missing-historical-data\}

如果确定需要回填，则应使用该视图中的查询，并将其修改为仅读取早于上述记录时间戳的数据，为当前最小时间戳之前的时间段填充 materialized view 的目标表。由于目标表使用 AggregatingMergeTree，在执行回填查询时，**必须插入聚合状态，而不是最终值**。

:::warning
该查询可能会处理大量数据，并且会非常消耗资源。在执行回填之前，一定要确认可用的 CPU、内存和 I/O 资源。一个实用技巧是先使用 `FORMAT Null` 执行该查询，以估算运行时间和资源使用情况。

如果预计该查询本身需要运行数小时，则**不推荐**使用此方法。
:::

注意下面的查询是如何通过添加 `WHERE` 子句，将聚合限制在早于该视图中最早时间戳的数据上的：

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

对于更大的数据集或资源消耗更高的聚合查询，使用单个 `INSERT INTO SELECT` 进行直接回填可能不切实际或不安全。在这些情况下，建议采用**增量回填**方法。该方法更接近增量materialized view 的常规运行方式，以可管理的数据块进行处理，而不是一次性聚合整个历史数据集。

以下场景适合使用这种方法：

- 回填查询否则会运行许多小时。
- 完整聚合的峰值内存使用过高。
- 希望在回填期间严格控制 CPU 和内存消耗。
- 需要一个在中断时可以安全重启、更加健壮的流程。

核心思路是使用一个 [**Null 表**](/engines/table-engines/special/null) 作为摄取缓冲区。虽然 Null 表本身不存储数据，但附加到它的任何 materialized view 仍然会执行，从而在数据流经时以增量方式计算聚合状态。

<VerticalStepper headerLevel="h5">

##### 创建用于回填的 Null 表 \{#create-null-table\}

创建一个轻量级的 Null 表，仅包含 materialized view 聚合所需的列。这样可以将 I/O 和内存使用量降到最低。

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

##### 将 materialized view 附加到 Null 表 \{#attach-mv-to-null-table\}

接下来，在 Null 表上创建一个 materialized view，使其写入与主 materialized view 使用的同一个聚合表。

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

随着行被插入到 Null 表中，该 materialized view 将以增量方式执行，分小块生成聚合状态。

##### 以增量方式回填数据 \{#incremental-backfill\}

最后，将历史数据插入到 Null 表中。materialized view 将按数据块处理数据，将聚合状态写入目标表，而不会持久化原始行。

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

由于数据是以增量方式处理的，内存使用保持有界且可预测，其行为与正常摄取非常相似。

:::note
为进一步提高安全性，可以考虑将回填 materialized view 的输出定向到一个临时目标表（例如 `otel_traces_1m_v2`）。一旦回填成功完成，可将[分区移动](/sql-reference/statements/alter/partition#move-partition-to-table)到主目标表，例如 `ALTER TABLE otel_traces_1m_v2 MOVE PARTITION '2026-01-02' TO otel_traces_1m`。如果回填因资源限制中断或失败，这种方式可以更容易地进行恢复。
:::

有关调整该流程的更多细节，包括提升插入性能以及减少和控制资源使用，请参阅 ["Backfilling."](/data-modeling/backfilling#tuning-performance--resources)

</VerticalStepper>

## 建议 \{#recommendations\}

以下建议总结了在 ClickStack 中设计和运维 materialized view 的最佳实践。遵循这些指南有助于确保 materialized view 高效、可预测且具有良好的成本效益。

### 粒度选择与对齐 \{#granularity-selection-and-alignment\}

仅当可视化或告警使用的粒度是 materialized view 粒度的**整数倍**时，才会使用 materialized views。粒度如何确定取决于图表类型：

- **时间图表**（x 轴为时间的折线图或柱状图）：
  图表显式设置的时间粒度必须是 materialized view 粒度的整数倍。
  例如，10 分钟粒度的图表可以使用粒度为 10、5、2 或 1 分钟的 materialized views，但不能使用 20 分钟或 3 分钟的 views。

- **非时间图表**（数字、表格或汇总图表）：
  有效粒度由 `(time range / 80)` 计算得到，并向上舍入为最接近的、HyperDX 支持的粒度。该推导出的粒度同样必须是 materialized view 粒度的整数倍。

基于上述规则：

- **不要创建粒度为 10 分钟的 materialized views**。
  ClickStack 在图表和告警中支持 15 分钟粒度，但不支持 10 分钟粒度。因此，10 分钟的 materialized view 将无法与常见的 15 分钟可视化和告警兼容。
- 优先使用 **1 分钟** 或 **1 小时** 粒度，它们可以与大多数图表和告警配置自然组合。

较粗的粒度（例如 1 小时）会产生更小的 view 并降低存储开销，而较细的粒度（例如 1 分钟）则为细粒度分析提供了更高的灵活性。请选择在满足关键工作流需求前提下尽可能细的粒度。

### 限制并整合 materialized view \{#limit-and-consolidate-materialized-views\}

每个 materialized view 都会引入额外的插入时开销，并增加数据分片（parts）与合并操作的压力。
建议遵循以下准则：

- 每个源表 **不超过 20 个 materialized view**。
- **大约 10 个 materialized view** 通常是比较理想的数量。
- 当多个可视化共享相同维度时，将其合并到单个 materialized view 中。

在可行的情况下，从同一个 materialized view 计算多个指标，并支持多个图表。

### 谨慎选择维度 \{#choose-dimensions-carefully\}

仅包含常用于分组或过滤的维度：

- 每增加一个分组列，都会增大视图的大小。
- 在查询灵活性与存储和写入时的成本之间取得平衡。
- 对视图中不存在的列进行过滤时，ClickStack 会回退到源表。

:::note Tip
一种常见且几乎总是有用的基线实践是：按 **service name 分组并包含 count 指标的 materialized view**，它可以在搜索和仪表板中实现快速直方图和服务级别概览。
:::

### 聚合列的命名约定 \{#naming-conventions-for-aggregation-columns\}

materialized view 的聚合列必须遵循严格的命名约定，以便实现自动推断：

- 命名模式：`<aggFn>__<sourceColumn>`
- 示例：
  - `avg__Duration`
  - `max__Duration`
  - `count__` 表示行数统计

ClickStack 依赖这一约定来将查询正确映射到 materialized view 的列。

### 分位数与草图选择 \{#quantiles-and-sketch-selection\}

不同的分位数函数在性能和存储特性上各不相同：

- `quantiles` 会在磁盘上生成更大的草图（sketch），但在插入时计算开销更低。
- `quantileTDigest` 在插入时计算开销更高，但会生成更小的草图，通常能够带来更快的视图查询。

可以在插入时为这两个函数指定草图大小（例如，使用 `quantile(0.5)`）。生成的草图之后仍然可以用于查询其他分位数值，例如 `quantile(0.95)`。建议通过试验为具体工作负载找到性能与精度的最佳平衡点。

### 持续验证效果 \{#validate-effectiveness-continously\}

始终确认 materialized view 是否真正带来实际收益：

- 通过 UI 加速指示器确认使用情况。
- 比较启用 VIEW 前后的查询性能。
- 监控资源使用情况和合并行为。

应将 materialized view 视为性能优化手段，需随着查询模式演进定期进行审查和调整。

### 高级配置 \{#advanced-configurations\}

对于更复杂的工作负载，可以使用多个 materialized view 来支持不同的访问模式。例如：

- **高分辨率的近期数据配合粗粒度的历史视图**
- **用于总览的服务级别视图和用于深度诊断的端点级别视图**

在有选择地应用时，这些模式可以显著提升性能，但应仅在验证了更简单的配置之后再引入。

遵循这些建议将有助于确保 materialized view 始终高效、易于维护，并与 ClickStack 的执行模型保持一致。

## 局限性 \{#limitations\}

### 常见不兼容原因 \{#common-incompatibility-reasons\}

如果满足以下任一条件，将**不会**使用 materialized view：

- **查询时间范围**
  查询时间范围的起始时间早于 materialized view 的最小时间戳。由于 materialized view 不会自动回填历史数据，它们只能满足其完全覆盖时间范围内的查询。

- **粒度不匹配**
  可视化图表的有效粒度必须是 materialized view 粒度的整数倍。具体来说：

  * 对于**时间图表**（x 轴为时间的折线图或柱状图），图表选定的粒度必须是 materialized view 粒度的整数倍。例如，一个 10 分钟粒度的图表可以使用 10、5、2 或 1 分钟的 materialized view，但不能使用 20 分钟或 3 分钟的 materialized view。
  * 对于**非时间图表**（数值或表格图表），有效粒度计算为 `(time range / 80)`，再向上取整到最近的 HyperDX 支持的粒度，该粒度同样必须是 materialized view 粒度的整数倍。

- **不受支持的聚合函数**
  查询中请求的聚合函数在 materialized view 中不存在。只能使用在 materialized view 中显式计算并存储的聚合函数。

- **自定义计数表达式**
  使用 `count(if(...))` 或其他条件计数表达式的查询，无法从标准聚合状态推导，因此不能使用 materialized view。

### 设计和运维约束 \{#design-and-operational-constraints\}

- **无自动回填**
  增量materialized view 仅包含在创建之后插入的数据。对历史查询进行加速需要显式执行回填操作，这对于大型数据集来说可能成本高昂，甚至在实践中不可行。

- **粒度权衡**
  粒度非常细的 view 会增加存储占用和插入时的开销，而粒度较粗的 view 会降低灵活性。必须谨慎选择粒度，使其与预期的查询模式相匹配。

- **维度爆炸**
  添加大量分组维度会显著增加 view 的大小，并可能降低其效果。view 中应仅包含常用的分组和过滤列。

- **view 数量的可扩展性受限**
  每个 materialized view 都会增加插入时的开销，并加剧合并压力。创建过多的 view 会对摄取和后台合并产生负面影响。

了解这些限制有助于确保仅在 materialized view 能够带来实际收益的场景中使用它们，并避免落入配置不当、查询悄然退化回更慢的源表查询的情况。

## 故障排查 \{#troubleshooting\}

### materialized view 未被使用 \{#materialied-view-not-being-used\}

**检查 1：日期范围**

- 打开优化弹窗，检查是否显示 “Date range not supported.”
- 确保查询的日期范围晚于该 materialized view 的最小日期。
- 如果 materialized view 覆盖了所有历史数据，则移除最小日期限制。

**检查 2：粒度**

- 确认图表粒度是 MV 粒度的整数倍。
- 尝试将图表设置为 “Auto”，或手动选择兼容的粒度。

**检查 3：聚合**

- 检查图表是否使用了 MV 中已有的聚合。
- 在优化弹窗中查看 “Available aggregated columns”。

**检查 4：维度**

- 确保 GROUP BY 使用的列在 MV 的维度列中。
- 在优化弹窗中查看 “Available group/filter columns”。

### materialized view 查询缓慢 \{#slow-mv-queries\}

**问题 1：materialized view 粒度过细**

- 由于粒度过低（例如 1 秒），MV 中的行数过多。
- 解决方案：创建粒度更粗的 MV（例如 1 分钟或 1 小时）。

**问题 2：维度过多**

- 由于维度列过多，MV 的基数（cardinality）很高。
- 解决方案：将维度列缩减为最常用的那些。

**问题 3：存在多个行数较高的 MV**

- 系统会对每个 MV 运行 `EXPLAIN`。
- 解决方案：移除很少使用或几乎总是被跳过的 MV。

### 配置错误 \{#config-errors\}

**错误："At least one aggregated column is required"**

- 在 MV 配置中至少添加一个聚合列。

**错误："Source column is required for non-count aggregations"**

- 指定要聚合的源列（只有 count 可以省略源列）。

**错误："Invalid granularity format"**

- 使用下拉列表中的预设粒度之一。
- 格式必须是有效的 SQL interval（例如，`1 hour`，而不是 `1 h`）。