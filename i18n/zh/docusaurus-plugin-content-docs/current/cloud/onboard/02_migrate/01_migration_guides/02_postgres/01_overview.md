---
slug: /migrations/postgresql/overview
title: '比较 PostgreSQL 与 ClickHouse'
description: '从 PostgreSQL 迁移到 ClickHouse 的指南'
keywords: ['postgres', 'postgresql', 'migrate', 'migration']
sidebar_label: '概览'
doc_type: 'guide'
---



# ClickHouse 与 PostgreSQL 对比



## 为什么选择 ClickHouse 而不是 Postgres？ {#why-use-clickhouse-over-postgres}

简而言之：因为 ClickHouse 作为 OLAP 数据库，是专门为快速分析（尤其是 `GROUP BY` 查询）而设计的，而 Postgres 则是为事务型负载设计的 OLTP 数据库。

OLTP（联机事务处理）数据库旨在管理事务型信息。此类数据库（Postgres 是经典示例）的首要目标，是确保工程师可以向数据库提交一组更新，并确信这组更新要么整体成功，要么整体失败。具备 ACID 特性的这类事务性保证，是 OLTP 数据库的主要关注点，也是 Postgres 的巨大优势。鉴于这些要求，当用于在大型数据集上执行分析查询时，OLTP 数据库通常会遇到性能瓶颈。

OLAP（联机分析处理）数据库则是为满足这些需求而设计——即处理分析型工作负载。这类数据库的首要目标，是确保工程师可以高效地在海量数据集上进行查询和聚合。像 ClickHouse 这样的实时 OLAP 系统，允许在数据被实时摄取的同时完成分析。

有关 ClickHouse 和 PostgreSQL 更深入的对比，请参见[这里](/migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)。

要了解 ClickHouse 和 Postgres 在分析查询方面的潜在性能差异，请参见 [Rewriting PostgreSQL Queries in ClickHouse](/migrations/postgresql/rewriting-queries)。



## 迁移策略 {#migration-strategies}

从 PostgreSQL 迁移到 ClickHouse 时，合适的策略取决于你的用例、基础设施以及数据需求。总体而言，实时 CDC（Change Data Capture，变更数据捕获）是大多数现代用例的最佳方案，而手动批量加载加上周期性更新则更适用于更简单的场景或一次性迁移。

下文介绍两种主要的迁移策略：**实时 CDC** 和 **手动批量加载 + 周期性更新**。

### 实时复制（CDC） {#real-time-replication-cdc}

Change Data Capture（CDC，变更数据捕获）是一种让两个数据库之间的表保持同步的过程。对于大多数从 PostgreSQL 迁移的场景，它是最高效的方法，但在实现上也更复杂，因为它会以接近实时的方式处理从 PostgreSQL 到 ClickHouse 的插入、更新和删除操作。它非常适合对实时分析要求较高的用例。 

在 ClickHouse 中，如果你使用 ClickHouse Cloud，可以通过 [ClickPipes](/integrations/clickpipes/postgres/deduplication) 实现实时 Change Data Capture（CDC）；如果你在本地或自建环境运行 ClickHouse，则可以使用 [PeerDB](https://github.com/PeerDB-io/peerdb)。这些解决方案通过捕获来自 PostgreSQL 的插入、更新和删除并将其复制到 ClickHouse，负责处理包括初始加载在内的实时数据同步复杂性。此方法确保 ClickHouse 中的数据始终是最新且准确的，而无需人工干预。

### 手动批量加载 + 周期性更新 {#manual-bulk-load-periodic-updates}

在某些情况下，更为直接的方式（例如手动批量加载加上周期性更新）就足够了。该策略非常适合一次性迁移，或不需要实时复制的场景。它涉及将数据从 PostgreSQL 批量加载到 ClickHouse，可以通过直接执行 SQL `INSERT` 命令，或导出并导入 CSV 文件来完成。完成初始迁移后，你可以通过定期从 PostgreSQL 同步变更来周期性更新 ClickHouse 中的数据。

批量加载过程简单且灵活，但缺点是没有实时更新。一旦初始数据加载到 ClickHouse，后续更新不会立即反映出来，因此你必须安排周期性更新来同步 PostgreSQL 中的变更。该方案适用于对时效性要求不高的用例，但会在 PostgreSQL 中数据发生变化与这些变化出现在 ClickHouse 之间引入一定延迟。

### 应该选择哪种策略？ {#which-strategy-to-choose}

对于大多数需要 ClickHouse 中数据保持新鲜、最新可用的应用，推荐通过 ClickPipes 使用实时 CDC。它可以在最小化配置和维护开销的前提下实现持续的数据同步。另一方面，对于更简单的一次性迁移，或对实时更新不敏感的工作负载，手动批量加载加上周期性更新则是一个可行的选项。

---

**[从这里开始 PostgreSQL 迁移指南](/migrations/postgresql/dataset)。**
