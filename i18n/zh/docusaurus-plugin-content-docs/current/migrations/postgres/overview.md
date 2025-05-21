---
'slug': '/migrations/postgresql/overview'
'title': '从PostgreSQL迁移到ClickHouse'
'description': '从PostgreSQL迁移到ClickHouse的指南'
'keywords':
- 'postgres'
- 'postgresql'
- 'migrate'
- 'migration'
---



## 为什么选择 ClickHouse 而不是 Postgres? {#why-use-clickhouse-over-postgres}

TLDR: 因为 ClickHouse 设计用于快速分析，特别是 `GROUP BY` 查询，作为 OLAP 数据库，而 Postgres 是设计用于事务工作负载的 OLTP 数据库。

OLTP，或者在线事务处理数据库，旨在管理事务信息。这些数据库的主要目标（Postgres 是经典示例）是确保工程师可以提交一批更新到数据库，并确信它将——完全——成功或失败。这些具有 ACID 属性的事务保证是 OLTP 数据库的主要焦点，也是 Postgres 的巨大优势。考虑到这些要求，OLTP 数据库在用于对大型数据集进行分析查询时通常会遭遇性能限制。

OLAP，或在线分析处理数据库，旨在满足这些需求——管理分析工作负载。这些数据库的主要目标是确保工程师能够高效地对庞大的数据集进行查询和聚合。像 ClickHouse 这样的实时 OLAP 系统允许在数据实时摄取时进行此分析。

有关 ClickHouse 与 PostgreSQL 的更深入比较，请参阅 [这里](/migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)。

要查看 ClickHouse 和 Postgres 在分析查询上的潜在性能差异，请查看 [在 ClickHouse 中重写 PostgreSQL 查询](/migrations/postgresql/rewriting-queries)。

## 迁移策略 {#migration-strategies}

从 PostgreSQL 迁移到 ClickHouse 的正确策略取决于您的用例、基础设施和数据需求。一般而言，实时的变更数据捕获（CDC）是大多数现代用例的最佳方法，而手动批量加载后再进行定期更新则适合于更简单的场景或一次性迁移。

以下部分描述了两种主要的迁移策略：**实时 CDC** 和 **手动批量加载 + 定期更新**。

### 实时复制 (CDC) {#real-time-replication-cdc}

变更数据捕获（CDC）是一种将两个数据库之间的表保持同步的过程。这是大多数从 PostgreSQL 迁移的最有效的方法，但由于处理从 PostgreSQL 到 ClickHouse 的插入、更新和删除，因此更复杂。这对于实时分析很重要的用例来说是理想的。

实时变更数据捕获（CDC）可以在 ClickHouse 中使用 [ClickPipes](/integrations/clickpipes/postgres/deduplication) 实现，前提是您正在使用 ClickHouse Cloud，或者在您同时运行 ClickHouse 的情况下使用 [PeerDB](https://github.com/PeerDB-io/peerdb)。这些解决方案处理实时数据同步的复杂性，包括初始加载，通过捕获来自 PostgreSQL 的插入、更新和删除，然后将其复制到 ClickHouse。这种方法确保 ClickHouse 中的数据始终是新鲜和准确的，无需人工干预。

### 手动批量加载 + 定期更新 {#manual-bulk-load-periodic-updates}

在某些情况下，像手动批量加载后进行定期更新这样的更简单的方法可能就足够了。这种策略非常适合一次性迁移或不需要实时复制的情况。它涉及将数据从 PostgreSQL 批量加载到 ClickHouse，可以通过直接的 SQL `INSERT` 命令或导出和导入 CSV 文件进行。初始迁移后，您可以通过定期同步 PostgreSQL 的更改来定期更新 ClickHouse 中的数据。

批量加载过程简单灵活，但缺乏实时更新的缺点。一旦初始数据在 ClickHouse 中，更新不会立即反映，因此您必须安排定期更新以同步来自 PostgreSQL 的更改。这种方法适用于对时间要求不高的用例，但它会引入 PostgreSQL 中数据更改和这些更改在 ClickHouse 中出现之间的延迟。

### 选择哪种策略? {#which-strategy-to-choose}

对于大多数需要在 ClickHouse 中拥有新鲜、最新数据的应用程序，推荐的方式是通过 ClickPipes 实现实时 CDC。它提供了持续的数据同步，设置和维护的要求最小。另一方面，手动批量加载与定期更新是一种适合于更简单的一次性迁移或对实时更新不那么关键的工作负载的可行选择。

---

**[在这里开始 PostgreSQL 迁移指南](/migrations/postgresql/dataset)。**
