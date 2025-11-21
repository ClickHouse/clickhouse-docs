---
slug: /guides/replacing-merge-tree
title: 'ReplacingMergeTree'
description: '在 ClickHouse 中使用 ReplacingMergeTree 引擎'
keywords: ['replacingmergetree', 'inserts', 'deduplication']
doc_type: 'guide'
---

import postgres_replacingmergetree from '@site/static/images/migrations/postgres-replacingmergetree.png';
import Image from '@theme/IdealImage';

虽然事务型数据库针对更新和删除类的事务性工作负载进行了优化，但 OLAP 数据库在这类操作上提供的保障较少。相应地，它们针对批量插入的不可变数据进行优化，从而显著加速分析型查询。尽管 ClickHouse 通过 mutation 提供了更新操作，并提供了一种轻量级的行删除方式，但其列式存储结构意味着这些操作应如上所述进行谨慎调度。这些操作是异步处理的，由单线程执行，并且在（更新的情况下）需要将数据重写到磁盘。因此，它们不适用于大量的小规模变更。

为了在避免上述使用模式的前提下处理更新和删除行的流式数据，我们可以使用 ClickHouse 表引擎 ReplacingMergeTree。


## 插入行的自动更新插入 {#automatic-upserts-of-inserted-rows}

[ReplacingMergeTree 表引擎](/engines/table-engines/mergetree-family/replacingmergetree)允许对行执行更新操作,无需使用低效的 `ALTER` 或 `DELETE` 语句。它允许用户插入同一行的多个副本,并将其中一个标记为最新版本。后台进程会异步删除同一行的旧版本,通过不可变插入有效地模拟更新操作。
这依赖于表引擎识别重复行的能力。通过使用 `ORDER BY` 子句来确定唯一性,即如果两行在 `ORDER BY` 中指定的列具有相同的值,则它们被视为重复行。在定义表时指定的 `version` 列用于在识别出重复行时保留最新版本的行,即保留版本值最高的行。
下面的示例说明了此过程。在这里,行由 A 列唯一标识(表的 `ORDER BY`)。我们假设这些行分两个批次插入,在磁盘上形成了两个数据部分。随后,在异步后台进程中,这些部分会合并在一起。

ReplacingMergeTree 还允许指定一个删除标记列。该列可以包含 0 或 1,其中值 1 表示该行(及其重复项)已被删除,否则使用 0。**注意:已删除的行不会在合并时被移除。**

在此过程中,部分合并期间会发生以下情况:

- 列 A 值为 1 标识的行既有版本 2 的更新行,也有版本 3 的删除行(删除标记列的值为 1)。因此保留标记为已删除的最新行。
- 列 A 值为 2 标识的行有两个更新行。保留后一行,其 price 列的值为 6。
- 列 A 值为 3 标识的行有一个版本 1 的行和一个版本 2 的删除行。保留此删除行。

此合并过程的结果是,我们有四行代表最终状态:

<br />

<Image
  img={postgres_replacingmergetree}
  size='md'
  alt='ReplacingMergeTree 过程'
/>

<br />

请注意,已删除的行永远不会被移除。可以使用 `OPTIMIZE table FINAL CLEANUP` 强制删除它们。这需要实验性设置 `allow_experimental_replacing_merge_with_cleanup=1`。只应在以下条件下执行此操作:

1. 您可以确保在执行操作后不会插入具有旧版本的行(针对那些将通过清理删除的行)。如果插入这些行,它们将被错误地保留,因为已删除的行将不再存在。
2. 在执行清理之前确保所有副本都已同步。可以通过以下命令实现:

<br />

```sql
SYSTEM SYNC REPLICA table
```

我们建议在保证条件 (1) 后暂停插入,直到此命令和后续清理完成。

> 只建议在删除数量较少到中等(少于 10%)的表中使用 ReplacingMergeTree 处理删除,除非可以在满足上述条件的情况下安排清理时段。

> 提示:用户还可以对不再发生变更的选定分区执行 `OPTIMIZE FINAL CLEANUP`。


## 选择主键/去重键 {#choosing-a-primarydeduplication-key}

如上所述,我们强调了在使用 ReplacingMergeTree 时必须满足的一个重要附加约束:`ORDER BY` 中列的值必须能够在变更过程中唯一标识一行数据。如果从 Postgres 等事务型数据库迁移数据,则应将原始 Postgres 主键包含在 ClickHouse 的 `ORDER BY` 子句中。

