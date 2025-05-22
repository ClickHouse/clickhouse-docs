---
'slug': '/migrations/postgresql/dataset'
'title': '数据迁移'
'description': '从 PostgreSQL 迁移到 ClickHouse 的数据集示例'
'keywords':
- 'postgres'
- 'postgresql'
- 'migrate'
- 'migration'
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> 这是关于从 PostgreSQL 迁移到 ClickHouse 的指南的 **第 1 部分**。使用一个实用示例，它展示了如何高效地进行实时复制 (CDC) 方法的迁移。涵盖的许多概念也适用于从 PostgreSQL 到 ClickHouse 的手动批量数据传输。

## 数据集 {#dataset}

作为一个示例数据集来展示从 Postgres 到 ClickHouse 的典型迁移，我们使用 Stack Overflow 数据集，详细信息记载于 [这里](/getting-started/example-datasets/stackoverflow)。其中包含自 2008 年至 2024 年 4 月期间 Stack Overflow 上每一个 `post`、`vote`、`user`、`comment` 和 `badge`。该数据的 PostgreSQL 模式如下所示：

<Image img={postgres_stackoverflow_schema} size="lg" alt="PostgreSQL Stack Overflow schema"/>

*在 PostgreSQL 中创建表的 DDL 命令可在 [这里](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==) 查阅。*

这个模式虽然不一定是最优的，但利用了许多流行的 PostgreSQL 特性，包括主键、外键、分区和索引。

我们将把这些概念迁移到它们在 ClickHouse 中的相应实现。

对于那些希望将此数据集填充到 PostgreSQL 实例以测试迁移步骤的用户，我们已经以 `pg_dump` 格式提供了数据供下载，DDL 和后续数据加载命令在下面给出：

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

尽管对 ClickHouse 来说这个数据集较小，但对于 Postgres 来说是相当可观的。上述数据集涵盖了 2024 年的前三个月的子集。

> 尽管我们的示例结果使用完整的数据集来显示 Postgres 和 ClickHouse 之间的性能差异，但下面文档中记录的所有步骤在较小的子集上功能上是相同的。想要将完整数据集加载到 Postgres 的用户请见 [这里](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)。由于上述模式施加的外键约束，PostgreSQL 的完整数据集仅包含满足引用完整性的行。如果需要，可以轻松将无此约束的 [Parquet 版本](/getting-started/example-datasets/stackoverflow) 直接加载到 ClickHouse 中。

## 迁移数据 {#migrating-data}

### 实时复制 (CDC) {#real-time-replication-or-cdc}

请参考此 [指南](/integrations/clickpipes/postgres) 设置 ClickPipes 用于 PostgreSQL。该指南涵盖了许多不同类型的源 Postgres 实例。

使用 ClickPipes 或 PeerDB 的 CDC 方法，PostgreSQL 数据库中的每个表都会自动复制到 ClickHouse 中。

为了处理近实时的更新和删除，ClickPipes 使用 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 引擎将 Postgres 表映射到 ClickHouse，这种设计专门用于处理 ClickHouse 中的更新和删除。您可以找到有关数据是如何使用 ClickPipes 复制到 ClickHouse 的更多信息 [这里](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated)。需要注意的是，使用 CDC 进行复制时，在复制更新或删除操作时会在 ClickHouse 中创建重复的行。请查看使用 [FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier) 修饰符处理这些的 [技术](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword)。

让我们看看如何使用 ClickPipes 在 ClickHouse 中创建表 `users`。

```sql
CREATE TABLE users
(
    `id` Int32,
    `reputation` String,
    `creationdate` DateTime64(6),
    `displayname` String,
    `lastaccessdate` DateTime64(6),
    `aboutme` String,
    `views` Int32,
    `upvotes` Int32,
    `downvotes` Int32,
    `websiteurl` String,
    `location` String,
    `accountid` Int32,
    `_peerdb_synced_at` DateTime64(9) DEFAULT now64(),
    `_peerdb_is_deleted` Int8,
    `_peerdb_version` Int64
)
ENGINE = ReplacingMergeTree(_peerdb_version)
PRIMARY KEY id
ORDER BY id;
```

