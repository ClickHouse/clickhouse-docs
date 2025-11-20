---
title: '简介'
description: '将 ClickHouse 用于可观测性解决方案'
slug: /use-cases/observability/introduction
keywords: ['observability', 'logs', 'traces', 'metrics', 'OpenTelemetry', 'Grafana', 'OTel']
show_related_blogs: true
doc_type: 'guide'
---

import observability_1 from '@site/static/images/use-cases/observability/observability-1.png';
import observability_2 from '@site/static/images/use-cases/observability/observability-2.png';
import Image from '@theme/IdealImage';


# 使用 ClickHouse 构建可观测性能力



## 简介 {#introduction}

本指南面向希望使用 ClickHouse 构建基于 SQL 的可观测性解决方案的用户,重点关注日志和链路追踪。本指南涵盖构建自定义解决方案的各个方面,包括数据摄取的考量因素、根据访问模式优化表结构,以及从非结构化日志中提取结构化信息。

ClickHouse 本身并非开箱即用的可观测性解决方案。但是,它可以作为可观测性数据的高效存储引擎,具备无与伦比的压缩率和极快的查询响应速度。要在可观测性解决方案中使用 ClickHouse,需要配备用户界面和数据采集框架。我们目前推荐使用 **Grafana** 进行可观测性信号的可视化,使用 **OpenTelemetry** 进行数据采集(两者均为官方支持的集成)。

<Image img={observability_1} alt='Simple OTel' size='md' />

<br />

