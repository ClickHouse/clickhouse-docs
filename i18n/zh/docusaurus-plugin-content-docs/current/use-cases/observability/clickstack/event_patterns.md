---
slug: /use-cases/observability/clickstack/event_patterns
title: 'ClickStack 中的事件模式'
sidebar_label: '事件模式'
pagination_prev: null
pagination_next: null
description: 'ClickStack 中的事件模式'
doc_type: 'guide'
keywords: ['clickstack', 'event patterns', 'log analysis', 'pattern matching', 'observability']
---

import Image from '@theme/IdealImage';
import event_patterns from '@site/static/images/use-cases/observability/event_patterns.png';
import event_patterns_highlight from '@site/static/images/use-cases/observability/event_patterns_highlight.png';

ClickStack 中的事件模式可以通过自动将相似消息聚类在一起，帮助你快速理解海量日志或追踪数据，因此你无需在数百万条单个事件中逐条排查，只需审查少量有代表性的事件分组即可。

<Image img={event_patterns} alt="事件模式" size="lg" />

这使你更容易发现哪些错误或警告是新的、哪些是反复出现的，以及哪些导致了日志量的突然飙升。由于这些模式是动态生成的，你不需要定义正则表达式或维护解析规则——ClickStack 会自动适配你的事件，而不受其格式限制。

除了用于事故响应之外，这种宏观视图还可以帮助你识别可以削减以降低成本的噪声日志来源，了解某个服务会产生的不同类型日志，并更快地判断系统是否已经发出了你所关心的关键信号。


## 访问事件模式 {#accessing-event-patterns}

事件模式可直接通过 ClickStack 中的**搜索**面板访问。

在左上角的**分析模式**选择器中,选择**事件模式**即可从标准结果表切换到相似事件的聚类视图。

<Image img={event_patterns_highlight} alt='事件模式' size='lg' />

这提供了默认**结果表**的替代方案,结果表允许用户逐条滚动浏览每个日志或跟踪记录。


## 建议 {#recommendations}

事件模式在应用于数据的**缩小子集**时最为有效。例如,在启用事件模式之前先筛选到单个服务,通常会比在数千个服务上同时应用模式更容易发现相关且有价值的消息。

事件模式对于汇总错误消息也特别有用,可以将具有不同 ID 或负载的重复错误分组为简洁的集群。

有关实际示例,请参阅[远程演示数据集](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns)中如何使用事件模式。
