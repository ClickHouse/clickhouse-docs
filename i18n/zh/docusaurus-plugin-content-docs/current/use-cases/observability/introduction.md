---
'title': 'Introduction'
'description': '使用ClickHouse作为观测解决方案'
'slug': '/use-cases/observability/introduction'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
---

import observability_1 from '@site/static/images/use-cases/observability/observability-1.png';
import observability_2 from '@site/static/images/use-cases/observability/observability-2.png';
import Image from '@theme/IdealImage';


# 使用 ClickHouse 进行可观察性

## 简介 {#introduction}

本指南旨在为希望使用 ClickHouse 构建自己的基于 SQL 的可观察性解决方案的用户提供支持，重点关注日志和跟踪。本指南覆盖了构建自己解决方案的各个方面，包括数据摄取、根据访问模式优化模式以及从非结构化日志中提取结构的考虑。

单靠 ClickHouse 并不是现成的可观察性解决方案。然而，它可以作为可观察性数据的高效存储引擎，具备无与伦比的压缩率和闪电般的查询响应时间。为了使用户能够在可观察性解决方案中使用 ClickHouse，还需要一个用户界面和数据收集框架。我们目前推荐使用 **Grafana** 进行可观察性信号的可视化和 **OpenTelemetry** 进行数据收集（这两者都是官方支持的集成）。

<Image img={observability_1} alt="简单 OTel" size="md"/>

<br />

:::note 不仅仅是 OpenTelemetry
虽然我们建议使用 OpenTelemetry（OTel）项目进行数据收集，但可以使用其他框架和工具（例如 Vector 和 Fluentd）创建类似的架构（参见 [一个示例](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit) 使用 Fluent Bit）。还存在其他可视化工具，例如 Superset 和 Metabase。
:::

## 为什么选择 ClickHouse？ {#why-use-clickhouse}

任何集中式可观察性存储的最重要特性是其快速聚合、分析和搜索来自不同来源的大量日志数据的能力。这种集中化简化了故障排除，使得更容易找出服务中断的根本原因。

随着用户对价格的敏感度增加，并且发现这些现成产品的成本较高且不可预测，相较于它们提供的价值，成本高效且可预测的日志存储在查询性能可接受的情况下，显得尤为重要。

由于其性能和成本效率，ClickHouse 已成为可观察性产品中日志和跟踪存储引擎的事实标准。

更具体地说，以下几点表明 ClickHouse 非常适合用于可观察性数据的存储：