ClickHouse 用户应熟悉如何选择表的 `ORDER BY` 子句中的列以[优化查询性能](/data-modeling/schema-design#choosing-an-ordering-key)。通常,应根据[常用查询选择这些列,并按基数递增的顺序排列](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)。重要的是,ReplacingMergeTree 增加了一个额外的约束——这些列必须是不可变的,即如果从 Postgres 复制数据,只有在底层 Postgres 数据中不会发生变化的列才能添加到此子句中。虽然其他列可以变化,但这些列必须保持一致以实现唯一的行标识。
对于分析型工作负载,Postgres 主键通常用处不大,因为用户很少执行单行点查询。鉴于我们建议按基数递增的顺序排列列,以及 [ORDER BY 中较早列出的列匹配通常更快](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)这一事实,Postgres 主键应附加到 `ORDER BY` 的末尾(除非它具有分析价值)。如果 Postgres 中的主键由多个列组成,则应将它们附加到 `ORDER BY` 中,同时考虑基数和查询价值的可能性。用户也可以通过 `MATERIALIZED` 列使用值的拼接来生成唯一主键。

以 Stack Overflow 数据集中的 posts 表为例。

```sql
CREATE TABLE stackoverflow.posts_updateable
(
       `Version` UInt32,
       `Deleted` UInt8,
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
        `Score` Int32,
        `ViewCount` UInt32 CODEC(Delta(4), ZSTD(1)),
        `Body` String,
        `OwnerUserId` Int32,
        `OwnerDisplayName` String,
        `LastEditorUserId` Int32,
        `LastEditorDisplayName` String,
        `LastEditDate` DateTime64(3, 'UTC') CODEC(Delta(8), ZSTD(1)),
        `LastActivityDate` DateTime64(3, 'UTC'),
        `Title` String,
        `Tags` String,
        `AnswerCount` UInt16 CODEC(Delta(2), ZSTD(1)),
        `CommentCount` UInt8,
        `FavoriteCount` UInt8,
        `ContentLicense` LowCardinality(String),
        `ParentId` String,
        `CommunityOwnedDate` DateTime64(3, 'UTC'),
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = ReplacingMergeTree(Version, Deleted)
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate, Id)
```

我们使用 `(PostTypeId, toDate(CreationDate), CreationDate, Id)` 作为 `ORDER BY` 键。`Id` 列对每个帖子都是唯一的,确保可以对行进行去重。根据需要,在模式中添加了 `Version` 和 `Deleted` 列。


## 查询 ReplacingMergeTree {#querying-replacingmergetree}

在合并时,ReplacingMergeTree 使用 `ORDER BY` 列的值作为唯一标识符来识别重复行,并且要么仅保留最高版本,要么在最新版本指示删除时移除所有重复项。然而,这仅提供最终一致性 - 它不保证行一定会被去重,您不应依赖此特性。因此,由于更新和删除的行会在查询中被考虑,查询可能会产生不正确的结果。

为了获得正确的结果,用户需要在后台合并的基础上,在查询时进行去重和删除移除。这可以通过使用 `FINAL` 操作符来实现。

考虑上面的 posts 表。我们可以使用常规方法加载此数据集,但需要额外指定 deleted 和 version 列,并将值设为 0。为了演示目的,我们仅加载 10000 行。

```sql
INSERT INTO stackoverflow.posts_updateable SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet') WHERE AnswerCount > 0 LIMIT 10000

0 rows in set. Elapsed: 1.980 sec. Processed 8.19 thousand rows, 3.52 MB (4.14 thousand rows/s., 1.78 MB/s.)
```

让我们确认行数:

```sql
SELECT count() FROM stackoverflow.posts_updateable

┌─count()─┐
│   10000 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

现在我们更新帖子回答统计信息。我们不是更新这些值,而是插入 5000 行的新副本并将它们的版本号加一(这意味着表中将存在 15000 行)。我们可以用一个简单的 `INSERT INTO SELECT` 来模拟这个操作:

```sql
INSERT INTO posts_updateable SELECT
        Version + 1 AS Version,
        Deleted,
        Id,
        PostTypeId,
        AcceptedAnswerId,
        CreationDate,
        Score,
        ViewCount,
        Body,
        OwnerUserId,
        OwnerDisplayName,
        LastEditorUserId,
        LastEditorDisplayName,
        LastEditDate,
        LastActivityDate,
        Title,
        Tags,
        AnswerCount,
        CommentCount,
        FavoriteCount,
        ContentLicense,
        ParentId,
        CommunityOwnedDate,
        ClosedDate
FROM posts_updateable --select 100 random rows
WHERE (Id % toInt32(floor(randUniform(1, 11)))) = 0
LIMIT 5000

0 rows in set. Elapsed: 4.056 sec. Processed 1.42 million rows, 2.20 GB (349.63 thousand rows/s., 543.39 MB/s.)
```

此外,我们通过重新插入行但将 deleted 列的值设为 1 来删除 1000 个随机帖子。同样,可以用一个简单的 `INSERT INTO SELECT` 来模拟这个操作。

```sql
INSERT INTO posts_updateable SELECT
        Version + 1 AS Version,
        1 AS Deleted,
        Id,
        PostTypeId,
        AcceptedAnswerId,
        CreationDate,
        Score,
        ViewCount,
        Body,
        OwnerUserId,
        OwnerDisplayName,
        LastEditorUserId,
        LastEditorDisplayName,
        LastEditDate,
        LastActivityDate,
        Title,
        Tags,
        AnswerCount + 1 AS AnswerCount,
        CommentCount,
        FavoriteCount,
        ContentLicense,
        ParentId,
        CommunityOwnedDate,
        ClosedDate
FROM posts_updateable --select 100 random rows
WHERE (Id % toInt32(floor(randUniform(1, 11)))) = 0 AND AnswerCount > 0
LIMIT 1000

0 rows in set. Elapsed: 0.166 sec. Processed 135.53 thousand rows, 212.65 MB (816.30 thousand rows/s., 1.28 GB/s.)
```

上述操作的结果将是 16,000 行,即 10,000 + 5000 + 1000。这里的正确总数实际上应该比我们的原始总数少 1000 行,即 10,000 - 1000 = 9000。

```sql
SELECT count()
FROM posts_updateable

┌─count()─┐
│   10000 │
└─────────┘
1 row in set. Elapsed: 0.002 sec.
```

您的结果会根据已发生的合并而有所不同。我们可以看到这里的总数不同,因为我们有重复行。对表应用 `FINAL` 可以得到正确的结果。


```sql
SELECT count()
FROM posts_updateable
FINAL

┌─count()─┐
│    9000 │
└─────────┘

返回 1 行。耗时:0.006 秒。处理了 1.181 万行,212.54 KB(214 万行/秒,38.61 MB/秒)。
峰值内存使用量:8.14 MiB。
```


## FINAL 性能 {#final-performance}

`FINAL` 操作符确实会对查询产生一定的性能开销。
当查询未在主键列上进行过滤时,这种开销最为明显,
会导致读取更多数据并增加去重开销。如果用户
使用 `WHERE` 条件在键列上进行过滤,则加载和传递用于
去重的数据量将会减少。

如果 `WHERE` 条件未使用键列,ClickHouse 目前在使用 `FINAL` 时不会利用 `PREWHERE` 优化。该优化旨在减少非过滤列的读取行数。可以在[此处](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1#final-performance)找到模拟 `PREWHERE` 从而潜在提升性能的示例。


## 利用 ReplacingMergeTree 的分区特性 {#exploiting-partitions-with-replacingmergetree}

ClickHouse 中的数据合并在分区级别进行。使用 ReplacingMergeTree 时,我们建议用户按照最佳实践对表进行分区,前提是用户能够确保**分区键对于某一行不会发生变化**。这将确保同一行的更新会被发送到同一个 ClickHouse 分区。您可以重用与 Postgres 相同的分区键,前提是遵守此处概述的最佳实践。

假设满足这种情况,用户可以使用设置 `do_not_merge_across_partitions_select_final=1` 来提高 `FINAL` 查询性能。此设置会使分区在使用 FINAL 时独立进行合并和处理。

考虑以下 posts 表,其中我们不使用分区:

```sql
CREATE TABLE stackoverflow.posts_no_part
(
        `Version` UInt32,
        `Deleted` UInt8,
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        ...
)
ENGINE = ReplacingMergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate, Id)

