---
slug: /dictionary
title: '数据字典'
keywords: ['数据字典', '字典']
description: '数据字典以键值对形式组织数据，便于快速查找。'
doc_type: 'reference'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# Dictionary

ClickHouse 中的 Dictionary 提供了一种在内存中以[键值](https://en.wikipedia.org/wiki/Key%E2%80%93value_database)形式表示来自多种[内部和外部数据源](/sql-reference/dictionaries#dictionary-sources)的数据的机制，并针对超低延迟的查找查询进行了优化。

Dictionary 适用于：
- 提升查询性能，特别是在与 `JOIN` 配合使用时
- 在不减慢摄取过程的情况下，对摄取数据进行实时丰富

<Image img={dictionaryUseCases} size="lg" alt="ClickHouse 中 Dictionary 的使用场景"/>



## 使用 Dictionary 加速 JOIN

Dictionaries 可用于加速特定类型的 `JOIN`：即 [`LEFT ANY` 类型](/sql-reference/statements/select/join#supported-types-of-join)，其中 JOIN 键需要与底层键值存储的键属性匹配。

<Image img={dictionaryLeftAnyJoin} size="sm" alt="在 LEFT ANY JOIN 中使用 Dictionary" />

在这种情况下，ClickHouse 可以利用 Dictionary 执行 [Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join)。这是 ClickHouse 速度最快的 JOIN 算法，适用于右表的底层 [table engine](/engines/table-engines) 支持低延迟键值请求的场景。ClickHouse 提供了三种满足该条件的表引擎：[Join](/engines/table-engines/special/join)（本质上是一个预计算哈希表）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 和 [Dictionary](/engines/table-engines/special/dictionary)。我们将重点介绍基于 Dictionary 的方法，但这三种引擎的机制是相同的。

Direct Join 算法要求右表由 Dictionary 提供支持，即该表中需要参与 JOIN 的数据已以内存中的低延迟键值数据结构形式存在。

### 示例

使用 Stack Overflow 数据集，让我们来回答这个问题：
*关于 SQL 的哪条 Hacker News 帖子最具争议性？*

我们将“具争议性”定义为：帖子获得的赞成票和反对票数量相近。我们计算两者的绝对差值，值越接近 0 表示争议越大。我们假定帖子至少要有 10 个赞成票和 10 个反对票——没人投票的帖子并不算很有争议。

在数据已规范化的前提下，这个查询目前需要在 `posts` 和 `votes` 表之间执行一次 `JOIN`：

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

第 1 行:
──────
Id:                     25372161
Title:                  How to add exception handling to SqlDataSource.UpdateCommand
UpVotes:                13
DownVotes:              13
Controversial_ratio: 0

返回 1 行。用时:1.283 秒。已处理 4.1844 亿行,7.23 GB(3.2607 亿行/秒,5.63 GB/秒)。
内存峰值:3.18 GiB。
```

> **在 `JOIN` 的右侧使用较小的数据集**：这个查询看起来比必要的更冗长，因为对 `PostId` 的过滤同时发生在外层查询和子查询中。这是一种性能优化，用于确保查询响应时间足够快。为了获得最佳性能，请始终确保 `JOIN` 右侧的数据集较小，并尽可能小。关于如何优化 JOIN 性能以及了解可用算法的更多提示，我们推荐阅读[这一系列博客文章](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。

虽然这个查询很快，但它依赖我们谨慎地编写 `JOIN` 才能获得良好的性能。理想情况下，我们只需先将帖子过滤为那些包含 “SQL” 的内容，然后再查看这一子集博客的 `UpVote` 和 `DownVote` 计数来计算我们的指标。

#### 使用字典

为了演示这些概念，我们为投票数据使用字典。由于字典通常存放在内存中（[ssd&#95;cache](/sql-reference/dictionaries#ssd_cache) 是个例外），用户应当注意数据的大小。先确认一下我们的 `votes` 表的大小：


```sql
SELECT 表,
        formatReadableSize(sum(data_compressed_bytes)) AS 压缩后大小,
        formatReadableSize(sum(data_uncompressed_bytes)) AS 未压缩大小,
        round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS 压缩比
FROM system.columns
WHERE 表 IN ('votes')
GROUP BY 表

┌─表───────────┬─压缩后大小─┬─未压缩大小─┬─压缩比─┐
│ votes           │ 1.25 GiB        │ 3.79 GiB          │  3.04 │
└─────────────────┴─────────────────┴───────────────────┴───────┘
```

数据将在我们的字典中以未压缩形式存储，因此如果要在字典中存储所有列（实际我们不会这么做），则至少需要 4GB 内存。字典会在集群中的各个节点间进行复制，因此这部分内存需要为*每个节点*预留。

> 在下面的示例中，我们字典的数据来源于一张 ClickHouse 表。虽然这是最常见的字典数据源，但还支持[多种数据源](/sql-reference/dictionaries#dictionary-sources)，包括文件、HTTP，以及包含 [Postgres](/sql-reference/dictionaries#postgresql) 在内的各类数据库。正如下文所示，字典可以自动刷新，是确保那些经常变动的小型数据集始终可以用于直接 JOIN 的理想方式。

我们的字典需要一个用于执行查找的主键。在概念上，它与事务型数据库中的主键相同，并且应当是唯一的。上面的查询需要在关联键 `PostId` 上进行查找。字典本身则应填充为来自 `votes` 表的每个 `PostId` 的赞成票和反对票的总数。下面是获取该字典数据的查询：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

要创建我们的字典，我们需要执行以下 DDL——请注意其中使用了上面的查询：

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

> 在自管理的开源部署中，需要在所有节点上执行上述命令。在 ClickHouse Cloud 中，字典会自动复制到所有节点。上述命令是在一台具有 64GB 内存的 ClickHouse Cloud 节点上执行的，加载耗时 36 秒。

要确认我们的字典占用的内存：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

现在，你可以通过一个简单的 `dictGet` 函数来获取特定 `PostId` 的赞成票和反对票数。下面我们检索帖子 `11227902` 的这些值：

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘

利用这一特性,我们可以在之前的查询中移除 JOIN:

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

返回 3 行。耗时:0.551 秒。处理了 1.1964 亿行,3.29 GB(2.1696 亿行/秒,5.97 GB/秒)。
峰值内存使用量:552.26 MiB。
```

这个查询不仅更加简单，而且执行速度也快了两倍多！还可以进一步优化，只将赞成票和反对票合计超过 10 的帖子加载到字典中，并只存储预先计算好的“争议度”数值。


## 查询时富化

可以在查询时使用字典来查找值。这些值可以直接在结果中返回，或用于聚合操作。假设我们创建一个字典，用于将用户 ID 映射到其位置：

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

我们可以使用此字典来丰富查询结果：

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
│ 52296928 │ ClickHouse 中两个字符串的比较                  │ Spain                 │
│ 52345137 │ 如何使用文件将数据从 MySQL 迁移到 ClickHouse? │ 中国江苏省Nanjing Shi   │
│ 61452077 │ 如何在 ClickHouse 中更改 PARTITION                         │ Guangzhou, 广东省中国   │
│ 55608325 │ ClickHouse 在不使用 max() 的情况下选择表中最后一条记录      │ Moscow, Russia        │
│ 55758594 │ ClickHouse 创建临时表                             │ Perm', Russia         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

返回 5 行。耗时:0.033 秒。处理了 425 万行,82.84 MB(每秒 1.3062 亿行,2.55 GB/秒)。
峰值内存使用量:249.32 MiB。
```

与上面的 JOIN 示例类似，我们可以使用同一个字典高效地确定大多数帖子来自哪里：

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

5 行结果。耗时：0.763 秒。处理了 59.82 百万行，239.28 MB（78.40 百万行/秒，313.60 MB/秒）。
峰值内存使用：248.84 MiB。
```


## 索引时富化

在上面的示例中，我们在查询时使用了字典来去掉一次 JOIN。字典也可以在插入时用于对行进行富化。通常当富化值不会变化，并且存在于可用于填充字典的外部数据源中时，这种方式是合适的。在这种情况下，在插入时对行进行富化可以避免在查询时再去查找字典。

假设 Stack Overflow 中用户的 `Location` 从不改变（实际上是会变的）——更具体地说是 `users` 表的 `Location` 列。假设我们希望在 `posts` 表上按位置进行分析查询。`posts` 表中包含一个 `UserId`。

字典提供了一个从用户 id 到位置的映射，并以 `users` 表为后端：

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

> 我们忽略 `Id < 0` 的用户，以便可以使用 `Hashed` 字典类型。`Id < 0` 的用户是系统用户。

要在向 `posts` 表插入数据时利用这个字典，我们需要修改该表的 schema：

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

在上面的示例中，`Location` 被声明为一个 `MATERIALIZED` 列。这意味着该值可以作为 `INSERT` 查询的一部分提供，并且始终会被计算。

> ClickHouse 也支持 [`DEFAULT` 列](/sql-reference/statements/create/table#default_values)（在这种情况下，值既可以被显式插入，也可以在未提供时自动计算）。

为了向该表填充数据，我们可以像往常一样从 S3 使用 `INSERT INTO SELECT`：

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

返回 0 行。耗时：36.830 秒。处理了 2.3898 亿行，2.64 GB（649 万行/秒，71.79 MB/秒）
```

现在我们可以找出大多数帖子发布地点的名称：

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

4 行结果。耗时：0.142 秒。处理了 59.82 百万行，1.08 GB（420.73 百万行/秒，7.60 GB/秒）。
峰值内存使用：666.82 MiB。
```


## 字典进阶主题 {#advanced-dictionary-topics}

### 选择字典 `LAYOUT` {#choosing-the-dictionary-layout}

`LAYOUT` 子句控制字典的内部数据结构。可用的布局类型有多种，其说明文档见[此处](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory)。关于如何选择合适布局的一些建议可以在[这里](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)找到。

### 刷新字典 {#refreshing-dictionaries}

我们为该字典指定的 `LIFETIME` 为 `MIN 600 MAX 900`。LIFETIME 表示字典的更新间隔，上述配置会使字典在 600 到 900 秒之间的随机时间点进行周期性重新加载。这个随机间隔是必要的，用于在大量服务器更新时分散对字典源的负载。在更新期间，旧版本的字典仍然可以被查询，只有初次加载会阻塞查询。请注意，设置 `(LIFETIME(0))` 将禁止字典更新。
可以使用 `SYSTEM RELOAD DICTIONARY` 命令强制重新加载字典。

对于 ClickHouse 和 Postgres 等数据库源，可以配置查询，让字典仅在数据确实发生变化时才更新（由该查询的响应决定），而不是按固定周期更新。更多细节请参见[此处](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)。

### 其他字典类型 {#other-dictionary-types}

ClickHouse 还支持[层次字典](/sql-reference/dictionaries#hierarchical-dictionaries)、[多边形字典](/sql-reference/dictionaries#polygon-dictionaries)和[正则表达式字典](/sql-reference/dictionaries#regexp-tree-dictionary)。

### 延伸阅读 {#more-reading}

- [使用字典加速查询](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典的高级配置](/sql-reference/dictionaries)
