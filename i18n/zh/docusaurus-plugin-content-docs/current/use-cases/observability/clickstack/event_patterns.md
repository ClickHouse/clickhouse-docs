---
slug: /use-cases/observability/clickstack/event_patterns
title: 'ClickStack 事件模式'
sidebar_label: '事件模式'
pagination_prev: null
pagination_next: null
description: 'ClickStack 事件模式'
doc_type: 'guide'
keywords: ['clickstack', '事件模式', '日志分析', '模式匹配', '可观测性']
---

import Image from '@theme/IdealImage';
import event_patterns from '@site/static/images/use-cases/observability/event_patterns.png';
import event_patterns_highlight from '@site/static/images/use-cases/observability/event_patterns_highlight.png';

ClickStack 中的事件模式可以通过自动将相似消息聚类在一起，帮助你快速梳理海量日志或追踪数据，因此你无需在数百万条单独事件中逐条查找，只需审阅少量有代表性的分组即可。

<Image img={event_patterns} alt="事件模式" size="lg" />

这使你更容易发现哪些错误或警告是新的、哪些是重复出现的，以及哪些正在导致日志量的突然激增。由于模式是动态生成的，你不需要定义正则表达式或维护解析规则——ClickStack 会自动适配你的事件，而不受格式限制。

除了用于事件响应之外，这种宏观视图还能帮助你识别可删减以降低成本的噪声日志源，发现某个服务产生的不同类型日志，并更快判断系统是否已经发出了你所关心的信号。


## 访问事件模式 {#accessing-event-patterns}

事件模式可以直接通过 ClickStack 中的 **Search** 面板访问。  

在左上角的 **Analysis Mode** 选择器中，选择 **Event Patterns**，即可从标准结果表切换到相似事件的聚类视图。  

<Image img={event_patterns_highlight} alt="Event patterns" size="lg"/>

这为默认的 **Results Table** 提供了一种替代视图，默认视图需要用户逐条滚动浏览每一条日志或 trace。



## 建议 {#recommendations}

事件模式在应用到数据的**更小、更精细的子集**时效果最佳。比如，在启用事件模式之前，先过滤到单个服务，相比一次性在上千个服务上应用事件模式，通常能呈现出更加相关且有价值的消息。  

事件模式在汇总错误消息方面也尤其强大，其中带有不同 ID 或负载的重复错误会被归并成简洁的聚类。  

要查看实时示例，请参阅在 [Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns) 中如何使用事件模式。
