---
'slug': '/guides/replacing-merge-tree'
'title': 'ReplacingMergeTree'
'description': '在 ClickHouse 中使用 ReplacingMergeTree 引擎'
'keywords':
- 'replacingmergetree'
- 'inserts'
- 'deduplication'
'doc_type': 'guide'
---

import postgres_replacingmergetree from '@site/static/images/migrations/postgres-replacingmergetree.png';
import Image from '@theme/IdealImage';

尽管事务数据库在事务更新和删除工作负载上经过优化，但 OLAP 数据库对这些操作的保证较少。相反，它们在批量插入不可变数据的情况下进行优化，以实现显著更快的分析查询。虽然 ClickHouse 通过变更提供了更新操作，以及轻量级的删除行的方式，但其列式结构意味着这些操作应谨慎安排，如上所述。这些操作是异步处理的，使用单线程处理，并要求（在更新的情况下）数据在磁盘上被重写。因此，它们不应被用于高数量的小变更。
为了处理更新和删除行的流，同时避免上述使用模式，我们可以使用 ClickHouse 表引擎 ReplacingMergeTree。

## 插入行的自动上载 {#automatic-upserts-of-inserted-rows}

[ReplacingMergeTree 表引擎](/engines/table-engines/mergetree-family/replacingmergetree) 允许对行应用更新操作，无需使用低效的 `ALTER` 或 `DELETE` 语句，提供了用户插入相同行的多个副本并标记一个为最新版本的能力。后台进程则异步移除同一行的较旧版本，通过不可变插入高效模拟更新操作。
这依赖于表引擎识别重复行的能力。这是通过使用 `ORDER BY` 子句来确定唯一性来实现的，即如果两行在 `ORDER BY` 中指定的列上具有相同的值，则它们被视为重复。一列 `version` 列，在定义表时指定，允许在识别出两行为重复时保留最新版本，即保留版本值最高的行。
我们在下面的示例中说明这个过程。在这里，行通过 A 列（表的 `ORDER BY`）唯一标识。我们假设这些行是作为两个批次插入的，导致在磁盘上形成两个数据部分。稍后，在异步后台进程中，这些部分被合并在一起。

ReplacingMergeTree 另外允许指定一个删除列。它可以包含 0 或 1，其中值为 1 表示该行（及其副本）已被删除，而值为 0 表示相反。**注意：已删除的行在合并时不会被删除。**

在此过程期间，部分合并期间发生以下情况：

- 被值 1 标识的 A 列行具有版本为 2 的更新行和版本为 3（删除列值为 1）的删除行。因此，标记为已删除的最新行被保留。
- 被值 2 标识的 A 列行具有两个更新行。后一个行在价格列上保留值为 6。
- 被值 3 标识的 A 列行具有版本为 1 的行和版本为 2 的删除行。这个删除行被保留。

通过此合并过程，我们得到了四个表示最终状态的行：

<br />

<Image img={postgres_replacingmergetree} size="md" alt="ReplacingMergeTree process"/>

<br />

注意，已删除的行永远不会被删除。可以通过 `OPTIMIZE table FINAL CLEANUP` 强制删除它们。这需要实验性设置 `allow_experimental_replacing_merge_with_cleanup=1`。仅在以下条件下发出：

1. 你可以确保在发出操作后不会插入带有旧版本的行（对于那些正在被清理的行）。如果这些行被插入，它们会被错误地保留，因为已删除的行将不再存在。
2. 在发出清理之前确保所有副本保持同步。这可以通过命令实现：

<br />

```sql
SYSTEM SYNC REPLICA table
```

我们建议在确认 (1) 后暂停插入，直到此命令和随后的清理完成。

> 对于删除的处理，使用 ReplacingMergeTree 仅推荐用于删除数量较少到中等的表（少于 10%），除非可以根据上述条件安排清理周期。

> 提示：用户也可以对不再发生变化的选择分区执行 `OPTIMIZE FINAL CLEANUP`。

## 选择主键/去重键 {#choosing-a-primarydeduplication-key}

上面提到，在使用 ReplacingMergeTree 的情况下，必须满足一个重要的附加约束：`ORDER BY` 列的值在变更过程中唯一标识一行。如果从像 Postgres 这样的事务数据库迁移，则应该在 Clickhouse 的 `ORDER BY` 子句中包含原始 Postgres 主键。