设置完成后，ClickPipes 开始将所有数据从 PostgreSQL 迁移到 ClickHouse。根据网络和部署的大小，这应该只需几分钟以完成 Stack Overflow 数据集的迁移。

### 手动批量加载和定期更新 {#initial-bulk-load-with-periodic-updates}

使用手动方法，可以通过以下方式实现数据集的初始批量加载：

- **表函数** - 使用 ClickHouse 中的 [Postgres 表函数](/sql-reference/table-functions/postgresql) 从 Postgres 中 `SELECT` 数据，并将其 `INSERT` 到 ClickHouse 表中。与可加载几百 GB 的数据集的批量加载相关。
- **导出** - 导出为 CSV 或 SQL 脚本文件等中间格式。然后可以通过 `INSERT FROM INFILE` 子句从客户端或使用对象存储及其相关功能（例如 s3、gcs）加载这些文件到 ClickHouse。

在从 PostgreSQL 手动加载数据之前，您需要先在 ClickHouse 中创建表。请参考此 [数据建模文档](/data-modeling/schema-design#establish-initial-schema)，其也使用 Stack Overflow 数据集来优化 ClickHouse 中的表模式。

PostgreSQL 和 ClickHouse 之间的数据类型可能不同。为了确定每个表列的等效类型，我们可以使用带有 [Postgres 表函数](/sql-reference/table-functions/postgresql) 的 `DESCRIBE` 命令。以下命令描述表 `posts` 在 PostgreSQL 中的定义，请根据您的环境进行修改：

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

要查看 PostgreSQL 和 ClickHouse 之间数据类型映射的概述，请参考 [附录文档](/migrations/postgresql/appendix#data-type-mappings)。

优化此模式的类型的步骤与如果数据是从其他来源加载（例如 Parquet 在 S3 上）是相同的。将此 [替代指南使用 Parquet](/data-modeling/schema-design) 中描述的过程应用于以下模式：

```sql title="Query"
CREATE TABLE stackoverflow.posts
(
   `Id` Int32,
   `PostTypeId` Enum('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
   `AcceptedAnswerId` UInt32,
   `CreationDate` DateTime,
   `Score` Int32,
   `ViewCount` UInt32,
   `Body` String,
   `OwnerUserId` Int32,
   `OwnerDisplayName` String,
   `LastEditorUserId` Int32,
   `LastEditorDisplayName` String,
   `LastEditDate` DateTime,
   `LastActivityDate` DateTime,
   `Title` String,
   `Tags` String,
   `AnswerCount` UInt16,
   `CommentCount` UInt8,
   `FavoriteCount` UInt8,
   `ContentLicense`LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT 'Optimized types'
```

我们可以使用简单的 `INSERT INTO SELECT` 来填充此数据，从 PostgreSQL 中读取数据并插入到 ClickHouse：

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

增量加载可以按计划进行。如果 Postgres 表仅接收插入，并且存在递增的 id 或时间戳，用户可以使用上述表函数的方法加载增量数据，即可以在 `SELECT` 中应用 `WHERE` 子句。如果这些更新确保更新相同的列，也可以使用此方法来支持更新。但是，支持删除将需要完整重新加载，随着表的增长，这可能难以实现。

我们演示一个初始加载和增量加载，使用 `CreationDate` （我们假设如果行被更新，则会更新此列）。

```sql
-- initial load
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse 将简单的 `WHERE` 子句（例如 `=`、`!=`、`>`、`>=`、`<`、`<=` 和 IN）下推到 PostgreSQL 服务器。因此，通过确保在用于识别更改集的列上存在索引，可以使增量加载更加高效。

> 一种在使用查询复制时检测 UPDATE 操作的方法是使用 [`XMIN` 系统列](https://www.postgresql.org/docs/9.1/ddl-system-columns.html) （事务 ID）作为水印 - 此列的更改表明存在变更，因此可以应用到目标表。采用此方法的用户应注意，`XMIN` 值可能会循环，并且比较需要完整的表扫描，从而使跟踪变化更复杂。

[点击这里查看第 2 部分](./rewriting-queries.md)
