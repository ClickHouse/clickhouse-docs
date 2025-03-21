---
slug: /guides/replacing-merge-tree
title: ReplacingMergeTree
description: 使用 ClickHouse 中的 ReplacingMergeTree 引擎
keywords: [replacingmergetree, inserts, deduplication]
---

import postgres_replacingmergetree from '@site/static/images/migrations/postgres-replacingmergetree.png';

虽然事务性数据库针对事务更新和删除工作负载进行了优化，但 OLAP 数据库则在此类操作上提供较低的保证。相反，它们优化了以批次插入的不可变数据，以此显著加快分析查询的速度。尽管 ClickHouse 通过突变提供更新操作，并且以轻量级方式删除行，但其面向列的结构意味着这些操作应小心安排，如上所述。这些操作是异步处理的，使用单线程进行处理，并且在更新的情况下需要重写磁盘上的数据。因此，不应将其用于大量的小变更。

为了在避免上述使用模式的情况下处理更新和删除行的流，我们可以使用 ClickHouse 表引擎 ReplacingMergeTree。

## 自动插入的更新 {#automatic-upserts-of-inserted-rows}

[ReplacingMergeTree 表引擎](/engines/table-engines/mergetree-family/replacingmergetree) 允许对行应用更新操作，无需使用低效的 `ALTER` 或 `DELETE` 语句，用户可以插入同一行的多个副本，并指定其中一个为最新版本。反过来，后台进程异步地删除同一行的旧版本，利用不可变插入有效地模拟更新操作。

这依赖于表引擎识别重复行的能力。这是通过 `ORDER BY` 子句来确定唯一性实现的，即如果两行在 `ORDER BY` 指定的列上具有相同的值，则被视为重复行。在定义表时指定的 `version` 列允许在识别出重复行时保留行的最新版本，即保留具有最高版本值的行。

我们在下面的例子中说明这一过程。在这里，行由 A 列唯一标识（表的 `ORDER BY`）。我们假设这些行已作为两批插入，导致磁盘上形成两个数据分片。稍后，在异步后台处理期间，这些分片被合并在一起。

ReplacingMergeTree 还允许指定一个删除列。该列可以包含 0 或 1，其中值为 1 表示行（及其重复项）已被删除，而零表示相反。**注意：已删除的行不会在合并时被移除。**

在此过程中，分片合并期间发生以下情况：

- 标识为 A 列值为 1 的行同时有一个版本为 2 的更新行和一个版本为 3 的删除行（删除列值为 1）。因此，标记为删除的最新行被保留。
- 标识为 A 列值为 2 的行有两个更新行。保留后一个行，其价格列的值为 6。
- 标识为 A 列值为 3 的行有一个版本为 1 的行和一个版本为 2 的删除行。此删除行被保留。

通过此合并过程，我们最终有四行表示最终状态：

<br />

<img src={postgres_replacingmergetree} class="image" alt="ReplacingMergeTree process" style={{width: '800px', background: 'none'}} />

<br />

请注意，已删除的行永远不会被移除。可以通过 `OPTIMIZE table FINAL CLEANUP` 强制删除它们。这需要实验性设置 `allow_experimental_replacing_merge_with_cleanup=1`。应仅在以下条件下执行此操作：

1. 您可以确定，发出操作后不会插入包含旧版本的行（对于正在被清理的行）。如果插入这些行，它们将被错误地保留，因为已删除的行将不再存在。
2. 在发出清理之前确保所有副本处于同步状态。可以通过以下命令实现：

<br />

```sql
SYSTEM SYNC REPLICA table
```

我们建议在保证 (1) 后暂停插入，直到此命令及后续清理完成。

> 建议仅在低至中等数量的删除（少于 10%）的表上使用 ReplacingMergeTree 处理删除，除非可以根据上述条件安排清理周期。

> 提示：用户还可以对不再受更改影响的选择性分区发出 `OPTIMIZE FINAL CLEANUP`。

## 选择主键/去重键 {#choosing-a-primarydeduplication-key}

上面提到，我们必须满足 ReplacingMergeTree 的一个重要附加约束：`ORDER BY` 的列值在变更中唯一标识一行。如果从像 Postgres 这样的事务性数据库迁移，则原始 Postgres 主键应包含在 Clickhouse 的 `ORDER BY` 子句中。