:::note 不仅限于 OpenTelemetry
虽然我们推荐使用 OpenTelemetry (OTel) 项目进行数据采集,但也可以使用其他框架和工具构建类似的架构,例如 Vector 和 Fluentd(参见使用 Fluent Bit 的[示例](https://clickhouse.com/blog/kubernetes-logs-to-clickhouse-fluent-bit))。此外还有其他可视化工具可供选择,包括 Superset 和 Metabase。
:::


## 为什么使用 ClickHouse? {#why-use-clickhouse}

任何集中式可观测性存储最重要的特性是能够快速聚合、分析和搜索来自不同来源的海量日志数据。这种集中化简化了故障排查,使定位服务中断的根本原因变得更加容易。

随着用户对价格越来越敏感,并发现这些开箱即用方案的成本相对于其带来的价值而言既高昂又不可预测,具有可接受查询性能的经济高效且成本可预测的日志存储比以往任何时候都更有价值。

凭借其卓越的性能和成本效率,ClickHouse 已成为可观测性产品中日志和追踪存储引擎的事实标准。

更具体地说,以下特性使 ClickHouse 非常适合存储可观测性数据:

- **压缩** - 可观测性数据通常包含值取自特定集合的字段,例如 HTTP 状态码或服务名称。ClickHouse 的列式存储以排序方式存储值,这意味着此类数据能够实现极高的压缩率——尤其是与一系列专门用于时序数据的编解码器结合使用时。与其他数据存储(通常需要与原始数据大小相当的存储空间,数据格式通常为 JSON)不同,ClickHouse 平均可将日志和追踪数据压缩至原来的 1/14。除了为大型可观测性部署提供显著的存储节省外,这种压缩还有助于加速查询,因为需要从磁盘读取的数据更少。
- **快速聚合** - 可观测性解决方案通常大量涉及通过图表进行数据可视化,例如显示错误率的折线图或显示流量来源的柱状图。聚合或 GROUP BY 是支撑这些图表的基础,在问题诊断工作流中应用过滤器时也必须快速响应。ClickHouse 的列式格式结合向量化查询执行引擎非常适合快速聚合,稀疏索引允许快速过滤数据以响应用户操作。
- **快速线性扫描** - 虽然其他技术依赖倒排索引来快速查询日志,但这些方法总是导致高磁盘和资源利用率。虽然 ClickHouse 提供倒排索引作为额外的可选索引类型,但线性扫描是高度并行化的,并使用机器上所有可用的核心(除非另有配置)。这使得可以以每秒数十 GB(压缩后)的速度扫描匹配项,配合[高度优化的文本匹配运算符](/sql-reference/functions/string-search-functions)。
- **SQL 的熟悉性** - SQL 是所有工程师都熟悉的通用语言。经过 50 多年的发展,它已证明自己是数据分析的事实标准语言,并且仍然是[第三大最流行的编程语言](https://clickhouse.com/blog/the-state-of-sql-based-observability#lingua-franca)。可观测性只是另一个数据问题,而 SQL 非常适合解决这类问题。
- **分析函数** - ClickHouse 通过分析函数扩展了 ANSI SQL,旨在使 SQL 查询更简单、更易于编写。这些函数对于执行根因分析的用户至关重要,在根因分析中需要对数据进行多维度分析。
- **二级索引** - ClickHouse 支持二级索引,例如布隆过滤器,以加速特定查询模式。这些索引可以在列级别选择性启用,为用户提供细粒度控制,并允许他们评估成本与性能的收益。
- **开源与开放标准** - 作为一个开源数据库,ClickHouse 拥抱开放标准,例如 OpenTelemetry。能够贡献并积极参与项目具有吸引力,同时避免了供应商锁定的挑战。


## 何时应该使用 ClickHouse 进行可观测性 {#when-should-you-use-clickhouse-for-observability}

使用 ClickHouse 处理可观测性数据需要用户采用基于 SQL 的可观测性方案。我们推荐阅读[这篇博客文章](https://clickhouse.com/blog/the-state-of-sql-based-observability)了解基于 SQL 的可观测性的发展历史,简而言之:

基于 SQL 的可观测性适合您的情况:

- 您或您的团队熟悉 SQL(或希望学习它)
- 您倾向于遵循 OpenTelemetry 等开放标准,以避免供应商锁定并实现可扩展性
- 您愿意运行一个由开源创新驱动的生态系统,涵盖从数据采集到存储和可视化的全过程
- 您预期管理的可观测性数据量会增长到中等或大规模(甚至超大规模)
- 您希望控制 TCO(总拥有成本)并避免可观测性成本失控
- 您不希望为了控制成本而被迫使用较短的可观测性数据保留期限

基于 SQL 的可观测性可能不适合您的情况:

- 学习(或生成!)SQL 对您或您的团队没有吸引力
- 您正在寻找一个打包的端到端可观测性解决方案
- 您的可观测性数据量太小,不会产生显著差异(例如 &lt;150 GiB),并且预计不会增长
- 您的使用场景以指标为主且需要 PromQL。在这种情况下,您仍然可以将 ClickHouse 用于日志和追踪,同时使用 Prometheus 处理指标,并在展示层通过 Grafana 进行统一
- 您更愿意等待生态系统进一步成熟,以及基于 SQL 的可观测性变得更加开箱即用


## 日志和追踪 {#logs-and-traces}

可观测性用例包含三个不同的支柱:日志记录、追踪和指标。每个支柱都有不同的数据类型和访问模式。

我们目前推荐使用 ClickHouse 存储两种类型的可观测性数据:

- **日志** - 日志是系统内发生事件的带时间戳记录,捕获有关软件操作各个方面的详细信息。日志中的数据通常是非结构化或半结构化的,可以包括错误消息、用户活动日志、系统变更和其他事件。日志对于故障排查、异常检测以及理解导致系统问题的具体事件至关重要。

```response
54.36.149.41 - - [22/Jan/2019:03:56:14 +0330] "GET
/filter/27|13%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,27|%DA%A9%D9%85%D8%AA%D8%B1%20%D8%A7%D8%B2%205%20%D9%85%DA%AF%D8%A7%D9%BE%DB%8C%DA%A9%D8%B3%D9%84,p53 HTTP/1.1" 200 30577 "-" "Mozilla/5.0 (compatible; AhrefsBot/6.1; +http://ahrefs.com/robot/)" "-"
```

- **追踪** - 追踪捕获请求在分布式系统中穿越不同服务的过程,详细记录这些请求的路径和性能。追踪中的数据是高度结构化的,由跨度(span)和追踪(trace)组成,映射出请求所采取的每个步骤,包括时间信息。追踪为系统性能提供了宝贵的洞察,有助于识别瓶颈、延迟问题,并优化微服务的效率。

:::note 指标
虽然 ClickHouse 可以用于存储指标数据,但这一支柱在 ClickHouse 中尚不成熟,对 Prometheus 数据格式和 PromQL 等功能的支持仍在开发中。
:::

### 分布式追踪 {#distributed-tracing}

分布式追踪是可观测性的一个关键特性。分布式追踪(简称追踪)映射请求在系统中的完整过程。请求源自最终用户或应用程序,并在整个系统中传播,通常会导致微服务之间的一系列操作流。通过记录这个序列并允许后续事件相互关联,可观测性用户或 SRE 能够诊断应用程序流中的问题,无论架构多么复杂或无服务器化。

每个追踪由多个跨度组成,与请求关联的初始跨度称为根跨度。这个根跨度从头到尾捕获整个请求。根跨度下的后续跨度提供了请求期间发生的各种步骤或操作的详细洞察。如果没有追踪,诊断分布式系统中的性能问题可能会极其困难。追踪通过详细记录请求在系统中移动时的事件序列,简化了调试和理解分布式系统的过程。

大多数可观测性供应商将此信息可视化为瀑布图,使用比例大小的水平条显示相对时间。例如,在 Grafana 中:

<Image img={observability_2} alt='追踪示例' size='lg' border />

对于需要深入了解日志和追踪概念的用户,我们强烈推荐阅读 [OpenTelemetry 文档](https://opentelemetry.io/docs/concepts/)。
