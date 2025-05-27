---
'title': '介绍'
'description': '将 ClickHouse 作为可观测性解决方案'
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

## 介绍 {#introduction}

本指南旨在帮助希望使用 ClickHouse 构建自己的基于 SQL 的可观察性解决方案的用户，重点关注日志和追踪。它涵盖了构建自身解决方案的各个方面，包括数据摄取的考虑、为访问模式优化模式以及从非结构化日志中提取结构。

单靠 ClickHouse 并不是一个现成的可观察性解决方案。然而，它可以作为一个高效的可观察性数据存储引擎，具备无与伦比的压缩率和闪电般的查询响应时间。为了使用户能够在可观察性解决方案中使用 ClickHouse，需要一个用户界面和数据收集框架。我们目前建议使用 **Grafana** 来可视化可观察性信号，使用 **OpenTelemetry** 进行数据收集（这两者都是官方支持的集成）。

<Image img={observability_1} alt="简单 OTel" size="md"/>

<br />

:::note 不仅仅是 OpenTelemetry
虽然我们推荐使用 OpenTelemetry (OTel) 项目进行数据收集，但也可以使用其他框架和工具（例如 Vector 和 Fluentd）构建类似架构（参见 [一个例子](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit) 使用 Fluent Bit）。还存在其他可视化工具，包括 Superset 和 Metabase。
:::

## 为什么选择 ClickHouse? {#why-use-clickhouse}

任何集中式可观察性存储最重要的特性是其能够快速聚合、分析和搜索来自各种来源的大量日志数据。这种集中化可以简化故障排除，使其更容易找到服务中断的根本原因。

随着用户对价格的敏感度增加，发现这些现成产品的成本相较于其带来的价值高且不可预测，因此，在查询性能可接受的情况下，成本高效且可预测的日志存储比以往更显得重要。

由于其性能和成本效率，ClickHouse 已成为可观察性产品中日志和追踪存储引擎的事实标准。

更具体地说，以下原因使 ClickHouse 特别适合用于可观察性数据的存储：