ClickHouse 用户对在其表的 `ORDER BY` 子句中选择列以[优化查询性能](/data-modeling/schema-design#choosing-an-ordering-key)会很熟悉。通常，这些列应根据您的[频繁查询并按递增基数的顺序列出](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)进行选择。重要的是，ReplacingMergeTree 强加了一个额外的约束——这些列必须是不可变的，即，如果从 Postgres 复制，则仅在它们在基础 Postgres 数据中不变更时才将列添加到该子句中。虽然其他列可以更改，但这些列需要保持一致以进行唯一行标识。

对于分析工作负载，Postgres 主键通常没有多大用处，用户很少会执行逐行查找。由于我们建议按递增基数排列列，并且 [在 `ORDER BY` 中列出的较早列的匹配通常更快](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，Postgres 的主键应附加到 `ORDER BY` 的末尾（除非它具有分析价值）。如果在 Postgres 中多个列形成主键，则应将它们附加到 `ORDER BY` 中，同时尊重基数和查询值的可能性。用户也可以使用通过 `MATERIALIZED` 列生成值的串联来生成唯一主键。

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

我们使用 `(PostTypeId, toDate(CreationDate), CreationDate, Id)` 的 `ORDER BY` 键。`Id` 列对于每个帖子是唯一的，确保行可以去重。`Version` 和 `Deleted` 列根据需要添加到模式中。

## 查询 ReplacingMergeTree {#querying-replacingmergetree}

在合并时，ReplacingMergeTree 使用 `ORDER BY` 列的值识别重复行，将其作为唯一标识，保留最高版本或删除所有副本（如果最新版本指示删除）。然而，这只提供最终准确性——它不保证行会被去重，因此您不应依赖它。因此，查询可能会因考虑到更新和删除行而产生不正确的答案。

为了获得正确的答案，用户需要用查询时间的去重和删除移除补充后台合并。这可以使用 `FINAL` 操作符实现。

考虑上面的 posts 表。我们可以使用加载该数据集的常规方法，但除了值 0 之外还指定一个删除和版本列。为了示例目的，我们仅加载 10000 行。

```sql
INSERT INTO stackoverflow.posts_updateable SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet') WHERE AnswerCount > 0 LIMIT 10000

0 rows in set. Elapsed: 1.980 sec. Processed 8.19 thousand rows, 3.52 MB (4.14 thousand rows/s., 1.78 MB/s.)
```

让我们确认行数：

```sql
SELECT count() FROM stackoverflow.posts_updateable

┌─count()─┐
│   10000 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

我们现在更新我们的帖子-答案统计信息。我们没有更新这些值，而是插入 5000 行的新副本并将它们的版本号加一（这意味着表中将存在 150 行）。我们可以用简单的 `INSERT INTO SELECT` 来模拟这一点：

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

此外，我们通过重新插入这些行（但将删除列值设置为 1）来删除 1000 条随机帖子。再次模拟这一过程可以使用简单的 `INSERT INTO SELECT`。

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

以上操作的结果将是 16000 行，即 10000 + 5000 + 1000。这里的正确总数实际上应为比我们原始总数少 1000 行，即 10000 - 1000 = 9000。

```sql
SELECT count()
FROM posts_updateable

┌─count()─┐
│   10000 │
└─────────┘
1 row in set. Elapsed: 0.002 sec.
```

您的结果可能会因发生的合并而有所不同。我们可以看到总数不同，因为我们有重复行。对表应用 `FINAL` 可以得到正确的结果。

```sql
SELECT count()
FROM posts_updateable
FINAL

┌─count()─┐
│	9000 │
└─────────┘

1 row in set. Elapsed: 0.006 sec. Processed 11.81 thousand rows, 212.54 KB (2.14 million rows/s., 38.61 MB/s.)
Peak memory usage: 8.14 MiB.
```

## FINAL 性能 {#final-performance}

`FINAL` 操作符在查询时会产生性能开销，尽管持续改进。尤其在查询不针对主键列时，这种开销最为显著，因为会读取更多数据并增加去重开销。如果用户在使用 `WHERE` 条件时过滤主键列，则加载和传递用于去重的数据将减少。

如果 `WHERE` 条件不使用主键列，ClickHouse 目前在使用 `FINAL` 时不会利用 `PREWHERE` 优化。此优化旨在减少读取未过滤列的行数。有关模拟此 `PREWHERE` 以可能提高性能的示例，可以参见 [这里](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1#final-performance)。

## 利用分区的 ReplacingMergeTree {#exploiting-partitions-with-replacingmergetree}

ClickHouse 中的数据合并发生在分区级别。当使用 ReplacingMergeTree 时，我们建议用户根据最佳实践对表进行分区，前提是用户可以确保该 **分区键在行中不会改变**。这将确保涉及同一行的更新将发送到同一 ClickHouse 分区。您可以重复使用与 Postgres 相同的分区键，只要您遵循此处列出的最佳实践。

假设确实如此，用户可以使用设置 `do_not_merge_across_partitions_select_final=1` 来改善 `FINAL` 查询性能。此设置使分区在使用 FINAL 时独立合并和处理。

考虑以下没有分区的 posts 表：

```sql
CREATE TABLE stackoverflow.posts_no_part
(
	`Version` UInt32,
	`Deleted` UInt8,
	`Id` Int32 CODEC(Delta(4), ZSTD(1)),
	…
)
ENGINE = ReplacingMergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate, Id)

INSERT INTO stackoverflow.posts_no_part SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet')

0 rows in set. Elapsed: 182.895 sec. Processed 59.82 million rows, 38.07 GB (327.07 thousand rows/s., 208.17 MB/s.)
```

为了确保 `FINAL` 需要进行一些工作，我们更新 100 万行 - 通过插入重复行增加其 `AnswerCount`。

```sql
INSERT INTO posts_no_part SELECT Version + 1 AS Version, Deleted, Id, PostTypeId, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount + 1 AS AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate
FROM posts_no_part
LIMIT 1000000
```

使用 `FINAL` 计算每年的答案总和：

```sql
SELECT toYear(CreationDate) AS year, sum(AnswerCount) AS total_answers
FROM posts_no_part
FINAL
GROUP BY year
ORDER BY year ASC

┌─year─┬─total_answers─┐
│ 2008 │    	371480 │
…
│ 2024 │    	127765 │
└──────┴───────────────┘

17 rows in set. Elapsed: 2.338 sec. Processed 122.94 million rows, 1.84 GB (52.57 million rows/s., 788.58 MB/s.)
Peak memory usage: 2.09 GiB.
```

对按年分区的表重复上述步骤，并在重复上述查询时使用 `do_not_merge_across_partitions_select_final=1`。

```sql
CREATE TABLE stackoverflow.posts_with_part
(
	`Version` UInt32,
	`Deleted` UInt8,
	`Id` Int32 CODEC(Delta(4), ZSTD(1)),
	…
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
│ 2008 │    	387832 │
│ 2009 │   	1165506 │
│ 2010 │   	1755437 │
…
│ 2023 │    	787032 │
│ 2024 │    	127765 │
└──────┴───────────────┘

17 rows in set. Elapsed: 0.994 sec. Processed 64.65 million rows, 983.64 MB (65.02 million rows/s., 989.23 MB/s.)
```

如上所示，分区在此案例中显著提高了查询性能，因为它允许去重过程在分区级别并行进行。

## 合并行为考量 {#merge-behavior-considerations}

ClickHouse 的合并选择机制超越了简单的分片合并。下面，我们在 ReplacingMergeTree 的上下文中检查这一行为，包括启用更积极合并旧数据的配置选项和针对大型分片的考量。

### 合并选择逻辑 {#merge-selection-logic}

尽管合并旨在最小化分片数量，但它也权衡了写放大成本。因此，如果合并会导致过多的写放大，则会排除某些分片范围。此行为有助于防止不必要的资源使用并延长存储组件的使用寿命。

### 大型分片上的合并行为 {#merging-behavior-on-large-parts}

ClickHouse 中的 ReplacingMergeTree 引擎针对通过合并数据分片来管理重复行进行了优化，仅根据指定的唯一键保留每行的最新版本。然而，当合并分片达到 `max_bytes_to_merge_at_max_space_in_pool` 阈值时，它将不再被选为进一步合并，即使 `min_age_to_force_merge_seconds` 被设置。因此，不能再依赖自动合并来删除随数据插入而累积的重复项。

为了解决这个问题，用户可以调用 `OPTIMIZE FINAL` 来手动合并分片并删除重复项。与自动合并不同，`OPTIMIZE FINAL` 跳过 `max_bytes_to_merge_at_max_space_in_pool` 阈值，基于可用资源（特别是磁盘空间）进行分片合并，直到每个分区只剩下一个分片。然而，这种方法在大型表上可能会消耗大量内存，并且可能需要重复执行以添加新数据。

为了保持性能的更可持续解决方案，建议对表进行分区。这可以帮助防止数据分片达到最大合并大小，并减少持续手动优化的需求。

### 分区和跨分区合并 {#partitioning-and-merging-across-partitions}

如在利用 ReplacingMergeTree 分区所述，我们建议将表分区作为最佳实践。分区隔离数据以提高合并效率，避免在查询执行过程中跨分区合并。这种行为在 23.12 及更高版本中得到了增强：如果分区键是排序键的前缀，则在查询时不会跨分区合并，从而提高查询性能。

### 调整合并以改善查询性能 {#tuning-merges-for-better-query-performance}

默认情况下，`min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only` 设置为 0 和 false，分别禁用这些功能。在此配置下，ClickHouse 将应用标准合并行为，而不基于分区年龄强制合并。

如果为 `min_age_to_force_merge_seconds` 指定了一个值，ClickHouse 将忽略正常的合并启发式，适用于超过指定周期的分片。虽然这通常仅在目标是最小化分片数量时有效，但它可以通过减少查询时需要合并的分片数量来改善 ReplacingMergeTree 的查询性能。

这种行为可以进一步通过将 `min_age_to_force_merge_on_partition_only` 设置为 true 来调整，要求所有分区中的分片都比 `min_age_to_force_merge_seconds` 更老，以实现积极合并。这种配置允许较旧的分区随时间合并为单个分片，从而整合数据并保持查询性能。

### 推荐设置 {#recommended-settings}

:::warning
调整合并行为是一项高级操作。我们建议在生产工作负载中启用这些设置之前咨询 ClickHouse 支持。
:::

在大多数情况下，将 `min_age_to_force_merge_seconds` 设置为一个低值——显著低于分区周期——是较好的选择。这将最小化分片数量，并防止在使用 `FINAL` 操作符时不必要的合并。

例如，考虑一个已经合并为单个分片的按月分区。如果一个小的零星插入在此分区内创建了一个新分片，则查询性能可能会受到影响，因为 ClickHouse 必须读取多个分片，直到合并完成。设置 `min_age_to_force_merge_seconds` 可以确保这些分片被积极合并，从而防止查询性能下降。
