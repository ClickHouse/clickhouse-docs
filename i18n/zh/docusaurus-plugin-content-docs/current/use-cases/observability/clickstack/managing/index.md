---
slug: /use-cases/observability/clickstack/managing
title: '管理 ClickStack'
pagination_prev: null
pagination_next: null
sidebar_label: '管理 ClickStack'
description: '管理 ClickStack'
doc_type: 'guide'
keywords: ['管理 ClickStack', '性能', 'materialized views', '管理命令']
---

本节介绍如何管理 ClickStack。

## 管理指南 \{#admin-guides\}

| 章节 | 描述 |
|--------|-------------|
| [基础管理](/use-cases/observability/clickstack/admin) | 介绍如何在 ClickStack 中执行常见管理任务。 |
| [部署到生产环境](/use-cases/observability/clickstack/production) | 在将 ClickStack 投入生产环境之前推荐的步骤和最佳实践。 |
| [Materialized views](/use-cases/observability/clickstack/materialized_views) | 详细指南，介绍如何在 ClickStack 中使用 materialized view 以提升查询性能。 |
| [性能调优](/use-cases/observability/clickstack/performance_tuning) | 面向大规模工作负载调优 ClickStack 的完整指南。 |

## 核心 ClickHouse 概念 \{#core-concepts\}

大多数 ClickStack 管理任务都需要对底层 ClickHouse 数据库有一定了解。我们建议在执行任何管理或性能相关操作之前，先回顾下文列出的核心 ClickHouse 概念。

| 概念 | 描述 |
|---------|-------------|
| **Tables** | ClickStack 数据源如何映射到底层 ClickHouse 表。ClickHouse 表主要使用 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 引擎。 |
| **Parts** | 数据如何被写入为不可变的分区片段，并随时间进行合并。 |
| **Partitions** | 对表的分区片段进行逻辑分组，以简化数据管理、查询和优化。 |
| **Merges** | 在后台运行的进程，用于合并分区片段，从而减少查询时需要处理的分区片段数量并维持性能。 |
| **Granules** | 在查询执行过程中被读取和裁剪的最小数据单元。 |
| **Primary (ordering) keys** | `ORDER BY` 键如何定义磁盘上的数据布局、压缩方式以及查询裁剪行为。 |

这些概念是 ClickHouse 性能的基础，将帮助您在管理 ClickStack 时做出更明智的管理决策。