- **压缩** - 可观察性数据通常包含多个字段，其值来自一个特定集合，例如 HTTP 代码或服务名称。ClickHouse 的列式存储使得值按排序存储，这意味着这类数据可以极其有效地压缩——尤其是在结合了一系列专门针对时间序列数据的编码时。与其他数据存储不同，后者通常需要与原始数据大小（通常为 JSON 格式）的一样多的存储，ClickHouse 则平均可以将日志和追踪压缩至 14 倍。除了为大型可观察性安装提供显著的存储节省外，这种压缩还加速了查询，因为需要从磁盘读取的数据更少。
- **快速聚合** - 可观察性解决方案通常涉及通过图表可视化数据，例如显示错误率的折线图或显示流量来源的条形图。聚合或 GROUP BY 对于支持这些图表至关重要，当在问题诊断的工作流中应用过滤器时，它们必须也要快速而响应。ClickHouse 的列式格式结合向量化查询执行引擎非常适合快速聚合，稀疏索引允许根据用户的操作快速过滤数据。
- **快速线性扫描** - 虽然其他技术依赖倒排索引来快速查询日志，但这会导致磁盘和资源的高利用率。虽然 ClickHouse 提供倒排索引作为额外的可选索引类型，线性扫描则高度并行化，并使用机器上的所有可用核心（除非另行配置）。这可能允许每秒扫描数十 GB（压缩）的数据以寻找匹配项，使用 [高度优化的文本匹配运算符](/sql-reference/functions/string-search-functions)。
- **SQL 的熟悉性** - SQL 是所有工程师都熟悉的通用语言。经过 50 多年的发展，它已经证明自己是数据分析的事实标准语言，并且仍然是 [第三大最流行的编程语言](https://clickhouse.com/blog/the-state-of-sql-based-observability#lingua-franca)。可观察性只是另一个适合使用 SQL 的数据问题。
- **分析功能** - ClickHouse 扩展了 ANSI SQL，提供了旨在使 SQL 查询简单更易于撰写的分析功能。这些对执行根本原因分析的用户至关重要，因为需要对数据进行切片和切块。
- **二级索引** - ClickHouse 支持二级索引，例如布隆过滤器，以加速特定查询轮廓。这些可以在列级别上作为可选启用，给予用户粒度控制，并允许他们评估成本与性能的收益。
- **开源及开放标准** - ClickHouse 是一个开源数据库，拥抱像 Open Telemetry 这样的开放标准。能够参与和积极参与项目的能力令人向往，同时避免了厂商锁定带来的挑战。

## 何时应该使用 ClickHouse 进行可观察性 {#when-should-you-use-clickhouse-for-observability}

使用 ClickHouse 进行可观察性数据要求用户接受基于 SQL 的可观察性。我们建议查看 [这篇博客文章](https://clickhouse.com/blog/the-state-of-sql-based-observability)，了解基于 SQL 的可观察性的历史，但总的来说：

如果你符合以下条件，则基于 SQL 的可观察性适合你：

- 你或你的团队熟悉 SQL（或想学习它）
- 你更喜欢遵循像 OpenTelemetry 这样的开放标准，以避免锁定并实现可扩展性。
- 你愿意运行一个由从收集到存储和可视化的开源创新推动的生态系统。
- 你设想会有中等或大型的数据量需要管理（甚至非常大的数据量）
- 你希望控制总拥有成本 (TCO)，并避免不断上升的可观察性成本。
- 你无法或不想仅仅为了管理成本而受限于短期的数据保留期。

如果你符合以下条件，则基于 SQL 的可观察性可能不适合你：

- 学习（或生成！）SQL 对你或你的团队没有吸引力。
- 你正在寻找一个打包好的端到端可观察性体验。
- 你的可观察性数据量太小，无法产生显著差异（例如 &lt;150 GiB），并且预计不会增长。
- 你的用例是重度依赖指标的，并需要 PromQL。在这种情况下，你仍然可以使用 ClickHouse 存储日志和追踪，并在 Grafana 的展示层与 Prometheus 进行指标统一。
- 你更希望等待生态系统进一步成熟，基于 SQL 的可观察性变得更加交钥匙。

## 日志和追踪 {#logs-and-traces}

可观察性用例有三个不同的支柱：日志、追踪和指标。每个支柱都有不同的数据类型和访问模式。

我们目前建议使用 ClickHouse 存储两种类型的可观察性数据：

- **日志** - 日志是系统中发生事件的带时间戳的记录，捕获有关软件操作各个方面的详细信息。日志中的数据通常是非结构化或半结构化的，可以包括错误消息、用户活动日志、系统更改和其他事件。日志对于故障排除、异常检测以及理解导致系统内问题的特定事件至关重要。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

- **追踪** - 追踪记录请求在分布式系统中穿越不同服务的旅程，详细说明这些请求的路径和性能。追踪中的数据高度结构化，由 spans 和 traces 组成，描绘了请求所经历的每一步，包括时间信息。追踪为系统性能提供了宝贵的见解，帮助识别瓶颈、延迟问题，并优化微服务的效率。

:::note 指标
虽然 ClickHouse 可用于存储指标数据，但在这方面 ClickHouse 的成熟度较低，尚未支持 Prometheus 数据格式和 PromQL 等功能。
:::

### 分布式追踪 {#distributed-tracing}

分布式追踪是可观察性的一个关键特性。分布式追踪，简单地称为追踪，描绘了请求在系统中的旅程。请求将起始于最终用户或应用程序，并在系统中传播，通常导致微服务之间的动作流动。通过记录这一序列并允许相关事件的后续关联，它使可观察性用户或 SRE 能够在应用流中诊断问题，无论其架构多么复杂或无服务器。

每个追踪包含多个 spans，初始与请求关联的 span 称为根 span。这个根 span 捕获请求的整个过程。根 span 下的后续 spans 提供对请求期间发生的各种步骤或操作的详细见解。如果没有追踪，在分布式系统中诊断性能问题可能是极其困难的。追踪通过详细记录请求在系统中移动时的事件序列，简化了调试和理解分布式系统的过程。

大多数可观察性供应商将此信息可视化为瀑布图，使用比例大小的水平条显示相对时间。例如，在 Grafana 中：

<Image img={observability_2} alt="示例追踪" size="lg" border/>

对于希望深入了解日志和追踪概念的用户，我们强烈推荐 [OpenTelemetry 文档](https://opentelemetry.io/docs/concepts/)。
