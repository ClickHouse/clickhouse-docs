---
slug: /cloud/get-started/cloud/use-cases/real-time-analytics
title: '实时分析'
description: '了解如何使用 ClickHouse Cloud 构建实时分析应用，实现即时洞察和数据驱动决策'
keywords: ['使用场景', '实时分析']
sidebar_label: '实时分析'
doc_type: '指南'
---

import Image from '@theme/IdealImage';
import rta_0 from '@site/static/images/cloud/onboard/discover/use_cases/0_rta.png';
import rta_1 from '@site/static/images/cloud/onboard/discover/use_cases/1_rta.png';
import rta_2 from '@site/static/images/cloud/onboard/discover/use_cases/2_rta.png';
import rta_3 from '@site/static/images/cloud/onboard/discover/use_cases/3_rta.png';

<iframe width="758" height="426" src="https://www.youtube.com/embed/SnFff0KYwuo?si=aNpGzSobzFhUlyX5" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />

## 什么是实时分析？ \\{#what-is-real-time-analytics\\}

实时分析是指一种数据处理方式，可以在数据生成后几乎立刻向终端用户
和客户提供洞察。它不同于传统分析或批处理分析，后者会先批量收集数据，
然后再进行处理，往往要在数据生成很久之后才开始处理。

实时分析系统构建在事件流之上，事件流由按时间顺序排列的一系列事件
组成。事件是已经发生过的事情。它可以是电商网站上将商品添加到购物车，
也可以是某个物联网（IoT）传感器发出的读数，或者是一场足球比赛中
的一次射门。

下面展示了一个（来自虚构 IoT 传感器的）事件示例：

```json
{
  "deviceId": "sensor-001",
  "timestamp": "2023-10-05T14:30:00Z",
  "eventType": "temperatureAlert",
  "data": {
    "temperature": 28.5,
    "unit": "Celsius",
    "thresholdExceeded": true
  }
}
```

通过对这类事件进行聚合和分析，组织可以发掘有关其客户的洞察。
传统上，这通常是通过批量分析来完成的，在下一节中我们将比较
批量分析与实时分析。

## 实时分析 vs 批量分析 \\{#real-time-analytics-vs-batch-analytics\\}

下图展示了从单个事件的角度来看，一个典型的批量分析系统的样子：

<Image img={rta_0} size="md" border alt="批量分析示意图" />

可以看到，从事件发生到我们处理并从中获得洞见之间存在相当大的时间间隔。传统上，这曾是唯一的数据分析方式，我们需要人为设定时间边界来对数据进行批量处理。比如，我们可能会在一天结束时处理当天收集的所有数据。这种方式在许多用例中是可行的，但对另一些场景来说则不够理想，因为我们处理的是陈旧数据，且无法足够快速地对数据作出响应。

相比之下，在实时分析系统中，我们会在事件发生后立即对其进行响应，如下图所示：

<Image img={rta_1} size="md" border alt="实时分析示意图" />

现在，我们几乎可以在事件生成的同时从中获得洞见。那么，这有什么用呢？

## 实时分析的优势 \\{#benefits-of-real-time-analytics\\}

在当今快节奏的世界中，组织依赖实时分析在不断变化的环境下保持
敏捷和快速响应。实时分析系统可以通过多种方式为业务带来收益。

### 更好的决策制定 \\{#better-decision-making\\}

通过实时分析获取可付诸行动的洞察，可以改进决策过程。当业务运营人员
能够在事件发生时实时看到它们，就可以更轻松地进行及时干预。

例如，如果我们对某个应用进行了更改，并想知道这些更改是否正在
对用户体验产生不利影响，我们希望尽快获知这一点，以便在必要时
回滚更改。在缺乏实时性的情况下，我们可能不得不等到第二天才能进行这项
分析，等到那个时候，可能已经有大量不满的用户了。

### 新产品和收入来源 \\{#new-products-and-revenue-streams\\}

实时分析可以帮助企业创造新的收入来源。组织可以开发以数据为核心的
新产品和服务，为用户提供分析查询能力的使用权。这类产品往往足够有吸引力，
使用户愿意为访问权限付费。

此外，还可以提高现有应用的“黏性”，从而提升用户参与度和留存率。这将带来更多
的应用使用量，为组织创造更多收入。

### 改善客户体验 \\{#improved-customer-experience\\}

借助实时分析，企业可以即时洞察客户行为、偏好和需求。这使企业能够提供及时
的支持、个性化交互，并打造更具吸引力的体验，从而让客户持续回访。

## 实时分析用例 \\{#real-time-analytics-use-cases\\}

当我们考虑实时分析的实际应用场景时，它的真正价值才会显现出来。下面来看几个典型用例。

### 欺诈检测 \\{#fraud-detection\\}

欺诈检测是指发现各种欺诈模式，从虚假账户到支付欺诈。我们希望尽可能快速地检测到这些欺诈行为，标记可疑活动，在必要时拦截交易并禁用账户。

这一类用例跨越多个行业：医疗保健、数字银行、金融服务、零售等。

[Instacart](https://www.instacart.com/) 是北美领先的线上杂货电商，拥有数百万活跃用户和“购物员”。它在其欺诈检测平台 Yoda 中使用 ClickHouse。除了上述常见的欺诈类型外，它还尝试检测用户与购物员之间的勾结行为。

<Image img={rta_2} size="md" border alt="用于欺诈检测的实时分析" />

他们总结了 ClickHouse 在实现实时欺诈检测方面具备以下特点：

> ClickHouse 支持基于 LSM-tree 的 MergeTree 系列引擎。  
> 这些引擎针对写入进行了优化，非常适合在实时场景下摄取和写入海量数据。

> ClickHouse 是专门为分析型查询设计并优化的。  
> 这与那些需要持续分析数据以发现潜在欺诈模式的应用需求完全契合。

### 时间敏感型决策 \\{#ftime-sensitive-decision-making\\}

时间敏感型决策是指用户或组织需要基于当前最新信息，快速做出明智选择的场景。实时分析使用户能够在动态环境中做出有依据的决策，无论是应对市场波动的交易员、做出购买决策的消费者，还是需要根据实时运营变化及时调整的专业人员。

Coinhall 通过蜡烛图向用户提供价格随时间变动的实时洞察，该图展示每个交易周期的开盘价、最高价、最低价和收盘价。他们需要在大量并发用户的情况下，也能快速执行此类查询。

<Image img={rta_3} size="md" border alt="用于时间敏感型决策的实时分析" />

> 在性能方面，ClickHouse 表现遥遥领先，仅用 20 毫秒就能执行蜡烛图查询，  
> 而其他数据库则需要 400 毫秒或更长时间。它在 8 毫秒内完成最新价格查询，  
> 远超排名第二的 SingleStore（45 毫秒）。最后，它在 50 毫秒内完成 ASOF JOIN 查询，  
> 而 Snowflake 需要 20 分钟，Rockset 则直接超时。