INSERT INTO stackoverflow.posts_no_part SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 182.895 sec. Processed 59.82 million rows, 38.07 GB (327.07 thousand rows/s., 208.17 MB/s.)
```

为了确保 `FINAL` 需要执行一些工作,我们更新 100 万行 - 通过插入重复行来递增它们的 `AnswerCount`。

```sql
INSERT INTO posts_no_part SELECT Version + 1 AS Version, Deleted, Id, PostTypeId, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount + 1 AS AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate
FROM posts_no_part
LIMIT 1000000
```

使用 `FINAL` 计算每年的答案总数:

```sql
SELECT toYear(CreationDate) AS year, sum(AnswerCount) AS total_answers
FROM posts_no_part
FINAL
GROUP BY year
ORDER BY year ASC

┌─year─┬─total_answers─┐
│ 2008 │        371480 │
...
│ 2024 │        127765 │
└──────┴───────────────┘

17 rows in set. Elapsed: 2.338 sec. Processed 122.94 million rows, 1.84 GB (52.57 million rows/s., 788.58 MB/s.)
Peak memory usage: 2.09 GiB.
```

对按年份分区的表重复这些相同的步骤,并使用 `do_not_merge_across_partitions_select_final=1` 重复上述查询。

```sql
CREATE TABLE stackoverflow.posts_with_part
(
        `Version` UInt32,
        `Deleted` UInt8,
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        ...
)
ENGINE = ReplacingMergeTree
PARTITION BY toYear(CreationDate)
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate, Id)

