---
slug: /use-cases/observability/clickstack/event_deltas
title: '使用 ClickStack 的事件增量'
sidebar_label: '事件增量'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 的事件增量'
doc_type: 'guide'
keywords: ['clickstack', '事件增量', '变更跟踪', '日志', '可观测性']
---

import Image from '@theme/IdealImage';
import event_deltas from '@site/static/images/use-cases/observability/hyperdx-demo/step_17.png';
import event_deltas_no_selected from '@site/static/images/use-cases/observability/event_deltas_no_selected.png';
import event_deltas_highlighted from '@site/static/images/use-cases/observability/event_deltas_highlighted.png';
import event_deltas_selected from '@site/static/images/use-cases/observability/event_deltas_selected.png';
import event_deltas_issue from '@site/static/images/use-cases/observability/event_deltas_issue.png';
import event_deltas_outliers from '@site/static/images/use-cases/observability/event_deltas_outliers.png';
import event_deltas_separation from '@site/static/images/use-cases/observability/event_deltas_separation.png';
import event_deltas_customization from '@site/static/images/use-cases/observability/event_deltas_customization.png';
import event_deltas_inappropriate from '@site/static/images/use-cases/observability/event_deltas_inappropriate.png';

ClickStack 中的 Event Deltas 是一项以 trace 为中心的功能，会自动分析 trace 的属性，以发现性能回归时发生了哪些变化。通过比较同一数据集中正常 trace 与慢 trace 的延迟分布，ClickStack 会突出显示与差异最为关联的属性——无论是新的部署版本、特定的 endpoint，还是某个特定的用户 ID。

无需手动筛查 trace 数据，Event Deltas 会直接呈现导致两个数据子集之间延迟差异的关键属性，使诊断性能回归和定位根本原因变得更加容易。该功能允许你直观查看原始 trace，并立即看到影响性能变化的因素，从而加速故障响应并缩短平均解决时间。

<Image img={event_deltas} alt="Event Deltas" size="lg" />


## 使用 Event Deltas \{#using-event-deltas\}

在 ClickStack 的 **Search** 面板中，当选择 `Trace` 类型的来源（source）时，可以直接使用 Event Deltas。

在左上角的 **Analysis Mode** 选择器中，在已选择 `Trace` 来源的情况下，选择 **Event Deltas**，即可从以 span 为行显示的标准结果表切换到该视图。

<Image img={event_deltas_no_selected} alt="未选择 Event Deltas" size="lg"/>

该视图会展示一段时间内 span 的分布情况，显示延迟如何随数量变化。纵轴表示延迟，颜色则表示在给定时间点 trace 的密度，更明亮的黄色区域对应更高的 trace 聚集度。借助该可视化，用户可以快速查看 span 在延迟与数量两个维度上的分布，更容易发现性能中的变化或异常。

<Image img={event_deltas_highlighted} alt="高亮显示的 Event Deltas" size="lg"/>

接下来，用户可以在可视化中选取某个区域——理想情况下应包含持续时间更长的 span 且具有足够的密度——然后点击 **Filter by Selection**。这会将该部分指定为用于分析的“离群点”。Event Deltas 随后会在整个数据集中，对比该离群子集与其余数据，找出与这些 span 最相关的列及其关键取值。通过聚焦于具有有意义离群点的区域，ClickStack 会突出显示将该子集与整体数据集区分开来的独特取值，从而呈现与观察到的性能差异最相关联的属性。

<Image img={event_deltas_selected} alt="已选择 Event Deltas" size="lg"/>

对于每一列，ClickStack 会识别出在选定离群子集中明显偏向出现的取值。换言之，当某个取值出现在某列中时，如果它主要出现在离群点中，而不是整个数据集中的正常样本（内群点），则会被标记为显著。偏向程度最强的列会排在最前面，从而凸显出与异常 span 关系最密切的属性，并将其与基线行为区分开来。

<Image img={event_deltas_outliers} alt="Event Deltas 离群点" size="lg"/>

以上方示例中被突出显示的 `SpanAttributes.app.payment.card_type` 列为例。此处，Event Deltas 分析显示：在内群点中有 `29%` 使用 MasterCard，而在离群点中为 `0%`；同时，`100%` 的离群点使用 Visa，对比内群点中为 `71%`。这表明 Visa 卡类型与异常的高延迟 trace 有很强的关联，而 MasterCard 仅出现在正常子集中。

<Image img={event_deltas_issue} alt="Event Deltas 问题" size="lg"/>

相反，仅与内群点相关联的取值同样可能具有分析价值。在上方示例中，错误 `Visa Cash Full` 只出现在内群点中，在离群 span 中完全不存在。在这种情况下，延迟始终小于约 50 毫秒，这表明该错误与较低延迟相关联。

## Event Deltas 的工作原理 \{#how-event-deltas-work\}

Event Deltas 通过执行两个查询来工作：一个针对选定的离群区域，另一个针对内群区域。每个查询都限制在相应的持续时间和时间窗口内。随后会对两个结果集中事件的样本进行检查，并识别出那些其取值高度集中出现在离群结果中的列。对于某个取值 100% 仅出现在离群子集中的列会优先显示，以突出最可能导致观测差异的属性。

## 自定义图表 \{#customizing-the-graph\}

在图表上方，你会看到一些控件，用于自定义热力图的生成方式。随着你调整这些参数，热力图会实时更新，帮助你可视化并比较任意可度量数值与其随时间变化的频率之间的关系。

**默认配置**

默认情况下，此可视化配置为：

- **Y 轴**：`Duration` —— 纵向显示延迟值
- **颜色（Z 轴）**：`count()` —— 表示随时间（X 轴）变化的请求数量

此配置展示了延迟随时间的分布情况，其中颜色强度表示每个区间内事件的数量。

**调整参数**

你可以修改这些参数，以探索数据的不同维度：

- **Value**：控制在 Y 轴上绘制的内容。例如，将 `Duration` 替换为错误率或响应大小等指标。
- **Count**：控制颜色映射。你可以从 `count()`（每个分桶中的事件数量）切换为其他聚合函数，如 `avg()`、`sum()`、`p95()`，甚至自定义表达式，例如 `countDistinct(field)`。

<Image img={event_deltas_customization} alt="事件差值自定义" size="lg"/>

## 建议 \{#recommendations\}

当分析聚焦在某个特定服务时，Event Deltas 的效果最佳。多个服务之间的延迟可能差异很大，从而更难识别对离群值影响最大的列和取值。在启用 Event Deltas 之前，请先将 spans 过滤到一组预期延迟分布相近的数据上。优先分析那些在业务上不应出现大幅延迟差异的数据集，以获取更有价值的洞察，避免在延迟高度可变（例如两个不同服务）的场景下使用。

在选择分析区域时，你应尽量选取在持续时间上存在明显“较慢”和“较快”区分的子集，这样可以将高延迟的 spans 清晰地分离出来进行分析。例如，下图中选定的区域就清晰地捕获了一组较慢的 spans 供分析使用。

<Image img={event_deltas_separation} alt="Event Deltas 分离效果" size="lg"/>

相反，下面这个数据集就很难通过 Event Deltas 得到有用的分析结果。

<Image img={event_deltas_inappropriate} alt="Event Deltas 分离效果较差" size="lg"/>