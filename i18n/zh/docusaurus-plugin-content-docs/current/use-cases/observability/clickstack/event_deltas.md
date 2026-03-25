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

ClickStack 中的 事件增量 是一项以 链路追踪 为中心的功能，会自动分析 链路追踪 的属性，以发现性能回归时发生了哪些变化。通过比较同一数据集中正常 链路追踪 与慢 链路追踪 的延迟分布，ClickStack 会突出显示与差异最为关联的特性——无论是新的部署版本、特定的 endpoint，还是某个特定的用户 ID。

无需手动筛查 链路追踪 数据，事件增量 会直接呈现导致两个数据子集之间延迟差异的关键特性，使诊断性能回归和定位根本原因变得更加容易。该功能允许你直观查看原始 链路追踪，并立即看到影响性能变化的因素，从而加速故障响应并缩短平均解决时间。

<Image img={event_deltas} alt="Event deltas" size="lg" />

## 使用事件增量 \{#using-event-deltas\}

在 ClickStack 中选择类型为 `Trace` 的源后，可直接通过 **搜索** 面板使用事件增量。

在左上角的 **分析模式** 选择器中，选择 **事件增量** (需先选中 `Trace` 源) ，即可从以 spans 为行显示的标准结果表切换到该视图。

<Image img={event_deltas_no_selected} alt="未选择事件增量" size="lg" />

此视图会显示 spans 随时间变化的分布，展示延迟如何随数量变化。纵轴表示延迟，颜色则表示该位置链路追踪的密度，其中颜色越亮的黄色区域表示链路追踪越集中。借助这种可视化，您可以快速查看 spans 在延迟和数量两个维度上的分布情况，更容易识别性能变化或异常。

<Image img={event_deltas_highlighted} alt="已高亮显示事件增量" size="lg" />

接下来，您可以在可视化中选取一个区域——理想情况下，应选择 spans 持续时间较长且密度足够的区域——然后点击 **按所选内容筛选**。这样会将这些“离群点”设定为分析对象。随后，事件增量会识别与该离群子集中的 spans 最相关的列和关键值，并将其与数据集其余部分进行比较。通过聚焦于有代表性的离群区域，ClickStack 会突出显示能够将该子集与整体数据区分开的独特值，从而找出与观测到的性能差异最相关的特性。

<Image img={event_deltas_selected} alt="已选择事件增量" size="lg" />

对于每一列，ClickStack 都会识别那些明显偏向所选离群子集的值。换句话说，当某个值出现在某一列中时，如果它主要出现在离群点中，而非整个数据集 (即内群点) 中，就会被标记为显著。偏向性最强的列会优先列出，从而突出显示与异常 spans 关联最强的特性，并将其与基线行为区分开来。

<Image img={event_deltas_outliers} alt="事件增量离群点" size="lg" />

以上述示例为例，`SpanAttributes.app.payment.card_type` 列被突出显示。此处，事件增量分析表明，内群点中有 `29%` 使用 MasterCard，而离群点中这一比例为 `0%`；与此同时，离群点中有 `100%` 使用 Visa，而内群点中的比例为 `71%`。这表明 Visa 卡类型与异常的高延迟链路追踪高度相关，而 MasterCard 仅出现在正常子集中。

<Image img={event_deltas_issue} alt="事件增量问题" size="lg" />

相反，仅与内群点相关的值也可能具有参考意义。在上面的示例中，错误 `Visa Cash Full` 仅出现在内群点中，在离群 spans 中则完全不存在。在这种情况下，延迟始终低于约 50 Milliseconds，这表明该错误与较低延迟相关。

## 事件增量 的工作原理 \{#how-event-deltas-work\}

事件增量 通过执行两个查询来工作：一个针对选定的离群区域，另一个针对内群点区域。每个查询都限制在相应的持续时间和时间窗口内。随后会对两个结果集中事件的样本进行检查，并识别出那些其取值高度集中出现在离群结果中的列。对于某个取值 100% 仅出现在离群子集中的列会优先显示，以突出最可能导致观测差异的特性。

## 自定义图表 \{#customizing-the-graph\}

在图表上方，你会看到一些控件，用于自定义热力图的生成方式。随着你调整这些参数，热力图会实时更新，帮助你可视化并比较任意可度量数值与其随时间变化的频率之间的关系。

**默认配置**

默认情况下，此可视化配置为：

* **Y 轴**：`Duration` —— 纵向显示延迟值
* **颜色 (Z 轴)&#x20;**：`count()` —— 表示随时间 (X 轴) 变化的请求数量

此配置展示了延迟随时间的分布情况，其中颜色强度表示每个区间内事件的数量。

**调整参数**

你可以修改这些参数，以探索数据的不同维度：

* **Value**：控制在 Y 轴上绘制的内容。例如，将 `Duration` 替换为错误率或响应大小等指标。
* **Count**：控制颜色映射。你可以从 `count()` (每个分桶中的事件数量) 切换为其他聚合函数，如 `avg()`、`sum()`、`p95()`，甚至自定义表达式，例如 `countDistinct(field)`。

<Image img={event_deltas_customization} alt="事件增量自定义" size="lg" />

## 建议 \{#recommendations\}

当分析聚焦在某个特定服务时，事件增量 的效果最佳。多个服务之间的延迟可能差异很大，从而更难识别对离群值影响最大的列和取值。在启用 事件增量 之前，请先将 spans 过滤到一组预期延迟分布相近的数据上。优先分析那些在业务上不应出现大幅延迟差异的数据集，以获取更有价值的洞察，避免在延迟高度可变 (例如两个不同服务) 的场景下使用。

在选择分析区域时，你应尽量选取在持续时间上存在明显“较慢”和“较快”区分的子集，这样可以将高延迟的 spans 清晰地分离出来进行分析。例如，下图中选定的区域就清晰地捕获了一组较慢的 spans 供分析使用。

<Image img={event_deltas_separation} alt="Event deltas 分离效果" size="lg" />

相反，下面这个数据集就很难通过 事件增量 得到有用的分析结果。

<Image img={event_deltas_inappropriate} alt="Event deltas 分离效果较差" size="lg" />