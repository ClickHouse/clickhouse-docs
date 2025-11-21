---
slug: /migrations/postgresql/overview
title: '比较 PostgreSQL 和 ClickHouse'
description: '从 PostgreSQL 迁移到 ClickHouse 的指南'
keywords: ['postgres', 'postgresql', 'migrate', 'migration']
sidebar_label: '概览'
doc_type: 'guide'
---



# ClickHouse 与 PostgreSQL 的比较



## 为什么使用 ClickHouse 而不是 Postgres? {#why-use-clickhouse-over-postgres}

简而言之:ClickHouse 作为 OLAP 数据库,专为快速分析而设计,尤其擅长 `GROUP BY` 查询,而 Postgres 是为事务性工作负载设计的 OLTP 数据库。

OLTP,即在线事务处理数据库,旨在管理事务性信息。这类数据库的主要目标(Postgres 是其中的经典代表)是确保工程师可以向数据库提交一批更新操作,并确保这些操作要么全部成功,要么全部失败。这种具有 ACID 属性的事务性保证是 OLTP 数据库的核心关注点,也是 Postgres 的一大优势。但正因为这些要求,OLTP 数据库在处理大规模数据集的分析查询时通常会遇到性能瓶颈。

OLAP,即在线分析处理数据库,正是为了满足这些需求而设计的——专门用于处理分析工作负载。这类数据库的主要目标是确保工程师能够高效地查询和聚合海量数据集。像 ClickHouse 这样的实时 OLAP 系统支持在数据实时摄取的同时进行分析。

有关 ClickHouse 和 PostgreSQL 的更深入比较,请参见[此处](/migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)。

要了解 ClickHouse 和 Postgres 在分析查询方面的潜在性能差异,请参见[在 ClickHouse 中重写 PostgreSQL 查询](/migrations/postgresql/rewriting-queries)。


## 迁移策略 {#migration-strategies}

从 PostgreSQL 迁移到 ClickHouse 时,合适的策略取决于您的使用场景、基础设施和数据需求。通常情况下,实时变更数据捕获(CDC)是大多数现代使用场景的最佳方法,而手动批量加载后进行定期更新则适用于较简单的场景或一次性迁移。

下文介绍了两种主要的迁移策略:**实时 CDC** 和 **手动批量加载 + 定期更新**。

### 实时复制 (CDC) {#real-time-replication-cdc}

变更数据捕获(CDC)是使两个数据库之间的表保持同步的过程。对于大多数从 PostgreSQL 的迁移来说,这是最高效的方法,但也更复杂,因为它需要以近实时的方式处理从 PostgreSQL 到 ClickHouse 的插入、更新和删除操作。它非常适合实时分析至关重要的使用场景。

如果您使用 ClickHouse Cloud,可以通过 [ClickPipes](/integrations/clickpipes/postgres/deduplication) 在 ClickHouse 中实现实时变更数据捕获(CDC);如果您在本地部署运行 ClickHouse,则可以使用 [PeerDB](https://github.com/PeerDB-io/peerdb)。这些解决方案通过捕获 PostgreSQL 的插入、更新和删除操作并在 ClickHouse 中复制它们,来处理实时数据同步的复杂性,包括初始加载。这种方法确保 ClickHouse 中的数据始终保持最新和准确,无需手动干预。

### 手动批量加载 + 定期更新 {#manual-bulk-load-periodic-updates}

在某些情况下,手动批量加载后进行定期更新这种更直接的方法可能就足够了。这种策略非常适合一次性迁移或不需要实时复制的情况。它涉及通过直接执行 SQL `INSERT` 命令或导出和导入 CSV 文件的方式,将数据从 PostgreSQL 批量加载到 ClickHouse。初始迁移完成后,您可以定期从 PostgreSQL 同步变更来更新 ClickHouse 中的数据。

批量加载过程简单灵活,但缺点是无法实时更新。一旦初始数据加载到 ClickHouse,更新不会立即反映出来,因此您必须定期安排更新任务以同步 PostgreSQL 的变更。这种方法适用于对时效性要求不高的使用场景,但它会在 PostgreSQL 中数据变更与这些变更出现在 ClickHouse 中之间产生延迟。

### 选择哪种策略? {#which-strategy-to-choose}

对于大多数需要在 ClickHouse 中获取最新数据的应用程序,通过 ClickPipes 实现的实时 CDC 是推荐的方法。它以最少的设置和维护工作提供持续的数据同步。另一方面,对于较简单的一次性迁移或实时更新不重要的工作负载,手动批量加载加定期更新是一个可行的选择。

---

**[从这里开始 PostgreSQL 迁移指南](/migrations/postgresql/dataset)。**
