---
slug: /use-cases/observability/clickstack/ingesting-data/trace-sampling
title: "追踪采样"
sidebar_label: "追踪采样"
pagination_prev: null
pagination_next: null
description: "在 ClickStack 中为采样后的追踪数据配置样本加权聚合。"
doc_type: "guide"
keywords: ["ClickStack", "追踪采样", "尾部采样", "采样率", "加权聚合", "OpenTelemetry", "SampleRate"]
---

import Image from "@theme/IdealImage"
import trace_sampling_source_settings from "@site/static/images/clickstack/trace-sampling-source-settings.png"

高吞吐量服务每秒可生成数百万个 span。存储每一个 span 的成本很高，因此团队通常会运行 OpenTelemetry Collector 的 [尾部采样处理器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/tailsamplingprocessor)，只保留每 N 个 span 中的 1 个。每个被保留的 span 都带有一个 `SampleRate` 属性，用于记录 N。

一旦数据经过采样，直接做聚合就会得出错误结果：`count()` 返回的事件数会比实际少 N 倍，`sum()` 和 `avg()` 会产生偏差，百分位数也会发生偏移。仪表板会显示具有误导性的偏低请求数、处理量和错误率。

ClickStack 通过具备采样感知能力的查询引擎解决了这个问题。当你在链路追踪数据源上配置采样率表达式时，查询构建器会改写 SQL 聚合，让每个 span 都按其采样率进行加权——这一能力适用于仪表板、告警和临时搜索。

## 工作原理 \{#how-it-works\}

当 链路追踪数据源配置了 `sampleRateExpression` 时，ClickStack 会将其封装为：

```sql
greatest(toUInt64OrZero(toString(expr)), 1)
```

不带 `SampleRate` 属性的 Span 默认权重为 1，因此对于未采样数据，结果与原始查询完全一致。

随后，查询构建器会改写聚合计算：

| 聚合                 | 改写前                | 改写后 (采样校正)                                |
| ------------------ | ------------------ | ----------------------------------------- |
| count              | `count()`          | `sum(weight)`                             |
| count + 条件         | `countIf(cond)`    | `sumIf(weight, cond)`                     |
| avg                | `avg(col)`         | `sum(col * weight) / sum(weight)`         |
| sum                | `sum(col)`         | `sum(col * weight)`                       |
| quantile(p)        | `quantile(p)(col)` | `quantileTDigestWeighted(p)(col, weight)` |
| min / max          | 不变                 | 不变                                        |
| count&#95;distinct | 不变                 | 不变                                        |

:::note
在采样场景下，百分位数使用 `quantileTDigestWeighted`；这是一种近似的 T-Digest sketch，因此结果接近但并非精确值。
:::

## 配置采样率表达式 \{#configuring\}

在 **Source Settings** 中打开链路追踪数据源，并在 **Sample Rate Expression** 字段中输入一个用于计算每个 span 采样率的 ClickHouse 表达式。

例如，如果 OpenTelemetry 尾部采样处理器将该速率写入 `SpanAttributes['SampleRate']`：

<Image img={trace_sampling_source_settings} alt="ClickStack Source Settings 中的 Sample Rate Expression 字段" size="lg" />

配置完成后，所有图表、仪表板、告警和服务仪表板面板都会自动应用基于采样率加权的聚合。无需修改单个查询。