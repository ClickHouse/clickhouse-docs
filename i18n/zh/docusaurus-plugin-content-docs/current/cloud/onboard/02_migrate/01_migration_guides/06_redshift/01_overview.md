---
'sidebar_label': '概述'
'slug': '/migrations/redshift-overview'
'description': '从 Amazon Redshift 迁移到 ClickHouse'
'keywords':
- 'Redshift'
'title': '比较 ClickHouse Cloud 和 Amazon Redshift'
'doc_type': 'guide'
---


# Amazon Redshift 到 ClickHouse 的迁移

> 本文档介绍了将数据从 Amazon Redshift 迁移到 ClickHouse 的相关内容。

## 介绍 {#introduction}

Amazon Redshift 是一个云数据仓库，提供对结构化和半结构化数据的报告和分析功能。它旨在使用类似于 ClickHouse 的列式数据库原则来处理大数据集上的分析工作负载。作为 AWS 产品的一部分，它通常是 AWS 用户在处理其分析数据需求时的默认解决方案。

尽管由于与 Amazon 生态系统的紧密集成而吸引了现有的 AWS 用户，但采用 Redshift 以支持实时分析应用的用户发现他们需要一个更优化的解决方案。因此，他们越来越倾向于选择 ClickHouse，以利用更优越的查询性能和数据压缩，作为替代方案或与现有的 Redshift 工作负载并行部署的“加速层”。

## ClickHouse vs Redshift {#clickhouse-vs-redshift}

对于在 AWS 生态系统中深度投入的用户来说，Redshift 在面对数据仓库需求时是一个自然选择。Redshift 与 ClickHouse 在这一重要方面有所不同——它优化其引擎以处理需要复杂报告和分析查询的数据仓库工作负载。在所有部署模式中，以下两个限制使得使用 Redshift 处理实时分析工作负载变得困难：
* Redshift [为每个查询执行计划编译代码](https://docs.aws.amazon.com/redshift/latest/dg/c-query-performance.html)，这为首次查询执行增加了显著的开销。当查询模式可预测且编译的执行计划可以存储在查询缓存中时，这种开销是合理的。然而，这在面对可变查询的交互式应用时引入了挑战。即便 Redshift 能够利用这个代码编译缓存，ClickHouse 在大多数查询上仍然更快。请参见 ["ClickBench"](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|Rf&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-)。
* Redshift [将并发限制在 50 个队列中](https://docs.aws.amazon.com/redshift/latest/dg/c_workload_mngmt_classification.html)，这（虽然对于商业智能足够）使得它不适合高度并发的分析应用。

相反，虽然 ClickHouse 也可以用于复杂的分析查询，但它优化了实时分析工作负载，无论是为应用提供动力还是充当数据仓库加速层。因此，Redshift 用户通常会出于以下原因使用 ClickHouse 替代或增强 Redshift：

| 优势                              | 描述                                                                                                                                                                                                                                                                                                                                                                                       |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **更低的查询延迟**                | ClickHouse 实现了更低的查询延迟，包括在高并发和流式插入下对于不同查询模式的支持。即使在查询未命中缓存的情况下（这是交互式用户分析中不可避免的），ClickHouse 仍然可以快速处理它。                                                                                                                                                                                                                                   |
| **更高的并发查询限制**            | ClickHouse 对并发查询的限制要高得多，这对实时应用体验至关重要。在 ClickHouse 中，无论是自管理还是云端，您可以根据每个服务所需的并发进行计算资源的扩展。ClickHouse 中允许的查询并发级别是可配置的，ClickHouse Cloud 的默认值为 1000。                                                                                                                 |
| **卓越的数据压缩**                | ClickHouse 提供卓越的数据压缩，允许用户减少总存储（从而降低成本）或在相同成本下持久化更多数据，并从其数据中获取更多实时洞察。请参见下面的“ClickHouse vs Redshift 存储效率”。                                                                                                                                                                                                                                 |
