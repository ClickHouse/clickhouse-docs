---
slug: /use-cases/observability/clickstack/event_patterns
title: 'ClickStack 事件模式'
sidebar_label: '事件模式'
pagination_prev: null
pagination_next: null
description: 'ClickStack 事件模式'
doc_type: 'guide'
keywords: ['clickstack', 'event patterns', 'log analysis', 'pattern matching', 'observability']
---

import Image from '@theme/IdealImage';
import event_patterns from '@site/static/images/use-cases/observability/event_patterns.png';
import event_patterns_highlight from '@site/static/images/use-cases/observability/event_patterns_highlight.png';

ClickStack 中的事件模式可以通过自动将相似的消息聚类在一起，帮助你快速理解海量日志或追踪数据，因此你无需在数百万条单独事件中逐条排查，只需审查数量很少但更有意义的一小部分分组即可。

<Image img={event_patterns} alt="事件模式" size="lg" />

这让你更容易发现哪些错误或警告是新的、哪些在反复出现、以及哪些正在推动日志量的突然飙升。由于模式是动态生成的，你不需要定义正则表达式或维护解析规则——无论事件采用何种格式，ClickStack 都会自动适配。

除了用于故障响应之外，这种高层视图还可以帮助你识别可以裁剪以降低成本的噪声日志源，发现某个服务会产生的不同类型日志，并能更快速地回答系统是否已经发出了你所关心的信号等问题。


## 访问事件模式 {#accessing-event-patterns}

事件模式可直接通过 ClickStack 中的**搜索**面板访问。

在左上角的**分析模式**选择器中,选择**事件模式**即可从标准结果表切换到相似事件的聚类视图。

<Image img={event_patterns_highlight} alt='事件模式' size='lg' />

这提供了默认**结果表**的替代方案,结果表允许用户逐条滚动浏览每个日志或跟踪记录。


## 建议 {#recommendations}

事件模式在应用于**缩小范围的数据子集**时最为有效。例如,在启用事件模式之前先筛选到单个服务,通常会比同时在数千个服务上应用模式发现更相关和更有价值的信息。

它们在汇总错误消息方面也特别强大,可以将具有不同 ID 或负载的重复错误归类为简洁的集群。

有关实际示例,请参阅[远程演示数据集](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns)中如何使用事件模式。
