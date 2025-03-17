---
slug: /migrations/postgresql/dataset
title: 从 PostgreSQL 加载数据到 ClickHouse
description: 示例数据集用于从 PostgreSQL 迁移到 ClickHouse
keywords: [postgres, postgresql, migrate, migration]
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';

> 这是关于从 PostgreSQL 迁移到 ClickHouse 的指南的 **第一部分**。该内容可以视为入门指南，旨在帮助用户部署一个符合 ClickHouse 最佳实践的初始功能系统。它避免了复杂主题，不会导致完全优化的架构；而是为用户提供了构建生产系统和学习的坚实基础。

## 数据集 {#dataset}

作为一个示例数据集，以展示从 Postgres 到 ClickHouse 的典型迁移，我们使用记录在 [这里](/getting-started/example-datasets/stackoverflow) 的 Stack Overflow 数据集。该数据集包含自 2008 到 2024 年 4 月期间发生的每个 `post`、`vote`、`user`、`comment` 和 `badge`。以下是该数据的 PostgreSQL 架构：

<br />

<img src={postgres_stackoverflow_schema} class="image" alt="PostgreSQL Stack Overflow schema" style={{width: '1000px', background: 'none'}} />

<br />

*创建 PostgreSQL 中表的 DDL 命令可在 [这里](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==) 获取。*

该架构虽然不一定是最优的，但利用了许多流行的 PostgreSQL 特性，包括主键、外键、分区和索引。

我们将把这些概念迁移到 ClickHouse 的对应项。

对于希望将该数据集填充到 PostgreSQL 实例中以测试迁移步骤的用户，我们提供了以 `pg_dump` 格式下载的数据，DDL 和后续数据加载命令如下：

```bash

# users
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/users.sql.gz
gzip -d users.sql.gz
psql < users.sql


# posts
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posts.sql.gz
gzip -d posts.sql.gz
psql < posts.sql


# posthistory
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql < posthistory.sql


# comments
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql


# votes
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/votes.sql.gz
gzip -d votes.sql.gz
psql < votes.sql


# badges
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql


# postlinks
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz
gzip -d postlinks.sql.gz
psql < postlinks.sql
```

虽然这个数据集对于 ClickHouse 来说较小，但对于 Postgres 来说却是相当庞大的。以上代表了覆盖 2024 年前三个月的一个子集。

> 虽然我们的示例结果使用完整数据集以展示 Postgres 和 ClickHouse 之间的性能差异，但下面记录的所有步骤与较小子集在功能上是完全相同的。希望将完整数据集加载到 Postgres 的用户请见 [这里](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)。由于上述架构施加的外键约束，PostgreSQL 的完整数据集仅包含满足参照完整性的行。一个 [Parquet 版本](/getting-started/example-datasets/stackoverflow)，没有此类约束，可以直接加载到 ClickHouse 中（如果需要）。

## 数据迁移 {#migrating-data}

在 ClickHouse 和 Postgres 之间的迁移数据分为两种主要工作负载类型：

- **初始大规模加载带周期性更新** - 需要迁移初始数据集，并定期在设定的时间间隔（例如，每日）更新此数据集。此处的更新通过重新发送已更改的行来处理，这些行可以通过用于比较的列（例如，日期）或 `XMIN` 值识别。删除操作通过对数据集进行完全的周期性重新加载来处理。
- **实时复制或 CDC** - 需要迁移初始数据集。对该数据集的更改必须在接近实时的情况下反映在 ClickHouse 中，允许的延迟仅为几秒。这实际上是一个变更数据捕获（CDC）过程，其中 Postgres 表必须与 ClickHouse 进行同步，即对 Postgres 表的插入、更新和删除必须应用到 ClickHouse 中的等效表。

### 初始大规模加载带周期性更新 {#initial-bulk-load-with-periodic-updates}

这种工作负载代表了上述工作负载中更简单的一种，因为可以周期性地应用更改。可以通过以下方式实现数据集的初始大规模加载：

- **表函数** - 使用 ClickHouse 中的 [Postgres 表函数](/sql-reference/table-functions/postgresql) 从 Postgres 中 `SELECT` 数据，并 `INSERT` 到 ClickHouse 表中。对于高达数百 GB 数据集的大规模加载是相关的。
- **导出** - 导出为中间格式，如 CSV 或 SQL 脚本文件。这些文件可以通过 `INSERT FROM INFILE` 子句从客户端加载到 ClickHouse 中，或使用对象存储及其相关函数（例如 s3，gcs）加载。

增量加载可以再次安排。如果 Postgres 表只接收插入并且存在递增的 id 或时间戳，用户可以使用上述表函数方法加载增量数据，即可以在 `SELECT` 上应用 `WHERE` 子句。该方法也可以用于支持更新，如果能够确保更新相同的列。然而，支持删除操作将需要完全重新加载，这在表增长时可能难以实现。

我们展示了一个初始加载和增量加载，使用 `CreationDate`（我们假设如果行被更新则该值会被更新）。

```sql
-- 初始加载
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse 将会将简单的 `WHERE` 子句如 `=`, `!=`, `>`,`>=`, `<`, `<=` 和 IN 下推到 PostgreSQL 服务器。因此，增量加载可以通过确保在用于识别更改集的列上存在索引来变得更加高效。

> 使用查询复制时检测 UPDATE 操作的一种可能方法是使用 [`XMIN` 系统列](https://www.postgresql.org/docs/9.1/ddl-system-columns.html)（事务 ID）作为水印 - 该列的变化表明有变更，因此可以应用到目标表。采用这种方法的用户应注意，`XMIN` 值可能会回绕，比较需要完全表扫描，这使得跟踪更改变得更加复杂。有关该方法的更多详细信息，请参见“变更数据捕获（CDC）”。

### 实时复制或 CDC {#real-time-replication-or-cdc}

变更数据捕获（CDC）是将两个数据库之间的表保持同步的过程。如果要实时处理更新和删除操作，这将显著复杂化。目前存在几种解决方案：
1. **ClickHouse 的 PeerDB** - PeerDB 提供了一个开源代码的专业 PostgreSQL CDC 解决方案，用户可以自行管理或通过 SaaS 解决方案运行，这在大规模处理 Postgres 和 ClickHouse 时表现良好。该解决方案专注于低级优化，以实现高性能的数据传输和在 Postgres 与 ClickHouse 之间的可靠性保证。它支持在线和离线加载。

:::info
PeerDB 现在在 ClickHouse Cloud 中本地可用 - 使用我们的 [新 ClickPipe 连接器](/integrations/clickpipes/postgres)，实现快速的 Postgres 到 ClickHouse 的 CDC - 现已进入公共测试阶段。
:::

2. **自行构建** - 这可以通过 **Debezium + Kafka** 实现 - Debezium 提供捕获 Postgres 表上所有更改的能力，将这些更改转发为事件到 Kafka 队列中。这些事件可以通过 ClickHouse Kafka 连接器或 [ClickHouse Cloud 中的 ClickPipes](https://clickhouse.com/cloud/clickpipes) 被消费，并插入到 ClickHouse 中。这代表了变更数据捕获（CDC），因为 Debezium 将不仅进行表的初始复制，还确保后续所有的更新、删除和插入在 Postgres 上被检测到，从而产生下游事件。这需要仔细配置 Postgres、Debezium 和 ClickHouse。示例可以在 [这里](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-2) 找到。

在本指南的示例中，我们假设仅进行初始大规模加载，重点是数据探索及向生产架构的简便迭代，以便用于其他方法。

[点击这里查看第二部分](/migrations/postgresql/designing-schemas).
