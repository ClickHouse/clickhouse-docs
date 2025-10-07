---
'slug': '/migrations/postgresql/dataset'
'title': '迁移数据'
'description': '示例数据集从 PostgreSQL 迁移至 ClickHouse'
'keywords':
- 'Postgres'
'show_related_blogs': true
'sidebar_label': '第 1 部分'
'doc_type': 'guide'
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> 这是关于从 PostgreSQL 迁移到 ClickHouse 的指南的 **第一部分**。通过一个实际示例，它演示了如何高效地使用实时复制 (CDC) 方法进行迁移。所涵盖的许多概念同样适用于从 PostgreSQL 到 ClickHouse 的手动批量数据传输。

## 数据集 {#dataset}

作为展示从 Postgres 到 ClickHouse 典型迁移的示例数据集，我们使用 Stack Overflow 数据集，该数据集的详细信息记录在 [这里](/getting-started/example-datasets/stackoverflow)。它包含了从 2008 年到 2024 年 4 月在 Stack Overflow 上发生的每个 `post`、`vote`、`user`、`comment` 和 `badge`。 PostgreSQL 的此数据的模式如下所示：

<Image img={postgres_stackoverflow_schema} size="lg" alt="PostgreSQL Stack Overflow schema"/>

*在 PostgreSQL 中创建表的 DDL 命令可在 [这里](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==) 获取。*

这个模式虽然不一定是最优的，但利用了一些流行的 PostgreSQL 特性，包括主键、外键、分区和索引。

我们将把这些概念迁移到它们在 ClickHouse 中的等效项。

对于那些希望将此数据集填充到 PostgreSQL 实例中以测试迁移步骤的用户，我们提供了以 `pg_dump` 格式下载的数据以及 DDL，而后续数据加载命令如下所示：

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

对于 ClickHouse 来说，这个数据集虽然较小，但对于 Postgres 来说却相当庞大。上述内容代表了覆盖 2024 年前三个月的一个子集。

> 虽然我们的示例结果使用完整数据集来显示 Postgres 和 ClickHouse 之间的性能差异，但下面记录的所有步骤在功能上与较小的子集是相同的。希望将完整数据集加载到 Postgres 中的用户可见 [这里](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)。由于上述模式施加的外键约束，PostgreSQL 的完整数据集仅包含满足引用完整性的行。如果需要，可以直接将没有这种约束的 [Parquet 版本](/getting-started/example-datasets/stackoverflow) 轻松加载到 ClickHouse 中。

## 迁移数据 {#migrating-data}

### 实时复制 (CDC) {#real-time-replication-or-cdc}

请参见此 [指南](/integrations/clickpipes/postgres) 以设置 PostgreSQL 的 ClickPipes。该指南涵盖许多不同类型的源 Postgres 实例。

使用 ClickPipes 或 PeerDB 的 CDC 方法，PostgreSQL 数据库中的每个表都将自动复制到 ClickHouse。

为了在近实时中处理更新和删除，ClickPipes 将 Postgres 表映射到 ClickHouse，使用专门设计用于处理 ClickHouse 中的更新和删除的 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 引擎。有关数据如何通过 ClickPipes 复制到 ClickHouse 的更多信息，请查看 [这里](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated)。重要的是要注意，使用 CDC 进行复制时，在复制更新或删除操作时，ClickHouse 会创建重复的行。请查看 [使用 FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier) 修饰符处理这些内容的 [技术](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword) 。

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

一旦设置完成，ClickPipes 将开始将所有数据从 PostgreSQL 迁移到 ClickHouse。根据网络和部署的大小，这对于 Stack Overflow 数据集只需几分钟的时间。

### 手动批量加载与定期更新 {#initial-bulk-load-with-periodic-updates}

使用手动方法，可以通过以下方式实现数据集的初始批量加载：

- **表函数** - 使用 ClickHouse 中的 [Postgres 表函数](/sql-reference/table-functions/postgresql) 从 Postgres `SELECT` 数据并 `INSERT` 到 ClickHouse 表中。适用于导入几百 GB 的数据集的批量加载。
- **导出** - 导出到中间格式，如 CSV 或 SQL 脚本文件。这些文件可以从客户端通过 `INSERT FROM INFILE` 子句加载到 ClickHouse 中，或者使用对象存储及其相关函数，如 s3、gcs。

在从 PostgreSQL 手动加载数据时，您需要先在 ClickHouse 中创建表。请参阅此 [数据建模文档](/data-modeling/schema-design#establish-initial-schema)，它使用 Stack Overflow 数据集来优化 ClickHouse 中的表模式。

PostgreSQL 与 ClickHouse 之间的数据类型可能不同。为了确定每个表列的等效类型，我们可以使用 `DESCRIBE` 命令和 [Postgres 表函数](/sql-reference/table-functions/postgresql)。以下命令描述 PostgreSQL 中的 `posts` 表，请根据您的环境进行修改：

```sql title="Query"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

有关 PostgreSQL 和 ClickHouse 之间数据类型映射的概述，请参阅 [附录文档](/migrations/postgresql/appendix#data-type-mappings)。

优化此模式的数据类型的步骤与从其他来源（例如 S3 上的 Parquet）加载数据时的步骤相同。在此 [使用 Parquet 的备用指南](/data-modeling/schema-design) 中描述的过程，将产生以下模式：

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

我们可以用简单的 `INSERT INTO SELECT` 填充它，从 PostgreSQL 读取数据并插入到 ClickHouse：

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

增量加载也可以调度。如果 Postgres 表仅接收插入并且存在递增的 id 或时间戳，用户可以使用上述表函数方法加载增量，即可以在 `SELECT` 中应用 `WHERE` 子句。这种方法也可以用于支持更新，如果这些更新确保会修改相同的列。然而，支持删除则需要完全重新加载，随着表的增长，这可能会很难实现。

我们通过使用 `CreationDate`（我们假设如果行被更新，则此字段也会更新）来展示初始加载和增量加载。

```sql
-- initial load
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse 将下推简单的 `WHERE` 子句，例如 `=`、`!=`、`>`、`>=`、`<`、`<=` 和 IN 到 PostgreSQL 服务器。因此，通过确保在用于识别更改集的列上存在索引，可以使增量加载更高效。

> 使用查询复制时检测 UPDATE 操作的一种可能方法是使用 [`XMIN` 系统列](https://www.postgresql.org/docs/9.1/ddl-system-columns.html)（事务 ID）作为水印 - 此列的变化意味着更改，因此可以应用到目标表。使用此方法的用户应意识到 `XMIN` 值可能会环绕，并且比较需要完全扫描表，使跟踪更改变得更加复杂。

[点击这里查看第二部分](/migrations/postgresql/rewriting-queries)
