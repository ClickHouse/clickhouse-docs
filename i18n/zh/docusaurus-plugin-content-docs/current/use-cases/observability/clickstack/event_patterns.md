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

ClickStack 中的事件模式可以通过自动将相似的消息聚类在一起，帮助你快速理解海量日志或 Traces，因此你不必在数百万条单独事件中逐条排查，而只需要审阅少量有意义的分组。

<Image img={event_patterns} alt="事件模式" size="lg" />

这大大简化了识别哪些错误或告警是新的、哪些是反复出现的、以及哪些正在驱动日志量突然攀升的过程。由于模式是动态生成的，你无需编写正则表达式或维护解析规则——ClickStack 会自动适配你的事件，而不受其格式限制。

除了用于故障响应之外，这种高层次视图还能帮助你识别可以精简以降低成本的噪声日志来源、发现某个服务产生的不同类型日志，并更快速地回答系统是否已经发出了你所关心的关键信号等问题。


## 访问事件模式 \\{#accessing-event-patterns\\}

可以直接通过 ClickStack 中的 **Search** 面板访问事件模式。  

在左上角的 **Analysis Mode** 选择器中选择 **Event Patterns**，即可从标准结果表切换到相似事件的聚类视图。  

<Image img={event_patterns_highlight} alt="Event patterns" size="lg"/>

这提供了相对于默认 **Results Table** 的另一种视图，默认视图允许你逐条滚动浏览每一条日志或跟踪（trace）。

## 建议 \\{#recommendations\\}

将事件模式应用于数据的**更窄子集**时效果最佳。比如，在启用事件模式之前先筛选到单个服务，通常比一次性在上千个服务上应用模式，更容易发现更相关、更有价值的消息。  

事件模式在汇总错误消息时也尤其强大；具有不同 ID 或负载的重复错误会被聚合成简洁的簇。  

要查看在线示例，请参考在 [Remote Demo Dataset](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns) 中如何使用事件模式。