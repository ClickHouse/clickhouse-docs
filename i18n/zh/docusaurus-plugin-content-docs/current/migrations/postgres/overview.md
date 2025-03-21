---
slug: /migrations/postgresql/overview
title: 从 PostgreSQL 迁移到 ClickHouse
description: 迁移从 PostgreSQL 到 ClickHouse 的指南
keywords: ['postgres', 'postgresql', 'migrate', 'migration']
---

## 为什么选择 ClickHouse 而不是 Postgres? {#why-use-clickhouse-over-postgres}

TLDR: 因为 ClickHouse 是为快速分析而设计的，特别是 `GROUP BY` 查询，作为一个 OLAP 数据库，而 Postgres 是一个为事务工作负载而设计的 OLTP 数据库。

OLTP，或在线事务处理数据库，旨在管理事务信息。这些数据库的主要目标（Postgres 是经典例子）是确保工程师可以将一组更新提交到数据库，并确保它将——整体上——成功或失败。这些带有 ACID 属性的事务性保证是 OLTP 数据库的主要关注点，也是 Postgres 的巨大优势。鉴于这些要求，OLTP 数据库通常在针对大型数据集进行分析查询时会遇到性能限制。

OLAP，或在线分析处理数据库，旨在满足这些需求——管理分析工作负载。这些数据库的主要目标是确保工程师能够高效地查询和聚合大量数据集。像 ClickHouse 这样的实时 OLAP 系统允许这种分析在数据实时摄取时发生。

要进行更高级的比较，请参见 [这篇博客文章](https://clickhouse.com/blog/adding-real-time-analytics-to-a-supabase-application)。

要查看 ClickHouse 和 Postgres 在分析查询上的潜在性能差异，请查看 [在 ClickHouse 中重写 PostgreSQL 查询](/migrations/postgresql/rewriting-queries)。

**[在这里开始 PostgreSQL 迁移指南](/migrations/postgresql/dataset).**
