---
slug: /use-cases/observability/clickstack/event_deltas
title: 'ClickStack 中的事件增量'
sidebar_label: '事件增量'
pagination_prev: null
pagination_next: null
description: '分析 trace 属性分布，并使用 ClickStack 的事件增量比较异常 span'
doc_type: 'guide'
keywords: ['ClickStack', '事件增量', '热力图', '属性分布', 'trace 分析', '可观测性']
---

import Image from '@theme/IdealImage';
import event_deltas from '@site/static/images/use-cases/observability/hyperdx-demo/step_17.png';
import event_deltas_separation from '@site/static/images/use-cases/observability/event_deltas_separation.png';
import event_deltas_issue from '@site/static/images/use-cases/observability/event_deltas_issue.png';
import distribution_mode from '@site/static/images/clickstack/event-deltas/distribution-mode.png';
import settings_drawer from '@site/static/images/clickstack/event-deltas/settings-drawer.png';

事件增量将延迟热力图与自动属性分析结合起来，让您无需编写查询，即可查看追踪数据的形态，并找出慢 span 的不同之处。其用法有三种：

* **分布模式 (始终开启)&#x20;**&#x20;— 当热力图上没有选区时，会显示当前 span 集合中每个属性的值分布。适合用来发现占主导地位或异常稀有的值 (基数异常值) 。
* **对比模式** — 在热力图上拖出一个矩形，将其中的 spans (Selection) 与外部的所有 spans (Background) 进行比较。适合用于定位偏差。
* **迭代式下钻** — 点击任意条形即可按该值筛选 (或排除) 。热力图会基于筛选后的结果重新渲染，因此您可以不断缩小范围，直到原因变得明显。

<Image img={event_deltas} alt="事件增量概览" size="lg" />

## 先决条件 \{#prerequisites\}

事件增量需要一个带有耗时表达式的 **Trace** 数据源。任何通过 OpenTelemetry 进行埋点并生成 span 数据的服务都可以。所有 ClickStack 部署 (托管版、开源版、ClickHouse Cloud) 均提供此功能。

## 入门 \{#getting-started\}

1. 在 **数据源** 下拉菜单中，选择一个包含链路追踪的数据源。源名称可以任意设置，关键在于该数据源配置为 Trace 类型。**事件增量** 选项卡仅对此类数据源启用。
2. 在 **分析模式** 部分中，点击 **事件增量** 选项卡。

事件增量是与 **结果表** 和 **事件模式** 并列的一种独立分析模式——切换到该模式后，视图会变为热力图和属性分析网格，但您的搜索筛选器和时间范围会保持不变，且您可以随时切换回来。

## 热力图 \{#the-heatmap\}

热力图按两个维度绘制 span：

* **X 轴** — 时间
* **Y 轴** — 数值，默认为 span 的耗时 (以毫秒计，对数刻度)

颜色强度表示每个分桶中的事件数——越亮表示 span 越多。

您可以直接从热力图中看出一些模式：双峰延迟、特定时间点的延迟峰值，或持续偏慢的 span 带状分布。要查看某个区域，请在其上单击并拖动框选一个矩形——这会成为您的 **Selection**，并将下方分析切换为比较模式。

## 分布模式：基数异常值 \{#distribution-mode\}

在热力图上未选择任何内容时，分析面板会为每个属性显示一个条形图，基于所有匹配的 span 计算得出。图例显示为 **所有 span**。

<Image img={distribution_mode} alt="分布模式显示所有 span 中各属性的值分布" size="lg" />

属性会按其值的集中程度排序——由少数几个值主导的属性会排在前面；分布均匀、熵较高的属性则会靠后。

当你想了解数据的**基数形态**时，请使用分布模式：

* **高值** —— 哪些服务、端点、状态码或主机主导了你的 span 总体？这通常会暴露出某个租户、版本或路由承载了大部分流量。
* **低值** —— 那些确实出现但很少见的值。某个状态码只出现在 `0.5%` 的 span 中，或者某台主机几乎不出现，都可能是最值得关注的信号——长尾部分往往隐藏着回归问题和异常行为。

先结合搜索栏缩小总体范围 (例如，仅查看 error spans、仅查看 client spans，或仅查看某一个端点) ，然后再查看该子集的分布情况。

## 对比模式：与常态的偏差 \{#comparison-mode\}

