---
slug: /use-cases/observability/clickstack/event_deltas
title: '使用 ClickStack 的事件增量'
sidebar_label: '事件增量'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 的事件增量'
doc_type: 'guide'
keywords: ['clickstack', 'event deltas', 'change tracking', 'logs', 'observability']
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

ClickStack 中的事件差分是一项以 trace 为中心的功能，会自动分析 trace 的属性，以发现性能回退时发生了哪些变化。通过比较数据集中正常 trace 与慢速 trace 的延迟分布，ClickStack 会突出显示与差异最相关的属性——无论是新的部署版本、特定的 endpoint，还是某个特定的用户 ID。

相比手动筛查 trace 数据，事件差分会直接呈现导致两个数据子集之间延迟差异的关键属性，使诊断回退与精准定位根本原因变得更加容易。该功能支持对原始 trace 进行可视化，并能立即看到影响性能变化的因素，从而加速事故响应，降低平均修复时间（MTTR）。

<Image img={event_deltas} alt="Event Deltas" size="lg" />


## 使用事件增量 {#using-event-deltas}

在 ClickStack 中选择 `Trace` 类型的数据源时,可以直接通过 **Search** 面板使用事件增量功能。

从左上角的 **Analysis Mode** 选择器中选择 **Event Deltas**(需先选择 `Trace` 数据源),即可从显示 span 为行的标准结果表切换到事件增量视图。

<Image
  img={event_deltas_no_selected}
  alt='未选择事件增量'
  size='lg'
/>

此视图呈现 span 随时间的分布情况,展示延迟如何随请求量变化。纵轴表示延迟,颜色表示给定点的 trace 密度,较亮的黄色区域对应更高的 trace 集中度。通过此可视化,用户可以快速查看 span 在延迟和数量上的分布情况,从而更容易识别性能的变化或异常。

<Image
  img={event_deltas_highlighted}
  alt='事件增量高亮显示'
  size='lg'
/>

用户可以选择可视化中的一个区域——理想情况下是具有较高持续时间 span 且密度足够的区域,然后点击 **Filter by Selection**。这将指定用于分析的"离群值"。事件增量随后会识别与该离群值子集中的这些 span 最相关的列和关键值,并与数据集的其余部分进行比较。通过聚焦于具有显著离群值的区域,ClickStack 会突出显示将此子集与整体数据区分开来的独特值,揭示与观察到的性能差异最相关的属性。

<Image img={event_deltas_selected} alt='已选择事件增量' size='lg' />

对于每一列,ClickStack 会识别出明显偏向所选离群值子集的值。换句话说,当某个值出现在列中时,如果它主要出现在离群值中而非整体数据集(正常值)中,则会被突出显示为重要值。偏差最强的列会首先列出,揭示与异常 span 最强相关的属性,并将它们与基线行为区分开来。

<Image img={event_deltas_outliers} alt='事件增量离群值' size='lg' />

考虑上面的示例,其中 `SpanAttributes.app.payment.card_type` 列被识别出来。在这里,事件增量分析显示 `29%` 的正常值使用 MasterCard,而离群值中为 `0%`,同时 `100%` 的离群值使用 Visa,相比之下正常值中为 `71%`。这表明 Visa 卡类型与异常的高延迟 trace 强相关,而 MasterCard 仅出现在正常子集中。

<Image img={event_deltas_issue} alt='事件增量问题' size='lg' />

相反,仅与正常值相关的值也可能很有意义。在上面的示例中,错误 `Visa Cash Full` 仅出现在正常值中,在离群值 span 中完全不存在。在出现此错误的情况下,延迟始终小于约 50 毫秒,表明此错误与低延迟相关。


## Event Deltas 的工作原理 {#how-event-deltas-work}

Event Deltas 通过执行两个查询来工作:一个针对选定的异常值区域,另一个针对正常值区域。每个查询都限定在相应的持续时间和时间窗口内。然后对两个结果集中的事件样本进行检查,识别出在异常值中占据高浓度的列。优先显示某个值 100% 仅出现在异常值子集中的列,以突出导致观察到差异的最关键属性。


## 自定义图表 {#customizing-the-graph}

在图表上方，您可以找到用于自定义热力图生成方式的控件。调整这些字段时，热力图会实时更新，让您能够可视化并比较任意可测量值与其随时间变化的频率之间的关系。

**默认配置**

默认情况下，可视化使用：

- **Y 轴**：`Duration` — 垂直显示延迟值
- **颜色（Z 轴）**：`count()` — 表示随时间（X 轴）变化的请求数量

此配置显示延迟随时间的分布情况，颜色深度表示落在各个范围内的事件数量。

**调整参数**

您可以修改这些参数来探索数据的不同维度：

- **值**：控制 Y 轴上绘制的内容。例如，可以将 `Duration` 替换为错误率或响应大小等指标。
- **计数**：控制颜色映射。您可以从 `count()`（每个桶中的事件数量）切换到其他聚合函数，如 `avg()`、`sum()`、`p95()`，甚至是自定义表达式如 `countDistinct(field)`。

<Image
  img={event_deltas_customization}
  alt='事件增量自定义'
  size='lg'
/>


## 建议 {#recommendations}

当分析聚焦于特定服务时,Event Deltas 的效果最佳。跨多个服务的延迟可能存在较大差异,这会增加识别导致异常值的列和值的难度。在启用 Event Deltas 之前,应将 span 过滤到延迟分布预期相似的集合。针对延迟变化较大本不应出现的数据集进行分析,可获得最有价值的洞察;应避免分析延迟变化本身就是常态的情况(例如两个不同的服务)。

选择区域时,用户应选择具有明确的较慢与较快持续时间分布的子集,以便能够清晰地隔离高延迟 span 进行分析。例如,下方选定的区域明确捕获了一组较慢的 span 用于分析。

<Image img={event_deltas_separation} alt='Event Deltas 分离' size='lg' />

相反,以下数据集很难通过 Event Deltas 进行有效分析。

<Image
  img={event_deltas_inappropriate}
  alt='Event Deltas 分离效果不佳'
  size='lg'
/>
