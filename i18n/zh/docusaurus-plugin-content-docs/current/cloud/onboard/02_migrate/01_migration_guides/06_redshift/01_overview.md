---
sidebar_label: '概述'
slug: /migrations/redshift-overview
description: '从 Amazon Redshift 迁移至 ClickHouse'
keywords: ['Redshift']
title: 'ClickHouse Cloud 与 Amazon Redshift 对比'
doc_type: 'guide'
---



# Amazon Redshift 到 ClickHouse 的迁移

> 本文档介绍如何将数据从 Amazon Redshift 迁移到 ClickHouse。



## 简介 {#introduction}

Amazon Redshift 是一个云数据仓库,为结构化和半结构化数据提供报表和分析功能。它采用与 ClickHouse 类似的列式数据库原理设计,专门用于处理大数据集上的分析工作负载。作为 AWS 产品组合的一部分,它通常是 AWS 用户处理分析数据需求时的首选解决方案。

虽然 Redshift 因与 Amazon 生态系统的紧密集成而对现有 AWS 用户颇具吸引力,但那些采用它来支撑实时分析应用的用户发现,他们需要一个针对此场景更加优化的解决方案。因此,越来越多的用户转向 ClickHouse,以获得卓越的查询性能和数据压缩能力——无论是作为替代方案,还是作为与现有 Redshift 工作负载并行部署的"速度层"。


## ClickHouse 与 Redshift 对比 {#clickhouse-vs-redshift}

对于深度使用 AWS 生态系统的用户而言,在面临数据仓库需求时,Redshift 是一个自然的选择。Redshift 与 ClickHouse 在一个重要方面存在差异——它针对需要复杂报表和分析查询的数据仓库工作负载优化其引擎。在所有部署模式下,以下两个限制使得 Redshift 难以用于实时分析工作负载:

- Redshift [为每个查询执行计划编译代码](https://docs.aws.amazon.com/redshift/latest/dg/c-query-performance.html),这会给首次查询执行增加显著的开销。当查询模式可预测且编译后的执行计划可以存储在查询缓存中时,这种开销是合理的。然而,这给具有可变查询的交互式应用程序带来了挑战。即使 Redshift 能够利用这个代码编译缓存,ClickHouse 在大多数查询上的性能仍然更快。参见 ["ClickBench"](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|Rf&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-)。
- Redshift [将所有队列的并发限制为 50](https://docs.aws.amazon.com/redshift/latest/dg/c_workload_mngmt_classification.html),这对于商业智能场景虽然足够,但不适合高并发分析应用程序。

相反,虽然 ClickHouse 也可用于复杂的分析查询,但它针对实时分析工作负载进行了优化,既可以为应用程序提供支持,也可以作为数据仓库加速层。因此,Redshift 用户通常会出于以下原因用 ClickHouse 替换或增强 Redshift:

| 优势                          | 描述                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **更低的查询延迟**          | ClickHouse 实现了更低的查询延迟,包括在高并发和流式插入的情况下处理各种查询模式。即使在面向用户的交互式分析中不可避免地出现查询未命中缓存的情况,ClickHouse 仍然可以快速处理查询。                                                                                                                     |
| **更高的并发查询限制** | ClickHouse 对并发查询设置了更高的限制,这对于实时应用程序体验至关重要。在 ClickHouse 中,无论是自托管还是云版本,您都可以扩展计算资源分配,以满足每个服务所需的应用程序并发性。ClickHouse 中允许的查询并发级别是可配置的,ClickHouse Cloud 默认值为 1000。 |
| **卓越的数据压缩**      | ClickHouse 提供卓越的数据压缩能力,使用户能够减少总存储量(从而降低成本),或以相同成本存储更多数据,并从数据中获得更多实时洞察。请参阅下文"ClickHouse 与 Redshift 存储效率对比"。                                                                                                                                            |
