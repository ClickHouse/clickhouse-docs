---
slug: /cloud/bestpractices/usage-limits
sidebar_label: '服务限制'
title: '使用限制'
description: '描述 ClickHouse Cloud 中推荐的使用限制'
doc_type: 'reference'
keywords: ['使用限制', '配额', '最佳实践', '资源管理', '云功能']
---

尽管 ClickHouse 以其速度和可靠性著称，但最佳性能是在特定运行参数范围内实现的。  
例如，过多的表、数据库或数据片段（parts）都会对性能产生负面影响。为避免这种情况，ClickHouse
Cloud 在多个运行维度上施加了限制。  
这些防护性限制的详细信息如下所示。

:::tip
如果您触及了这些防护性限制之一，很可能说明您实现用例的方式尚未优化。请联系我们的支持团队，
我们将非常乐意帮助您优化用例，以避免超出这些限制，或与您一起研究如何在可控的前提下提升这些限制。
:::

| Dimension                     | Limit                                                      |
|-------------------------------|------------------------------------------------------------|
| **Databases**                 | 1000                                                       |
| **Tables**                    | 5000                                                       |
| **Columns**                   | ∼1000（推荐使用宽表格式而非紧凑格式）                     |
| **Partitions**                | 50k                                                        |
| **Parts**                     | 整个实例最多 100k                                          |
| **Part size**                 | 150 GB                                                     |
| **Services per organization** | 20（软限制）                                               |
| **Services per warehouse**    | 5（软限制）                                                |
| **Replicas per service**      | 20（软限制）                                               |  
| **Low cardinality**           | 10k 或更少                                                 |
| **Primary keys in a table**   | 4–5 个，且能充分过滤数据                                   |
| **Query concurrency**         | 1000（每个副本）                                           |
| **Batch ingest**              | 任何 &gt; 1M 的批次都会被系统拆分为 1M 行的块              |

:::note
对于 Single Replica Services，数据库数量最多限制为 100，表数量最多限制为 500。  
此外，Basic Tier Services 的存储空间限制为 1 TB。
:::