ClickHouse 用户会熟悉在其表的 `ORDER BY` 子句中选择列以[优化查询性能](/data-modeling/schema-design#choosing-an-ordering-key)。通常，这些列应根据你的[常见查询并按递增基数列出](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)进行选择。重要的是，ReplacingMergeTree 施加了一个额外的约束——这些列必须是不可变的，即如果是从 Postgres 复制，只应在这些列在底层 Postgres 数据中不变的情况下将其添加到此子句中。虽然其他列可以更改，但这些列需要保持一致，以便唯一识别行。
对于分析工作负载，Postgres 主键通常用途不大，因为用户很少进行点行查找。考虑到我们建议这些列按基数递增的顺序排列，以及与[在 ORDER BY 之前列出列匹配通常会更快](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，Postgres 主键应添加到 `ORDER BY` 的末尾（除非它具有分析价值）。如果 Postgres 中的多个列组成主键，应该将其附加到 `ORDER BY`，遵循基数和查询值的可能性。用户可能还希望通过 `MATERIALIZED` 列使用值的串联生成唯一主键。

考虑 Stack Overflow 数据集中的 posts 表。

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

我们使用 `(PostTypeId, toDate(CreationDate), CreationDate, Id)` 的 `ORDER BY` 键。`Id` 列是每个帖子的唯一标识，确保行可以去重。根据要求往模式中添加了 `Version` 和 `Deleted` 列。

## 查询 ReplacingMergeTree {#querying-replacingmergetree}

在合并时，ReplacingMergeTree 使用 `ORDER BY` 列的值作为唯一标识符来识别重复行，并保留最高版本或在最新版本指示删除时删除所有重复。这仅提供最终正确性——它并不保证行会被去重，因此你不应依赖它。因此，查询可能由于更新和删除行被考虑在查询中而导致错误答案。

为了获得正确的答案，用户需要在查询时间的去重和删除移除中补充后台合并。这可以通过使用 `FINAL` 运算符实现。

考虑上面的 posts 表。我们可以使用加载此数据集的正常方法，但除了值 0 外，还指定删除和版本列。例如，仅加载 10,000 行。

```sql
INSERT INTO stackoverflow.posts_updateable SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet') WHERE AnswerCount > 0 LIMIT 10000

0 rows in set. Elapsed: 1.980 sec. Processed 8.19 thousand rows, 3.52 MB (4.14 thousand rows/s., 1.78 MB/s.)
```

确认行数：

```sql
SELECT count() FROM stackoverflow.posts_updateable

┌─count()─┐
│   10000 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

我们现在更新我们的帖子答案统计数据。我们不是更新这些值，而是插入 5000 行的新副本，并将它们的版本号加一（这意味着该表中将存在 150 行）。我们可以通过简单的 `INSERT INTO SELECT` 来模拟这一点：

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

此外，我们通过重新插入行但删除列值为 1 来删除 1000 条随机帖子。再一次，模拟这可以通过简单的 `INSERT INTO SELECT` 完成。

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

上述操作的结果将是 16,000 行，即 10,000 + 5000 + 1000。这里的正确总数实际上应该仅少于我们原始总数 1000 行，即 10,000 - 1000 = 9000。

```sql
SELECT count()
FROM posts_updateable

┌─count()─┐
│   10000 │
└─────────┘
1 row in set. Elapsed: 0.002 sec.
```

你的结果将因发生的合并而异。我们可以看到这里的总数不同，因为我们有重复行。对表应用 `FINAL` 可以提供正确的结果。

```sql
SELECT count()
FROM posts_updateable
FINAL

┌─count()─┐
│    9000 │
└─────────┘

1 row in set. Elapsed: 0.006 sec. Processed 11.81 thousand rows, 212.54 KB (2.14 million rows/s., 38.61 MB/s.)
Peak memory usage: 8.14 MiB.
```

## FINAL 性能 {#final-performance}

`FINAL` 运算符确实对查询有小的性能开销。
这在查询未对主键列进行过滤时最为明显，使得读取更多数据并增加去重的开销。如果用户使用 `WHERE` 条件针对键列进行过滤，则加载和传递给去重的数据将减少。

如果 `WHERE` 条件未使用键列，ClickHouse 目前在使用 `FINAL` 时不会利用 `PREWHERE` 优化。此优化旨在减少读取未过滤列的行数。模拟此 `PREWHERE` 的例子，从而可能提高性能，可以在[这里](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1#final-performance)找到。

## 利用分区与 ReplacingMergeTree {#exploiting-partitions-with-replacingmergetree}

ClickHouse 中的数据合并发生在分区级别。在使用 ReplacingMergeTree 时，我们建议用户根据最佳实践为他们的表进行分区，前提是用户能够确保这个**分区键对于一行不变**。这将确保与同一行相关的更新将发送到同一 ClickHouse 分区。只要遵循此处概述的最佳实践，您可以重用与 Postgres 相同的分区键。

假设情况如此，用户可以使用设置 `do_not_merge_across_partitions_select_final=1` 来提高 `FINAL` 查询性能。此设置导致在使用 FINAL 时分区独立合并和处理。

考虑以下帖子表，我们不使用任何分区：

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

为了确保 `FINAL` 需要做一些工作，我们更新 1m 行——通过插入重复行将其 `AnswerCount` 增加。

```sql
INSERT INTO posts_no_part SELECT Version + 1 AS Version, Deleted, Id, PostTypeId, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount + 1 AS AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate
FROM posts_no_part
LIMIT 1000000
```

计算每年的答案总和，使用 `FINAL`：

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

对按年分区的表重复相同步骤，并与使用 `do_not_merge_across_partitions_select_final=1` 重新执行上述查询。

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

// populate & update omitted

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

如图所示，在这种情况下，通过允许去重过程在分区级别并行发生，分区显著提高了查询性能。

## 合并行为考虑 {#merge-behavior-considerations}

ClickHouse 的合并选择机制超越了简单的部分合并。下面，我们在 ReplacingMergeTree 的背景下检查此行为，包括启用对旧数据进行更激进合并的配置选项和对较大部分的考虑。

### 合并选择逻辑 {#merge-selection-logic}

虽然合并旨在最小化部分数量，但它也平衡这个目标与写入放大效应的成本。因此，如果合并会导致过度的写入放大，一些部分范围将被排除在合并之外，基于内部计算。这种行为有助于防止不必要的资源使用，并延长存储组件的寿命。

### 对大型部分的合并行为 {#merging-behavior-on-large-parts}

ClickHouse 中的 ReplacingMergeTree 引擎经过优化以通过合并数据部分来管理重复行，仅保留每行基于指定的唯一键的最新版本。然而，当合并后的部分达到 max_bytes_to_merge_at_max_space_in_pool 阈值时，它将不再被选中进行进一步的合并，即使 min_age_to_force_merge_seconds 被设置。因此，自动合并不能再依赖于去除随着数据插入而可能累积的重复数据。

为了解决此问题，用户可以调用 OPTIMIZE FINAL 来手动合并部分并移除重复行。与自动合并不同，OPTIMIZE FINAL 会绕过 max_bytes_to_merge_at_max_space_in_pool 阈值，仅基于可用资源，尤其是磁盘空间合并部分，直到每个分区中只剩一个部分。然而，在大型表上，该方法可能会消耗大量内存，并且可能需要随着新数据的添加而重复执行。

为了保持性能的可持续解决方案，建议对表进行分区。这可以帮助防止数据部分达到最大合并大小，并减少持续手动优化的需要。

### 跨分区的合并与分区 {#partitioning-and-merging-across-partitions}

正如在利用 ReplacingMergeTree 的分区中讨论的，我们推荐将表进行分区作为最佳实践。分区隔离数据以实现更高效的合并，并在查询执行时避免跨分区合并。自 23.12 版本以来，此行为得到了增强：如果分区键是排序键的前缀，在查询时不进行跨分区合并，从而提高查询性能。

### 为更好的查询性能调整合并 {#tuning-merges-for-better-query-performance}

默认情况下，min_age_to_force_merge_seconds 和 min_age_to_force_merge_on_partition_only 分别设置为 0 和 false，禁用这些功能。在此配置中，ClickHouse 将应用标准合并行为，而不基于分区年龄强制合并。

如果指定了 min_age_to_force_merge_seconds 的值，ClickHouse 将忽略比指定时间段还大的部分的正常合并启发式。虽然这通常仅在目标是最小化部分总数时有效，但它可以通过减少查询时需要合并的部分数量来提高 ReplacingMergeTree 的查询性能。

通过将 min_age_to_force_merge_on_partition_only 设置为 true 进一步调整该行为，要求分区中的所有部分都要超过 min_age_to_force_merge_seconds 的年龄，才能进行激进合并。此配置允许旧分区随着时间的推移合并为单个部分，从而整合数据并维持查询性能。

### 推荐设置 {#recommended-settings}

:::warning
调整合并行为是一项高级操作。我们建议在生产工作负载中启用这些设置之前，先咨询 ClickHouse 支持。
:::

在大多数情况下，将 min_age_to_force_merge_seconds 设置为一个较低的值——显著低于分区周期——是首选。这将最小化部分数量，并防止在使用 FINAL 运算符时在查询时进行不必要的合并。

例如，考虑一个已经合并为一个部分的按月分区。如果一个小的、孤立的插入在此分区内创建了一个新部分，则查询性能可能会受到影响，因为 ClickHouse 必须读取多个部分直到合并完成。设置 min_age_to_force_merge_seconds 可以确保这些部分被激进合并，从而防止查询性能的下降。
