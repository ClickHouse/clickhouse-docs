---
slug: /dictionary
title: '字典'
keywords: ['dictionary', 'dictionaries']
description: '字典提供数据的键值表示，以便快速查找。'
---

import dictionaryUseCases from '@site/static/images/dictionary/dictionary-use-cases.png';
import dictionaryLeftAnyJoin from '@site/static/images/dictionary/dictionary-left-any-join.png';


# 字典

在 ClickHouse 中，字典提供了来自各种 [内部和外部来源](/sql-reference/dictionaries#dictionary-sources) 的内存 [键值](https://en.wikipedia.org/wiki/Key%E2%80%93value_database) 表示，优化以实现超低延迟的查找查询。

字典的用途包括：
- 改善查询性能，特别是在与 `JOIN` 一起使用时
- 在不减慢数据摄取过程的情况下，实时丰富摄取的数据

<img src={dictionaryUseCases}
  class="image"
  alt="在 ClickHouse 中使用字典的用例"
  style={{width: '100%', background: 'none'}} />

## 使用字典加速连接 {#speeding-up-joins-using-a-dictionary}

字典可以用于加速特定类型的 `JOIN`：[`LEFT ANY` 类型](/sql-reference/statements/select/join#supported-types-of-join)，在此类型中，连接键需要与基础键值存储的键属性匹配。

<img src={dictionaryLeftAnyJoin}
  class="image"
  alt="使用字典与 LEFT ANY JOIN"
  style={{width: '300px', background: 'none'}} />

如果是这种情况，ClickHouse 可以利用字典执行 [直接连接](https://clickhouse.com/blog/clickhouse-fully-supports-joins-direct-join-part4#direct-join)。这是 ClickHouse 的最快连接算法，适用于右侧表的基础 [表引擎](/engines/table-engines) 支持低延迟的键值请求。ClickHouse 有三个表引擎提供此功能：[Join](/engines/table-engines/special/join)（基本上是预计算的哈希表）、[EmbeddedRocksDB](/engines/table-engines/integrations/embedded-rocksdb) 和 [Dictionary](/engines/table-engines/special/dictionary)。我们将描述基于字典的方法，但机制对所有三种引擎都是相同的。

直接连接算法要求右侧表由字典支持，使得要连接的数据在内存中以低延迟的键值数据结构的形式存在。

### 示例 {#example}

使用 Stack Overflow 数据集，来回答这个问题：
*在 Hacker News 上关于 SQL 的最具争议的帖子是什么？*

我们定义“争议”是指帖子有相似的赞成票和反对票。我们计算这个绝对差值，越接近 0 的值表示越具有争议。我们假设帖子必须有至少 10 个赞同和反对票——没有人投票的帖子并不算特别有争议。

经过数据规范化后，这个查询当前需要使用 `posts` 表和 `votes` 表的 `JOIN`：

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
Id:              	25372161
Title:           	如何向 SqlDataSource.UpdateCommand 添加异常处理
UpVotes:         	13
DownVotes:       	13
Controversial_ratio: 0

1 rows in set. Elapsed: 1.283 sec. Processed 418.44 million rows, 7.23 GB (326.07 million rows/s., 5.63 GB/s.)
Peak memory usage: 3.18 GiB.
```

>**在 `JOIN` 的右侧使用更小的数据集**：这个查询可能看起来比实际需要的更冗长，因为在外部和子查询中对 `PostId`s 的过滤都出现了。这是一种性能优化，确保查询响应时间快速。为了获得最佳性能，请始终确保 `JOIN` 的右侧是较小的数据集，并尽可能小。有关优化 `JOIN` 性能和理解可用算法的提示，我们推荐 [这一系列博客文章](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1)。

虽然这个查询很快，但它依赖于我们仔细编写 `JOIN` 来实现良好的性能。理想情况下，我们只需在查看 `UpVote` 和 `DownVote` 计数之前，先过滤出标题中包含“SQL”的帖子。

#### 应用字典 {#applying-a-dictionary}

为了演示这些概念，我们对投票数据使用一个字典。由于字典通常保存在内存中（[ssd_cache](/sql-reference/dictionaries#ssd_cache) 是例外），用户应意识到数据的大小。确认我们的 `votes` 表大小：

```sql
SELECT table,
	formatReadableSize(sum(data_compressed_bytes)) AS compressed_size,
	formatReadableSize(sum(data_uncompressed_bytes)) AS uncompressed_size,
	round(sum(data_uncompressed_bytes) / sum(data_compressed_bytes), 2) AS ratio
FROM system.columns
WHERE table IN ('votes')
GROUP BY table

┌─table───────────┬─compressed_size─┬─uncompressed_size─┬─ratio─┐
│ votes │ 1.25 GiB    	│ 3.79 GiB      	│  3.04 │
└─────────────────┴─────────────────┴───────────────────┴───────┘
```

数据将以未压缩形式存储在我们的字典中，因此如果我们存储所有列（我们不会）在字典中，至少需要 4GB 的内存。字典将在我们的集群中复制，因此每个节点都需要保留此内存量。

> 在下面的示例中，我们的字典数据来源于 ClickHouse 表。尽管这代表字典的最常见来源，但还支持 [许多其他来源](/sql-reference/dictionaries#dictionary-sources)，包括文件、http 和数据库，包括 [Postgres](/sql-reference/dictionaries#postgresql)。如我们所示，字典可以自动刷新，为确保频繁更改的小数据集可以用于直接连接提供了理想的方法。

我们的字典需要一个作为查找的主键。概念上，这与事务数据库主键相同，并且应该是唯一的。我们上面的查询要求在连接键 - `PostId` 上进行查找。字典应填充来自 `votes` 表的每个 `PostId` 的总赞成票和反对票。以下是获取字典数据的查询：

```sql
SELECT PostId,
   countIf(VoteTypeId = 2) AS UpVotes,
   countIf(VoteTypeId = 3) AS DownVotes
FROM votes
GROUP BY PostId
```

要创建我们的字典，需要以下 DDL - 注意我们上面查询的使用：

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

> 在自管理 OSS 中，上述命令需要在所有节点上执行。在 ClickHouse Cloud 中，字典将自动复制到所有节点。上述命令在一个具有 64GB RAM 的 ClickHouse Cloud 节点上执行，耗时 36 秒加载。

确认我们的字典所消耗的内存：

```sql
SELECT formatReadableSize(bytes_allocated) AS size
FROM system.dictionaries
WHERE name = 'votes_dict'

┌─size─────┐
│ 4.00 GiB │
└──────────┘
```

现在可以使用简单的 `dictGet` 函数检索特定 `PostId` 的赞成票和反对票。以下是检索帖子 `11227902` 的值：

```sql
SELECT dictGet('votes_dict', ('UpVotes', 'DownVotes'), '11227902') AS votes

┌─votes──────┐
│ (34999,32) │
└────────────┘


在我们早期的查询中利用这一点，我们可以去除 `JOIN`：

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

这个查询不仅简单得多，而且速度也超过了两倍！通过仅将超过 10 个赞成票和反对票的帖子加载到字典中，并仅存储预计算的争议值，进一步优化也是可能的。

## 查询时丰富 {#query-time-enrichment}

字典可用于在查询时查找值。这些值可以在结果中返回或用于聚合。假设我们创建一个字典来映射用户 ID 到他们的位置：

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
│ 52296928 │ ClickHouse 中两个字符串的比较             	│ 西班牙             	│
│ 52345137 │ 如何使用文件将数据从 mysql 迁移到 clickhouse? │ 中国江苏省南京市 │
│ 61452077 │ 如何在 ClickHouse 中更改 PARTITION                     	│ 广州，广东省中国 │
│ 55608325 │ Clickhouse 在没有 max() 的情况下选择最后一条记录   	│ 俄罗斯莫斯科    	│
│ 55758594 │ ClickHouse 创建临时表                         	│ 俄罗斯佩尔姆     	│
└──────────┴───────────────────────────────────────────────────────────────┴───────────────────────┘

5 rows in set. Elapsed: 0.033 sec. Processed 4.25 million rows, 82.84 MB (130.62 million rows/s., 2.55 GB/s.)
Peak memory usage: 249.32 MiB.
```

类似于我们上面的连接示例，我们可以使用相同的字典高效地确定大多数帖子来自哪里：

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
│ 印度              	│ 787814 │
│ 德国            	│ 685347 │
│ 美国      	│ 595818 │
│ 伦敦，英国 │ 538738 │
│ 英国     	│ 537699 │
└────────────────────────┴────────┘

5 rows in set. Elapsed: 0.763 sec. Processed 59.82 million rows, 239.28 MB (78.40 million rows/s., 313.60 MB/s.)
Peak memory usage: 248.84 MiB.
```

## 索引时丰富 {#index-time-enrichment}

在上述示例中，我们在查询时使用了字典来去除一个连接。字典还可用于在插入时丰富行。这通常适用于丰富值没有变化且存在于外部源中，字典可以用于填充的情况。在这种情况下，在插入时丰富行可以避免在查询时查找字典。

假设 Stack Overflow 中用户的 `Location` 从不改变（实际上它们会变化）——具体来说是 `users` 表的 `Location` 列。假设我们想按位置对帖子表进行分析查询。这包含一个 `UserId`。

字典提供了用户 ID 到位置的映射，支持 `users` 表：

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

> 我们省略了 `Id < 0` 的用户，从而允许我们使用 `Hashed` 字典类型。`Id < 0` 的用户是系统用户。

要在 `posts` 表的插入时利用这个字典，我们需要修改架构：

```sql
CREATE TABLE posts_with_location
(
    `Id` UInt32,
    `PostTypeId` Enum8('问题' = 1, '回答' = 2, '维基' = 3, '标签维基摘录' = 4, '标签维基' = 5, '版主提名' = 6, '维基占位符' = 7, '特权维基' = 8),
     …
    `Location` MATERIALIZED dictGet(users_dict, 'Location', OwnerUserId::'UInt64')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CommentCount)
```

在上述示例中，`Location` 被声明为 `MATERIALIZED` 列。这意味着该值可以作为 `INSERT` 查询的一部分提供，并且将始终被计算。

> ClickHouse 还支持 [`DEFAULT` 列](/sql-reference/statements/create/table#default_values)（在未提供时可以插入或计算该值）。

要填充该表，我们可以使用常规的 `INSERT INTO SELECT` 从 S3：

```sql
INSERT INTO posts_with_location SELECT Id, PostTypeId::UInt8, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 36.830 sec. Processed 238.98 million rows, 2.64 GB (6.49 million rows/s., 71.79 MB/s.)
```

我们现在可以获取大多数帖子来自的地点的名称：

```sql
SELECT Location, count() AS c
FROM posts_with_location
WHERE Location != ''
GROUP BY Location
ORDER BY c DESC
LIMIT 4

┌─Location───────────────┬──────c─┐
│ 印度                  │ 787814 │
│ 德国                │ 685347 │
│ 美国          │ 595818 │
│ 伦敦，英国 │ 538738 │
└────────────────────────┴────────┘

4 rows in set. Elapsed: 0.142 sec. Processed 59.82 million rows, 1.08 GB (420.73 million rows/s., 7.60 GB/s.)
Peak memory usage: 666.82 MiB.
```

## 高级字典主题 {#advanced-dictionary-topics}

### 选择字典的 `LAYOUT` {#choosing-the-dictionary-layout}

`LAYOUT` 子句控制字典的内部数据结构。存在多种选项，并在 [此处](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) 进行了文档记录，选择正确布局的一些建议可以在 [这里](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse#choosing-a-layout) 找到。

### 刷新字典 {#refreshing-dictionaries}

我们已经为字典指定了 `LIFETIME = MIN 600 MAX 900`。LIFETIME 是字典的更新时间间隔，此处的值导致在 600 到 900 秒之间的随机间隔进行定期重新加载。这个随机间隔是必要的，以便在更新大量服务器时分散对字典源的负载。在更新期间，可以查询旧版本的字典，只有初始加载会阻塞查询。请注意，设置 `(LIFETIME(0))` 会阻止字典更新。
字典可以通过 `SYSTEM RELOAD DICTIONARY` 命令强制重新加载。

对于数据库源，如 ClickHouse 和 Postgres，您可以设置一个查询，该查询仅在实际更改的情况下更新字典（查询的响应会决定这一点），而不是在周期性间隔下更新。进一步的详细信息可以在 [这里](https://sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime) 找到。

### 其他字典类型 {#other-dictionary-types}

ClickHouse 还支持 [层次型字典](/sql-reference/dictionaries#hierarchical-dictionaries)、[多边形字典](/sql-reference/dictionaries#polygon-dictionaries) 和 [正则表达式字典](/sql-reference/dictionaries#regexp-tree-dictionary)。

### 更多阅读 {#more-reading}

- [使用字典加速查询](https://clickhouse.com/blog/faster-queries-dictionaries-clickhouse)
- [字典的高级配置](/sql-reference/dictionaries)
