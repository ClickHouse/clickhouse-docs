---
'slug': '/guides/replacing-merge-tree'
'title': 'ReplacingMergeTree'
'description': '在 ClickHouse 中使用 ReplacingMergeTree 引擎'
'keywords':
- 'replacingmergetree'
- 'inserts'
- 'deduplication'
---

import postgres_replacingmergetree from '@site/static/images/migrations/postgres-replacingmergetree.png';
import Image from '@theme/IdealImage';

在事务型数据库针对事务更新和删除工作负载进行优化时，OLAP 数据库对这些操作提供较少的保证。相反，它们对以批量方式插入的不可变数据进行优化，从而显著加快分析查询的速度。虽然 ClickHouse 通过突变操作提供了更新操作以及一种轻量级删除行的方法，但其列式结构意味着这些操作应谨慎调度，如上述所述。这些操作是异步处理的，使用单个线程进行处理，并且（在更新情况下）需要在磁盘上重写数据。因此，它们不应用于大量小的更改。

为了处理更新和删除行的流，并避免上述使用模式，我们可以使用 ClickHouse 表引擎 ReplacingMergeTree。

## 自动更新插入行 {#automatic-upserts-of-inserted-rows}

[ReplacingMergeTree 表引擎](/engines/table-engines/mergetree-family/replacingmergetree) 允许对行执行更新操作，无需使用低效的 `ALTER` 或 `DELETE` 语句，用户可以插入多份相同的行，并将其中一份标记为最新版本。后台进程异步移除同一行的旧版本，通过使用不可变的插入高效地模拟更新操作。

这依赖于表引擎识别重复行的能力。通过使用 `ORDER BY` 子句来确定唯一性，即如果两行在 `ORDER BY` 中指定的列的值相同，则它们被视为重复。定义表时指定的 `version` 列允许在识别到两行重复时保留最新版本，即保留版本值最高的行。

我们在下面的示例中说明这个过程。在这里，行通过 A 列独特地标识（表的 `ORDER BY`）。我们假设这些行以两个批次插入，从而在磁盘上形成两个数据部分。稍后，在异步后台处理过程中，这些部分将合并在一起。

ReplacingMergeTree 还允许指定删除列。该列可以包含 0 或 1 值，其中值为 1 表示该行（及其副本）已被删除，0 表示其他情况。**注意：删除的行在合并时不会被移除。**

在这个过程中，部分合并时会发生以下情况：

- 对于 A 列值为 1 的行，有一行版本为 2 的更新行和一行版本为 3 的删除行（删除列值为 1）。因此，标记为删除的最新行被保留。
- 对于 A 列值为 2 的行，有两行更新行。较后的一行被保留，价格列的值为 6。
- 对于 A 列值为 3 的行，有一行版本为 1 和一行版本为 2 的删除行。该删除行被保留。

通过这个合并过程，我们得到了四行，代表最终状态：

<br />

<Image img={postgres_replacingmergetree} size="md" alt="ReplacingMergeTree process"/>

<br />

请注意，删除的行不会被移除。可以使用 `OPTIMIZE table FINAL CLEANUP` 强制删除。这需要实验性设置 `allow_experimental_replacing_merge_with_cleanup=1`。此操作仅在以下条件下发出：

1. 在操作发出后，您可以确保不会插入任何旧版本的行（对于那些将被清理的行）。如果这些行被插入，它们将被错误地保留，因为已删除的行将不再存在。
2. 确保在发出清理之前所有副本都已同步。这可以通过以下命令实现：

<br />

```sql
SYSTEM SYNC REPLICA table
```

我们建议在确保 (1) 后暂停插入，直到此命令和后续的清理完成。

> 使用 ReplacingMergeTree 处理删除操作仅建议用于删除数量低到中等的表（少于 10%），除非可以按照上述条件安排清理时间段。

> 提示：用户还可以对不再受到更改影响的选择性分区发出 `OPTIMIZE FINAL CLEANUP`。

## 选择主键/去重键 {#choosing-a-primarydeduplication-key}

上述内容中，我们强调了在 ReplacingMergeTree 的情况下必须满足的一个重要额外约束：`ORDER BY` 的列值在变更中唯一标识一行。如果是从像 Postgres 的事务型数据库迁移，则原 Postgres 主键应包含在 ClickHouse 的 `ORDER BY` 子句中。

