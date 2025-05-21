---
'slug': '/guides/replacing-merge-tree'
'title': 'ReplacingMergeTree'
'description': 'Using the ReplacingMergeTree engine in ClickHouse'
'keywords':
- 'replacingmergetree'
- 'inserts'
- 'deduplication'
---

import postgres_replacingmergetree from '@site/static/images/migrations/postgres-replacingmergetree.png';
import Image from '@theme/IdealImage';

虽然事务性数据库针对事务更新和删除工作负载进行了优化，但OLAP数据库对此类操作提供的保证较少。相反，它们针对批量插入不可变数据进行了优化，以提高分析查询的速度。虽然ClickHouse通过变更操作提供更新操作以及一种轻量级的删除行方式，但其列式结构意味着这些操作应谨慎安排，如上所述。这些操作是异步处理的，使用单线程处理，并且（在更新的情况下）需要在磁盘上重写数据。因此，它们不适合高频率的小变更。

为了处理更新和删除行的流，同时避免上述使用模式，我们可以使用ClickHouse表引擎ReplacingMergeTree。

## 自动合并插入的行 {#automatic-upserts-of-inserted-rows}

[ReplacingMergeTree表引擎](/engines/table-engines/mergetree-family/replacingmergetree)允许对行应用更新操作，而无需使用低效的`ALTER`或`DELETE`语句，它提供了用户插入相同行的多个副本并标记一个为最新版本的功能。后台进程依此异步移除同一行的较旧版本，通过使用不可变插入有效地模拟更新操作。这依赖于表引擎识别重复行的能力。通过使用`ORDER BY`子句来确定唯一性，即如果两行在`ORDER BY`中指定的列的值相同，则它们被视为重复。定义表时指定的`version`列允许保留在被识别为重复的情况下最新版本的行，即保留版本值最高的行。

我们在下面的示例中说明这一过程。在这里，行通过A列（表的`ORDER BY`）进行唯一识别。我们假设这些行作为两批插入，从而在磁盘上形成两个数据部分。后来，在异步后台进程中，这些部分被合并在一起。

ReplacingMergeTree还允许指定一个删除列。该列可以包含0或1，其中值1表示该行（及其副本）已被删除，值0则表示相反。 **注意：在合并时不会移除已删除的行。**

在此过程中，在部分合并时发生以下情况：

- 对于A列值为1的行，有一个版本为2的更新行和一个版本为3的删除行（删除列值为1）。因此，标记为删除的最新行被保留。
- 对于A列值为2的行，有两个更新行。最后一行的价格列值为6，因此被保留。
- 对于A列值为3的行，有一个版本为1的行和一个版本为2的删除行。此删除行被保留。

通过这个合并过程，我们有四行表示最终状态：

<br />

<Image img={postgres_replacingmergetree} size="md" alt="ReplacingMergeTree过程"/>

<br />

请注意，已删除的行永远不会被移除。可以通过`OPTIMIZE table FINAL CLEANUP`强制删除它们。这需要实验性设置`allow_experimental_replacing_merge_with_cleanup=1`。这仅应在以下条件下发出：

1. 确保在发出操作后不会插入包含旧版本的行（即将通过清理删除的行）。如果这些行被插入，它们将被不正确地保留，因为已删除的行将不再存在。
2. 在发出清理之前，确保所有副本保持同步。这可以通过以下命令实现：

<br />

```sql
SYSTEM SYNC REPLICA table
```

我们建议在确保(1)后暂停插入，直到此命令及后续清理完成。

> 处理使用ReplacingMergeTree 的删除时，仅建议在删除数量较少到适中的表中使用（少于10%），除非可以安排时间进行清理，满足上述条件。

> 提示：用户还可以针对不再受更改影响的选择性分区发出`OPTIMIZE FINAL CLEANUP`。

## 选择主键/去重键 {#choosing-a-primarydeduplication-key}

上述内容强调了在使用ReplacingMergeTree时必须满足的一个重要附加约束：`ORDER BY`中的列值在变更跨越时唯一识别行。如果从如Postgres的事务数据库迁移，则应将原始Postgres主键包含在ClickHouse的`ORDER BY`子句中。

