---
slug: /cloud/bestpractices/usage-limits
sidebar_label: '服务限制'
title: '使用限制'
description: '描述 ClickHouse Cloud 中推荐的使用限制'
doc_type: 'reference'
keywords: ['使用限制', '配额', '最佳实践', '资源管理', '云功能']
---

尽管 ClickHouse 以其速度和可靠性著称，但在特定的运行参数范围内才能获得最优性能。  
例如，拥有过多的表、数据库或数据片段（parts）可能会对性能产生负面影响。为防止这种情况，ClickHouse
Cloud 会在若干运行维度上实施限制。  
这些限制条件的详细信息如下所示。

:::tip
如果您已经触及了其中某个限制条件，这可能意味着您在实现用例时尚未充分优化。请联系我们的支持团队，
我们可以帮助您优化用例，以避免超出这些限制条件，或者与您一起评估如何在可控的前提下提升这些限制。
:::

| Dimension                     | Limit                                                      |
|-------------------------------|------------------------------------------------------------|
| **Databases**                 | 1000                                                       |
| **Tables**                    | 5000                                                       |
| **Columns**                   | ∼1000（更推荐使用宽表而非紧凑表）                          |
| **Partitions**                | 50k                                                        |
| **Parts**                     | 整个实例最多 100k                                          |
| **Part size**                 | 150GB                                                      |
| **Services per organization** | 20（软限制）                                               |
| **Services per warehouse**    | 5（软限制）                                                |
| **Replicas per service**      | 20（软限制）                                               |  
| **Low cardinality**           | 10k 或更少                                                 |
| **Primary keys in a table**   | 4–5 个，能够充分过滤数据                                   |
| **Query concurrency**         | 1000（每个副本）                                           |
| **Batch ingest**              | 任何 &gt; 1M 的批量摄取都会被系统拆分为以 1M 行为单位的块 |

:::note
对于单副本服务（Single Replica Services），数据库的最大数量限制为 100，表的最大数量限制为 500。  
此外，基础层服务（Basic Tier Services）的存储空间限制为 1 TB。
:::