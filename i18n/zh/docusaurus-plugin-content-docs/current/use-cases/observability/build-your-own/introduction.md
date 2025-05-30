---
'title': '介绍'
'description': '使用 ClickHouse 作为可观察性解决方案'
'slug': '/use-cases/observability/introduction'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'show_related_blogs': true
---

import observability_1 from '@site/static/images/use-cases/observability/observability-1.png';
import observability_2 from '@site/static/images/use-cases/observability/observability-2.png';
import Image from '@theme/IdealImage';


# 使用 ClickHouse 进行可观测性

## 引言 {#introduction}

本指南旨在为希望使用 ClickHouse 构建基于 SQL 的可观测性解决方案的用户提供指导，重点关注日志和追踪。这涵盖了构建自己解决方案的各个方面，包括数据摄取、为访问模式优化架构和从非结构化日志中提取结构。

单靠 ClickHouse 并不是一个即插即用的可观测性解决方案。然而，它可以作为一个高效的存储引擎用于可观测性数据，具备无与伦比的压缩率和闪电般快速的查询响应时间。为了使用户能够在可观测性解决方案中使用 ClickHouse，需要一个用户界面和数据收集框架。目前我们推荐使用 **Grafana** 来可视化可观测性信号，而 **OpenTelemetry** 用于数据收集（两者都是官方支持的集成）。

<Image img={observability_1} alt="Simple OTel" size="md"/>

<br />

:::note 不仅仅是 OpenTelemetry
虽然我们推荐使用 OpenTelemetry （OTel）项目进行数据收集，但也可以使用其他框架和工具产生类似的架构，例如 Vector 和 Fluentd （参见 [示例](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit) 使用 Fluent Bit）。还存在其他可视化工具，包括 Superset 和 Metabase。
:::

## 为什么使用 ClickHouse？ {#why-use-clickhouse}

任何集中式可观测性存储的最重要特征是能快速聚合、分析和搜索来自各种来源的大量日志数据。这种集中化简化了故障排除，使得更容易找出服务中断的根本原因。

由于用户越来越关注成本，并发现这些即插即用产品的成本高而且不可预测，相比于它们所带来的价值，经济高效且可预测的日志存储比以往任何时候都更有价值，而查询性能令人满意。

由于其性能和成本效率，ClickHouse 已成为可观测性产品中日志和追踪存储引擎的事实标准。

更具体地说，以下几点表明 ClickHouse 特别适合用于存储可观测性数据：

