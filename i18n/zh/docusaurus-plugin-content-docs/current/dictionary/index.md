---
'slug': '/dictionary'
'title': '字典'
'keywords':
- 'dictionary'
- 'dictionaries'
'description': '字典提供数据的键值表示，以便快速查找。'
'doc_type': 'reference'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# 字典

ClickHouse中的字典提供了来自各种 [内部和外部源](/sql-reference/dictionaries#dictionary-sources) 的数据的内存 [键值](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表示，优化了超低延迟查找查询。

字典的用途包括：
- 提高查询性能，尤其是在与 `JOIN` 一起使用时
- 在不中断数据摄取过程的情况下动态丰富摄取的数据

<Image img={dictionaryUseCases} size="lg" alt="ClickHouse中字典的使用案例"/>

## 使用字典加速连接 {#speeding-up-joins-using-a-dictionary}

字典可以用来加速特定类型的 `JOIN`：[`LEFT ANY` 类型](/sql-reference/statements/select/join#supported-types-of-join)，其中连接键需要匹配底层键值存储的键属性。

<Image img={dictionaryLeftAnyJoin} size="sm" alt="使用字典与LEFT ANY JOIN"/>

如果是这种情况，ClickHouse可以利用字典执行 [直接连接](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join)。这是ClickHouse最快的连接算法，适用于右侧表的底层 [表引擎](/engines/table-engines) 支持低延迟键值请求。ClickHouse有三个提供此功能的表引擎：[Join](/engines/table-engines/special/join)（实际上是预计算的哈希表）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 和 [Dictionary](/engines/table-engines/special/dictionary)。我们将描述基于字典的方法，但这三种引擎的机制是相同的。

直接连接算法要求右侧表由字典支持，以便待连接的数据以低延迟键值数据结构的形式存在于内存中。

### 示例 {#example}

使用Stack Overflow数据集，我们来回答这个问题：
*关于SQL的争议帖子是什么？*

我们将定义争议为当帖子有相似数量的赞成票和反对票时。我们计算这个绝对差值，值越接近0表示争议越大。我们假设帖子必须至少有10个赞成票和反对票——没有人投票的帖子并不是很有争议。

在我们的数据规范化之后，这个查询目前需要使用 `posts` 和 `votes` 表的 `JOIN`：

```sql
WITH PostIds AS
(
         SELECT Id
         FROM posts
         WHERE Title ILIKE '%SQL%'
)
SELECT
    Id,
    Title,
    UpVotes,
    DownVotes,
    abs(UpVotes - DownVotes) AS Controversial_ratio
FROM posts
INNER JOIN
(
    SELECT
         PostId,
         countIf(VoteTypeId = 2) AS UpVotes,
         countIf(VoteTypeId = 3) AS DownVotes
    FROM votes
    WHERE PostId IN (PostIds)
    GROUP BY PostId
    HAVING (UpVotes > 10) AND (DownVotes > 10)
) AS votes ON posts.Id = votes.PostId
WHERE Id IN (PostIds)
ORDER BY Controversial_ratio ASC
LIMIT 1

Row 1:
──────
Id:                     25372161
Title:                  How to add exception handling to SqlDataSource.UpdateCommand
UpVotes:                13
DownVotes:              13
Controversial_ratio: 0

1 rows in set. Elapsed: 1.283 sec. Processed 418.44 million rows, 7.23 GB (326.07 million rows/s., 5.63 GB/s.)
Peak memory usage: 3.18 GiB.
```

>**在 `JOIN` 的右侧使用较小的数据集**：这个查询可能看起来比实际所需的冗长，因为在外层和子查询中都对 `PostId` 进行过滤。这是一种性能优化，确保查询响应时间快速。为了获得最佳性能，始终确保 `JOIN` 的右侧是较小的集合，并尽可能小。有关优化 `JOIN` 性能和理解可用算法的提示，我们建议 [这系列博客文章](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。

尽管这个查询很快，但它依赖于我们仔细编写 `JOIN` 来实现良好的性能。理想情况下，我们会在查看子集的 `UpVote` 和 `DownVote` 计数之前，仅过滤包含“SQL”的帖子，以便计算我们的指标。

#### 应用字典 {#applying-a-dictionary}

为了展示这些概念，我们使用字典来处理我们的投票数据。由于字典通常存储在内存中（[ssd_cache](/sql-reference/dictionaries#ssd_cache) 是例外），用户应注意数据的大小。确认我们的 `votes` 表的大小：

```sql
SELECT table,
        formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
        formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
        round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table IN ('votes')
GROUP BY table

┌─table───────────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ votes           │ 1.25 GiB        │ 3.79 GiB          │  3.04 │
└─────────────────┴─────────────────┴───────────────────┴───────┘
```

数据将在我们的字典中未压缩存储，因此如果我们要在字典中存储所有列（我们不会），则需要至少4GB的内存。字典将在我们的集群中复制，因此此内存量需要按 *节点* 保留。

> 在下面的示例中，我们的字典数据源来自一个ClickHouse表。虽然这代表了字典中最常见的数据源，但支持包括文件、http和数据库（如 [Postgres](/sql-reference/dictionaries#postgresql)）在内的 [许多来源](/sql-reference/dictionaries#dictionary-sources)。正如我们将展示的，字典可以自动刷新，提供了一种理想的方式来确保频繁更改的小数据集可用于直接连接。

我们的字典需要一个主键，用于进行查找。这在概念上与事务性数据库的主键相同，并且应该是唯一的。我们上述的查询需要在连接键上进行查找 - `PostId`。字典应填充自 `votes` 表的每个 `PostId` 的总赞成票和反对票。以下是获取此字典数据的查询：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

创建我们的字典需要以下DDL - 请注意使用我们上述的查询：

```sql
CREATE DICTIONARY votes_dict
(
  `PostId` UInt64,
  `UpVotes` UInt32,
  `DownVotes` UInt32
)
PRIMARY KEY PostId
SOURCE(CLICKHOUSE(QUERY 'SELECT PostId, countIf(VoteTypeId = 2) AS UpVotes, countIf(VoteTypeId = 3) AS DownVotes FROM votes GROUP BY PostId'))
LIFETIME(MIN 600 MAX 900)
LAYOUT(HASHED())

0 rows in set. Elapsed: 36.063 sec.
```

> 在自管理的OSS中，上述命令需要在所有节点上执行。在ClickHouse Cloud中，字典将自动复制到所有节点。上述命令在具有64GB RAM的ClickHouse Cloud节点上执行，花费了36秒来加载。

确认我们的字典所消耗的内存：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

检索特定 `PostId` 的赞成票和反对票现在可以通过一个简单的 `dictGet` 函数来实现。以下是我们为帖子 `11227902` 检索的值：

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘

Exploiting this in our earlier query, we can remove the JOIN:

WITH PostIds AS
(
        SELECT Id
        FROM posts
        WHERE Title ILIKE '%SQL%'
)
SELECT Id, Title,
        dictGet('votes_dict', 'UpVotes', Id) AS UpVotes,
        dictGet('votes_dict', 'DownVotes', Id) AS DownVotes,
        abs(UpVotes - DownVotes) AS Controversial_ratio
FROM posts
WHERE (Id IN (PostIds)) AND (UpVotes > 10) AND (DownVotes > 10)
ORDER BY Controversial_ratio ASC
LIMIT 3

3 rows in set. Elapsed: 0.551 sec. Processed 119.64 million rows, 3.29 GB (216.96 million rows/s., 5.97 GB/s.)
Peak memory usage: 552.26 MiB.
```

这个查询不仅更简单，而且还快了两倍以上！这可以通过仅将赞成票和反对票均超过10的帖子加载到字典中并仅存储预计算的争议值来进一步优化。

## 查询时丰富 {#query-time-enrichment}

字典可以在查询时查找值。这些值可以在结果中返回或用于聚合。假设我们创建一个字典，将用户ID映射到他们的位置：

```sql
CREATE DICTIONARY users_dict
(
  `Id` Int32,
  `Location` String
)
PRIMARY KEY Id
SOURCE(CLICKHOUSE(QUERY 'SELECT Id, Location FROM stackoverflow.users'))
LIFETIME(MIN 600 MAX 900)
LAYOUT(HASHED())
```

我们可以使用这个字典来丰富帖子结果：

```sql
SELECT
        Id,
        Title,
        dictGet('users_dict', 'Location', CAST(OwnerUserId, 'UInt64')) AS location
FROM posts
WHERE Title ILIKE '%clickhouse%'
LIMIT 5
FORMAT PrettyCompactMonoBlock

┌───────Id─┬─Title─────────────────────────────────────────────────────────┬─Location──────────────┐
│ 52296928 │ Comparison between two Strings in ClickHouse                  │ Spain                 │
│ 52345137 │ How to use a file to migrate data from mysql to a clickhouse? │ 中国江苏省Nanjing Shi   │
│ 61452077 │ How to change PARTITION in clickhouse                         │ Guangzhou, 广东省中国   │
│ 55608325 │ Clickhouse select last record without max() on all table      │ Moscow, Russia        │
│ 55758594 │ ClickHouse create temporary table                             │ Perm', Russia         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

与我们上述的连接示例类似，我们可以使用相同的字典高效地确定大多数帖子来自哪里：

```sql
SELECT
        dictGet('users_dict', 'Location', CAST(OwnerUserId, 'UInt64')) AS location,
        count() AS c
FROM posts
WHERE location != ''
GROUP BY location
ORDER BY c DESC
LIMIT 5

┌─location───────────────┬──────c─┐
│ India                  │ 787814 │
│ Germany                │ 685347 │
│ United States          │ 595818 │
│ London, United Kingdom │ 538738 │
│ United Kingdom         │ 537699 │
└────────────────────────┴────────┘

5 rows in set. Elapsed: 0.763 sec. Processed 59.82 million rows, 239.28 MB (78.40 million rows/s., 313.60 MB/s.)
Peak memory usage: 248.84 MiB.
```

## 索引时丰富 {#index-time-enrichment}

在上述示例中，我们在查询时使用字典来消除连接。字典还可以在插入时丰富行。这通常适用于如果丰富值不会改变并且存在于可用于填充字典的外部源中。在这种情况下，在插入时丰富行可以避免查询时查找字典。

假设Stack Overflow中用户的 `Location` 从未改变（实际上是会改变的）——具体来说是 `users` 表的 `Location` 列。假设我们希望按位置对帖子表进行分析查询。它包含一个 `UserId`。

字典提供了从用户ID到位置的映射，由 `users` 表支持：

```sql
CREATE DICTIONARY users_dict
(
    `Id` UInt64,
    `Location` String
)
PRIMARY KEY Id
SOURCE(CLICKHOUSE(QUERY 'SELECT Id, Location FROM users WHERE Id >= 0'))
LIFETIME(MIN 600 MAX 900)
LAYOUT(HASHED())
```

> 我们省略 `Id < 0` 的用户，从而允许使用 `Hashed` 字典类型。 `Id < 0` 的用户是系统用户。

为了在帖子表的插入时利用该字典，我们需要修改模式：

```sql
CREATE TABLE posts_with_location
(
    `Id` UInt32,
    `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
     ...
    `Location` MATERIALIZED dictGet(users_dict, 'Location', OwnerUserId::'UInt64')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

在上述示例中，`Location` 被声明为 `MATERIALIZED` 列。这意味着该值可以作为 `INSERT` 查询的一部分提供，并且将始终计算。

> ClickHouse还支持 [`DEFAULT` 列](/sql-reference/statements/create/table#default_values)（如果未提供，则可以插入或计算值）。

我们可以使用通常的 `INSERT INTO SELECT` 从S3填充表：

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

我们现在可以获取大多数帖子来源的地点名称：

```sql
SELECT Location, count() AS c
FROM posts_with_location
WHERE Location != ''
GROUP BY Location
ORDER BY c DESC
LIMIT 4

┌─Location───────────────┬──────c─┐
│ India                  │ 787814 │
│ Germany                │ 685347 │
│ United States          │ 595818 │
│ London, United Kingdom │ 538738 │
└────────────────────────┴────────┘

4 rows in set. Elapsed: 0.142 sec. Processed 59.82 million rows, 1.08 GB (420.73 million rows/s., 7.60 GB/s.)
Peak memory usage: 666.82 MiB.
```

## 高级字典主题 {#advanced-dictionary-topics}

### 选择字典 `LAYOUT` {#choosing-the-dictionary-layout}

`LAYOUT` 子句控制字典的内部数据结构。存在多种选项，并在 [这里](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory) 进行了文档记录。有关选择正确布局的一些提示可以在 [这里](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) 找到。

### 刷新字典 {#refreshing-dictionaries}

我们为字典指定了 `LIFETIME` 为 `MIN 600 MAX 900`。LIFETIME 是字典的更新间隔，这里的值导致在600至900秒之间的随机间隔进行周期性重新加载。这个随机间隔是必要的，以便在对大量服务器进行更新时分配字典源的负载。在更新期间，可以查询旧版本的字典，只有初始加载会阻塞查询。请注意，设置 `(LIFETIME(0))` 会阻止字典更新。
可以使用 `SYSTEM RELOAD DICTIONARY` 命令强制重新加载字典。

对于ClickHouse和Postgres等数据库来源，您可以设置一个查询，仅在字典真的发生变化时更新（查询的响应决定这一点），而不是在周期性间隔。有关进一步的细节，可以在 [这里](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) 找到。

### 其他字典类型 {#other-dictionary-types}

ClickHouse还支持 [层次](/sql-reference/dictionaries#hierarchical-dictionaries)、[多边形](/sql-reference/dictionaries#polygon-dictionaries) 和 [正则表达式](/sql-reference/dictionaries#regexp-tree-dictionary) 字典。

### 更多阅读 {#more-reading}

- [使用字典加速查询](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典的高级配置](/sql-reference/dictionaries)
