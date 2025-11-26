---
slug: /use-cases/observability/clickstack/event_deltas
title: 'ClickStack 事件差异'
sidebar_label: '事件差异'
pagination_prev: null
pagination_next: null
description: 'ClickStack 事件差异'
doc_type: 'guide'
keywords: ['clickstack', '事件差异', '变更跟踪', '日志', '可观测性']
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

ClickStack 中的 Event Deltas 是一个面向 trace 的功能，会自动分析 trace 的属性，以发现当性能退化时究竟发生了哪些变化。通过在同一数据集中对比正常 trace 与慢速 trace 的延迟分布，ClickStack 会突出显示与差异最为关联的属性——无论是新的部署版本、某个特定的 endpoint，还是某个特定的用户 ID。

相比手动筛查 trace 数据，Event Deltas 会直接呈现导致两组数据延迟差异的关键属性，大幅简化回归问题的诊断并帮助精准定位根本原因。借助该功能，你可以可视化原始 trace，并立即看到影响性能变化的关键因素，从而加速故障响应并降低平均修复时间（MTTR）。

<Image img={event_deltas} alt="Event Deltas" size="lg" />


## 使用 Event Deltas {#using-event-deltas}

当选择类型为 `Trace` 的源时，可以在 ClickStack 的 **Search** 面板中直接使用 Event Deltas。

在左上角的 **Analysis Mode** 选择器中，选择 **Event Deltas**（在已选择 `Trace` 源的前提下），即可从标准结果表切换视图；标准结果表以行的形式展示各个 span。

<Image img={event_deltas_no_selected} alt="未选择 Event Deltas 的界面" size="lg"/>

该视图以时间为横轴展示 span 的分布情况，显示延迟如何随数量变化。纵轴表示延迟，颜色则表示在给定时间点上的 trace 密度，更亮的黄色区域对应更高的 trace 集中度。通过这种可视化方式，用户可以快速查看 span 在延迟和数量两个维度上的分布，更容易识别性能中的变化或异常。

<Image img={event_deltas_highlighted} alt="高亮显示的 Event Deltas" size="lg"/>

接下来，用户可以在可视化图中选择一个区域——理想情况下，该区域应包含持续时间较长且密度足够高的 span——然后点击 **Filter by Selection**。这会将该部分指定为用于分析的“异常值”集合。随后，Event Deltas 会识别在该异常值子集与其余数据集相比最相关的列和关键值。通过聚焦在具有有意义异常值的区域，ClickStack 会突出显示将该子集与整体数据集区分开的独特值，从而呈现与观测到的性能差异最为关联的属性。

<Image img={event_deltas_selected} alt="已选中的 Event Deltas 区域" size="lg"/>

对于每一列，ClickStack 会识别那些对所选异常值子集高度倾斜的取值。换言之，当某个值出现在某一列中时，如果它主要出现在异常值中，而不是出现在整体数据集（正常值）中，就会被标记为重要。倾斜程度最强的列会优先列出，从而呈现与异常 span 关联最强的属性，帮助区分这些 span 与基线行为。

<Image img={event_deltas_outliers} alt="Event Deltas 中的异常值分析" size="lg"/>

考虑上方示例，其中 `SpanAttributes.app.payment.card_type` 列被突出展示。在这里，Event Deltas 分析显示，正常值中有 `29%` 使用 MasterCard，而异常值中为 `0%`；同时，`100%` 的异常值使用 Visa，而正常值中仅有 `71%` 使用 Visa。这表明 Visa 卡类型与这些异常的高延迟 trace 强相关，而 MasterCard 仅出现在正常子集中。

<Image img={event_deltas_issue} alt="Event Deltas 发现的问题示例" size="lg"/>

反过来，仅与正常值相关联的取值同样可能具有参考意义。在上方示例中，错误 `Visa Cash Full` 只出现在正常值中，并完全未出现在异常 span 中。在出现该错误的场景下，延迟始终低于约 50 毫秒，这表明该错误与较低延迟相关联。



## Event Deltas 的工作原理 {#how-event-deltas-work}

Event Deltas 的工作方式是执行两个查询：一个针对所选的异常（outlier）区域，另一个针对正常（inlier）区域。每个查询都限定在相应的持续时间和时间窗口内。随后会对两个结果集中的事件样本进行检查，并识别出那些其取值在异常结果中高度集中的列。对于某个取值 100% 只出现在异常子集中的列，会优先显示，从而突出最主要导致观测到差异的属性。



## 自定义图表 {#customizing-the-graph}

在图表上方，你会看到一些控件，可用于自定义热力图的生成逻辑。随着你调整这些参数，热力图会实时更新，从而直观展示并对比任意可度量数值与其随时间变化的出现频率之间的关系。

**默认配置**

默认情况下，可视化配置为：

- **Y 轴**：`Duration` —— 在纵轴上显示延迟值
- **颜色（Z 轴）**：`count()` —— 表示随时间（X 轴）变化的请求数量

该配置展示了延迟随时间的分布情况，颜色强度表示落入各个区间的事件数量。

**调整参数**

你可以修改这些参数，以探索数据的不同维度：

- **Value**：控制在 Y 轴上绘制的内容。例如，可以将 `Duration` 替换为错误率或响应大小等指标。
- **Count**：控制颜色映射。你可以从 `count()`（每个桶中的事件数量）切换为其他聚合函数，例如 `avg()`、`sum()`、`p95()`，甚至是类似 `countDistinct(field)` 的自定义表达式。

<Image img={event_deltas_customization} alt="事件 Deltas 自定义" size="lg"/>



## 建议 {#recommendations}

当分析聚焦于某个特定服务时，Event Deltas 的效果最佳。多个服务之间的延迟可能差异很大，这会增加识别导致离群值的关键列和值的难度。在启用 Event Deltas 之前，请先将 spans 过滤到一个其延迟分布预期相似的集合。优先分析那些理论上不应出现大范围延迟波动的集合，以获得更有价值的洞察，避免在延迟高度分散（例如两个不同服务）的场景中使用。

在选择区域时，用户应尽量选择在持续时间上存在明显“较慢”与“较快”区分的子集，这样可以将高延迟的 spans 清晰地隔离出来进行分析。例如，下方所选区域就清楚地捕获了一组较慢的 spans 供分析使用。

<Image img={event_deltas_separation} alt="Event Deltas Separation" size="lg"/>

相反，下面这个数据集用 Event Deltas 很难进行有价值的分析。

<Image img={event_deltas_inappropriate} alt="Event Deltas Poor seperation" size="lg"/>