// 省略填充和更新操作

SELECT toYear(CreationDate) AS year, sum(AnswerCount) AS total_answers
FROM posts_with_part
FINAL
GROUP BY year
ORDER BY year ASC

┌─year─┬─total_answers─┐
│ 2008 │       387832  │
│ 2009 │       1165506 │
│ 2010 │       1755437 │
...
│ 2023 │       787032  │
│ 2024 │       127765  │
└──────┴───────────────┘

17 rows in set. Elapsed: 0.994 sec. Processed 64.65 million rows, 983.64 MB (65.02 million rows/s., 989.23 MB/s.)
```

如图所示,在这种情况下,分区通过允许去重过程在分区级别并行进行,显著提高了查询性能。


## 合并行为注意事项 {#merge-behavior-considerations}

ClickHouse 的合并选择机制不仅仅是简单地合并数据部分。下面我们将在 ReplacingMergeTree 的上下文中研究这种行为,包括用于启用更激进的旧数据合并的配置选项以及对较大数据部分的考虑因素。

### 合并选择逻辑 {#merge-selection-logic}

虽然合并旨在最小化数据部分的数量,但它也会在此目标与写入放大的成本之间进行权衡。因此,根据内部计算,如果某些数据部分范围会导致过度的写入放大,则会被排除在合并之外。这种行为有助于防止不必要的资源使用并延长存储组件的使用寿命。

### 大数据部分的合并行为 {#merging-behavior-on-large-parts}

ClickHouse 中的 ReplacingMergeTree 引擎通过合并数据部分来优化重复行的管理,根据指定的唯一键仅保留每行的最新版本。然而,当合并后的数据部分达到 max_bytes_to_merge_at_max_space_in_pool 阈值时,即使设置了 min_age_to_force_merge_seconds,它也不会再被选择进行进一步合并。因此,无法再依赖自动合并来删除随着持续数据插入而累积的重复数据。

为了解决这个问题,用户可以调用 OPTIMIZE FINAL 来手动合并数据部分并删除重复数据。与自动合并不同,OPTIMIZE FINAL 会绕过 max_bytes_to_merge_at_max_space_in_pool 阈值,仅根据可用资源(特别是磁盘空间)合并数据部分,直到每个分区中只剩下一个数据部分。然而,这种方法在大表上可能会占用大量内存,并且随着新数据的添加可能需要重复执行。

为了获得更可持续且能保持性能的解决方案,建议对表进行分区。这可以帮助防止数据部分达到最大合并大小,并减少持续手动优化的需求。

### 分区和跨分区合并 {#partitioning-and-merging-across-partitions}

如在"利用 ReplacingMergeTree 的分区"中所讨论的,我们建议将表分区作为最佳实践。分区可以隔离数据以实现更高效的合并,并避免跨分区合并,特别是在查询执行期间。从 23.12 版本开始,这种行为得到了增强:如果分区键是排序键的前缀,则在查询时不会执行跨分区合并,从而提高查询性能。

### 调整合并以获得更好的查询性能 {#tuning-merges-for-better-query-performance}

默认情况下,min_age_to_force_merge_seconds 和 min_age_to_force_merge_on_partition_only 分别设置为 0 和 false,禁用这些功能。在此配置下,ClickHouse 将应用标准合并行为,而不会根据分区年龄强制合并。

如果指定了 min_age_to_force_merge_seconds 的值,ClickHouse 将忽略超过指定时间段的数据部分的正常合并启发式规则。虽然这通常仅在目标是最小化数据部分总数时才有效,但它可以通过减少查询时需要合并的数据部分数量来提高 ReplacingMergeTree 的查询性能。

可以通过设置 min_age_to_force_merge_on_partition_only=true 来进一步调整此行为,要求分区中的所有数据部分都超过 min_age_to_force_merge_seconds 才能进行激进合并。此配置允许较旧的分区随着时间的推移合并为单个数据部分,从而整合数据并保持查询性能。

### 推荐设置 {#recommended-settings}

:::warning
调整合并行为是一项高级操作。我们建议在生产工作负载中启用这些设置之前咨询 ClickHouse 支持团队。
:::

在大多数情况下,建议将 min_age_to_force_merge_seconds 设置为较低的值——明显小于分区周期。这可以最小化数据部分的数量,并防止在使用 FINAL 运算符进行查询时进行不必要的合并。

例如,考虑一个已经合并为单个数据部分的月度分区。如果一个小的零散插入在此分区内创建了一个新的数据部分,查询性能可能会受到影响,因为 ClickHouse 必须读取多个数据部分直到合并完成。设置 min_age_to_force_merge_seconds 可以确保这些数据部分被激进地合并,从而防止查询性能下降。
