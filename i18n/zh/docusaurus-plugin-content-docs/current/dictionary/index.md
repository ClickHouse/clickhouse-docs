---
slug: /dictionary
title: '字典'
keywords: ['dictionary', 'dictionaries']
description: '字典以键值对形式表示数据，以实现快速查找。'
doc_type: 'reference'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# 字典

ClickHouse 中的字典以内存中的 [key-value](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 形式表示来自多种[内部和外部数据源](/sql-reference/dictionaries#dictionary-sources)的数据，从而对超低延迟的查找查询进行优化。

字典适用于以下场景：
- 提升查询性能，尤其是在与 `JOIN` 一起使用时
- 在不减慢数据摄取过程的情况下，实时丰富已摄取的数据

<Image img={dictionaryUseCases} size="lg" alt="ClickHouse 中字典的使用场景"/>



## 使用字典加速连接 {#speeding-up-joins-using-a-dictionary}

字典可用于加速特定类型的 `JOIN`:即 [`LEFT ANY` 类型](/sql-reference/statements/select/join#supported-types-of-join),其中连接键需要与底层键值存储的键属性相匹配。

<Image
  img={dictionaryLeftAnyJoin}
  size='sm'
  alt='使用字典进行 LEFT ANY JOIN'
/>

在这种情况下,ClickHouse 可以利用字典执行[直接连接](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join)。这是 ClickHouse 最快的连接算法,适用于右侧表的底层[表引擎](/engines/table-engines)支持低延迟键值请求的场景。ClickHouse 有三种表引擎提供此功能:[Join](/engines/table-engines/special/join)(本质上是预先计算的哈希表)、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 和 [Dictionary](/engines/table-engines/special/dictionary)。我们将介绍基于字典的方法,但这三种引擎的工作机制是相同的。

直接连接算法要求右侧表由字典支持,使得该表中待连接的数据已经以低延迟键值数据结构的形式存在于内存中。

### 示例 {#example}

使用 Stack Overflow 数据集,让我们来回答这个问题:
_Hacker News 上关于 SQL 最具争议的帖子是什么?_

我们将争议性定义为帖子的赞成票和反对票数量相近的情况。我们计算这个绝对差值,其中值越接近 0 表示争议性越大。我们假设帖子必须至少有 10 个赞成票和 10 个反对票 - 人们不投票的帖子并不具有争议性。

在数据规范化后,此查询目前需要使用 `posts` 和 `votes` 表进行 `JOIN`:

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

> **在 `JOIN` 右侧使用较小的数据集**:此查询可能看起来比所需的更冗长,对 `PostId` 的过滤在外部查询和子查询中都出现了。这是一种性能优化,可确保查询响应时间快速。为了获得最佳性能,始终确保 `JOIN` 的右侧是较小的数据集并且尽可能小。有关优化 JOIN 性能和了解可用算法的技巧,我们推荐[这一系列博客文章](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。

虽然此查询速度很快,但它依赖于我们仔细编写 `JOIN` 以实现良好的性能。理想情况下,我们只需将帖子过滤为包含 "SQL" 的帖子,然后查看博客子集的 `UpVote` 和 `DownVote` 计数来计算我们的指标。

#### 应用字典 {#applying-a-dictionary}

为了演示这些概念,我们对投票数据使用字典。由于字典通常保存在内存中([ssd_cache](/sql-reference/dictionaries#ssd_cache) 是例外),用户应该注意数据的大小。确认我们的 `votes` 表大小:


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

数据将在我们的字典中以未压缩形式存储，因此如果要在字典中存储所有列（虽然我们不会这么做），至少需要 4GB 内存。字典会在整个集群中复制，因此这部分内存需要为*每个节点*单独预留。

> 在下面的示例中，我们字典中的数据来自一个 ClickHouse 表。虽然这是最常见的字典数据源，但还支持[多种数据源](/sql-reference/dictionaries#dictionary-sources)，包括文件、HTTP，以及包括 [Postgres](/sql-reference/dictionaries#postgresql) 在内的数据库。正如我们将展示的那样，字典可以自动刷新，为那些经常发生变化的小型数据集提供了一种理想的方式，使其可以直接用于 JOIN。

我们的字典需要一个用于执行查找的主键。这在概念上与事务型数据库的主键相同，并且应当是唯一的。上面的查询需要在 JOIN 键 `PostId` 上执行查找。字典则应当使用 `votes` 表中每个 `PostId` 对应的赞成票和反对票总数进行填充。下面是获取该字典数据的查询：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

要创建我们的字典，需要如下 DDL——请注意上面使用的查询：

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

> 在自管的开源部署中，需要在所有节点上执行上述命令。在 ClickHouse Cloud 中，字典会自动复制到所有节点。上述操作是在一台拥有 64GB 内存的 ClickHouse Cloud 节点上执行的，加载耗时 36 秒。

为确认字典实际占用的内存：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

现在，可以通过一个简单的 `dictGet` 函数来获取特定 `PostId` 的赞成票和反对票。下面我们检索帖子 `11227902` 对应的这些值：

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

返回 3 行。用时:0.551 秒。处理了 1.1964 亿行,3.29 GB(2.1696 亿行/秒,5.97 GB/秒)。
峰值内存使用量:552.26 MiB。
```

这个查询不仅要简单得多，速度也快了两倍以上！还可以进一步优化，例如只将赞成票和反对票总数超过 10 的帖子加载到字典中，并且只存储预先计算好的“争议度”数值。


## 查询时数据增强 {#query-time-enrichment}

字典可用于在查询时查找值。这些值可以在结果中返回或用于聚合。假设我们创建一个字典将用户 ID 映射到其所在位置:

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

我们可以使用此字典来增强帖子结果:

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

与上面的连接示例类似,我们可以使用同一字典来高效地确定大多数帖子的来源位置:

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


## 插入时数据增强 {#index-time-enrichment}

在上述示例中,我们在查询时使用字典来消除连接操作。字典也可以用于在插入时增强行数据。如果增强值不会改变且存在于可用于填充字典的外部数据源中,这种方式通常是合适的。在这种情况下,在插入时增强行数据可以避免查询时对字典的查找操作。

假设 Stack Overflow 中用户的 `Location` 永远不会改变(实际上会改变)——具体来说是 `users` 表的 `Location` 列。假设我们想要按位置对 posts 表进行分析查询。该表包含一个 `UserId`。

字典提供了从用户 ID 到位置的映射,由 `users` 表支持:

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

> 我们省略了 `Id < 0` 的用户,这使我们能够使用 `Hashed` 字典类型。`Id < 0` 的用户是系统用户。

要在 posts 表插入时利用此字典,我们需要修改表结构:

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

在上述示例中,`Location` 被声明为 `MATERIALIZED` 列。这意味着该值可以作为 `INSERT` 查询的一部分提供,并且始终会被计算。

> ClickHouse 还支持 [`DEFAULT` 列](/sql-reference/statements/create/table#default_values)(如果未提供值,则可以插入或计算该值)。

要填充表,我们可以使用常规的从 S3 执行 `INSERT INTO SELECT`:

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

现在我们可以获取大多数帖子来源的位置名称:

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

`LAYOUT` 子句控制字典的内部数据结构。有多种选项可供选择,详细文档请参见[此处](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory)。关于如何选择正确布局的一些建议可以在[此处](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout)找到。

### 刷新字典 {#refreshing-dictionaries}

我们为字典指定了 `LIFETIME` 为 `MIN 600 MAX 900`。LIFETIME 是字典的更新间隔,此处的值会使字典在 600 到 900 秒之间的随机间隔进行周期性重新加载。这个随机间隔是必要的,以便在大量服务器上更新时分散字典源的负载。在更新期间,仍然可以查询字典的旧版本,只有初始加载会阻塞查询。请注意,设置 `(LIFETIME(0))` 会阻止字典更新。
可以使用 `SYSTEM RELOAD DICTIONARY` 命令强制重新加载字典。

对于 ClickHouse 和 Postgres 等数据库源,您可以设置一个查询,使字典仅在真正发生变化时才更新(由查询的响应决定),而不是按周期性间隔更新。更多详细信息可以在[此处](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)找到。

### 其他字典类型 {#other-dictionary-types}

ClickHouse 还支持[层级](/sql-reference/dictionaries#hierarchical-dictionaries)、[多边形](/sql-reference/dictionaries#polygon-dictionaries)和[正则表达式](/sql-reference/dictionaries#regexp-tree-dictionary)字典。

### 延伸阅读 {#more-reading}

- [使用字典加速查询](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典的高级配置](/sql-reference/dictionaries)
