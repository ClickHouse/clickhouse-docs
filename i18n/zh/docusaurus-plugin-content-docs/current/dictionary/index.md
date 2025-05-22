import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';
import Image from '@theme/IdealImage';

# 字典

ClickHouse 中的字典提供了来自各种 [内部和外部源](/sql-reference/dictionaries#dictionary-sources) 的数据在内存中的 [键值](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表示，优化用于超低延迟查找查询。

字典的用途包括：
- 提高查询的性能，尤其是在与 `JOIN` 一起使用时
- 在不减缓摄取过程的情况下动态丰富摄取的数据

<Image img={dictionaryUseCases} size="lg" alt="ClickHouse 中字典的用例"/>

## 使用字典加速 JOIN {#speeding-up-joins-using-a-dictionary}

字典可以用于加速特定类型的 `JOIN`：[`LEFT ANY` 类型](/sql-reference/statements/select/join#supported-types-of-join)，此时连接键需要与底层键值存储的键属性匹配。

<Image img={dictionaryLeftAnyJoin} size="sm" alt="使用字典与 LEFT ANY JOIN"/>

如果是这种情况，ClickHouse 可以利用字典执行 [直接连接](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join)。这是 ClickHouse 的最快连接算法，适用于右侧表的底层 [表引擎](/engines/table-engines) 支持低延迟键值请求。ClickHouse 有三个提供此功能的表引擎：[Join](/engines/table-engines/special/join)（基本上是一个预计算的哈希表）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 和 [Dictionary](/engines/table-engines/special/dictionary)。我们将描述基于字典的方法，但这三种引擎的机制是相同的。

直接连接算法要求右侧表由字典支持，因此要连接的来自该表的数据已以低延迟键值数据结构的形式存在内存中。

### 示例 {#example}

使用 Stack Overflow 数据集，我们来回答这个问题：
*关于 SQL，Hacker News 上最有争议的帖子是什么？*

我们将“有争议”定义为帖子有相似数量的支持和反对票。我们计算这个绝对差异，值越接近 0 表示争议越大。我们假设帖子必须至少有 10 票支持和反对 - 没人投票的帖子并不算太有争议。

在我们的数据规范化后，这个查询当前需要使用 `posts` 和 `votes` 表的 `JOIN`：

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

>**在 `JOIN` 的右侧使用较小的数据集**：这个查询看起来可能比实际所需的要冗长，`PostId` 的过滤在外部和子查询中都进行。这是一个性能优化，确保查询响应时间较快。为了获得最佳性能，请始终确保 `JOIN` 的右侧是较小的数据集，并且尽可能小。关于优化 JOIN 性能和理解可用算法的建议，我们推荐 [这系列博客文章](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。

虽然这个查询速度很快，但它依赖于我们仔细编写 `JOIN` 来实现良好的性能。理想情况下，我们可以在查看博客的 `UpVote` 和 `DownVote` 计数之前，仅过滤出包含“SQL”的帖子。

#### 应用字典 {#applying-a-dictionary}

为了演示这些概念，我们使用字典作为我们的投票数据。由于字典通常存储在内存中（[ssd_cache](/sql-reference/dictionaries#ssd_cache) 是例外），用户应该注意数据的大小。确认我们的 `votes` 表大小：

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

数据将以未压缩的形式存储在我们的字典中，因此如果要在字典中存储所有列，我们至少需要 4GB 的内存（我们并不会存储所有列）。字典将在我们的集群中进行复制，因此每个节点需要保留这部分内存。

> 在下面的例子中，我们的字典数据源来自 ClickHouse 表。虽然这代表了字典的最常见来源，但支持 [许多来源](/sql-reference/dictionaries#dictionary-sources)，包括文件、http 和数据库，包括 [Postgres](/sql-reference/dictionaries#postgresql)。正如我们所展示的，字典可以自动刷新，为频繁变化的小数据集提供了直接连接的理想方式。

我们的字典要求一个主键，以便执行查找。这在概念上与事务数据库的主键相同，并且应该是唯一的。我们上面的查询需要在连接键 `PostId` 上执行查找。字典应填充来自 `votes` 表每个 `PostId` 的支持和反对票总数。以下是获取此字典数据的查询：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

创建字典需要以下 DDL - 注意使用了我们上面的查询：

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

> 在自管理的 OSS 中，上述命令需要在所有节点上执行。在 ClickHouse Cloud 中，字典将自动复制到所有节点。上述操作在具有 64GB RAM 的 ClickHouse Cloud 节点上执行，加载时间为 36 秒。

确认我们字典占用的内存：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

现在，通过一个简单的 `dictGet` 函数，可以检索特定 `PostId` 的支持和反对票。以下是我们获取帖子 `11227902` 的值：

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

这个查询不仅更简单，而且速度也是以前的两倍！这可以通过仅将具有超过 10 票的帖子加载到字典中，并仅存储预计算的争议值来进一步优化。

## 查询时丰富 {#query-time-enrichment}

字典可以在查询时查找值。这些值可以在结果中返回或用于聚合。假设我们创建一个字典，将用户 ID 映射到他们的位置：

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
│ 52296928 │ Comparision between two Strings in ClickHouse                 │ Spain                 │
│ 52345137 │ How to use a file to migrate data from mysql to a clickhouse? │ 中国江苏省Nanjing Shi   │
│ 61452077 │ How to change PARTITION in clickhouse                         │ Guangzhou, 广东省中国   │
│ 55608325 │ Clickhouse select last record without max() on all table      │ Moscow, Russia        │
│ 55758594 │ ClickHouse create temporary table                             │ Perm', Russia         │
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

与我们上面的连接示例类似，我们可以使用同一个字典高效地确定大多数帖子来源于哪个地方：

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

在上述示例中，我们在查询时使用了字典以去除连接。字典也可以用于在插入时丰富行。如果丰富值不变，并且存在于可以用来填充字典的外部来源时，这通常是合适的。在这种情况下，在插入时丰富行将避免查询时查找字典。

假设 Stack Overflow 中用户的 `Location` 从不改变（实际上是会改变的） - 特别是 `users` 表的 `Location` 列。假设我们想对帖子表按位置执行分析查询。这包含一个 `UserId`。

字典提供了从用户 ID 到位置的映射，支持 `users` 表：

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

> 我们省略 `Id < 0` 的用户，从而允许我们使用 `Hashed` 字典类型。`Id < 0` 的用户是系统用户。

为了在帖子表插入时利用这个字典，我们需要修改模式：

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

在上述示例中，`Location` 被声明为一个 `MATERIALIZED` 列。这意味着这个值可以作为 `INSERT` 查询的一部分提供，并且将始终计算。

> ClickHouse 也支持 [`DEFAULT` 列](/sql-reference/statements/create/table#default_values)（如果未提供，可以插入或计算值）。

要填充表，我们可以使用常规的 `INSERT INTO SELECT` 从 S3：

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

我们现在可以获取来自大多数帖子的来源的位置信息：

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

### 选择字典的 `LAYOUT` {#choosing-the-dictionary-layout}

`LAYOUT` 子句控制字典的内部数据结构。存在多种选项，详细信息见 [这里](/sql-reference/dictionaries#ways-to-store-dictionaries-in-memory)。关于选择正确布局的一些建议可以在 [这里](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) 找到。

### 刷新字典 {#refreshing-dictionaries}

我们为字典指定了 `LIFETIME` 为 `MIN 600 MAX 900`。LIFETIME 是字典的更新间隔，此处的值导致在 600 到 900 秒之间的随机间隔定期重载。这个随机间隔是为了在更新大量服务器时分散对字典源的负载。在更新期间，仍然可以查询字典的旧版本，仅初始化加载会阻塞查询。请注意，设置 `(LIFETIME(0))` 会阻止字典更新。
字典可以使用 `SYSTEM RELOAD DICTIONARY` 命令强制重新加载。

对于 ClickHouse 和 Postgres 等数据库源，您可以设置一个查询，仅在字典确实更改时（该查询的响应决定了这一点）更新字典，而不是按照定期间隔更新。进一步的细节可以在 [这里](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) 查找。

### 其他字典类型 {#other-dictionary-types}

ClickHouse 还支持 [层次](/sql-reference/dictionaries#hierarchical-dictionaries)、[多边形](/sql-reference/dictionaries#polygon-dictionaries) 及 [正则表达式](/sql-reference/dictionaries#regexp-tree-dictionary) 字典。

### 更多阅读 {#more-reading}

- [使用字典加速查询](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典的高级配置](/sql-reference/dictionaries)
