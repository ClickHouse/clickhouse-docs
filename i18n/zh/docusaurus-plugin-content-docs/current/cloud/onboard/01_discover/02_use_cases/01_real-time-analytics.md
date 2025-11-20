---
slug: /cloud/get-started/cloud/use-cases/real-time-analytics
title: '实时分析'
description: '了解如何使用 ClickHouse Cloud 构建实时分析应用，实现即时洞察与数据驱动决策'
keywords: ['use cases', 'real-time analytics']
sidebar_label: '实时分析'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import rta_0 from '@site/static/images/cloud/onboard/discover/use_cases/0_rta.png';
import rta_1 from '@site/static/images/cloud/onboard/discover/use_cases/1_rta.png';
import rta_2 from '@site/static/images/cloud/onboard/discover/use_cases/2_rta.png';
import rta_3 from '@site/static/images/cloud/onboard/discover/use_cases/3_rta.png';

<iframe width="758" height="426" src="https://www.youtube.com/embed/SnFff0KYwuo?si=aNpGzSobzFhUlyX5" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## 什么是实时分析？ {#what-is-real-time-analytics}

实时分析是指在数据生成后立即向最终用户和客户提供洞察的数据处理方式。它与传统的批处理分析不同——批处理分析是将数据分批收集并处理,通常在数据生成很长时间之后才进行。

实时分析系统构建在事件流之上,事件流由一系列按时间顺序排列的事件组成。事件是指已经发生的事情,可以是电子商务网站上向购物车添加商品的操作、物联网(IoT)传感器发出的读数,或者足球比赛中的射门。

下面是一个事件示例(来自虚构的 IoT 传感器):

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

组织可以通过聚合和分析此类事件来发现关于客户的洞察。传统上这是通过批处理分析完成的,在下一节中,我们将比较批处理分析和实时分析。


## 实时分析与批处理分析 {#real-time-analytics-vs-batch-analytics}

下图展示了从单个事件的角度来看，典型的批处理分析系统的运作方式：

<Image img={rta_0} size='md' border alt='批处理分析示意图' />

可以看到，从事件发生到我们处理并从中获取洞察之间存在相当大的时间延迟。传统上，这是数据分析的唯一方式，我们需要人为设定时间边界来批量处理数据。例如，我们可能会在每天结束时处理当天收集到的所有数据。这种方式适用于许多使用场景，但对于其他场景来说并非最优选择，因为我们处理的是过时的数据，无法对数据做出足够快速的反应。

相比之下，在实时分析系统中，我们会在事件发生时立即做出反应，如下图所示：

<Image img={rta_1} size='md' border alt='实时分析示意图' />

现在我们几乎可以在事件生成的同时从中获取洞察。但这有什么用处呢？


## 实时分析的优势 {#benefits-of-real-time-analytics}

在当今快节奏的环境中,企业依靠实时分析来保持敏捷性并快速响应不断变化的情况。实时分析系统可以在多个方面为企业带来价值。

### 更优的决策能力 {#better-decision-making}

通过实时分析获得可执行的洞察,可以显著提升决策质量。当业务运营人员能够实时看到正在发生的事件时,就能更轻松地进行及时干预。

例如,如果我们对应用程序进行了更改,并想知道这是否对用户体验产生了负面影响,我们希望尽快获知这一信息,以便在必要时回滚更改。如果采用非实时方式,我们可能需要等到第二天才能进行分析,而到那时已经会有大量用户感到不满。

### 新产品和收入来源 {#new-products-and-revenue-streams}

实时分析可以帮助企业开拓新的收入来源。企业可以开发以数据为中心的新产品和服务,为用户提供分析查询能力。这些产品往往具有足够的吸引力,让用户愿意为此付费。

此外,现有应用程序可以变得更具粘性,从而提高用户参与度和留存率。这将带来更高的应用使用率,为企业创造更多收入。

### 提升客户体验 {#improved-customer-experience}

借助实时分析,企业可以即时洞察客户的行为、偏好和需求。这使企业能够提供及时的帮助,实现个性化互动,并创造更具吸引力的体验,从而提高客户回访率。


## 实时分析应用场景 {#real-time-analytics-use-cases}

当我们考虑实时分析的实际应用时,其真正价值便显而易见。让我们来看看其中的一些应用场景。

### 欺诈检测 {#fraud-detection}

欺诈检测旨在识别欺诈模式,涵盖从虚假账户到支付欺诈等各种情况。我们希望尽快检测到这些欺诈行为,标记可疑活动,阻止交易,并在必要时禁用账户。

该应用场景横跨多个行业:医疗保健、数字银行、金融服务、零售等。

[Instacart](https://www.instacart.com/) 是北美领先的在线杂货公司,拥有数百万活跃客户和购物者。它将 ClickHouse 作为其欺诈检测平台 Yoda 的一部分。除了上述常见的欺诈类型外,它还会检测客户与购物者之间的串通行为。

<Image
  img={rta_2}
  size='md'
  border
  alt='用于欺诈检测的实时分析'
/>

他们总结了 ClickHouse 支持实时欺诈检测的以下特性:

> ClickHouse 支持基于 LSM-tree 的 MergeTree 系列引擎。
> 这些引擎针对写入操作进行了优化,适合实时摄取大量数据。

> ClickHouse 专门针对分析查询进行设计和优化。这完全契合需要持续分析数据以发现潜在欺诈模式的应用需求。

### 时效性决策 {#ftime-sensitive-decision-making}

时效性决策是指用户或组织需要基于最新可用信息快速做出明智选择的场景。实时分析使用户能够在动态环境中做出明智的决策,无论他们是应对市场波动的交易员、做出购买决策的消费者,还是适应实时运营变化的专业人士。

Coinhall 通过 K 线图为其用户提供价格随时间变动的实时洞察,该图表显示每个交易周期的开盘价、最高价、最低价和收盘价。他们需要能够快速运行这些类型的查询,并支持大量并发用户。

<Image
  img={rta_3}
  size='md'
  border
  alt='用于时效性决策的实时分析'
/>

> 在性能方面,ClickHouse 表现最为出色,执行 K 线查询仅需 20 毫秒,而其他数据库需要 400 毫秒或更长时间。它执行最新价格查询仅需 8 毫秒,超过了次优性能(SingleStore)的 45 毫秒。最后,它处理 ASOF JOIN 查询仅需 50 毫秒,而 Snowflake 需要 20 分钟,Rockset 则超时。
