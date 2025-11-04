---
'slug': '/cloud/get-started/cloud/use-cases/real-time-analytics'
'title': '实时分析'
'description': '学习如何使用 ClickHouse Cloud 构建实时分析应用程序，以获得即时洞察和数据驱动的决策'
'keywords':
- 'use cases'
- 'real-time analytics'
'sidebar_label': '实时分析'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import rta_0 from '@site/static/images/cloud/onboard/discover/use_cases/0_rta.png';
import rta_1 from '@site/static/images/cloud/onboard/discover/use_cases/1_rta.png';
import rta_2 from '@site/static/images/cloud/onboard/discover/use_cases/2_rta.png';
import rta_3 from '@site/static/images/cloud/onboard/discover/use_cases/3_rta.png';

<iframe width="758" height="426" src="https://www.youtube.com/embed/SnFff0KYwuo?si=aNpGzSobzFhUlyX5" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 什么是实时分析？ {#what-is-real-time-analytics}

实时分析指的是数据处理，它在数据生成后立刻向最终用户和客户提供洞察。它与传统或批处理分析不同，后者将数据以批次的方式收集并处理，通常在数据生成后很长一段时间才进行处理。

实时分析系统建立在事件流之上，该事件流由一系列按时间顺序排列的事件组成。事件是已经发生的事情。它可以是电子商务网站上将项目添加到购物车的动作，来自物联网 (IoT) 传感器的读数输出，或者足球比赛中的进球。

下面是来自一个虚构的物联网传感器的事件示例：

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

组织可以通过聚合和分析这样的事件来发现关于客户的洞察。这在传统上是通过批处理分析完成的，接下来的部分我们将比较批处理分析和实时分析。

## 实时分析与批处理分析 {#real-time-analytics-vs-batch-analytics}

下面的图表展示了从单个事件的角度来看，典型的批处理分析系统的样子：

<Image img={rta_0} size="md" border alt="批处理分析图" />

可以看到，从事件发生到我们处理并获得一些洞察之间有很大的间隔。传统上，这是唯一的数据分析方式，我们需要创建人工时间边界以批量处理数据。例如，我们可能在一天结束时处理所有收集到的数据。这对于许多用例有效，但对于其他一些用例来说，这种方式并不理想，因为我们在处理陈旧的数据，并且这无法让我们对数据做出足够迅速的反应。

相比之下，在实时分析系统中，我们会在事件发生后立即做出反应，如下图所示：

<Image img={rta_1} size="md" border alt="实时分析图" />

现在，我们几乎可以在事件生成后立即派生出洞察。但这为什么有用呢？

## 实时分析的好处 {#benefits-of-real-time-analytics}

在今天这个快速变化的世界中，组织依赖实时分析来保持敏捷，并对不断变化的环境做出响应。一个实时分析系统可以在许多方面为企业带来好处。

### 更好的决策 {#better-decision-making}

通过实时分析获得可操作的洞察，可以改善决策过程。当业务运营者能够看到正在发生的事件时，更容易做出及时干预。

例如，如果我们对应用程序进行更改并希望知道这些更改是否对用户体验产生了负面影响，我们希望尽快知道这一点，以便在必要时撤回更改。如果采用不够实时的方法，我们可能需要等到第二天才能进行分析，这样的话就会有很多不满的用户。

### 新产品和收入来源 {#new-products-and-revenue-streams}

实时分析可以帮助企业生成新的收入来源。组织可以开发新的以数据为中心的产品和服务，使用户能够获得分析查询功能。这些产品往往足够吸引用户支付使用费用。

此外，现有应用程序可以变得更具粘性，提高用户参与度和留存率。这将导致更多的应用使用，从而为组织创造更多的收入。

### 改善客户体验 {#improved-customer-experience}

借助实时分析，企业可以获得关于客户行为、偏好和需求的即时洞察。这使企业能提供及时的帮助，个性化互动，并创造更具吸引力的体验，让客户不断回访。

## 实时分析的用例 {#real-time-analytics-use-cases}

实时分析的实际价值在于我们考虑其实际应用时会变得明显。我们来看一些用例。

### 欺诈检测 {#fraud-detection}

欺诈检测是指识别欺诈模式，从虚假账户到支付欺诈。我们希望尽快发现这种欺诈，标记可疑活动，阻止交易并在必要时禁用账户。

这个用例跨越多个行业：医疗保健、数字银行、金融服务、零售等。

[Instacart](https://www.instacart.com/) 是北美领先的在线杂货公司，拥有数百万的活跃客户和购物者。它使用 ClickHouse 作为其欺诈检测平台 Yoda 的一部分。除了上述描述的欺诈一般类型外，它还试图检测客户与购物者之间的勾结。

<Image img={rta_2} size="md" border alt="实时分析的欺诈检测" />

他们识别出 ClickHouse 的以下特性使其能够实现实时欺诈检测：

> ClickHouse 支持基于 LSM 树的 MergeTree 家族引擎。
> 这些引擎经过优化，适合实时摄取大量数据，适合大量写入操作。

> ClickHouse专门为分析查询设计并优化。这完美契合了应用程序的需求，即持续分析数据以寻找可能表明欺诈的模式。

### 对时间敏感的决策 {#ftime-sensitive-decision-making}

对时间敏感的决策是指用户或组织需要快速做出知情选择的情况，基于可用的最新信息。实时分析使用户能够在动态环境中做出明智的选择，无论他们是对市场波动作出反应的交易员，还是做出购买决定的消费者，亦或是适应实时操作变化的专业人士。

Coinhall 通过蜡烛图提供实时的价格变动洞察，显示每个交易周期的开盘价、最高价、最低价和收盘价。他们需要能够快速运行这些类型的查询，并支持大量并发用户。

<Image img={rta_3} size="md" border alt="实时分析的时间敏感决策" />

> 在性能方面，ClickHouse 是明显的赢家，以 20 毫秒执行蜡烛图查询，而其他数据库需要 400 毫秒或更多。其最新价格查询在 8 毫秒内完成，超越了下一个最佳性能 (SingleStore) 的 45 毫秒。最后，它在 50 毫秒内处理 ASOF JOIN 查询，而 Snowflake 则需要 20 分钟，Rockset 超时。
