---
'slug': '/use-cases/observability/clickstack/event_patterns'
'title': '与 ClickStack 的事件模式'
'sidebar_label': '事件模式'
'pagination_prev': null
'pagination_next': null
'description': '与 ClickStack 的事件模式'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import event_patterns from '@site/static/images/use-cases/observability/event_patterns.png';
import event_patterns_highlight from '@site/static/images/use-cases/observability/event_patterns_highlight.png';

Event patterns in ClickStack 允许您通过自动聚类相似的消息，快速理解大量的日志或追踪，因此您只需审查少量有意义的组，而无需逐条查找数百万个单独的事件。

<Image img={event_patterns} alt="事件模式" size="lg"/>

这使得识别哪些错误或警告是新的，哪些是重复出现的，以及哪些导致日志量激增变得更加容易。由于模式是动态生成的，您无需定义正则表达式或维护解析规则 - ClickStack 会自动适应您的事件，无论其格式如何。

除了事件响应，这种高层次的视图还帮助您识别噪声日志源，这些源可以被修剪以减少成本，发现服务产生的不同类型的日志，以及更快速地回答系统是否已经发出您关心的信号。

## 访问事件模式 {#accessing-event-patterns}

事件模式可以直接通过 ClickStack 中的 **Search** 面板访问。  

从左上角的 **Analysis Mode** 选择器中，选择 **Event Patterns** 以切换到聚类相似事件的视图，而不是标准结果表。  

<Image img={event_patterns_highlight} alt="事件模式" size="lg"/>

这为默认的 **Results Table** 提供了一种替代方案，允许用户滚动浏览每个单独的日志或追踪。

## 建议 {#recommendations}

事件模式在应用于 **缩小的子集** 数据时效果最佳。例如，在启用事件模式之前过滤到单个服务，通常会比在数千个服务上同时应用模式更易于浮现出相关和有趣的消息。  

它们对于总结错误消息尤为强大，其中重复的错误（具有不同的 ID 或有效负载）被聚合成简明的集群。  

有关实时示例，请查看事件模式在 [Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns) 中的使用情况。