- **压缩** - 可观察性数据通常包含字段，其中的值来自一组不同的集合，例如 HTTP 代码或服务名称。ClickHouse 的列式存储方式，值按顺序存储，意味着这些数据的压缩效果极佳——特别是在与多种针对时间序列数据的专业编解码器结合使用时。与其他数据存储不同，其他存储通常需要与数据原始数据大小（通常为 JSON 格式）相等的存储空间，而 ClickHouse 的日志和跟踪平均可以压缩到 14 倍。除了为大型可观察性安装提供显著的存储节省外，这种压缩有助于加速查询，因为需要从磁盘读取的数据更少。
- **快速聚合** - 可观察性解决方案通常涉及通过图表可视化数据，例如显示错误率的线条或显示流量来源的柱状图。聚合或 GROUP BY 是支持这些图表的基础，在为问题诊断应用筛选器时也必须快速且响应迅速。ClickHouse 的列式格式结合向量化查询执行引擎非常适合快速聚合，稀疏索引允许根据用户的操作迅速过滤数据。
- **快速线性扫描** - 虽然替代技术依赖于倒排索引以快速查询日志，但这必然导致磁盘和资源利用率较高。虽然 ClickHouse 提供了作为可选索引类型的倒排索引，但线性扫描具有高度并行化，并使用机器上所有可用的核心（除非另行配置）。这可能允许每秒扫描数十 GB（压缩）以查找匹配项，使用 [高效的文本匹配操作符](/sql-reference/functions/string-search-functions)。
- **SQL 的熟悉度** - SQL 是所有工程师都熟悉的通用语言。经过超过 50 年的发展，SQL 已证明自己是数据分析的事实语言，并且仍然是 [第三大最受欢迎的编程语言](https://clickhouse.com/blog/the-state-of-sql-based-observability#lingua-franca)。可观察性只是一个数据问题，SQL 是其理想选择。
- **分析功能** - ClickHouse 扩展 ANSI SQL，提供设计用于简化 SQL 查询的分析功能。这些对执行根本原因分析的用户至关重要，因为数据需要被切片和组合。
- **二级索引** - ClickHouse 支持二级索引，例如布隆过滤器，以加速特定查询配置。这些可以在列级别选择性启用，从而让用户进行精细控制，并允许他们评估成本与性能的好处。
- **开源与开放标准** - 作为一个开源数据库，ClickHouse 拥抱开放标准，例如 Open Telemetry。能够贡献和积极参与项目的能力是有吸引力的，同时避免了供应商锁定的挑战。

## 何时使用 ClickHouse 进行可观察性 {#when-should-you-use-clickhouse-for-observability}

使用 ClickHouse 进行可观察性数据要求用户接受基于 SQL 的可观察性。我们推荐 [这篇博客文章](https://clickhouse.com/blog/the-state-of-sql-based-observability) 了解基于 SQL 的可观察性的历史，但简而言之：

如果您或您的团队熟悉 SQL（或想学习它），基于 SQL 的可观察性适合您：

- 您更喜欢遵循开放标准，如 OpenTelemetry，以避免锁定并实现可扩展性。
- 您愿意运行一个由开源创新驱动的生态系统，从收集到存储和可视化。
- 您设想在管理下有中等或大量的可观察性数据的增长（甚至是非常大的数据量）。
- 您希望控制 TCO（总拥有成本），避免可观察性成本失控。
- 您不能或不想在可观察性数据上设置短暂的数据保留期以管理成本。

如果您觉得以下情况适用，基于 SQL 的可观察性可能不适合您：

- 学习（或生成！）SQL 对您或您的团队没有吸引力。
- 您正在寻找一个打包的端到端可观察性体验。
- 您的可观察性数据量过小，不会产生任何显著的差异（例如 &lt;150 GiB），并且没有预测到会增长。
- 您的用例重度依赖于指标，并需要 PromQL。在这种情况下，您仍然可以在 ClickHouse 中使用日志和跟踪，并在 Grafana 中统一可视化与 Prometheus 的指标。
- 您更愿意等待生态系统更加成熟，基于 SQL 的可观察性得到更多的交钥匙解决方案。

## 日志和跟踪 {#logs-and-traces}

可观察性用例有三个不同的支柱：日志、跟踪和指标。每个支柱具有不同的数据类型和访问模式。

我们目前推荐 ClickHouse 存储两种类型的可观察性数据：

- **日志** - 日志是系统中事件发生的时间戳记录，捕获了关于软件操作各个方面的详细信息。日志中的数据通常是非结构化或半结构化的，可以包括错误消息、用户活动日志、系统变更和其他事件。日志对于故障排除、异常检测以及理解系统中导致问题的特定事件至关重要。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

- **跟踪** - 跟踪捕获请求在分布式系统中穿越不同服务的旅程，详细说明这些请求的路径和性能。跟踪中的数据是高度结构化的，包括描述请求每一步的跨度和跟踪信息，包含时间信息。跟踪为系统性能提供了宝贵的洞察，帮助识别瓶颈、延迟问题，并优化微服务的效率。

:::note 指标
虽然 ClickHouse 可用于存储指标数据，但这一支柱在 ClickHouse 中较不成熟，还在等待对 Prometheus 数据格式和 PromQL 等特性的支持。
:::

### 分布式跟踪 {#distributed-tracing}

分布式跟踪是可观察性的一个关键特性。分布式跟踪，简称为跟踪，映射出请求在系统中的旅程。请求通常来自最终用户或应用程序，并在整个系统中传播，通常会在微服务之间产生一系列操作。通过记录这一序列，允许后续事件进行关联，使可观察性用户或 SRE 能够诊断应用流程中的问题，无论架构有多复杂或无服务器。

每个跟踪由多个跨度组成，与请求相关的初始跨度称为根跨度。这个根跨度捕获了整个请求的开始和结束。根下的后续跨度提供了关于请求期间发生的各种步骤或操作的详细信息。在没有跟踪的情况下，在分布式系统中诊断性能问题可能会非常困难。跟踪通过详细说明请求在系统中穿行的事件序列，简化了调试和理解分布式系统的过程。

大多数可观察性供应商以瀑布图的形式可视化该信息，使用比例大小的水平条显示相对时间。例如，在 Grafana 中：

<Image img={observability_2} alt="示例跟踪" size="lg" border/>

对于需要深入了解日志和跟踪概念的用户，我们强烈推荐 [OpenTelemetry 文档](https://opentelemetry.io/docs/concepts/)。
