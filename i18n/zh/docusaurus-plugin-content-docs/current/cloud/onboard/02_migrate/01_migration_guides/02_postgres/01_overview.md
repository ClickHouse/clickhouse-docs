---
'slug': '/migrations/postgresql/overview'
'title': '比较 PostgreSQL 和 ClickHouse'
'description': '从 PostgreSQL 迁移到 ClickHouse 的指南'
'keywords':
- 'postgres'
- 'postgresql'
- 'migrate'
- 'migration'
'sidebar_label': '概述'
'doc_type': 'guide'
---


# 比较 ClickHouse 和 PostgreSQL

## 为什么使用 ClickHouse 而不是 Postgres? {#why-use-clickhouse-over-postgres}

TLDR：因为 ClickHouse 是为快速分析而设计的，特别是 `GROUP BY` 查询，作为一个 OLAP 数据库，而 Postgres 是一个为事务工作负载设计的 OLTP 数据库。

OLTP，或在线事务处理数据库，是为管理事务信息而设计的。这些数据库的主要目标，Postgres 是经典的例子，是确保工程师能够将一批更新提交到数据库，并能确保该批更新——整体上——要么成功，要么失败。这些类型的事务保证与 ACID 属性是 OLTP 数据库的主要焦点，也是 Postgres 的巨大优势。考虑到这些要求，OLTP 数据库在用于大数据集的分析查询时通常会遇到性能限制。

OLAP，或在线分析处理数据库，旨在满足这些需求——管理分析工作负载。这些数据库的主要目标是确保工程师能够有效地查询和聚合庞大的数据集。像 ClickHouse 这样的实时 OLAP 系统允许在数据实时摄取时进行这种分析。

有关 ClickHouse 和 PostgreSQL 更深入比较，请参见 [这里](/migrations/postgresql/appendix#postgres-vs-clickhouse-equivalent-and-different-concepts)。

要查看 ClickHouse 和 Postgres 在分析查询上的潜在性能差异，请查看 [在 ClickHouse 中重写 PostgreSQL 查询](/migrations/postgresql/rewriting-queries)。

## 迁移策略 {#migration-strategies}

从 PostgreSQL 迁移到 ClickHouse 的正确策略取决于您的用例、基础架构和数据要求。一般而言，对于大多数现代用例，实时变更数据捕获 (CDC) 是最佳方法，而手动批量加载后跟定期更新适合于更简单的场景或一次性迁移。

以下部分描述了两种主要的迁移策略：**实时 CDC** 和 **手动批量加载 + 定期更新**。

### 实时复制 (CDC) {#real-time-replication-cdc}

变更数据捕获 (CDC) 是保持两个数据库之间同步表的过程。它是从 PostgreSQL 迁移的最有效的方法，但由于它处理近乎实时的 PostgreSQL 到 ClickHouse 的插入、更新和删除，因此更复杂。它非常适合实时分析非常重要的用例。

实时变更数据捕获 (CDC) 可以通过 [ClickPipes](/integrations/clickpipes/postgres/deduplication) 在 ClickHouse 中实现，如果您正在使用 ClickHouse Cloud，或者如果您运行的是本地 ClickHouse，可以使用 [PeerDB](https://github.com/PeerDB-io/peerdb)。这些解决方案处理实时数据同步的复杂性，包括初始加载，通过捕获来自 PostgreSQL 的插入、更新和删除并在 ClickHouse 中复制它们。这种方法确保 ClickHouse 中的数据始终是最新和准确的，而无需手动干预。

### 手动批量加载 + 定期更新 {#manual-bulk-load-periodic-updates}

在某些情况下，像手动批量加载后跟定期更新这样的更简单的方法可能就足够了。此策略非常适合一次性迁移或不要求实时复制的情况。它涉及通过直接 SQL `INSERT` 命令或导出和导入 CSV 文件将数据从 PostgreSQL 批量加载到 ClickHouse。初始迁移后，您可以通过定期同步来自 PostgreSQL 的更改周期性地更新 ClickHouse 中的数据。

批量加载过程简单灵活，但缺乏实时更新的缺点。一旦初始数据在 ClickHouse 中，更新不会立即反映，因此您必须安排定期更新以同步来自 PostgreSQL 的更改。这种方法适用于对时间不太敏感的用例，但它引入了数据在 PostgreSQL 中更改和这些更改出现在 ClickHouse 中之间的延迟。

### 选择哪个策略? {#which-strategy-to-choose}

对于大多数需要在 ClickHouse 中保持最新数据的应用程序，建议采用通过 ClickPipes 实现的实时 CDC 方法。它提供了连续的数据同步，设置和维护最小。另一方面，手动批量加载加上定期更新，适合于更简单的一次性迁移或实时更新不太关键的工作负载。

---

**[在这里开始 PostgreSQL 迁移指南](/migrations/postgresql/dataset)。**
