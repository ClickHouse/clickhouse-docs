---
slug: /migrations/postgresql/dataset
title: '数据迁移'
description: '从 PostgreSQL 迁移到 ClickHouse 的示例数据集'
keywords: ['Postgres']
show_related_blogs: true
sidebar_label: '第 1 部分'
doc_type: 'guide'
---

import postgres_stackoverflow_schema from '@site/static/images/migrations/postgres-stackoverflow-schema.png';
import Image from '@theme/IdealImage';

> 本文是《从 PostgreSQL 迁移到 ClickHouse 指南》的 **第 1 部分**。通过一个实际示例，演示如何使用实时复制（CDC）方法高效完成迁移。其中涉及的许多概念同样适用于从 PostgreSQL 到 ClickHouse 的手动批量数据传输。


## 数据集 {#dataset}

作为展示从 Postgres 迁移到 ClickHouse 的典型示例,我们使用[此处](/getting-started/example-datasets/stackoverflow)记录的 Stack Overflow 数据集。该数据集包含 2008 年至 2024 年 4 月期间 Stack Overflow 上的所有 `post`、`vote`、`user`、`comment` 和 `badge` 数据。该数据的 PostgreSQL 架构如下所示:

<Image
  img={postgres_stackoverflow_schema}
  size='lg'
  alt='PostgreSQL Stack Overflow 架构'
/>

