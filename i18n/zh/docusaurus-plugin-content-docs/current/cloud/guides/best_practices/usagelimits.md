---
slug: /cloud/bestpractices/usage-limits
sidebar_label: 'Service limits'
title: '使用限制'
description: '描述 ClickHouse Cloud 中推荐的使用限制'
doc_type: 'reference'
keywords: ['usage limits', 'quotas', 'best practices', 'resource management', 'cloud features']
---

虽然 ClickHouse 以其速度和可靠性著称，但只有在特定的运行参数范围内才能获得最佳性能。比如，表、数据库或数据分片（parts）过多都会对性能产生负面影响。为避免这种情况，ClickHouse Cloud 在多个运行维度上设置了限制。下方列出了这些“护栏”的详细信息。

:::tip
如果你触及了这些护栏中的某一项，很可能说明你的用例实现方式尚未优化。请联系我们的支持团队，我们会协助你优化用例，以避免超出这些护栏，或者与你一起评估如何在可控的方式下提高这些限制。
:::

| Dimension                     | Limit                                                      |
|-------------------------------|------------------------------------------------------------|
| **Databases**                 | 1000                                                       |
| **Tables**                    | 5000                                                       |
| **Columns**                   | ∼1000（更推荐使用宽表而非紧凑表）                          |
| **Partitions**                | 50k                                                        |
| **Parts**                     | 整个实例最多 100k                                          |
| **Part size**                 | 150gb                                                      |
| **Services per organization** | 20（软限制）                                               |
| **Services per warehouse**    | 5（软限制）                                                |
| **Replicas per service**      | 20（软限制）                                               |  
| **Low cardinality**           | 10k 或更少                                                 |
| **Primary keys in a table**   | 4–5 个，且能够充分过滤数据                                 |
| **Query concurrency**         | 1000（每个副本）                                          |
| **Batch ingest**              | 任何 &gt; 1M 的写入会被系统拆分为 1M 行的块                |

:::note
对于 Single Replica Services，数据库的最大数量限制为 100，表的最大数量限制为 500。除此之外，Basic Tier Services 的存储容量限制为 1 TB。
:::