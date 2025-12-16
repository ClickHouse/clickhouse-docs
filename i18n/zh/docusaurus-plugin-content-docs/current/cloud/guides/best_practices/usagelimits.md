---
slug: /cloud/bestpractices/usage-limits
sidebar_label: '服务限制'
title: '使用限制'
description: '描述 ClickHouse Cloud 中推荐的使用限制'
doc_type: 'reference'
keywords: ['使用限制', '配额', '最佳实践', '资源管理', 'Cloud 功能']
---

虽然 ClickHouse 以其速度和可靠性著称，但只有在特定的运行参数范围内才能实现最佳性能。比如，表、数据库或分区片段数量过多都可能对性能产生负面影响。为防止这种情况发生，ClickHouse
Cloud 在多个运行维度上实施了限制。
这些防护性限制的详细信息如下所示。

:::tip
如果您触及了这些防护性限制中的某一项，很可能说明当前实现使用场景的方式尚未优化。请联系技术支持团队，我们会协助您优化使用场景以避免超出这些限制，或者一起评估如何在可控的前提下提升这些限制。
:::

| Dimension                     | Limit                                                                                             |
|-------------------------------|---------------------------------------------------------------------------------------------------|
| **Databases**                 | 1000                                                                                              |
| **Tables**                    | 5000                                                                                              |
| **Columns**                   | ∼1000（推荐使用宽表格式而非紧凑格式）                                                              |
| **Partitions**                | 50k                                                                                               |
| **Parts**                     | 10k（参见 [`max_parts_in_total`](/whats-new/cloud-compatibility#max_parts_in_total-10000) setting） |
| **Part size**                 | 150 GB                                                                                            |
| **Services per organization** | 20（软限制）                                                                                      |
| **Services per warehouse**    | 5（软限制）                                                                                       |
| **Replicas per service**      | 20（软限制）                                                                                      |  
| **Low cardinality**           | 10k 或更少                                                                                       |
| **Primary keys in a table**   | 建议 4–5 个，并且能够充分过滤数据                                                                  |
| **Query concurrency**         | 1000（每个副本）                                                                                  |
| **Batch ingest**              | 大于 1M 行的批量写入会被系统拆分为以 1M 行为单位的块                                               |

:::note
对于单副本服务（Single Replica Services），数据库的最大数量限制为 100，表的最大数量限制为 500。此外，基础层服务（Basic Tier Services）的存储容量限制为 1 TB。
:::