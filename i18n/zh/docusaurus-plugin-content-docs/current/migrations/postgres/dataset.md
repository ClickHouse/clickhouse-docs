---
'slug': '/migrations/postgresql/dataset'
'title': '迁移数据'
'description': '示例数据集从 PostgreSQL 迁移到 ClickHouse'
'keywords':
- 'Postgres'
'show_related_blogs': true
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> 这是关于将 PostgreSQL 迁移到 ClickHouse 的指南的 **第 1 部分**。通过一个实用示例，它展示了如何使用实时复制 (CDC) 方法高效地执行迁移。涵盖的许多概念同样适用于从 PostgreSQL 到 ClickHouse 的手动批量数据转移。

## 数据集 {#dataset}

作为展示从 Postgres 到 ClickHouse 的典型迁移的示例数据集，我们使用 Stack Overflow 数据集，该数据集的详细信息可在 [这里](/getting-started/example-datasets/stackoverflow) 找到。它包含自 2008 年至 2024 年 4 月期间 Stack Overflow 上发生的每个 `post`、`vote`、`user`、`comment` 和 `badge`。该数据的 PostgreSQL 模式如下所示：

<Image img={postgres_stackoverflow_schema} size="lg" alt="PostgreSQL Stack Overflow schema"/>

*用于在 PostgreSQL 中创建表的 DDL 命令可在 [这里](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==) 获得。*

该模式虽然不一定是最优的，但利用了多个流行的 PostgreSQL 特性，包括主键、外键、分区和索引。

我们将把这些概念迁移到它们的 ClickHouse 等价物。

对于希望将此数据集填充到 PostgreSQL 实例以测试迁移步骤的用户，我们提供了以 `pg_dump` 格式下载的数据，DDL 和后续数据加载命令如下：

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

对于 ClickHouse 来说，该数据集规模较小，但对 Postgres 来说则相当庞大。上述内容代表了涵盖 2024 年前三个月的一个子集。

> 尽管我们的示例结果使用完整数据集来显示 Postgres 和 ClickHouse 之间的性能差异，但下面文档中的所有步骤在功能上与较小的子集是完全相同的。希望将完整数据集加载到 Postgres 的用户可见 [这里](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)。由于上述模式施加的外键约束，PostgreSQL 的完整数据集仅包含满足引用完整性的行。如果需要，没有这些约束的 [Parquet 版本](/getting-started/example-datasets/stackoverflow) 可以直接加载到 ClickHouse 中。

## 数据迁移 {#migrating-data}

### 实时复制 (CDC) {#real-time-replication-or-cdc}

请参考此 [指南](/integrations/clickpipes/postgres) 来设置 PostgreSQL 的 ClickPipes。该指南涵盖了多种类型的源 Postgres 实例。

使用 ClickPipes 或 PeerDB 的 CDC 方法，PostgreSQL 数据库中的每个表会自动在 ClickHouse 中复制。

为了处理近实时的更新和删除，ClickPipes 使用 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 引擎将 Postgres 表映射到 ClickHouse，该引擎专门设计用于处理 ClickHouse 中的更新和删除。您可以在 [这里](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated) 找到有关数据如何通过 ClickPipes 复制到 ClickHouse 的更多信息。重要的是要注意，使用 CDC 进行的复制在 ClickHouse 中在复制更新或删除操作时会创建重复的行。请参见使用 [FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier) 修饰符的 [技术](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword) 来处理 ClickHouse 中的这些问题。

我们来看看如何使用 ClickPipes 在 ClickHouse 中创建 `users` 表。

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

一旦设置完成，ClickPipes 就会开始将所有数据从 PostgreSQL 迁移到 ClickHouse。根据网络和部署的规模，这对于 Stack Overflow 数据集来说只需几分钟。

### 手动批量加载带定期更新 {#initial-bulk-load-with-periodic-updates}

使用手动方法，可以通过以下方式实现数据集的初始批量加载：

- **表函数** - 使用 ClickHouse 中的 [Postgres 表函数](/sql-reference/table-functions/postgresql) 从 Postgres `SELECT` 数据并将其 `INSERT` 到 ClickHouse 表中。相关于数百 GB 数据集的批量加载。
- **导出** - 导出为中间格式，例如 CSV 或 SQL 脚本文件。这些文件可以通过 `INSERT FROM INFILE` 子句从客户端加载到 ClickHouse，或者使用对象存储及其相关功能，如 s3、gcs。

从 PostgreSQL 手动加载数据时，您需要首先在 ClickHouse 中创建表。请参考此 [数据建模文档](/data-modeling/schema-design#establish-initial-schema)，该文档同样使用 Stack Overflow 数据集来优化 ClickHouse 中的表模式。

PostgreSQL 和 ClickHouse 之间的数据类型可能不同。为了确定每个表列的等效类型，我们可以使用 `DESCRIBE` 命令与 [Postgres 表函数](/sql-reference/table-functions/postgresql)。以下命令描述了 PostgreSQL 中的 `posts` 表，请根据您的环境进行修改：

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

有关 PostgreSQL 与 ClickHouse 之间的数据类型映射的概述，请参见 [附录文档](/migrations/postgresql/appendix#data-type-mappings)。

优化此模式的类型的步骤与从其他来源（例如 S3 上的 Parquet）加载数据时的步骤是相同的。按照此 [使用 Parquet 的替代指南](/data-modeling/schema-design) 中描述的过程可得出以下模式：

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

我们可以通过简单的 `INSERT INTO SELECT` 填充这一表，读取 PostgresSQL 中的数据并插入到 ClickHouse 中：

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

增量加载可以进行调度。如果 Postgres 表仅接收插入且存在递增的 id 或时间戳，用户可以使用上述表函数方法加载增量，例如可以对 `SELECT` 应用 `WHERE` 子句。此方法也可以用于支持更新，如果保证这些更新是同一列的更新。支持删除将需要完整重新加载，这在表增长时可能难以实现。

我们演示使用 `CreationDate` 的初始加载和增量加载（我们假设如果行被更新则会更新此字段）。

```sql
-- initial load
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse 将向 PostgreSQL 服务器推送简单的 `WHERE` 子句，例如 `=`、`!=`、`>`、`>=`、`<`、`<=` 和 IN。因此，通过确保在用于识别更改集的列上存在索引，可以提高增量加载的效率。

> 在使用查询复制时，检测 UPDATE 操作的一种可能方法是使用 [`XMIN` 系统列](https://www.postgresql.org/docs/9.1/ddl-system-columns.html)（事务 ID）作为水印——该列的变化表示变化，因此可以应用到目标表。采用此方法的用户应注意 `XMIN` 值可能会循环，比较需要完整表扫描，从而使跟踪变化变得更复杂。

[点击这里查看第 2 部分](./rewriting-queries.md)
