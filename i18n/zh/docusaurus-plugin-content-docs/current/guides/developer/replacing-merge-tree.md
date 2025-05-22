import postgres_replacingmergetree from '@site/static/images/migrations/postgres-replacingmergetree.png';
import Image from '@theme/IdealImage';

尽管事务数据库针对事务更新和删除工作负载进行了优化，但 OLAP 数据库对这些操作提供了较低的保证。相反，它们优化用于批量插入的不可变数据，以便显著加快分析查询的速度。虽然 ClickHouse 通过变更提供了更新操作，以及轻量级删除行的方式，但其列式结构意味着这些操作应谨慎安排，如上所述。这些操作是异步处理的，采用单线程处理，并且（在更新的情况下）需要在磁盘上重写数据。因此，不应将其用于高数量的小更改。
为了处理一串更新和删除行，同时避免上述使用模式，我们可以使用 ClickHouse 表引擎 ReplacingMergeTree。

## 插入行的自动 upsert {#automatic-upserts-of-inserted-rows}

[替换 MergeTree 表引擎](/engines/table-engines/mergetree-family/replacingmergetree) 允许在不需要使用低效的 `ALTER` 或 `DELETE` 语句的情况下，对行应用更新操作，提供了用户插入同一行的多个副本并标记其中一个为最新版本的能力。一个后台进程则异步移除同一行的较旧版本，通过使用不可变插入有效地模拟更新操作。
这依赖于表引擎识别重复行的能力。通过使用 `ORDER BY` 子句来确定唯一性，即如果两行在 `ORDER BY` 中指定的列上具有相同的值，则它们被视为重复。定义表时指定的 `version` 列允许在两个行被识别为重复时保留行的最新版本，即保留具有最高版本值的行。
我们在下面的示例中说明这个过程。在这里，行通过 A 列（表的 `ORDER BY`）唯一标识。我们假设这些行已作为两个批次插入，导致在磁盘上形成两个数据部分。随后，在一个异步后台处理中，这些部分被合并在一起。

ReplacingMergeTree 还允许指定一个删除列。此列可以包含 0 或 1，其中值为 1 表示该行（及其副本）已经被删除，而零则表示其他情况。 **注意：删除的行在合并时不会被移除。**

在这个过程中，部分合并时会发生以下情况：

- 对于 A 列值为 1 的行，存在一个版本为 2 的更新行和一个版本为 3 的删除行（以及一个删除列值为 1）。因此，标记为已删除的最新行将被保留。
- 对于 A 列值为 2 的行，存在两个更新行。保留后一个行，其价格列值为 6。
- 对于 A 列值为 3 的行，存在一个版本为 1 的行和一个版本为 2 的删除行。此删除行将被保留。

作为此次合并过程的结果，我们得到了四行代表最终状态：

<br />

<Image img={postgres_replacingmergetree} size="md" alt="替换 MergeTree 过程"/>

<br />

请注意，删除的行永远不会被移除。可以通过运行 `OPTIMIZE table FINAL CLEANUP` 强制删除它们。这需要实验性设置 `allow_experimental_replacing_merge_with_cleanup=1`。只有在以下情况下才应发出此命令：

1. 确保在发出操作后，没有旧版本的行（对于正在清理的行）将被插入。如果插入，这些行将被错误地保留，因为删除的行将不再存在。
2. 在执行清理之前，确保所有副本保持同步。这可以通过命令实现：

<br />

```sql
SYSTEM SYNC REPLICA table
```

我们建议在确认 (1) 后暂停插入，直到此命令和随后的清理完成。

> 针对替换 MergeTree 的删除操作仅建议在删除数量较低到适中的表（少于 10%）中使用，除非可以根据上述条件安排清理时间。

> 提示：用户还可以对不再受变化影响的选择性分区发出 `OPTIMIZE FINAL CLEANUP`。

## 选择主键/去重键 {#choosing-a-primarydeduplication-key}

上面，我们强调了在使用 ReplacingMergeTree 的情况下必须满足的重要附加约束：`ORDER BY` 的列值在变化期间唯一标识一行。如果从事务数据库（如 Postgres）迁移，则应将原始的 Postgres 主键包括在 ClickHouse 的 `ORDER BY` 子句中。

