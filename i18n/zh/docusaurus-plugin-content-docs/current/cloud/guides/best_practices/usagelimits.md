---
slug: /cloud/bestpractices/usage-limits
sidebar_label: '服务限制'
title: '使用限制'
description: '描述 ClickHouse Cloud 中推荐的使用限制'
doc_type: 'reference'
keywords: ['使用限制', '配额', '最佳实践', '资源管理', '云功能']
---

虽然 ClickHouse 以其速度和可靠性而闻名，但只有在一定的运行参数范围内才能实现最佳性能。  
例如，表、数据库或数据片段（parts）数量过多都可能对性能产生负面影响。为防止这种情况发生，ClickHouse
Cloud 会在多个运行维度上强制执行限制。  
这些保护性阈值的详细信息如下所示。

:::tip
如果遇到了这些保护性阈值之一，可能意味着当前对用例的实现还未优化。请联系我们的支持团队，
我们将协助优化用例，以避免超出这些阈值，或者一起评估如何在可控的前提下提升这些阈值。
:::

| Dimension                     | Limit                                                      |
|-------------------------------|------------------------------------------------------------|
| **Databases**                 | 1000                                                       |
| **Tables**                    | 5000                                                       |
| **Columns**                   | ∼1000（优先使用宽表格式而非紧凑格式）                      |
| **Partitions**                | 50k                                                        |
| **Parts**                     | 整个实例内合计 100k                                        |
| **Part size**                 | 150gb                                                      |
| **Services per organization** | 每个组织 20（软限制）                                      |
| **Services per warehouse**    | 每个 warehouse 5（软限制）                                 |
| **Replicas per service**      | 每个 service 20（软限制）                                  |  
| **Low cardinality**           | 10k 或更少                                                 |
| **Primary keys in a table**   | 4–5 个，且能够充分过滤数据                                 |
| **Query concurrency**         | 1000（每个副本）                                           |
| **Batch ingest**              | 所有 &gt; 1M 的批量都会被系统拆分为 1M 行的分块            |

:::note
对于单副本服务（Single Replica Services），数据库的最大数量限制为 100，表的最大数量限制为 500。  
此外，基础层服务（Basic Tier Services）的存储容量限制为 1 TB。
:::