_在 PostgreSQL 中创建表的 DDL 命令可在[此处](https://pastila.nl/?001c0102/eef2d1e4c82aab78c4670346acb74d83#TeGvJWX9WTA1V/5dVVZQjg==)获取。_

该架构虽然不一定是最优的,但使用了许多常用的 PostgreSQL 特性,包括主键、外键、分区和索引。

我们将把这些概念逐一迁移到 ClickHouse 中的对应实现。

对于希望将此数据集导入 PostgreSQL 实例以测试迁移步骤的用户,我们提供了 `pg_dump` 格式的数据供下载,其中包含 DDL,后续的数据加载命令如下所示:


```bash
# 用户
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/users.sql.gz
gzip -d users.sql.gz
psql < users.sql
```


# posts
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posts.sql.gz
gzip -d posts.sql.gz
psql &lt; posts.sql



# posthistory
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/posthistory.sql.gz
gzip -d posthistory.sql.gz
psql &lt; posthistory.sql



# comments
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/comments.sql.gz
gzip -d comments.sql.gz
psql < comments.sql



# votes
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/votes.sql.gz
gzip -d votes.sql.gz
psql &lt; votes.sql



# badges
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/badges.sql.gz
gzip -d badges.sql.gz
psql < badges.sql



# postlinks

wget [https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz](https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/pdump/2024/postlinks.sql.gz)
gzip -d postlinks.sql.gz
psql &lt; postlinks.sql

```

虽然对 ClickHouse 而言这个数据集很小,但对 Postgres 来说却相当庞大。上述内容为 2024 年前三个月的数据子集。

> 虽然我们的示例结果使用完整数据集来展示 Postgres 和 ClickHouse 之间的性能差异,但下文记录的所有步骤在功能上与较小的子集完全相同。如需将完整数据集加载到 Postgres,请参见[此处](https://pastila.nl/?00d47a08/1c5224c0b61beb480539f15ac375619d#XNj5vX3a7ZjkdiX7In8wqA==)。由于上述模式施加的外键约束,PostgreSQL 的完整数据集仅包含满足引用完整性的行。如有需要,可以将没有此类约束的 [Parquet 版本](/getting-started/example-datasets/stackoverflow)直接加载到 ClickHouse 中。
```


## 迁移数据 {#migrating-data}

### 实时复制 (CDC) {#real-time-replication-or-cdc}

请参阅此[指南](/integrations/clickpipes/postgres)来为 PostgreSQL 设置 ClickPipes。该指南涵盖了多种不同类型的 Postgres 源实例。

使用 ClickPipes 或 PeerDB 的 CDC 方法时,PostgreSQL 数据库中的每个表都会自动复制到 ClickHouse 中。

为了近实时地处理更新和删除操作,ClickPipes 使用 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 引擎将 Postgres 表映射到 ClickHouse,该引擎专门用于处理 ClickHouse 中的更新和删除操作。您可以在[此处](/integrations/clickpipes/postgres/deduplication#how-does-data-get-replicated)找到有关使用 ClickPipes 将数据复制到 ClickHouse 的更多信息。需要注意的是,使用 CDC 进行复制时,在复制更新或删除操作时会在 ClickHouse 中产生重复行。[查看相关技术](/integrations/clickpipes/postgres/deduplication#deduplicate-using-final-keyword)了解如何使用 [FINAL](https://clickhouse.com/docs/sql-reference/statements/select/from#final-modifier) 修饰符在 ClickHouse 中处理这些情况。

让我们看看如何使用 ClickPipes 在 ClickHouse 中创建 `users` 表。

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

设置完成后,ClickPipes 开始将所有数据从 PostgreSQL 迁移到 ClickHouse。根据网络状况和部署规模,对于 Stack Overflow 数据集,这通常只需要几分钟。

### 手动批量加载与定期更新 {#initial-bulk-load-with-periodic-updates}

使用手动方法时,可以通过以下方式实现数据集的初始批量加载:

- **表函数** - 在 ClickHouse 中使用 [Postgres 表函数](/sql-reference/table-functions/postgresql)从 Postgres `SELECT` 数据并将其 `INSERT` 到 ClickHouse 表中。适用于最多几百 GB 的数据集批量加载。
- **导出** - 导出为中间格式,如 CSV 或 SQL 脚本文件。然后可以通过客户端使用 `INSERT FROM INFILE` 子句或使用对象存储及其相关函数(如 s3、gcs)将这些文件加载到 ClickHouse 中。

从 PostgreSQL 手动加载数据时,您需要首先在 ClickHouse 中创建表。请参阅此[数据建模文档](/data-modeling/schema-design#establish-initial-schema),该文档同样使用 Stack Overflow 数据集来优化 ClickHouse 中的表结构。

PostgreSQL 和 ClickHouse 之间的数据类型可能有所不同。要为每个表列确定等效类型,我们可以使用 `DESCRIBE` 命令配合 [Postgres 表函数](/sql-reference/table-functions/postgresql)。以下命令用于描述 PostgreSQL 中的 `posts` 表,请根据您的环境进行修改:

```sql title="查询"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

有关 PostgreSQL 和 ClickHouse 之间数据类型映射的概述,请参阅[附录文档](/migrations/postgresql/appendix#data-type-mappings)。

优化此模式类型的步骤与从其他源(例如 S3 上的 Parquet)加载数据时相同。应用此[使用 Parquet 的替代指南](/data-modeling/schema-design)中描述的流程会得到以下模式:


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
COMMENT '已优化类型'
```

我们可以使用一个简单的 `INSERT INTO SELECT` 来填充数据，从 PostgreSQL 读取数据并插入到 ClickHouse 中：

```sql title="Query"
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

增量加载也可以进行调度。如果 Postgres 表只发生插入操作，并且存在递增的 id 或时间戳，用户可以使用上述表函数的方法来加载增量数据，即在 `SELECT` 中添加 `WHERE` 子句。若能够保证只更新同一列，此方法也可用于支持更新。然而，要支持删除则需要完整重新加载，随着表的规模增大，这可能会变得难以实现。

我们使用 `CreationDate` 演示一次初始加载和一次增量加载（我们假设当行被更新时该字段也会更新）。

```sql
-- 初始加载
INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password')

INSERT INTO stackoverflow.posts SELECT * FROM postgresql('<host>', 'postgres', 'posts', 'postgres', '<password') WHERE CreationDate > ( SELECT (max(CreationDate) FROM stackoverflow.posts)
```

> ClickHouse 会将简单的 `WHERE` 子句（如 `=`, `!=`, `>`, `>=`, `<`, `<=` 和 IN）下推到 PostgreSQL 服务器。通过确保在用于标识变更集的列上建立索引，可以更高效地执行增量加载。

> 在使用查询复制时，检测 UPDATE 操作的一种可行方法是使用 [`XMIN` 系统列](https://www.postgresql.org/docs/9.1/ddl-system-columns.html)（事务 ID）作为水位线——该列值的变化表明发生了变更，因此可以将其应用到目标表。采用此方法的用户需要注意，`XMIN` 值可能会发生回绕，且比较时需要对整张表进行全表扫描，从而使变更跟踪更加复杂。

[点击此处查看第 2 部分](/migrations/postgresql/rewriting-queries)
