---
slug: /use-cases/observability/clickstack/event_patterns
title: '使用 ClickStack 进行事件模式分析'
sidebar_label: '事件模式'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 进行事件模式分析'
doc_type: 'guide'
keywords: ['clickstack', '事件模式', '日志分析', '模式匹配', '可观测性']
---

import Image from '@theme/IdealImage';
import event_patterns from '@site/static/images/use-cases/observability/event_patterns.png';
import event_patterns_highlight from '@site/static/images/use-cases/observability/event_patterns_highlight.png';

ClickStack 中的事件模式可以通过自动将相似消息聚类归组，帮助你快速理解海量日志或跟踪数据，因此你无需在数百万条单独事件中逐条排查，只需要审阅少量有意义的分组即可。

<Image img={event_patterns} alt="事件模式" size="lg" />

这使得识别哪些错误或警告是新的、哪些在反复出现、以及哪些导致了日志量的突然飙升变得容易得多。由于模式是动态生成的，你不需要定义正则表达式或维护解析规则——无论事件格式如何，ClickStack 都会自动适配你的事件。

除了用于事故响应之外，这种高层次视图还可以帮助你识别可精简以降低成本的噪声日志源，发现某个服务产生的不同类型日志，并更快地判断系统是否已经发出了你所关心的信号等。


## 访问事件模式 {#accessing-event-patterns}

事件模式可直接通过 ClickStack 中的**搜索**面板访问。

从左上角的**分析模式**选择器中,选择**事件模式**以从标准结果表切换到相似事件的聚类视图。

<Image img={event_patterns_highlight} alt='事件模式' size='lg' />

这提供了默认**结果表**的替代方案,默认结果表允许用户逐条滚动浏览每个日志或跟踪记录。


## 建议 {#recommendations}

事件模式在应用于**缩小范围的数据子集**时最为有效。例如,在启用事件模式之前先筛选到单个服务,通常比在数千个服务上同时应用模式更能发现相关且有价值的信息。

事件模式在汇总错误消息方面也特别强大,可以将具有不同 ID 或负载的重复错误归类为简洁的集群。

有关实际示例,请参阅[远程演示数据集](/use-cases/observability/clickstack/getting-started/remote-demo-data#identify-error-patterns)中事件模式的使用方式。
