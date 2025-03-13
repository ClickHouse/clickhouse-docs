---
slug: /migrations/postgresql/designing-schemas
title: 设计模式
description: 从 PostgreSQL 迁移到 ClickHouse 时的模式设计
keywords: [postgres, postgresql, migrate, migration, schema]
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';

> 这是关于从 PostgreSQL 迁移到 ClickHouse 的指南的 **第 2 部分**。此内容可以视为入门，旨在帮助用户部署符合 ClickHouse 最佳实践的初始功能系统。它避免了复杂的主题，结果不会是一个完全优化的模式；而是为用户构建生产系统和学习提供了坚实的基础。

Stack Overflow 数据集包含多个相关的表。我们建议迁移首先集中在迁移其主表上。这不一定是最大表，而是您期望接受最多分析查询的表。这将使您熟悉 ClickHouse 的主要概念，尤其是如果您来自 OLTP 背景时。这张表可能需要重新建模，因为在添加其他表时，可能需要充分利用 ClickHouse 的特性以获得最佳性能。我们在我们的 [数据建模文档](/data-modeling/schema-design#next-data-modelling-techniques) 中探讨这个建模过程。

## 建立初始模式 {#establish-initial-schema}

遵循这一原则，我们专注于主要的 `posts` 表。下面显示了其 Postgres 模式：

```sql title="查询"
CREATE TABLE posts (
   Id int,
   PostTypeId int,
   AcceptedAnswerId text,
   CreationDate timestamp,
   Score int,
   ViewCount int,
   Body text,
   OwnerUserId int,
   OwnerDisplayName text,
   LastEditorUserId text,
   LastEditorDisplayName text,
   LastEditDate timestamp,
   LastActivityDate timestamp,
   Title text,
   Tags text,
   AnswerCount int,
   CommentCount int,
   FavoriteCount int,
   ContentLicense text,
   ParentId text,
   CommunityOwnedDate timestamp,
   ClosedDate timestamp,
   PRIMARY KEY (Id),
   FOREIGN KEY (OwnerUserId) REFERENCES users(Id)
)
```

为了为上述每一列建立等效类型，我们可以使用 `DESCRIBE` 命令和 [Postgres 表函数](/sql-reference/table-functions/postgresql)。将以下命令修改为您的 Postgres 实例：

```sql title="查询"
DESCRIBE TABLE postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
SETTINGS describe_compact_output = 1
```

```response title="响应"
┌─name──────────────────┬─type────────────────────┐
│ id           		│ Int32                   │
│ posttypeid   		│ Nullable(Int32)	  │
│ acceptedanswerid 	│ Nullable(String)   	  │
│ creationdate 		│ Nullable(DateTime64(6)) │
│ score        		│ Nullable(Int32)	  │
│ viewcount    		│ Nullable(Int32)	  │
│ body         		│ Nullable(String)   	  │
│ owneruserid  		│ Nullable(Int32)	  │
│ ownerdisplayname 	│ Nullable(String)   	  │
│ lasteditoruserid 	│ Nullable(String)   	  │
│ lasteditordisplayname │ Nullable(String)   	  │
│ lasteditdate 		│ Nullable(DateTime64(6)) │
│ lastactivitydate 	│ Nullable(DateTime64(6)) │
│ title        		│ Nullable(String)   	  │
│ tags         		│ Nullable(String)   	  │
│ answercount  		│ Nullable(Int32)	  │
│ commentcount 		│ Nullable(Int32)	  │
│ favoritecount		│ Nullable(Int32)	  │
│ contentlicense   	│ Nullable(String)   	  │
│ parentid     		│ Nullable(String)   	  │
│ communityowneddate    │ Nullable(DateTime64(6)) │
│ closeddate   		│ Nullable(DateTime64(6)) │
└───────────────────────┴─────────────────────────┘

22 rows in set. Elapsed: 0.478 sec.
```

这为我们提供了一个初步的非优化模式。

> 在没有 `NOT NULL Constraint` 的情况下，Postgres 列可以包含 Null 值。在未检查行值的情况下，ClickHouse 将其映射到等效的 Nullable 类型。请注意，主键不能为 Null，这在 Postgres 中是一个要求。

我们可以使用这些类型通过简单的 `CREATE AS EMPTY SELECT` 命令创建一个 ClickHouse 表。

```sql title="查询"
CREATE TABLE posts
ENGINE = MergeTree
ORDER BY () EMPTY AS
SELECT * FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
```

同样的方法可以用于以其他格式从 s3 加载数据。请参见此处有关从 Parquet 格式加载数据的等效示例。

## 初始加载 {#initial-load}

创建了表后，我们可以使用 [Postgres 表函数](/sql-reference/table-functions/postgresql) 将行从 Postgres 插入 ClickHouse。

```sql title="查询"
INSERT INTO posts SELECT *
FROM postgresql('<host>:<port>', 'postgres', 'posts', '<username>', '<password>')
0 rows in set. Elapsed: 1136.841 sec. Processed 58.89 million rows, 80.85 GB (51.80 thousand rows/s., 71.12 MB/s.)
Peak memory usage: 2.51 GiB.
```

> 此操作可能会对 Postgres 造成相当大的负担。用户可能希望使用其他操作进行补充，以避免对生产工作负载造成影响，例如导出 SQL 脚本。此操作的性能将取决于您的 Postgres 和 ClickHouse 集群的大小及其网络互连。

> 每个从 ClickHouse 到 Postgres 的 `SELECT` 仅使用一个连接。该连接来自服务端连接池，其大小由设置 `postgresql_connection_pool_size`（默认值为 16）决定。

如果使用完整的数据集，示例应加载 5900 万个帖子。通过在 ClickHouse 中进行简单计数确认：

```sql title="查询"
SELECT count()
FROM posts
```

```response title="响应"
┌──count()─┐
│ 58889566 │
└──────────┘
```

## 优化类型 {#optimizing-types}

优化此模式的类型的步骤与从其他来源加载数据（例如 S3 上的 Parquet）时是相同的。应用此 [使用 Parquet 的替代指南](/data-modeling/schema-design) 中描述的过程产生了以下模式：

```sql title="查询"
CREATE TABLE posts_v2
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
   `ContentLicense` LowCardinality(String),
   `ParentId` String,
   `CommunityOwnedDate` DateTime,
   `ClosedDate` DateTime
)
ENGINE = MergeTree
ORDER BY tuple()
COMMENT '优化类型'
```

我们可以通过简单的 `INSERT INTO SELECT` 将数据从前一个表读取并插入到此表中：

```sql title="查询"
INSERT INTO posts_v2 SELECT * FROM posts
0 rows in set. Elapsed: 146.471 sec. Processed 59.82 million rows, 83.82 GB (408.40 thousand rows/s., 572.25 MB/s.)
```

在我们的新模式中，我们不保留任何 null 值。上述插入将这些隐式转换为其各自类型的默认值 - 整数为 0，字符串为空值。ClickHouse 还会自动将任何数字转换为其目标精度。

## 在 ClickHouse 中的主键（排序键） {#primary-ordering-keys-in-clickhouse}

来自 OLTP 数据库的用户通常会寻找 ClickHouse 中的等效概念。在注意到 ClickHouse 支持 `PRIMARY KEY` 语法时，用户可能会倾向于使用与其源 OLTP 数据库相同的键定义其表模式。这是不合适的。

### ClickHouse 主键有何不同？ {#how-are-clickhouse-primary-keys-different}

为了理解为什么在 ClickHouse 中使用 OLTP 主键不合适，用户应了解 ClickHouse 索引的基本知识。我们以 Postgres 作为示例进行比较，但这些一般概念适用于其他 OLTP 数据库。

- Postgres 主键，按定义是每行唯一的。使用 [B 树结构](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) 可有效查看该键的单行。虽然 ClickHouse 可以针对单行值进行优化，但分析工作负载通常需要读取几个列，但用于许多行。过滤器通常需要确定 **一部分行** 以进行聚合。
- 内存和磁盘效率对 ClickHouse 经常使用的规模至关重要。数据以称为 parts 的块写入 ClickHouse 表，合并 部分的规则在后台应用。在 ClickHouse 中，每个部分都有自己的主索引。当部分被合并时，合并部分的主索引也会被合并。与 Postgres 不同，这些索引不是为每行构建的。相反，部分的主索引具有每组行一个索引条目 - 这种技术称为 **稀疏索引**。
- **稀疏索引** 之所以可能，是因为 ClickHouse 将部分的行按指定键有序存储在磁盘上。稀疏主索引允许它快速（通过索引条目的二进制搜索）识别可能匹配查询的行组。找到的可能匹配的行组随后将并行传输到 ClickHouse 引擎以查找匹配项。这种索引设计允许主索引小（它完全适合主内存），同时仍显著加快查询执行时间，尤其是对于数据分析用例中的典型范围查询。有关更多详细信息，我们推荐此 [深入指南](/guides/best-practices/sparse-primary-indexes)。

<br />

<img src={postgres_b_tree} class="image" alt="PostgreSQL B-Tree Index" style={{width: '800px'}} />

<br />

<img src={postgres_sparse_index} class="image" alt="PostgreSQL Sparse Index" style={{width: '800px'}} />

<br />

在 ClickHouse 中选择的键将决定不仅是索引，也决定数据在磁盘上写入的顺序。因此，它可以显著影响压缩级别，这反过来又会影响查询性能。使大多数列的值以连续顺序写入的排序键将使所选压缩算法（和编解码器）更有效地压缩数据。

> 表中的所有列将根据指定排序键的值进行排序，无论它们是否包含在键中。例如，如果 `CreationDate` 用作键，则所有其他列的值的顺序将对应于 `CreationDate` 列中值的顺序。可以指定多个排序键 - 这将按照与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义进行排序。

### 选择排序键 {#choosing-an-ordering-key}

关于选择排序键的考虑和步骤，以 posts 表为例，请参见 [此处](/data-modeling/schema-design#choosing-an-ordering-key)。

## 压缩 {#compression}

ClickHouse 的列式存储意味着与 Postgres 相比，压缩效果通常会显著更好。以下是比较两个数据库中所有 Stack Overflow 表的存储需求的示例：

```sql title="查询 (Postgres)"
SELECT
    schemaname,
    tablename,
    pg_total_relation_size(schemaname || '.' || tablename) AS total_size_bytes,
    pg_total_relation_size(schemaname || '.' || tablename) / (1024 * 1024 * 1024) AS total_size_gb
FROM
    pg_tables s
WHERE
    schemaname = 'public';
```

```sql title="查询 (ClickHouse)"
SELECT
	`table`,
	formatReadableSize(sum(data_compressed_bytes)) AS compressed_size
FROM system.parts
WHERE (database = 'stackoverflow') AND active
GROUP BY `table`
```

```response title="响应"
┌─table───────┬─compressed_size─┐
│ posts       │ 25.17 GiB  	│
│ users       │ 846.57 MiB 	│
│ badges      │ 513.13 MiB 	│
│ comments    │ 7.11 GiB   	│
│ votes       │ 1.28 GiB   	│
│ posthistory │ 40.44 GiB  	│
│ postlinks   │ 79.22 MiB  	│
└─────────────┴─────────────────┘
```

有关优化和测量压缩的更多详细信息，请参见 [此处](/data-compression/compression-in-clickhouse)。

[点击这里进入第 3 部分](/migrations/postgresql/data-modeling-techniques).