- **压缩** - 可观测性数据通常包含其值取自于不同集合的字段，例如 HTTP 代码或服务名称。ClickHouse 的列式存储，数据以排序方式存储，使得这些数据能够极为有效地压缩——特别是结合一系列针对时间序列数据的专用编解码器。与其他数据存储不同，后者通常需要与原始数据大小相等的存储空间（通常为 JSON 格式），ClickHouse 平均可以将日志和追踪压缩至 14 倍以上。除了为大型可观测性安装提供显著的存储节约外，这种压缩还加速了查询，因为需要从磁盘读取的数据量减少。
- **快速聚合** - 可观测性解决方案通常涉及通过图表可视化数据，例如显示错误率的线图或显示流量来源的条形图。聚合或 GROUP BY 对于驱动这些图表至关重要，当在故障诊断工作流程中应用过滤器时，也必须快速和响应。ClickHouse 的列式格式结合向量化查询执行引擎非常适合快速聚合，稀疏索引允许根据用户的操作快速过滤数据。
- **快速线性扫描** - 虽然替代技术依赖于倒排索引来快速查询日志，但这不可避免地导致高磁盘和资源利用率。虽然 ClickHouse 提供了倒排索引作为附加可选索引类型，但线性扫描是高度并行化的，并利用机器上所有可用的核心（除非另行配置）。这可能允许每秒扫描数十 GB（压缩）以寻找匹配的 [高度优化的文本匹配操作符](/sql-reference/functions/string-search-functions)。
- **SQL 的熟悉性** - SQL 是所有工程师都熟悉的通用语言。经过超过 50 年的发展，SQL 已证明自己是数据分析的事实标准语言，并仍然是 [第三大流行编程语言](https://clickhouse.com/blog/the-state-of-sql-based-observability#lingua-franca)。可观测性只是另一个数据问题，SQL 在这里是理想的选择。
- **分析函数** - ClickHouse 扩展 ANSI SQL，引入了旨在简化 SQL 查询的分析函数。这些功能对于执行根本原因分析的用户至关重要，数据需要被切片和切块。
- **二级索引** - ClickHouse 支持二级索引，例如布隆过滤器，以加速特定的查询配置。这些索引可以在列级别可选启用，赋予用户细粒度的控制，并允许他们评估成本-性能的好处。
- **开源和开放标准** - 作为开源数据库，ClickHouse 采用开放标准，例如 OpenTelemetry。能参与和积极贡献项目的能力具有吸引力，同时避免了供应商锁定的挑战。

## 何时使用 ClickHouse 进行可观测性 {#when-should-you-use-clickhouse-for-observability}

使用 ClickHouse 进行可观测性数据要求用户接受基于 SQL 的可观测性。我们推荐 [这篇博客文章](https://clickhouse.com/blog/the-state-of-sql-based-observability) 了解基于 SQL 的可观测性历史，但总结如下：

如果您或您的团队：

- 熟悉 SQL （或想学习它）
- 偏好遵循开放标准如 OpenTelemetry，以避免被锁定并实现可扩展性。
- 愿意运行一个由开源创新推动的生态系统，从数据收集到存储和可视化。
- 设想可管理的可观测性数据量的中等或大幅增长（甚至非常大）
- 希望控制 TCO （总拥有成本），避免不断上涨的可观测性成本。
- 无法或不想因管理成本而在可观测性数据上面临较短的数据保留期。

那么，基于 SQL 的可观测性适合您。

如果您：

- 学习（或生成！）SQL 对您或您的团队没有吸引力。
- 寻找打包的、端到端的可观测性体验。
- 您的可观测性数据量太小，无法产生任何显著的差异（例如 &lt;150 GiB），并且没有预期增长。
- 您的用例是以指标为重的并且需要 PromQL。在这种情况下，您仍然可以将 ClickHouse 用于日志和追踪，同时使用 Prometheus 处理指标，在呈现层使用 Grafana 统一。
- 更倾向于等待生态系统进一步成熟，基于 SQL 的可观测性变得更为一体化。

## 日志和追踪 {#logs-and-traces}

可观测性用例有三个独特支柱：日志、追踪和指标。每个支柱都有不同的数据类型和访问模式。

我们当前推荐 ClickHouse 用于存储两种类型的可观测性数据：

- **日志** - 日志是事件在系统内发生时的时间戳记录，捕捉关于软件操作不同方面的详细信息。日志中的数据通常是非结构化或半结构化的，可以包括错误消息、用户活动日志、系统更改和其他事件。日志对故障排除、异常检测以及理解系统内导致问题的具体事件至关重要。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

- **追踪** - 追踪记录请求在分布式系统中穿越不同服务的过程，详细说明这些请求的路径和性能。追踪中的数据高度结构化，由跨度和追踪组成，描绘请求经过的每个步骤，包括时间信息。追踪提供了对系统性能的宝贵见解，帮助识别瓶颈、延迟问题，并优化微服务的效率。

:::note 指标
虽然 ClickHouse 可以用来存储指标数据，但这一支柱在 ClickHouse 中相对不成熟，缺少对 Prometheus 数据格式和 PromQL 的支持。
:::

### 分布式追踪 {#distributed-tracing}

分布式追踪是可观测性的关键特性。分布式追踪，简单称为追踪，映射请求在系统中的旅程。请求将由最终用户或应用程序发起，并在整个系统中传播，通常导致微服务之间的流动。通过记录这个序列，并允许随后的事件相关联，它使得可观测性用户或 SRE 能够诊断应用流程中的问题，无论架构多么复杂或无服务器。

每个追踪由若干跨度组成，初始跨度与请求关联，称为根跨度。该根跨度捕获整个请求的开始和结束。根下的后续跨度提供对请求过程中发生的各种步骤或操作的详细见解。没有追踪，在分布式系统中诊断性能问题可能极为困难。追踪通过详细描述请求在系统中移动过程中的事件序列，简化了调试和理解分布式系统的过程。

大多数可观测性供应商将这些信息可视化为瀑布图，相对时间使用相应大小的水平条显示。例如，在 Grafana 中：

<Image img={observability_2} alt="Example trace" size="lg" border/>

对于需要深入理解日志和追踪概念的用户，我们强烈推荐 [OpenTelemetry 文档](https://opentelemetry.io/docs/concepts/)。
