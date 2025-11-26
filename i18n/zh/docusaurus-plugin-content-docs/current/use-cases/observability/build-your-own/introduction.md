---
title: '简介'
description: '将 ClickHouse 用作可观测性解决方案'
slug: /use-cases/observability/introduction
keywords: ['可观测性', '日志', '链路追踪', '指标', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
---

import observability_1 from '@site/static/images/use-cases/observability/observability-1.png';
import observability_2 from '@site/static/images/use-cases/observability/observability-2.png';
import Image from '@theme/IdealImage';


# 在可观测性中使用 ClickHouse



## 介绍 {#introduction}

本指南面向希望使用 ClickHouse 构建自建、基于 SQL 的可观测性解决方案，并重点关注日志和链路追踪的用户。内容涵盖构建自有方案的各个方面，包括对数据摄取的考量、针对访问模式优化表结构，以及从非结构化日志中提取结构化信息。

单独使用 ClickHouse 并不是一个开箱即用的可观测性解决方案。但它可以作为高效的可观测性数据存储引擎，具备无与伦比的压缩率和极快的查询响应时间。要在可观测性解决方案中使用 ClickHouse，还需要同时具备用户界面和数据采集框架。目前我们推荐使用 **Grafana** 来可视化可观测性信号，并使用 **OpenTelemetry** 进行数据采集（两者都是官方支持的集成）。

<Image img={observability_1} alt="简单的 OTel" size="md"/>

<br />

:::note 不止是 OpenTelemetry
虽然我们推荐使用 OpenTelemetry (OTel) 项目进行数据采集，但也可以使用其他框架和工具构建类似架构，例如 Vector 和 Fluentd（参见使用 Fluent Bit 的[示例](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit)）。也存在其他可视化工具，包括 Superset 和 Metabase。
:::



## 为什么使用 ClickHouse？ {#why-use-clickhouse}

对于任何集中式可观测性存储而言，最重要的特性是其能够快速地对来自各种不同来源的大量日志数据进行聚合、分析和搜索。这种集中化简化了故障排查，使定位服务中断的根本原因变得更容易。

随着用户对价格越来越敏感，并且认为这些开箱即用方案的成本相较于其价值而言偏高且难以预测，具备可接受查询性能的高性价比、成本可预期的日志存储比以往任何时候都更为重要。

得益于其性能和成本效率，ClickHouse 已经成为可观测性产品中日志和链路追踪存储引擎的事实标准。

更具体来说，下列特性意味着 ClickHouse 非常适合用作可观测性数据的存储：

- **压缩** - 可观测性数据通常包含其取值来自有限集合的字段，例如 HTTP 状态码或服务名称。ClickHouse 的列式存储会对值进行排序存放，使得这些数据可以获得极佳的压缩效果——特别是在结合面向时序数据的一系列专用编解码器时。与其他需要与原始数据（通常为 JSON 格式）体积相当的存储系统不同，ClickHouse 对日志和追踪的平均压缩率可高达 14 倍。除了为大型可观测性部署带来显著的存储节省外，这种压缩还通过减少从磁盘读取的数据量来帮助加速查询。

- **快速聚合** - 可观测性解决方案通常高度依赖通过图表对数据进行可视化，例如展示错误率的折线图或展示流量来源的柱状图。聚合（或 GROUP BY 操作）是驱动这些图表的基础，并且在用于问题诊断的工作流中应用过滤器时必须保持快速且响应灵敏。ClickHouse 的列式格式结合向量化查询执行引擎，非常适合进行快速聚合，而稀疏索引可以在响应用户操作时迅速过滤数据。

- **快速线性扫描** - 替代技术通常依赖倒排索引来对日志进行快速查询，但这往往会导致极高的磁盘和资源占用。虽然 ClickHouse 也提供倒排索引作为额外的可选索引类型，但其线性扫描高度并行化，会使用机器上所有可用的核心（除非另有配置）。这使得系统可以以每秒数十 GB 的速度扫描压缩后的数据以匹配结果，并配合[高度优化的文本匹配运算符](/sql-reference/functions/string-search-functions)。

- **熟悉的 SQL** - SQL 是所有工程师都熟悉的通用语言。经过 50 多年的发展，它已经被证明是数据分析的事实标准语言，并且仍然是[第三大最流行的编程语言](https://clickhouse.com/blog/the-state-of-sql-based-observability#lingua-franca)。可观测性只是另一类数据问题，而 SQL 正是解决这类问题的理想工具。

- **分析函数** - ClickHouse 在 ANSI SQL 的基础上扩展了分析函数，这些函数旨在让 SQL 查询更简单、更易于编写。对于需要对数据进行多维切分和组合的根因分析场景来说，这些函数至关重要。

- **二级索引** - ClickHouse 支持二级索引，例如布隆过滤器，用于加速特定查询模式。这些索引可以在列级别按需启用，为用户提供细粒度的控制，并允许其在成本与性能收益之间进行权衡评估。

- **开源与开放标准** - 作为一款开源数据库，ClickHouse 拥抱诸如 OpenTelemetry 之类的开放标准。用户可以参与并积极贡献相关项目，同时还能避免供应商锁定带来的挑战。



## 何时应将 ClickHouse 用于可观测性 {#when-should-you-use-clickhouse-for-observability}

将 ClickHouse 用于可观测性数据，意味着用户需要采用基于 SQL 的可观测性方案。我们推荐阅读[这篇博客文章](https://clickhouse.com/blog/the-state-of-sql-based-observability)了解基于 SQL 的可观测性的历史，简单来说：

如果满足以下条件，基于 SQL 的可观测性适合你：

- 你或你的团队熟悉 SQL（或希望学习 SQL）
- 你倾向于遵循 OpenTelemetry 等开放标准，以避免厂商锁定并实现可扩展性。
- 你愿意运行一个从采集到存储和可视化，依托开源创新驱动的生态系统。
- 你预期将管理会增长到中等或大规模的可观测性数据量（甚至是超大规模的数据）
- 你希望能够控制 TCO（总体拥有成本），并避免可观测性成本失控。
- 你无法接受，或不想因为控制成本而把可观测性数据的保留期压缩得过短。

如果出现以下情况，基于 SQL 的可观测性可能并不适合你：

- 学习（或自动生成）SQL 对你或你的团队没有吸引力。
- 你在寻找一种打包好的端到端可观测性解决方案。
- 你的可观测性数据量太小，难以带来显著收益（例如 &lt;150 GiB），并且预计不会增长。
- 你的用例以指标为主，并且需要 PromQL。在这种情况下，你仍然可以在使用 Prometheus 处理指标的同时，使用 ClickHouse 处理日志和追踪，并在展示层通过 Grafana 进行统一。
- 你更倾向于等待生态进一步成熟，使基于 SQL 的可观测性更加开箱即用。



## 日志和链路追踪

可观测性用例通常包含三大支柱：日志（Logging）、链路追踪（Tracing）和指标（Metrics）。每一类都有不同的数据类型和访问模式。

我们目前推荐使用 ClickHouse 来存储两类可观测性数据：

* **Logs** - 日志是对系统中发生的事件进行带时间戳记录的内容，用于捕获软件运行各个方面的详细信息。日志中的数据通常是非结构化或半结构化的，可以包括错误信息、用户活动日志、系统变更以及其他事件。日志对于故障排查、异常检测，以及理解导致系统问题的一系列具体事件至关重要。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

* **Traces（追踪）** - Traces 捕获请求在分布式系统中穿越不同服务时的完整历程，详细记录这些请求的路径和性能表现。Trace 中的数据高度结构化，由 span 和 trace 组成，用于描绘请求每一步的执行过程，包括时间信息。Traces 为系统性能提供了宝贵洞察，帮助识别瓶颈和延迟问题，并优化微服务的整体效率。

:::note Metrics
虽然 ClickHouse 可以用于存储 metrics 数据，但在 ClickHouse 中，这一观测维度目前还不够成熟，对诸如 Prometheus 数据格式和 PromQL 等特性的支持仍在推进中。
:::

### 分布式追踪

分布式追踪是可观测性中的关键能力。一个分布式 trace（通常简称为 trace）会映射请求在系统中的完整旅程。请求通常源自终端用户或应用程序，并在系统中被进一步调用，通常在微服务之间形成一系列动作流。通过记录这整个序列，并允许对后续事件进行关联，可观测性平台的使用者或 SRE 即可在不受架构复杂度或是否采用 serverless 的影响下，对应用程序调用链中的问题进行诊断。

每个 trace 由多个 span 组成，其中与请求关联的第一个 span 被称为 root span。root span 捕获整个请求从开始到结束的过程。位于 root 之下的后续 spans 则对请求期间发生的各个步骤或操作提供了更细粒度的洞察。如果没有追踪，在分布式系统中诊断性能问题可能会极其困难。Tracing 通过详细记录请求在系统中流转时的事件序列，使调试和理解分布式系统的过程更加容易。

大多数可观测性厂商会将这些信息以瀑布图的形式可视化，使用长度成比例的水平条来展示相对时间。例如，在 Grafana 中：

<Image img={observability_2} alt="Example trace" size="lg" border />

对于需要深入理解日志和追踪概念的用户，我们强烈推荐阅读 [OpenTelemetry 文档](https://opentelemetry.io/docs/concepts/)。
