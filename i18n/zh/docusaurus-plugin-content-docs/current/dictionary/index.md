---
slug: /dictionary
title: '字典'
keywords: ['dictionary', 'dictionaries']
description: '字典以键值对形式表示数据，以支持快速查找。'
doc_type: 'reference'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# 字典 {#dictionary}

ClickHouse 中的字典以内存中的 [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 形式表示来自各种[内部和外部数据源](/sql-reference/dictionaries#dictionary-sources)的数据，并针对超低延迟的查找查询进行了优化。

字典可用于：

- 提高查询性能，尤其是在与 `JOIN` 一起使用时
- 在不减慢摄取过程的情况下，实时丰富已摄取的数据

<Image img={dictionaryUseCases} size="lg" alt="ClickHouse 中字典的使用场景"/>

## 使用字典加速 JOIN {#speeding-up-joins-using-a-dictionary}

字典（Dictionary）可以用于加速特定类型的 `JOIN`：即 [`LEFT ANY` 类型](/sql-reference/statements/select/join#supported-types-of-join)，其中 JOIN 键需要与底层键值存储的键属性匹配。

<Image img={dictionaryLeftAnyJoin} size="sm" alt="Using Dictionary with LEFT ANY JOIN"/>

在这种情况下，ClickHouse 可以利用字典来执行 [Direct Join](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join)。这是 ClickHouse 中最快的 JOIN 算法，适用于右表的底层[表引擎](/engines/table-engines)支持低延迟键值请求的场景。ClickHouse 为此提供了三种表引擎：[Join](/engines/table-engines/special/join)（本质上是预计算的哈希表）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 和 [Dictionary](/engines/table-engines/special/dictionary)。我们将介绍基于字典的方案，但三种引擎的机制是相同的。

Direct Join 算法要求右表由字典驱动，这样来自该表、需要参与 JOIN 的数据就已经以内存中的低延迟键值数据结构形式存在。

### 示例 {#example}

使用 [Stack Overflow 数据集](/getting-started/example-datasets/stackoverflow)，来回答这样一个问题：
*在 Hacker News 上，关于 SQL 的帖子中，哪一条是最具争议性的？*

我们将“有争议性”定义为：帖子获得的赞成票和反对票数量相近。我们会计算这两者的绝对差值，数值越接近 0，代表争议越大。我们还假设帖子必须至少有 10 个赞成票和 10 个反对票——几乎没人投票的帖子并不算很有争议。

在对数据进行规范化之后，这个查询目前需要对 `posts` 表和 `votes` 表执行一次 `JOIN` 操作：

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

结果集包含 1 行。耗时: 1.283 秒。处理了 4.1844 亿行，7.23 GB (每秒 3.2607 亿行，5.63 GB/秒)。
峰值内存使用: 3.18 GiB。
```

> **在 `JOIN` 的右侧使用较小的数据集**：这个查询看起来比实际需要的更啰嗦一些，因为对 `PostId` 的过滤同时出现在外层查询和子查询中。这是一种性能优化，用于确保查询响应时间足够快。为了获得最佳性能，应始终确保 `JOIN` 右侧的数据集更小，并且尽可能小。关于优化 JOIN 性能以及理解可用算法的建议，我们推荐阅读[这系列博客文章](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。

虽然这个查询很快，但它要求我们在编写 `JOIN` 时格外小心，才能获得良好的性能。理想情况下，我们只需先过滤出包含“SQL”的帖子，然后再查看这部分帖子对应的 `UpVote` 和 `DownVote` 计数来计算我们的指标。


#### 应用字典 {#applying-a-dictionary}

为了演示这些概念，我们为投票数据使用一个字典。由于字典通常存放在内存中（[ssd&#95;cache](/sql-reference/dictionaries#ssd_cache) 是一个例外），用户应当注意数据的大小。先确认一下我们的 `votes` 表的大小：

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

数据将在我们的字典中以未压缩形式存储，因此如果要将所有列（实际上我们不会这样做）都存入字典，至少需要 4GB 内存。字典会在集群中进行复制，因此这部分内存需要 *按节点* 预留。

> 在下面的示例中，我们字典的数据来源于一个 ClickHouse 表。虽然这是字典最常见的数据源，但还支持[多种数据源](/sql-reference/dictionaries#dictionary-sources)，包括文件、HTTP 以及包括 [Postgres](/sql-reference/dictionaries#postgresql) 在内的各类数据库。正如我们将展示的那样，字典可以自动刷新，为小型且经常变更的数据集提供了一种理想方式，使其可用于直接进行 join 操作。

我们的字典需要一个用于执行查找的主键。这在概念上与事务型数据库中的主键相同，并且必须唯一。上面的查询需要在 join 键 `PostId` 上执行查找。字典应相应地填充为来自 `votes` 表的每个 `PostId` 的赞成票和反对票总数。下面是获取该字典数据的查询：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

要创建我们的字典，需要使用以下 DDL——请注意其中使用了上面的查询：

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

> 在自管理 OSS 中，需要在所有节点上执行上述命令。在 ClickHouse Cloud 中，字典会自动复制到所有节点。上述操作是在一台具有 64GB 内存的 ClickHouse Cloud 节点上执行的，加载耗时 36 秒。

要确认我们的字典内存占用情况：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

现在，可以通过一个简单的 `dictGet` FUNCTION 来获取特定 `PostId` 的赞成票和反对票。下面我们检索 `PostId` 为 `11227902` 的帖子对应的这些值：


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

返回 3 行。耗时:0.551 秒。处理了 1.1964 亿行,3.29 GB(每秒 2.1696 亿行,5.97 GB/秒)。
峰值内存使用量:552.26 MiB。
```

这个查询不仅简单得多，而且速度也提升了两倍多！还可以通过只将赞成票和反对票之和超过 10 的帖子加载到字典中，并仅存储预先计算好的争议度值来进一步优化。


## 查询时富化 {#query-time-enrichment}

字典可以用于在查询时查找值。这些值可以在查询结果中返回，或用于聚合运算。假设我们创建一个字典，将用户 ID 映射到其所在地：

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

我们可以使用该字典来丰富 POST 请求的结果：

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

返回 5 行。用时:0.033 秒。处理了 425 万行,82.84 MB(每秒 1.3062 亿行,2.55 GB/秒)。
内存峰值:249.32 MiB。
```

与上面的 join 示例类似，我们可以使用同一个字典，高效判断大部分帖子是从哪里发出的：

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


## 索引时富化 {#index-time-enrichment}

在上面的示例中，我们在查询时使用字典来避免一次 join 操作。字典也可以用于在插入时对行进行富化。如果富化值不会变化，并且存在于可用于填充字典的外部数据源中，这通常是一个合适的做法。在这种情况下，在插入时对行进行富化可以避免在查询时对字典进行查找。

假设 Stack Overflow 中某个用户的 `Location` 永远不变（实际上会变）——具体来说，是 `users` 表中的 `Location` 列。假设我们希望对 `posts` 表按地点进行分析查询。该表包含一个 `UserId`。

字典提供了从用户 ID 到位置信息的映射，并以 `users` 表为数据源：

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

> 我们排除 `Id < 0` 的用户，这样就可以使用 `Hashed` 字典类型。`Id < 0` 的用户是系统用户。

为了在向 posts 表插入数据时利用这个字典，我们需要修改表结构（schema）：

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

在上面的示例中，`Location` 被声明为 `MATERIALIZED` 列。这意味着其值可以作为 `INSERT` 查询的一部分提供，并且始终会被计算。

> ClickHouse 还支持 [`DEFAULT` columns](/sql-reference/statements/create/table#default_values)（在这种情况下，如果未提供值，则可以插入该值或由系统计算）。

为了填充该表，我们可以像往常一样使用来自 S3 的 `INSERT INTO SELECT`：

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

返回 0 行。耗时：36.830 秒。处理了 2.3898 亿行，2.64 GB（649 万行/秒，71.79 MB/秒）
```

现在我们可以获取大多数帖子发布地的名称：

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

返回 4 行。用时:0.142 秒。已处理 5982 万行,1.08 GB(420.73 百万行/秒,7.60 GB/秒)。
内存峰值:666.82 MiB。
```


## 字典高级主题 {#advanced-dictionary-topics}

### 选择字典 `LAYOUT` {#choosing-the-dictionary-layout}

`LAYOUT` 子句控制字典的内部数据结构。有多种可用选项，其文档见[此处](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory)。关于如何选择合适布局的一些建议见[这里](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)。

### 刷新字典 {#refreshing-dictionaries}

我们为字典指定了 `LIFETIME MIN 600 MAX 900`。`LIFETIME` 用于控制字典的更新间隔，上述取值会使字典在 600 到 900 秒之间的随机时间间隔内周期性地重新加载。这个随机间隔是必要的，以便在大量服务器进行更新时分散对字典数据源的负载。在更新过程中，旧版本的字典仍然可以被查询，只有初始加载时才会阻塞查询。注意，将 `LIFETIME(0)` 进行设置会禁止字典更新。
可以使用 `SYSTEM RELOAD DICTIONARY` 命令强制重新加载字典。

对于 ClickHouse 和 Postgres 等数据库数据源，你可以设置一个查询，仅在字典数据确实发生变化时才更新字典（由该查询的响应来决定），而不是按固定周期更新。更多详细信息请参见[此处](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)。

### 其他字典类型 {#other-dictionary-types}

ClickHouse 还支持[层次结构字典](/sql-reference/dictionaries#hierarchical-dictionaries)、[多边形字典](/sql-reference/dictionaries#polygon-dictionaries)和[正则表达式字典](/sql-reference/dictionaries#regexp-tree-dictionary)。

### 延伸阅读 {#more-reading}

- [使用字典加速查询](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典的高级配置](/sql-reference/dictionaries)