---
'title': '介绍'
'description': '使用 ClickHouse 作为观察解决方案'
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
'doc_type': 'guide'
---

import observability_1 from '@site/static/images/use-cases/observability/observability-1.png';
import observability_2 from '@site/static/images/use-cases/observability/observability-2.png';
import Image from '@theme/IdealImage';


# 使用 ClickHouse 进行可观察性

## 引言 {#introduction}

本指南旨在为希望使用 ClickHouse 构建自己的基于 SQL 的可观察性解决方案的用户提供帮助，重点关注日志和跟踪。内容涵盖了构建您自己的解决方案的所有方面，包括数据摄取、优化访问模式的模式以及从非结构化日志中提取结构的考虑。

ClickHouse 本身并不是可观察性的现成解决方案。然而，它可以作为一个高效的存储引擎，用于可观察性数据，具备无与伦比的压缩率和闪电般的查询响应时间。为了让用户在可观察性解决方案中使用 ClickHouse，既需要用户界面，也需要数据收集框架。目前，我们建议使用 **Grafana** 来可视化可观察性信号，以及使用 **OpenTelemetry** 来收集数据（两者都是官方支持的集成）。

<Image img={observability_1} alt="Simple OTel" size="md"/>

<br />

:::note 不仅仅是 OpenTelemetry
尽管我们的建议是使用 OpenTelemetry (OTel) 项目进行数据收集，但也可以使用其他框架和工具（例如 Vector 和 Fluentd）构建类似的架构（参见 [一个示例](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit)使用 Fluent Bit）。还存在其他可视化工具，包括 Superset 和 Metabase。
:::

## 为什么使用 ClickHouse？ {#why-use-clickhouse}

任何集中式可观察性存储的最重要特点是能够快速聚合、分析和搜索来自不同源的海量日志数据。这种集中化简化了故障排除，使得更容易找出服务中断的根本原因。

随着用户对价格的敏感度增加，以及相比于它们带来的价值，这些现成产品的成本被认为较高且不可预测，成本效益高且可预测的日志存储，在查询性能可接受的情况下，比以往任何时候都更有价值。

由于其性能和成本效益，ClickHouse 在可观察性产品中的日志和跟踪存储引擎中已成为事实上的标准。

更具体地说，以下几点使 ClickHouse 特别适合存储可观察性数据：