ClickHouse 用户将熟悉在其表的 `ORDER BY` 子句中选择列以 [优化查询性能](/data-modeling/schema-design#choosing-an-ordering-key)。通常，这些列应根据您的 [频繁查询并按基数递增的顺序列出](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)。重要的是，ReplacingMergeTree 施加了一个额外的约束——这些列必须是不可变的，即如果从 Postgres 复制，仅在这些列在底层 Postgres 数据中不发生变化时，才应将其添加到此子句中。虽然其他列可以变化，但这些列需要保持一致，以便进行唯一行识别。
对于分析工作负载，Postgres 主键通常几乎没有用，因为用户通常不会执行点行查找。鉴于我们建议列应按基数递增的顺序排列，以及在 [ORDER BY 中较早列出的列匹配通常速度更快](/guides/best-practices/sparse-primary-indexes#ordering-key-columns-efficiently)，因此 Postgres 主键应附加到 `ORDER BY` 的末尾（除非其具有分析价值）。如果在 Postgres 中多个列组成主键，则应注意基数和查询值的可能性，将其附加到 `ORDER BY` 中。用户也可能希望通过 `MATERIALIZED` 列使用值连接生成唯一主键。

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

我们使用 `(PostTypeId, toDate(CreationDate), CreationDate, Id)` 作为 `ORDER BY` 键。`Id` 列对于每个帖子是唯一的，确保行可以去重。根据需要，版本和删除列被添加到模式中。

## 查询 ReplacingMergeTree {#querying-replacingmergetree}

在合并时，ReplacingMergeTree 识别重复行，使用 `ORDER BY` 列的值作为唯一标识符，并保留最高版本或在最新版本指示删除时移除所有重复行。然而，这仅提供了最终正确性——它并不保证行会被去重，因此您不应依赖于此。因此，查询可能会因更新和删除行而产生不正确的答案。

为了获得正确答案，用户需要在查询时去重和删除，并补充后台合并。这可以通过使用 `FINAL` 运算符来实现。

考虑上述的帖子表。我们可以使用加载此数据集的正常方法，但除了值 0 外，另行指定一个删除和版本列。为了示例，我们仅加载 10000 行。

```sql
INSERT INTO stackoverflow.posts_updateable SELECT 0 AS Version, 0 AS Deleted, *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/stackoverflow/parquet/posts/*.parquet') WHERE AnswerCount > 0 LIMIT 10000

0 rows in set. Elapsed: 1.980 sec. Processed 8.19 thousand rows, 3.52 MB (4.14 thousand rows/s., 1.78 MB/s.)
```

我们来确认行数：

```sql
SELECT count() FROM stackoverflow.posts_updateable

┌─count()─┐
│   10000 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

我们现在更新我们的帖子-回答统计。我们不是更新这些值，而是插入新的 5000 行副本，并将它们的版本号加一（这意味着表中将存在 150 行）。我们可以用简单的 `INSERT INTO SELECT` 模拟这一过程：

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

此外，我们通过重新插入行但将删除列值设置为 1 来删除 1000 个随机帖子。同样，可以使用简单的 `INSERT INTO SELECT` 模拟这一过程。

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

您的结果将根据发生的合并而有所不同。可以看到，由于存在重复行，总数不同。对表应用 `FINAL` 将生成正确结果。

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

尽管正在进行改进，`FINAL` 运算符在查询上会有性能开销。当查询未在主键列上过滤时，这种开销最为明显，导致读取更多数据并增加去重开销。如果用户在主键列上使用 `WHERE` 条件进行过滤，那么加载和传递以供去重的数据将减少。

如果 `WHERE` 条件不使用关键列，ClickHouse 目前在使用 `FINAL` 时不会利用 `PREWHERE` 优化。此优化旨在减少未过滤列的读取行数。有关模拟此 `PREWHERE` 从而可能提高性能的示例，请见 [此处](https://clickhouse.com/blog/clickhouse-postgresql-change-data-capture-cdc-part-1#final-performance)。

## 利用 ReplacingMergeTree 的分区 {#exploiting-partitions-with-replacingmergetree}

ClickHouse 中的数据合并发生在分区级别。当使用 ReplacingMergeTree 时，我们建议用户根据最佳实践对表进行分区，前提是用户可以确保 **分区键在行中不变**。这将确保与同一行相关的更新将发送到同一 ClickHouse 分区。只要遵循此处概述的最佳实践，您可以重复使用与 Postgres 相同的分区键。

假设是这种情况，用户可以使用设置 `do_not_merge_across_partitions_select_final=1` 来提高 `FINAL` 查询性能。此设置使得在使用 FINAL 时，分区独立合并和处理。

考虑以下不分区的帖子表：

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

为了确保 `FINAL` 需要做一些工作，我们更新了 1m 行——通过插入重复行增加它们的 `AnswerCount`。

```sql
INSERT INTO posts_no_part SELECT Version + 1 AS Version, Deleted, Id, PostTypeId, AcceptedAnswerId, CreationDate, Score, ViewCount, Body, OwnerUserId, OwnerDisplayName, LastEditorUserId, LastEditorDisplayName, LastEditDate, LastActivityDate, Title, Tags, AnswerCount + 1 AS AnswerCount, CommentCount, FavoriteCount, ContentLicense, ParentId, CommunityOwnedDate, ClosedDate
FROM posts_no_part
LIMIT 1000000
```

计算每年的回答总数，使用 `FINAL`：

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

对按年分区的表重复这些步骤，使用 `do_not_merge_across_partitions_select_final=1` 重复上述查询。

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

如所示，在这种情况下，分区显著提高了查询性能，使得去重过程可以在分区级别并行进行。

## 合并行为考虑 {#merge-behavior-considerations}

ClickHouse 的合并选择机制超出了简单的合并部分。以下，我们在 ReplacingMergeTree 的上下文中检查此行为，包括启用对较旧数据进行更激进合并的配置选项及对大型部分的考虑。

### 合并选择逻辑 {#merge-selection-logic}

合并的目标是最小化部分的数量，同时也平衡这一目标和写放大带来的成本。因此，如果某些部分的合并会导致过度的写放大，根据内部计算，这些部分将被排除在合并之外。这种行为有助于防止不必要的资源使用并延长存储组件的使用寿命。

### 大部分的合并行为 {#merging-behavior-on-large-parts}

ClickHouse 中的 ReplacingMergeTree 引擎针对合并数据部分的重复行进行了优化，仅根据指定的唯一键保留每行的最新版本。但是，当合并的部分达到 `max_bytes_to_merge_at_max_space_in_pool` 阈值时，它将不会再被选中进行进一步的合并，即使设置了 `min_age_to_force_merge_seconds`。因此，自动合并不能再依赖以移除可能随着持续数据插入而积累的重复项。

为了应对这一问题，用户可以调用 `OPTIMIZE FINAL` 手动合并部分并移除重复项。与自动合并不同，`OPTIMIZE FINAL` 不受 `max_bytes_to_merge_at_max_space_in_pool` 阈值的限制，仅根据可用资源（尤其是磁盘空间）进行合并，直到每个分区剩下一个部分。然而，对于大型表，这种方法可能会对内存造成负担，并且可能需要随着新数据的添加而重复执行。

为实现维持性能的可持续解决方案，建议对表进行分区。这可以防止数据部分达到最大合并大小，并减少持续手动优化的需求。

### 分区和跨分区的合并 {#partitioning-and-merging-across-partitions}

正如在利用 ReplacingMergeTree 的分区中所讨论的，我们建议将表进行分区作为最佳实践。分区隔离数据以实现更高效的合并，并避免在查询执行期间跨分区合并。当分区键是排序键的前缀时，从 23.12 版起，该行为得到了增强：在查询时间不会执行跨分区合并，从而提高查询性能。

### 针对更好查询性能的合并调优 {#tuning-merges-for-better-query-performance}

默认情况下，`min_age_to_force_merge_seconds` 和 `min_age_to_force_merge_on_partition_only` 设置为 0 和 false，分别禁用这些功能。在这种配置下，ClickHouse 将使用标准合并行为，而不强制基于分区年龄进行合并。

如果指定 `min_age_to_force_merge_seconds` 的值，ClickHouse 将忽略对超过指定时间段的部分进行正常合并启发式方法。虽然这通常仅在目标是最小化部分的总数时有效，但在 ReplacingMergeTree 中通过减少查询时需合并的部分数量，可以提高查询性能。

可以通过设置 `min_age_to_force_merge_on_partition_only=true` 进一步调整这种行为，要求分区中的所有部分都必须超过 `min_age_to_force_merge_seconds` 才能进行激进的合并。此配置允许较旧的分区随时间合并到单个部分，从而整合数据并维持查询性能。

### 推荐设置 {#recommended-settings}

:::warning
调整合并行为是一项高级操作。我们建议在生产工作负载中启用这些设置之前咨询 ClickHouse 支持。
:::

在大多数情况下，将 `min_age_to_force_merge_seconds` 设置为一个低值（远低于分区周期）是首选。这样可以最小化部分数量，并防止在使用 `FINAL` 运算符时发生不必要合并。

例如，考虑一个已经合并成一个部分的每月分区。如果一个小的、孤立的插入在这个分区内创建新的部分，则查询性能可能会受到影响，因为 ClickHouse 必须读取多个部分，直到合并完成。设置 `min_age_to_force_merge_seconds` 能确保这些部分被激进合并，从而防止查询性能下降。
