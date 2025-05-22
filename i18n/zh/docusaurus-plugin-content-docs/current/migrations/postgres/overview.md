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

TLDR: 因为 ClickHouse 是为快速分析而设计的，特别是 `GROUP BY` 查询，作为一种 OLAP 数据库，而 Postgres 是一种 OLTP 数据库，旨在处理事务性工作负载。

OLTP，或在线事务处理数据库，旨在管理事务信息。这些数据库的主要目标是确保工程师可以向数据库提交一批更新，并确保它会——完整地——成功或失败。这种具有 ACID 属性的事务保证是 OLTP 数据库的主要关注点，也是 Postgres 的一个巨大优势。鉴于这些要求，OLTP 数据库在针对大型数据集的分析查询时通常会遇到性能限制。

OLAP，或在线分析处理数据库，旨在满足这些需求——管理分析工作负载。这些数据库的主要目标是确保工程师能够有效地查询和聚合大量数据集。像 ClickHouse 这样的实时 OLAP 系统允许在数据实时摄取时进行这种分析。

有关 ClickHouse 和 PostgreSQL 的更深入比较，请参见 [这里](/migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)。

要查看 ClickHouse 和 Postgres 在分析查询上的潜在性能差异，请参见 [在 ClickHouse 中重写 PostgreSQL 查询](/migrations/postgresql/rewriting-queries)。

## 迁移策略 {#migration-strategies}

从 PostgreSQL 迁移到 ClickHouse 的正确策略取决于您的用例、基础设施和数据需求。一般而言，实时变更数据捕获（CDC）对于大多数现代用例来说是最佳方法，而手动批量加载后跟定期更新适合于更简单的场景或一次性迁移。

以下部分描述了两种主要的迁移策略：**实时 CDC** 和 **手动批量加载 + 定期更新**。

### 实时复制 (CDC) {#real-time-replication-cdc}

变更数据捕获（CDC）是将两个数据库之间的表保持同步的过程。这是从 PostgreSQL 迁移的最有效的方法，但相对更复杂，因为它以近乎实时的方式处理从 PostgreSQL 到 ClickHouse 的插入、更新和删除。这非常适合实时分析重要的用例。

如果您使用 ClickHouse Cloud，则可以使用 [ClickPipes](/integrations/clickpipes/postgres/deduplication) 实现实时变更数据捕获（CDC），或者在本地运行 ClickHouse 时可以使用 [PeerDB](https://github.com/PeerDB-io/peerdb)。这些解决方案处理实时数据同步的复杂性，包括初始加载，通过捕捉来自 PostgreSQL 的插入、更新和删除，并在 ClickHouse 中进行复制。这种方法确保了 ClickHouse 中的数据始终是最新的和准确的，而无需手动干预。

### 手动批量加载 + 定期更新 {#manual-bulk-load-periodic-updates}

在某些情况下，更直接的方法，如手动批量加载后跟定期更新，可能就足够了。这种策略适用于一次性迁移或不需要实时复制的情况。它涉及通过直接 SQL `INSERT` 命令或导出和导入 CSV 文件批量从 PostgreSQL 加载数据到 ClickHouse。在初始迁移后，您可以通过定期同步 PostgreSQL 的更改来定期更新 ClickHouse 中的数据。

批量加载过程简单灵活，但缺点是没有实时更新。一旦初始数据进入 ClickHouse，更新将不会立即反映，因此您必须安排定期更新以同步 PostgreSQL 的更改。这种方法适合对时间不太敏感的用例，但它引入了 PostgreSQL 中数据发生变化与这些变化在 ClickHouse 中出现之间的延迟。

### 选择哪种策略? {#which-strategy-to-choose}

对于大多数需要在 ClickHouse 中保持新鲜、最新数据的应用程序，推荐通过 ClickPipes 使用实时 CDC。这提供了持续的数据同步，同时设置和维护成本最低。另一方面，手动批量加载与定期更新是适用于更简单的一次性迁移或实时更新不重要的工作负载的可行选项。

---

**[在这里开始 PostgreSQL 迁移指南](/migrations/postgresql/dataset)。**
