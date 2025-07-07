---
'slug': '/migrations/postgresql/overview'
'title': '从 PostgreSQL 迁移到 ClickHouse'
'description': '从 PostgreSQL 迁移到 ClickHouse 的指南'
'keywords':
- 'postgres'
- 'postgresql'
- 'migrate'
- 'migration'
---

## 为什么选择 ClickHouse 而不是 Postgres? {#why-use-clickhouse-over-postgres}

TLDR: 因为 ClickHouse 旨在进行快速分析，特别是 `GROUP BY` 查询，作为一个 OLAP 数据库，而 Postgres 是一个用于事务工作负载的 OLTP 数据库。

OLTP，或在线事务处理数据库，旨在管理事务信息。这些数据库的主要目标（Postgres 是经典示例）是确保工程师可以将一组更新提交到数据库，并确信它将——整体上——成功或失败。这些带有 ACID 属性的事务保证是 OLTP 数据库的主要关注点，并且是 Postgres 的巨大优势。鉴于这些要求，当 OLTP 数据库用于对大数据集的分析查询时，通常会遇到性能限制。

OLAP，或在线分析处理数据库，旨在满足这些需求——管理分析工作负载。这些数据库的主要目标是确保工程师能够高效地查询和汇总大量数据集。实时 OLAP 系统如 ClickHouse 允许在数据实时获取的过程中进行这些分析。

有关 ClickHouse 和 PostgreSQL 更深入的比较，请参见 [这里](/migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)。

要查看 ClickHouse 和 Postgres 在分析查询中的潜在性能差异，请参见 [Rewriting PostgreSQL Queries in ClickHouse](/migrations/postgresql/rewriting-queries)。

## 迁移策略 {#migration-strategies}

从 PostgreSQL 迁移到 ClickHouse 的正确策略取决于您的用例、基础设施和数据要求。一般而言，实时变更数据捕获 (CDC) 是大多数现代用例的最佳方法，而手动批量加载后跟定期更新适用于更简单的场景或一次性迁移。

以下部分描述了两种主要的迁移策略：**实时 CDC** 和 **手动批量加载 + 定期更新**。

### 实时复制 (CDC) {#real-time-replication-cdc}

变更数据捕获 (CDC) 是保持两个数据库之间表同步的过程。这是从 PostgreSQL 迁移的最有效方法，但同时更复杂，因为它在近实时的情况下处理从 PostgreSQL 到 ClickHouse 的插入、更新和删除。它非常适合实时分析很重要的用例。

实时变更数据捕获 (CDC) 可以通过使用 [ClickPipes](/integrations/clickpipes/postgres/deduplication) 在 ClickHouse 中实现，如果您使用的是 ClickHouse Cloud，或者在本地运行 ClickHouse 的情况下可以使用 [PeerDB](https://github.com/PeerDB-io/peerdb)。这些解决方案处理实时数据同步的复杂性，包括初始加载，通过捕获来自 PostgreSQL 的插入、更新和删除并将其复制到 ClickHouse 中。此方法确保 ClickHouse 中的数据始终新鲜准确，无需手动干预。

### 手动批量加载 + 定期更新 {#manual-bulk-load-periodic-updates}

在某些情况下，更简单的方法，如手动批量加载后跟定期更新，可能就足够了。该策略适用于一次性迁移或不要求实时复制的情况。它涉及通过直接 SQL `INSERT` 命令或导出和导入 CSV 文件将数据从 PostgreSQL 批量加载到 ClickHouse。在初始迁移完成后，您可以通过定期从 PostgreSQL 同步更改来定期更新 ClickHouse 中的数据。

批量加载过程简单灵活，但缺点是没有实时更新。一旦初始数据加载到 ClickHouse 中，更新不会立即反映，因此您必须安排定期更新以同步 PostgreSQL 中的更改。这种方法适用于对时间不太敏感的用例，但它引入了 PostgreSQL 数据更改与这些更改在 ClickHouse 中出现之间的延迟。

### 选择哪种策略? {#which-strategy-to-choose}

对于大多数需要在 ClickHouse 中获得新鲜、最新数据的应用程序，推荐使用通过 ClickPipes 进行的实时 CDC 方法。它提供了持续的数据同步，设置和维护工作量最小。另一方面，手动批量加载与定期更新的组合是适合更简单的一次性迁移或实时更新不重要的工作负载的可行选项。

---

**[在这里开始 PostgreSQL 迁移指南](/migrations/postgresql/dataset).**