ClickHouse用户会熟悉在其表的`ORDER BY`子句中选择列以[优化查询性能](/data-modeling/schema-design#choosing-an-ordering-key)。通常，这些列应根据您的[频繁查询并按基数递增的顺序列出](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)。重要的是，ReplacingMergeTree施加了一个额外的约束——这些列必须不可变。即如果从Postgres进行复制，则仅在这些列在底层Postgres数据中不变时，才将它们添加到此子句。虽然其他列可以更改，但这些列要求保持一致，以实现唯一行识别。

对于分析工作负载，Postgres主键通常用处不大，因为用户很少执行精确的行查找。考虑到我们建议按照基数递增的顺序对列进行排序，以及在`ORDER BY`中列出的较早列的匹配通常会更快，Postgres主键应附加到`ORDER BY`的末尾（除非它具有分析价值）。如果在Postgres中多个列形成主键，则应按照基数和查询值的可能性将其附加到`ORDER BY`。用户可能还希望使用通过`MATERIALIZED`列值的连接生成唯一主键。

考虑Stack Overflow数据集中的帖子表。

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

我们使用`(PostTypeId, toDate(CreationDate), CreationDate, Id)`作为`ORDER BY`键。`Id`列对于每个帖子是唯一的，确保行可以去重。根据需要将`Version`和`Deleted`列添加到模式中。

## 查询ReplacingMergeTree {#querying-replacingmergetree}

在合并时，ReplacingMergeTree通过使用`ORDER BY`列的值作为唯一标识符来识别重复行，仅保留最高版本，或者如果最新版本指示删除，则移除所有副本。然而，这仅提供最终正确性 - 并不能保证行会去重，因此不应依赖于此。因此，查询可能由于更新和删除行在查询中被考虑而产生不正确的答案。

为了获得正确的答案，用户将需要在查询时去重和移除删除，在背景合并的基础上。这可以使用`FINAL`运算符实现。

考虑上面的帖子表。我们可以使用加载该数据集的常规方法，但在值0的基础上还需指定删除和版本列。为了示例目的，加载10000行。

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

我们现在更新我们的帖子答案统计信息。与其更新这些值，不如插入新副本的5000行并将它们的版本号加一（这意味着表中将存在150行）。我们可以通过简单的`INSERT INTO SELECT`来模拟这一操作：

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

此外，我们通过重新插入行但将删除列值设置为1来删除1000个随机帖子。再次说，通过简单的`INSERT INTO SELECT`可以模拟这个过程。

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

上述操作的结果将是16000行，即10000 + 5000 + 1000。这里的正确总数实际上应该比原始总数少1000，即10000 - 1000 = 9000。

```sql
SELECT count()
FROM posts_updateable

┌─count()─┐
│   10000 │
└─────────┘
1 row in set. Elapsed: 0.002 sec.
```

此处的结果会因发生的合并而有所不同。我们可以看到总数不同，因为我们有重复行。对表应用`FINAL`会产生正确的结果。

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

## FINAL性能 {#final-performance}

尽管正在持续改进，`FINAL`运算符在查询时会有性能开销。当查询没有在主键列上过滤时，这种开销最为明显，因为会读取更多数据并增加去重开销。如果用户使用`WHERE`条件在关键列上进行过滤，则加载并传递进行去重的数据将减少。

如果`WHERE`条件不使用关键列，ClickHouse当前在使用`FINAL`时不会利用`PREWHERE`优化。此优化旨在减少对不被过滤列读取的行数。有关模拟此`PREWHERE`从而可能提高性能的示例，请参见[这里](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1#final-performance)。

## 利用ReplacingMergeTree的分区 {#exploiting-partitions-with-replacingmergetree}

在ClickHouse中，数据的合并发生在分区级别。使用ReplacingMergeTree时，我们建议用户根据最佳实践对表进行分区，前提是用户能确保此**分区键在行中不变**。这将确保与相同行相关的更新将被发送到同一个ClickHouse分区。只要遵循此处概述的最佳实践，您可以重用与Postgres相同的分区键。

假设情况确实如此，用户可以使用设置`do_not_merge_across_partitions_select_final=1`来提高`FINAL`查询性能。此设置会导致在使用FINAL时对分区进行独立合并和处理。

考虑以下帖子表，其中不使用分区：

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

为了确保`FINAL`需要进行一些工作，我们更新100万行 - 通过插入重复行将其`AnswerCount`递增。

```sql
INSERT INTO posts_no_part SELECT Version + 1 AS Version, Deleted, Id, PostTypeId, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount + 1 AS AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate
FROM posts_no_part
LIMIT 1000000
```

使用`FINAL`计算每年的答案总和：

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

对按年分区的表重复这些步骤，并使用`do_not_merge_across_partitions_select_final=1`重复上述查询。

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

如所示，分区通过允许在分区级别并行进行去重过程显著提高了查询性能。

## 合并行为注意事项 {#merge-behavior-considerations}

ClickHouse的合并选择机制不仅仅是简单地合并片段。下面，我们在ReplacingMergeTree的上下文中检查此行为，包括启用针对旧数据进行更激进合并的配置选项以及大型部分的考虑。

### 合并选择逻辑 {#merge-selection-logic}

虽然合并旨在最小化部分数量，但它还平衡这一目标与写放大成本。因此，如果某些部分的合并会导致过度的写放大，则这些部分范围将被排除在外，基于内部计算。这种行为有助于防止不必要的资源浪费，延长存储组件的使用寿命。

### 对大型部分的合并行为 {#merging-behavior-on-large-parts}

ClickHouse中的ReplacingMergeTree引擎针对重复行进行了优化，合并数据部分，仅保留基于指定唯一键的每行的最新版本。然而，当合并的部分达到`max_bytes_to_merge_at_max_space_in_pool`阈值时，即使在设定`min_age_to_force_merge_seconds`的情况下，它也将不再被选中进行进一步合并。因此，无法再依赖自动合并来移除随着数据插入而可能积累的重复项。

为了解决这个问题，用户可以调用`OPTIMIZE FINAL`手动合并部分并移除重复。在与自动合并不同，`OPTIMIZE FINAL`绕过`max_bytes_to_merge_at_max_space_in_pool`阈值，仅基于可用资源（特别是磁盘空间）合并部分，直到每个分区仅剩下一个部分。然而，这种方法在大型表上可能会消耗大量内存，并且可能需要在添加新数据时重复执行。

为了更可持续的解决方案以保持性能，建议对表进行分区。这样有助于防止数据部分达到最大合并大小，并减少持续手动优化的需要。

### 跨分区的分区和合并 {#partitioning-and-merging-across-partitions}

如《利用ReplacingMergeTree的分区》中所述，我们建议将表进行分区作为最佳实践。分区隔离数据，使合并更高效，并避免在查询执行期间跨分区合并。这种行为在23.12及更高版本中得到了增强：如果分区键是排序键的前缀，则在查询时不会执行跨分区合并，从而提高查询性能。

### 调整合并以改善查询性能 {#tuning-merges-for-better-query-performance}

默认情况下，`min_age_to_force_merge_seconds`和`min_age_to_force_merge_on_partition_only`分别设置为0和false，禁用这些功能。在此配置中，ClickHouse将应用标准的合并行为，而不会根据分区年龄强制合并。

如果指定了`min_age_to_force_merge_seconds`的值，ClickHouse将忽略正常的合并启发式，针对比指定时间更老的部分。这通常仅在目标是最小化部分总数时有效，但在ReplacingMergeTree中可以通过减少查询时需要合并的部分数量提高查询性能。

通过将`min_age_to_force_merge_on_partition_only`设置为true，这种行为可以进一步调整，要求分区中的所有部分都必须比`min_age_to_force_merge_seconds`更老，才能进行激进的合并。此配置使较老的分区可以随时间合并为单个部分，从而整合数据并保持查询性能。

### 推荐设置 {#recommended-settings}

:::warning
调整合并行为是一个高级操作。在生产工作负载中启用这些设置之前，我们建议咨询ClickHouse支持。
:::

在大多数情况下，偏好将`min_age_to_force_merge_seconds`设置为低值——显著低于分区周期。这将最小化部分数量，并防止在查询时与`FINAL`运算符的不必要的合并。

例如，考虑一个已经合并为单个部分的按月分区。如果一个小的、独立的插入在此分区内创建了一个新部分，则查询性能可能会受到影响，因为ClickHouse必须读取多个部分直到合并完成。设置`min_age_to_force_merge_seconds`可以确保这些部分被激进地合并，从而防止查询性能降级。