- **压缩** - 可观察性数据通常包含从不同集合中提取的字段值，例如 HTTP 代码或服务名称。ClickHouse 的列式存储意味着这些数据可以很好地压缩，尤其是与一系列专门的时间序列数据编解码器结合时。与其他数据存储不同，后者通常需要与原始数据大小一样多的存储空间（典型格式为 JSON），ClickHouse 在平均压缩日志和跟踪时可达到 14 倍以上。除了为大型可观察性安装提供显著的存储节省外，这种压缩还帮助加速查询，因为读取的磁盘数据更少。
- **快速聚合** - 可观察性解决方案通常涉及通过图表进行数据可视化，例如显示错误率的线或显示流量来源的条形图。聚合或 GROUP BY 是驱动这些图表的基本内容，也必须在工作流中应用过滤器进行故障诊断时快速响应。ClickHouse 的列式格式结合向量化查询执行引擎非常适合快速聚合，稀疏索引允许在用户操作响应中快速过滤数据。
- **快速线性扫描** - 虽然替代技术依赖于倒排索引来快速查询日志，但这不可避免地导致高磁盘和资源利用率。虽然 ClickHouse 提供倒排索引作为可选的附加索引类型，但线性扫描是高度并行化的，并使用机器上所有可用的核心（除非另有配置）。这可能允许每秒扫描 10 GB/s 的压缩数据以查找匹配项，与 [高度优化的文本匹配运算符](/sql-reference/functions/string-search-functions)结合使用。
- **SQL 的熟悉度** - SQL 是所有工程师都熟悉的通用语言。经过 50 多年的发展，它已经证明自己是数据分析的事实标准语言，并且仍然是 [第三大最流行的编程语言](https://clickhouse.com/blog/the-state-of-sql-based-observability#lingua-franca)。可观察性只不过是 SQL 理想的数据问题。
- **分析函数** - ClickHouse 扩展了 ANSI SQL，提供了旨在简化 SQL 查询的分析函数。这些函数对于进行根本原因分析的用户至关重要，因为数据需要切片和切块。
- **二级索引** - ClickHouse 支持二级索引，如布隆过滤器，以加速特定的查询配置。用户可以在列级别选择性启用这些索引，提供细粒度控制，并允许用户评估成本效益。
- **开源与开放标准** - 作为一个开源数据库，ClickHouse 采用 OpenTelemetry 等开放标准。能够参与和积极参与项目是其吸引力，同时避免了供应商锁定的挑战。

## 何时使用 ClickHouse 进行可观察性 {#when-should-you-use-clickhouse-for-observability}

使用 ClickHouse 处理可观察性数据需要用户接受基于 SQL 的可观察性。我们推荐 [这篇博客文章](https://clickhouse.com/blog/the-state-of-sql-based-observability) 作为基于 SQL 的可观察性的历史总结，但总而言之：

如果以下情况适合您，基于 SQL 的可观察性会很适合您：

- 您或您的团队熟悉 SQL（或想要学习它）
- 您更愿意遵循开放标准，如 OpenTelemetry，以避免锁定并实现可扩展性。
- 您愿意运行一个由开源创新从收集到存储和可视化驱动的生态系统。
- 您预见到在管理下会有中到大规模的可观察性数据增长（甚至非常大）。
- 您想控制 TCO（总拥有成本）并避免可观察性成本飙升。
- 您无法或不想为您的可观察性数据设定小的数据保留期限以管理成本。

如果以下情况适合您，则基于 SQL 的可观察性可能不适合您：

- 学习（或生成！）SQL 对您或您的团队没有吸引力。
- 您在寻找一个打包的、端到端的可观察性体验。
- 您的可观察性数据量太小，以至于没有明显的差异（例如 &lt;150 GiB），并且预计不会增长。
- 您的用例偏重于指标并需要 PromQL。在这种情况下，您仍然可以在 ClickHouse 中使用日志和跟踪，同时使用 Prometheus 来处理指标，将其在展示层与 Grafana 统一。
- 您更倾向于等待生态系统更加成熟，基于 SQL 的可观察性变得更具完成度。

## 日志和跟踪 {#logs-and-traces}

可观察性用例有三个不同的支柱：日志、跟踪和指标。每个支柱都有不同的数据类型和访问模式。

我们目前推荐 ClickHouse 用于存储两种类型的可观察性数据：

- **日志** - 日志是系统中发生事件的时间戳记录，捕捉有关软件操作各个方面的详细信息。日志中的数据通常是非结构化或半结构化的，可能包括错误消息、用户活动日志、系统更改和其他事件。日志对于故障排除、异常检测和理解导致系统问题的特定事件至关重要。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

- **跟踪** - 跟踪捕捉请求在分布式系统中通过不同服务的过程，详细说明这些请求的路径和性能。跟踪中的数据是高度结构化的，由跨度和跟踪组成，描绘了请求经过的每一个步骤，包括时间信息。跟踪提供了对系统性能的宝贵洞察，帮助识别瓶颈、延迟问题，并优化微服务的效率。

:::note 指标
虽然 ClickHouse 可用于存储指标数据，但该支柱在 ClickHouse 中尚不成熟，尚待支持 Prometheus 数据格式和 PromQL 等功能。
:::

### 分布式追踪 {#distributed-tracing}

分布式追踪是可观察性的重要特性。分布式追踪，也就是简单的追踪，映射了请求在系统中的旅程。请求将来自最终用户或应用程序，并在系统中传播，通常导致微服务之间的一系列动作。通过记录这个顺序，并允许后续事件关联，它使可观察性用户或 SRE 能够诊断应用程序流程中的问题，无论架构如何复杂或无服务器。

每个追踪由多个跨度组成，与请求相关的初始跨度称为根跨度。这个根跨度捕获整个请求的开始和结束。后续的跨度提供有关请求过程中发生的各个步骤或操作的详细见解。没有追踪，在分布式系统中诊断性能问题可能极其困难。追踪通过详细说明请求在系统中移动时的事件顺序，简化了调试和理解分布式系统的过程。

大多数可观察性供应商将此信息可视化为瀑布图，使用相对时间显示相应大小的水平条。例如，在 Grafana 中：

<Image img={observability_2} alt="Example trace" size="lg" border/>

对于需要深入熟悉日志和跟踪概念的用户，我们强烈推荐 [OpenTelemetry 文档](https://opentelemetry.io/docs/concepts/)。