在热力图上拖出一个矩形，然后点击 **Filter by Selection** 进入对比模式。选中的 spans 会成为 **Selection** (红色条形) ；其余部分会成为 **Background** (绿色条形) 。随后，每个属性图表都会并排显示这两组数据，并按差异程度排序，因此偏差最大的属性会排在最前面——某个值如果几乎只出现在其中一侧 (或只在其中一侧缺失) ，往往就是造成差异的最强线索。

<Image img={event_deltas_separation} alt="从某个特定时间开始的慢速带上的热力图选区，下方显示对比条形" size="lg" />

任何矩形选区都可以使用，但下面三种选区分别适合回答不同的问题：

* **看起来不太对劲的区域** —— 例如局限在特定时间窗口内的高延迟带、可见性能回退的起点，或一簇与其余部分不一致的 spans。当热力图里已经出现可疑迹象时，使用这种方式。
* **全宽垂直拆分 (慢 vs 快)&#x20;**&#x20;—— 拖动一个矩形，覆盖整个时间范围，但只覆盖上方的高延迟带 (慢尾) ，将大部分较快的 spans 留作 Background。用于比较慢 spans 与快 spans 的差异究竟来自哪里。
* **全高水平拆分 (前 vs 后)&#x20;**&#x20;—— 拖动一个矩形，覆盖完整的延迟轴，但只覆盖疑似发生修改之后的时间窗口，将更早的时间段留作 Background。用于比较两个时间窗口之间发生了什么变化，而不受延迟因素影响。

当热力图里没有任何内容在视觉上一眼特别突出时，全范围的垂直拆分和水平拆分尤其有用——它们让属性分析来找出偏差，而不是依赖肉眼判断。

## 迭代式逐层钻取 \{#drill-down\}

比较模式和分布模式在串联使用时效果最佳。单击任意条形图，即可打开一个包含三个操作的弹出框：

* **Filter** — 仅保留具有该值的 spans
* **Exclude** — 排除具有该值的 spans
* **Copy** — 将该值复制到剪贴板

<Image img={event_deltas_issue} alt="条形图弹出框显示了 filter、exclude 和 copy 操作，作用于仅存在于一个总体中的某个值" size="lg" />

应用 filter 或 exclude 后，热力图中的选择会被清除，热力图会基于新的总体重新渲染，分布模式也会基于该筛选后的集合继续显示。观察热力图如何改变形态——成功的筛选会明显消除慢速带，或让双峰分化收拢。重复这一过程：找出下一个可疑值，筛选，查看新的热力图，再查看新的分布。经过几轮迭代，通常就能将回归范围缩小到一两个属性。

:::note
将低频值聚合后的 **Other (N)** 分桶不可点击。若要筛选该分桶中的特定值，请直接使用[搜索栏](/use-cases/observability/clickstack/search)。
:::

当总体足够小时，切换到 **结果表** 选项卡以检查单个链路追踪——你的筛选条件会被保留。

## 自定义热力图 \{#customize\}

热力图右上角的齿轮图标会打开 **Heatmap Settings** 抽屉。

<Image img={settings_drawer} alt="Heatmap Settings 抽屉，包含 Scale、Value 和 Count 字段" size="lg" />

| 参数        | 默认值              | 说明                                                                          |
| --------- | ---------------- | --------------------------------------------------------------------------- |
| **Scale** | Log              | Log 适用于跨度较大的延迟范围；Linear 更适合范围较窄且分布均匀的场景。                                    |
| **Value** | `(Duration)/1e6` | 任何数值表达式，例如响应大小、错误率或自定义 span 属性。                                             |
| **Count** | `count()`        | 用于颜色映射的聚合方式，可切换为 `avg()`、`sum()`、`p95()`，或使用 `countDistinct(field)` 之类的表达式。 |

点击 **Apply** 更新热力图；下方的属性分析也会随之更新。

:::tip 仪表板中的热力图
同一个热力图也可作为[仪表板卡片](/use-cases/observability/clickstack/dashboards#create-a-tile-heatmap)使用，当你希望在事件增量下钻流程之外监控分布形态随时间的变化时，这会很有用。
:::

## 故障排查 \{#troubleshooting\}

### “事件增量”选项卡不可见 \{#tab-not-visible\}

仅当在 **分析模式** 下选择了带有耗时表达式的 **Trace** 数据源时，才会显示 **事件增量** 选项卡。请确认您的数据源已配置为 Trace 类型，并且包含带有耗时信息的 span 数据。

### 属性图表显示的结果很少或没有结果 \{#few-results\}

如果样本过小 (少于几十个 span) ，这些分布在统计上可能意义不大。请扩大时间范围或放宽搜索筛选器。