---
'slug': '/dictionary'
'title': '字典'
'keywords':
- 'dictionary'
- 'dictionaries'
'description': '字典为数据提供键值表示，用于快速查找。'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';


# 字典

ClickHouse 中的字典提供了内存中 [键值](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 数据的表示，源自各种 [内部和外部来源](/sql-reference/dictionaries#dictionary-sources)，优化了超低延迟查找查询。

字典对于以下目的非常有用：
- 提高查询性能，尤其是在使用 `JOIN` 时
- 在不减慢数据摄入过程的情况下动态丰富摄入的数据

<Image img={dictionaryUseCases} size="lg" alt="ClickHouse 中字典的用例"/>

## 使用字典加速连接 {#speeding-up-joins-using-a-dictionary}

字典可以用于加速一种特定类型的 `JOIN`：[`LEFT ANY` 类型](/sql-reference/statements/select/join#supported-types-of-join)，其中连接键需要与基础键值存储的键属性匹配。

<Image img={dictionaryLeftAnyJoin} size="sm" alt="使用字典与 LEFT ANY JOIN"/>

如果是这样，ClickHouse 可以利用字典执行 [直接连接](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join)。这是 ClickHouse 的最快连接算法，当右侧表的基础 [表引擎](/engines/table-engines) 支持低延迟键值请求时适用。ClickHouse 有三个提供此功能的表引擎：[Join](/engines/table-engines/special/join)（基本上是一个预计算的哈希表）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 和 [Dictionary](/engines/table-engines/special/dictionary)。我们将描述基于字典的方法，但三个引擎的机制是相同的。

直接连接算法要求右侧表由字典支持，使得要连接的表中的数据以低延迟键值数据结构的形式已存在于内存中。

### 示例 {#example}

使用 Stack Overflow 数据集，我们来回答这个问题：
*关于 SQL，在 Hacker News 上最具争议的帖子是什么？*

我们将“争议”定义为帖子具有相似的点赞和点踩数量。我们计算这个绝对差值，值越接近 0 意味着越具有争议。我们将假设帖子必须至少有 10 个点赞和点踩——没有人投票的帖子不算非常争议。

在我们的数据规范化后，这个查询目前需要使用 `posts` 和 `votes` 表进行 `JOIN`：

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

>**在 `JOIN` 的右侧使用较小的数据集**：这个查询可能看起来比需要的更冗长，过滤 `PostId` 的操作发生在外部查询和子查询中。这是一个性能优化，确保查询响应时间快速。为获得最佳性能，请始终确保 `JOIN` 的右侧是较小的数据集，并尽可能小。有关优化 `JOIN` 性能和理解可用算法的建议，我们推荐 [这一系列博客文章](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。

虽然这个查询很快，但它依赖于我们仔细编写 `JOIN` 来实现良好的性能。理想情况下，我们先过滤出包含“SQL”的帖子，然后再查看这些博客的 `UpVote` 和 `DownVote` 数量，以计算我们的指标。

#### 应用字典 {#applying-a-dictionary}

为了演示这些概念，我们为投票数据使用了一个字典。由于字典通常保存在内存中（[ssd_cache](/sql-reference/dictionaries#ssd_cache) 是例外），用户应该注意数据的大小。确认我们的 `votes` 表大小：

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

数据将以未压缩的形式存储在我们的字典中，因此如果我们要将所有列（我们不会）存储在字典中，至少需要 4GB 的内存。字典将在我们的集群中复制，因此这个内存量需要为 *每个节点* 保留。

> 在下面的示例中，我们的字典数据来源于 ClickHouse 表。虽然这代表了字典最常见的来源，但 [支持多种来源](/sql-reference/dictionaries#dictionary-sources)，包括文件、http 和数据库（包括 [Postgres](/sql-reference/dictionaries#postgresql)）。正如我们所示，字典可以自动刷新，提供了一个理想的方式，以确保频繁更改的小数据集可以用于直接连接。

我们的字典要求对查找执行主键。这个概念与事务数据库的主键概念相同，并且应该是唯一的。我们上面的查询需要在连接键 `PostId` 上进行查找。字典应该填充来自 `votes` 表的每个 `PostId` 的点赞和点踩数量。以下是获取该字典数据的查询：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

创建我们的字典需要以下 DDL - 请注意上面查询的使用：

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

> 在自管理的 OSS 中，上面的命令需在所有节点上执行。在 ClickHouse Cloud 中，字典将自动复制到所有节点。上述命令在一台具有 64GB 内存的 ClickHouse Cloud 节点上执行，加载耗时 36 秒。

要确认我们的字典占用的内存：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

现在可以通过一个简单的 `dictGet` 函数检索特定 `PostId` 的点赞和点踩。以下是我们检索帖子 `11227902` 的值：

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

这个查询不仅大大简化，而且速度也快了两倍！进一步优化可以通过仅将点赞和点踩超过10的帖子加载到字典中，并仅存储预先计算的争议值。

## 查询时间丰富性 {#query-time-enrichment}

字典可用于在查询时间查找值。可以在结果中返回这些值或在聚合中使用。假设我们创建一个字典，将用户 ID 映射到他们的位置：

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

我们可以使用这个字典丰富帖子结果：

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
│ 52296928 │ Comparision between two Strings in ClickHouse                 │ Spain                 │
│ 52345137 │ How to use a file to migrate data from mysql to a clickhouse? │ 中国江苏省Nanjing Shi   │
│ 61452077 │ How to change PARTITION in clickhouse                         │ Guangzhou, 广东省中国   │
│ 55608325 │ Clickhouse select last record without max() on all table      │ Moscow, Russia        │
│ 55758594 │ ClickHouse create temporary table                             │ Perm', Russia         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

类似于我们上面的连接示例，我们可以使用相同的字典有效地确定大多数帖子来自何处：

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

## 索引时间丰富性 {#index-time-enrichment}

在上述示例中，我们在查询时间使用字典以去除连接。字典也可以用于在插入时间丰富行。这通常适用于丰盈值不变且存在于可以用来填充字典的外部来源的情况。在这种情况下，在插入时间丰富行避免了查询时间对字典的查找。

假设 Stack Overflow 中的用户 `Location` 从未变化（实际上是会变化的）- 特别是 `users` 表的 `Location` 列。假设我们想按照位置对帖子表进行分析查询。这包含一个 `UserId`。

字典提供从用户 ID 到位置的映射，由 `users` 表支持：

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

> 我们省略 `Id < 0` 的用户，使我们能够使用 `Hashed` 字典类型。 `Id < 0` 的用户是系统用户。

为了在帖子表插入时间利用这个字典，我们需要修改架构：

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

在上述示例中，`Location` 被声明为 `MATERIALIZED` 列。这意味着该值可以作为 `INSERT` 查询的一部分提供，并将始终被计算。

> ClickHouse 还支持 [`DEFAULT` 列](/sql-reference/statements/create/table#default_values)（当未提供时，可以插入或计算该值）。

为了填充表格，可以使用常规的 `INSERT INTO SELECT` 从 S3：

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

我们可以现在获得大多数帖子来源的地点名称：

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

`LAYOUT` 子句控制字典的内部数据结构。存在多种选项，并在 [这里](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory) 进行了记录。选择正确布局的一些提示可以在 [这里](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) 找到。

### 刷新字典 {#refreshing-dictionaries}

我们为字典指定了 `LIFETIME` 为 `MIN 600 MAX 900`。LIFETIME 是字典的更新间隔，这里的值导致在 600 到 900 秒之间随机间隔的定期重载。这个随机间隔是必要的，以便在大量服务器上更新时分散字典源的负载。在更新期间，旧版本的字典仍然可以查询，只有初始加载会阻塞查询。请注意，设置 `(LIFETIME(0))` 会停止字典的更新。
可以使用 `SYSTEM RELOAD DICTIONARY` 命令强制重新加载字典。

对于 ClickHouse 和 Postgres 等数据库源，您可以设置一个查询，仅在字典真的发生变化时（查询的响应决定这一点）更新字典，而不是在定期间隔时。进一步的详细信息可以在 [这里](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) 找到。

### 其他字典类型 {#other-dictionary-types}

ClickHouse 还支持 [层次型](/sql-reference/dictionaries#hierarchical-dictionaries)、[多边形](/sql-reference/dictionaries#polygon-dictionaries) 和 [正则表达式](/sql-reference/dictionaries#regexp-tree-dictionary) 字典。

### 进一步阅读 {#more-reading}

- [使用字典加速查询](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典的高级配置](/sql-reference/dictionaries)
