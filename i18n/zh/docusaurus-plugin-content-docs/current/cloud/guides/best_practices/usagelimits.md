---
slug: /cloud/bestpractices/usage-limits
sidebar_label: '服务限制'
title: '使用限制'
description: '描述 ClickHouse Cloud 中推荐的使用限制'
doc_type: 'reference'
keywords: ['usage limits', 'quotas', 'best practices', 'resource management', 'cloud features']
---

虽然 ClickHouse 以其速度和可靠性而闻名，但要获得最佳性能，需要在特定的运行参数范围内工作。例如，过多的表、
数据库或数据分片（parts）可能会对性能产生负面影响。为避免这种情况，ClickHouse
Cloud 会在多个运行维度上施加限制。
这些保护边界的详细信息如下所示。

:::tip
如果你触及了这些保护边界中的某一项，很可能说明你的用例实现方式尚未优化。请联系我们的支持团队，
我们非常乐意帮助你改进用例，以避免超出这些保护边界，或者一起研究如何在可控的前提下提升这些限制。
:::

| Dimension                     | Limit                                                      |
|-------------------------------|------------------------------------------------------------|
| **Databases**                 | 1000                                                       |
| **Tables**                    | 5000                                                       |
| **Columns**                   | ∼1000（推荐使用宽表格式而非紧凑格式）                      |
| **Partitions**                | 50k                                                        |
| **Parts**                     | 整个实例中 100k                                            |
| **Part size**                 | 150gb                                                      |
| **Services per organization** | 20（软限制）                                               |
| **Services per warehouse**    | 5（软限制）                                                |
| **Replicas per service**      | 20（软限制）                                               |  
| **Low cardinality**           | 10k 或更少                                                 |
| **Primary keys in a table**   | 4–5 个，且足以将数据过滤到较小范围                         |
| **Query concurrency**         | 1000（每个副本）                                           |
| **Batch ingest**              | 任何大于 1M 的批次都会被系统拆分为 1M 行的块               |

:::note
对于 Single Replica Services，数据库的最大数量限制为 100，
表的最大数量限制为 500。此外，Basic Tier Services 的存储容量限制为 1 TB。
:::