ClickHouse 的用户将熟悉选择其表中 `ORDER BY` 子句的列以[优化查询性能](/data-modeling/schema-design#choosing-an-ordering-key)。通常，这些列应基于您[频繁查询的列并按增大基数顺序列出](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)。重要的是，ReplacingMergeTree 施加了一个额外约束：这些列必须是不可变的，即如果从 Postgres 复制，则仅在底层 Postgres 数据中不更改的情况下，将列添加到此子句中。虽然其他列可以改变，但它们在唯一行标识中需保持一致。

对于分析工作负载而言，Postgres 主键通常几乎没有用，因为用户很少进行点行查找。鉴于我们建议按增大基数的顺序排列列，并且在 `[ORDER BY] 中列出的前面列的匹配通常更快](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，Postgres 主键应附加到 `ORDER BY` 的末尾（除非它具有分析价值）。如果多个列在 Postgres 中形成主键，应将其附加到 `ORDER BY` 中，同时尊重基数和查询值的可能性。用户可能还希望通过 `MATERIALIZED` 列使用值的连接生成一个唯一主键。

考虑 Stack Overflow 数据集中的帖子表。

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

我们使用 `(PostTypeId, toDate(CreationDate), CreationDate, Id)` 的 `ORDER BY` 键。`Id` 列每个帖子都是唯一的，确保可以去重。根据需求添加 `Version` 和 `Deleted` 列到模式中。

## 查询 ReplacingMergeTree {#querying-replacingmergetree}

在合并时，ReplacingMergeTree 使用 `ORDER BY` 列的值作为唯一标识符，识别重复行，要么保留最高版本的行，要么如果最新版本指示删除，则删除所有重复行。然而，这仅提供最终的正确性 - 它不保证行将被去重，因此不应对此产生依赖。因此，由于在查询中考虑到更新和删除行，查询可能会产生不正确的答案。

为了获取正确的答案，用户需要在查询时去重和删除移除，来补充后台合并。这可以通过使用 `FINAL` 运算符实现。

考虑上面的帖子表。我们可以使用加载此数据集的普通方法，但在值 0 之外指定删除和版本列。例如出于示范目的，我们只加载 10000 行。

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

我们现在更新我们的回答统计信息。我们并不是更新这些值，而是插入 5000 行的行的新副本，并将它们的版本号加一（这意味着表中将存在 150 行）。我们可以通过简单的 `INSERT INTO SELECT` 来模拟这一点：

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

此外，我们通过重新插入行但将删除列值设置为 1 来删除 1000 个随机帖子。同样，模拟这个也可以通过简单的 `INSERT INTO SELECT`。

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

上述操作的结果将是 16,000 行，即 10,000 + 5000 + 1000。正确的总数是，实际上我们应该比原始总数少 1000 行，即 10,000 - 1000 = 9000。

```sql
SELECT count()
FROM posts_updateable

┌─count()─┐
│   10000 │
└─────────┘
1 row in set. Elapsed: 0.002 sec.
```

您的结果在这里会有所不同，具体取决于发生的合并情况。我们可以看到这里的总数不同，因为我们有重复的行。对表应用 `FINAL` 将返回正确的结果。

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

尽管持续改进，`FINAL` 运算符对查询仍会有性能开销。当查询未在主键列上进行过滤时，这种开销最为明显，导致读取更多数据，并增加去重开销。如果用户使用 `WHERE` 条件在关键列上进行过滤，通过去重所加载和传递的数据会减少。

如果 `WHERE` 条件未使用关键列，ClickHouse 在使用 `FINAL` 时不会当前利用 `PREWHERE` 优化。此优化旨在减少读取未过滤列的行数。有关模拟此 `PREWHERE` 从而潜在提高性能的示例，可以在[此处](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1#final-performance)找到。

## 利用分区与 ReplacingMergeTree {#exploiting-partitions-with-replacingmergetree}

ClickHouse 的数据合并发生在分区级别。使用 ReplacingMergeTree 时，我们建议用户根据最佳实践对表进行分区，前提是用户可以确保**分区键对行不改变**。这将确保与同一行相关的更新发送到同一 ClickHouse 分区。您可以重用 Postgres 的相同分区键，只要您遵循此处概述的最佳实践。

假设是这种情况，用户可以使用设置 `do_not_merge_across_partitions_select_final=1` 来提高 `FINAL` 查询性能。此设置使得在使用 FINAL 时，分区独立进行合并和处理。

考虑以下帖子表，其中我们不使用分区：

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

为了确保 `FINAL` 需要执行一些操作，我们更新 1m 行 - 通过插入重复行将其 `AnswerCount` 递增。

```sql
INSERT INTO posts_no_part SELECT Version + 1 AS Version, Deleted, Id, PostTypeId, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount + 1 AS AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate
FROM posts_no_part
LIMIT 1000000
```

计算每年答案的总和，并使用 `FINAL`：

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

对按年分区的表重复相同的步骤，并使用 `do_not_merge_across_partitions_select_final=1` 重复上述查询。

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

如所示，分区在此情况下显著改善了查询性能，通过允许去重过程在分区级别并行发生。

## 合并行为考虑 {#merge-behavior-considerations}

ClickHouse 的合并选择机制不仅仅是简单地合并部分。下面，我们将探讨在 ReplacingMergeTree 上下文中的这种行为，包括用于启用对旧数据更激进合并的配置选项以及较大部分的考虑因素。

### 合并选择逻辑 {#merge-selection-logic}

尽管合并旨在将部分数量最小化，但它还需要在写放大成本与此目标之间保持平衡。因此，如果部分范围的合并会导致过度的写放大，则将其排除在外。这种行为有助于防止资源不必要的使用，并延长存储组件的使用寿命。

### 对大部分的合并行为 {#merging-behavior-on-large-parts}

ClickHouse 中的 ReplacingMergeTree 引擎经过优化以通过合并数据部分来管理重复行，仅保留基于指定唯一键的每行的最新版本。然而，当合并部分达到 max_bytes_to_merge_at_max_space_in_pool 阈值时，即使设置了 min_age_to_force_merge_seconds，它也将不再被选择进行进一步合并。因此，无法再依赖自动合并来移除可能随着持续数据插入而累积的重复行。

为了解决这个问题，用户可以调用 OPTIMIZE FINAL 来手动合并部分并移除重复行。与自动合并不同，OPTIMIZE FINAL 将绕过 max_bytes_to_merge_at_max_space_in_pool 阈值，仅根据可用资源（特别是磁盘空间）合并部分，直到每个分区余留一个部分。然而，该方法在大表上可能消耗大量内存，并且可能需要在添加新数据时重复执行。

为了保持性能，建议对表进行分区。这可以帮助防止数据部分达到最大合并大小，并减少持续人工优化的需求。

### 跨分区的合并与分区 {#partitioning-and-merging-across-partitions}

如在利用分区与 ReplacingMergeTree 中所讨论的，我们建议将表分区作为最佳实践。分区将数据隔离以实现更高效的合并，并避免在查询执行期间跨分区合并。这种行为在 23.12 及更高版本中得到了增强：如果分区键是排序键的前缀，则查询时不会跨分区合并，从而提高查询性能。

### 调整合并以提高查询性能 {#tuning-merges-for-better-query-performance}

默认情况下，min_age_to_force_merge_seconds 和 min_age_to_force_merge_on_partition_only 分别设置为 0 和 false，禁用这些功能。在此配置中，ClickHouse 将应用标准合并行为，而不会根据分区年龄强制合并。

如果为 min_age_to_force_merge_seconds 指定了值，则 ClickHouse 将忽略对超过指定时间段的部分的正常合并启发式。虽然这通常仅在目的是最小化部分总数时有效，但它通过减少查询时需要合并的部分数量，可以提高 ReplacingMergeTree 的查询性能。

使用设置 min_age_to_force_merge_on_partition_only=true 进一步调整此行为，要求分区中的所有部分必须大于 min_age_to_force_merge_seconds，才能进行激进合并。此配置允许旧分区随着时间的推移合并为一个部分，从而整合数据并保持查询性能。

### 推荐设置 {#recommended-settings}

:::warning
调整合并行为是一项高级操作。我们建议在生产工作负载中启用这些设置之前咨询 ClickHouse 支持。
:::

在大多数情况下，将 min_age_to_force_merge_seconds 设置为一个低值—显著低于分区周期—是首选。这可以最大限度地减少部分数量，并防止在使用 FINAL 运算符时不必要的合并。

例如，考虑一个已经合并为一个部分的每月分区。如果一个小的零散插入在此分区内创建了一个新部分，由于 ClickHouse 必须读取多个部分直到合并完成，查询性能可能会受到影响。设置 min_age_to_force_merge_seconds 可以确保这些部分得到积极合并，防止查询性能退化。
