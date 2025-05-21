---
'slug': '/migrations/postgresql/data-modeling-techniques'
'title': '数据建模技术'
'description': '从PostgreSQL迁移到ClickHouse的数据建模'
'keywords':
- 'postgres'
- 'postgresql'
- 'migrate'
- 'migration'
- 'data modeling'
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';
import postgres_partitions from '@site/static/images/migrations/postgres-partitions.png';
import postgres_projections from '@site/static/images/migrations/postgres-projections.png';
import Image from '@theme/IdealImage';

> 这是关于从 PostgreSQL 迁移到 ClickHouse 的指南的 **第三部分**。通过一个实际示例，它演示了如果从 PostgreSQL 迁移，如何在 ClickHouse 中建模数据。

我们建议从 Postgres 迁移的用户阅读 [ClickHouse 中的数据建模指南](/data-modeling/schema-design)。本指南使用相同的 Stack Overflow 数据集，并探索多种使用 ClickHouse 功能的方法。

## ClickHouse 中的主键（排序键） {#primary-ordering-keys-in-clickhouse}

来自 OLTP 数据库的用户通常会寻找 ClickHouse 中等效的概念。注意到 ClickHouse 支持 `PRIMARY KEY` 语法后，用户可能会被诱惑用与其源 OLTP 数据库相同的键定义其表架构。这是不合适的。

### ClickHouse 的主键有什么不同？ {#how-are-clickhouse-primary-keys-different}

要理解为何在 ClickHouse 中使用 OLTP 主键不合适，用户应了解 ClickHouse 索引的基础知识。我们以 Postgres 作为比较示例，但这些一般概念适用于其他 OLTP 数据库。

- Postgres 主键的定义是每行唯一。使用 [B-tree 结构](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) 允许通过此键有效查找单行。尽管 ClickHouse 可以针对单行值进行优化查找，但分析工作负载通常需要读取几个列，而不是很多行。过滤器更可能需要识别 **一组行的子集**，对其执行聚合。
- 内存和磁盘效率对于 ClickHouse 通常使用的规模至关重要。数据以称为 parts 的块写入 ClickHouse 表，并应用规则在后台合并这些 parts。在 ClickHouse 中，每个 part 有自己的主索引。当 parts 被合并时，合并后的 part 的主索引也会合并。与 Postgres 不同，这些索引并不是针对每行建立的。相反，一个 part 的主索引针对一组行只有一个索引条目——这种技术称为 **稀疏索引**。
- **稀疏索引** 成立是因为 ClickHouse 按照指定的键将行存储在磁盘上。稀疏主索引允许它通过对索引条目进行二分搜索快速（快速搜索）识别可能匹配查询的行组。然后，将找到的可能匹配行组并行传输到 ClickHouse 引擎以查找匹配项。这种索引设计使得主索引可以很小（完全适合主内存），同时显著加快查询执行时间，特别是对于数据分析使用案例中典型的范围查询。

有关更多详细信息，我们推荐这份 [深入指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={postgres_b_tree} size="lg" alt="PostgreSQL B-Tree 索引"/>

<Image img={postgres_sparse_index} size="lg" alt="PostgreSQL 稀疏索引"/>

ClickHouse 中选择的键不仅决定索引，还决定数据在磁盘上的写入顺序。因此，它可以极大地影响压缩级别，进而影响查询性能。使大多数列的值按连续顺序写入的排序键将允许所选的压缩算法（和编解码器）更有效地压缩数据。

> 表中所有列将根据指定排序键的值进行排序，无论它们是否包含在键中。例如，如果将 `CreationDate` 作为键，则所有其他列中值的顺序将对应于 `CreationDate` 列中值的顺序。可以指定多个排序键——这将与 `SELECT` 查询中的 `ORDER BY` 子句具有相同的语义。

### 选择排序键 {#choosing-an-ordering-key}

对于选择排序键的考虑和步骤，以 posts 表为例，可以参阅 [此处](/data-modeling/schema-design#choosing-an-ordering-key)。

当使用实时复制与 CDC 时，还需要考虑其他约束，请参考 [此文档](/integrations/clickpipes/postgres/ordering_keys)，获取如何与 CDC 自定义排序键的技术。

## 分区 {#partitions}

Postgres 用户对表分区的概念会很熟悉，通过将表划分为称为分区的更小、更易于管理的部分来提高大型数据库的性能和可管理性。可以通过对指定列（例如，日期）进行范围划分、定义列表或通过键进行哈希划分来实现此分区。这允许管理员根据特定标准（如日期范围或地理位置）组织数据。分区有助于提高查询性能，通过启用分区修剪和更有效的索引来加快数据访问。它还通过使操作针对单个分区而不是整个表来帮助维护任务，例如备份和数据清理。此外，分区可以显著提高 PostgreSQL 数据库的可扩展性，通过在多个分区之间分配负载。

在 ClickHouse 中，分区是在通过 `PARTITION BY` 子句初始定义表时指定的。此子句可以包含任何列上的 SQL 表达式，其结果将定义某行被发送到哪个分区。

<Image img={postgres_partitions} size="md" alt="PostgreSQL 分区到 ClickHouse 分区"/>

数据 parts 在磁盘上与每个分区逻辑关联，并可以单独查询。以下示例中，我们使用表达式 `toYear(CreationDate)` 按年份对 `posts` 表进行分区。当行插入 ClickHouse 时，将对每行评估此表达式，并如果结果分区存在，将其路由到该分区（如果该行是某一年的第一个行，则会创建分区）。

```sql
 CREATE TABLE posts
(
        `Id` Int32 CODEC(Delta(4), ZSTD(1)),
        `PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
        `AcceptedAnswerId` UInt32,
        `CreationDate` DateTime64(3, 'UTC'),
...
        `ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)
PARTITION BY toYear(CreationDate)
```

有关分区的完整描述，请参阅 ["表分区"](/partitions)。

### 分区的应用 {#applications-of-partitions}

ClickHouse 中的分区与 Postgres 中的分区有类似的应用，但有一些细微的差异。更具体地说：

- **数据管理** - 在 ClickHouse 中，用户应主要将分区视为数据管理特征，而不是查询优化技术。通过基于键逻辑分隔数据，每个分区可以独立操作，例如删除。这使得用户能够高效地在时间或 [存储层](/integrations/s3#storage-tiers) 之间移动分区，从而移动子集，或 [使数据过期/通过集群高效删除](/sql-reference/statements/alter/partition)。在下面的示例中，我们删除 2008 年的帖子。

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008      │
│ 2009      │
│ 2010      │
│ 2011      │
│ 2012      │
│ 2013      │
│ 2014      │
│ 2015      │
│ 2016      │
│ 2017      │
│ 2018      │
│ 2019      │
│ 2020      │
│ 2021      │
│ 2022      │
│ 2023      │
│ 2024      │
└───────────┘

17 rows in set. Elapsed: 0.002 sec.

ALTER TABLE posts
(DROP PARTITION '2008')

Ok.

0 rows in set. Elapsed: 0.103 sec.
```

- **查询优化** - 尽管分区可以帮助优化查询性能，但这在很大程度上依赖于访问模式。如果查询仅针对几个分区（理想情况下一个），则性能可能会提高。然而这通常只在分区键不在主键中且基于此进行过滤的情况下有用。然而，需要覆盖许多分区的查询可能表现得比没有进行分区更差（因为可能会因此有更多的 parts）。如果分区键已经是主键的早期条目，则目标单个分区的好处可能会下降到几乎不存在。分区也可以用于 [优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)，但一般而言，用户应确保主键经过优化，并在只有在访问模式访问特定可预测的子集的特殊情况下（例如按天分区，并且大多数查询在最后一天）时考虑将分区作为查询优化技术。

### 分区的建议 {#recommendations-for-partitions}

用户应将分区视为一种数据管理技术。当操作时间序列数据时，尤其在需要从集群中过期数据时非常理想，例如可以 [简单地删除最旧的分区](/sql-reference/statements/alter/partition#drop-partitionpart)。

**重要：** 确保您的分区键表达式不会导致高基数集，即应避免创建超过 100 个分区。例如，不要根据高基数列（如客户端标识符或名称）对数据进行分区。相反，应将客户端标识符或名称作为 ORDER BY 表达式中的第一列。

> 在内部，ClickHouse [为插入的数据创建 parts](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着数据的不断插入，parts 的数量会增加。为了防止过多的 parts，这会降低查询性能（因为需要读取更多文件），parts 会在后台异步处理过程中合并。如果 parts 的数量超过预配置的限制，则 ClickHouse 将在插入时抛出异常——作为“部分过多”的错误。在正常操作下，不应该发生这种情况，仅在 ClickHouse 配置错误或误用时发生，即许多小的插入。

> 由于每个分区在隔离中创建 parts，因此增加分区的数量会导致 parts 的数量增加，即是分区数的倍数。高基数的分区键因此可以导致此错误，应予以避免。

## 物化视图与投影 {#materialized-views-vs-projections}

Postgres 允许在单个表上创建多个索引，以优化多种访问模式。这种灵活性允许管理员和开发人员将数据库性能调整到特定查询和业务需求。ClickHouse 的投影概念虽然与此不完全类比，但允许用户为表指定多个 `ORDER BY` 子句。

在 ClickHouse [数据建模文档](/data-modeling/schema-design) 中，我们探索了如何在 ClickHouse 中使用物化视图来预先计算聚合，转换行，和优化不同访问模式的查询。

对于后者，我们提供了 [一个示例](/materialized-view/incremental-materialized-view#lookup-table)，其中物化视图将行发送到一个目标表，该表的排序键与接收插入的原始表不同。

例如，考虑以下查询：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

该查询需要扫描所有 9000 万行（虽然很快）因为 `UserId` 不是排序键。
之前，我们通过使用物化视图作为 `PostId` 的查找来解决了这个问题。同样的问题也可以通过 [投影](/data-modeling/projections) 来解决。以下命令为 `ORDER BY user_id` 添加了投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意，我们必须首先创建投影，然后进行物化。这条后命令会导致数据在磁盘中以两种不同的顺序存储两次。该投影还可以在创建数据时定义，如下所示，并将在数据插入时自动维护。

```sql
CREATE TABLE comments
(
        `Id` UInt32,
        `PostId` UInt32,
        `Score` UInt16,
        `Text` String,
        `CreationDate` DateTime64(3, 'UTC'),
        `UserId` Int32,
        `UserDisplayName` LowCardinality(String),
        PROJECTION comments_user_id
        (
        SELECT *
        ORDER BY UserId
        )
)
ENGINE = MergeTree
ORDER BY PostId
```

如果通过 `ALTER` 创建投影，`MATERIALIZE PROJECTION` 命令发出时创建是异步的。用户可以使用以下查询确认此操作的进度，等待 `is_done=1`。

```sql
SELECT
        parts_to_do,
        is_done,
        latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

   ┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
1. │           1 │       0 │                    │
   └─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

如果我们重复上述查询，可以看到性能显著改善，代价是额外的存储。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

通过 `EXPLAIN` 命令，我们还确认了投影被用于服务此查询：

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

    ┌─explain─────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY))         │
 2. │   Aggregating                                       │
 3. │   Filter                                            │
 4. │           ReadFromMergeTree (comments_user_id)      │
 5. │           Indexes:                                  │
 6. │           PrimaryKey                                │
 7. │           Keys:                                     │
 8. │           UserId                                    │
 9. │           Condition: (UserId in [8592047, 8592047]) │
10. │           Parts: 2/2                                │
11. │           Granules: 2/11360                         │
    └─────────────────────────────────────────────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

### 何时使用投影 {#when-to-use-projections}

投影是新用户的一个吸引人的特征，因为随着数据插入它们会自动维护。此外，查询可以只发送到一个单一的表，投影被利用以尽可能加快响应时间。

<Image img={postgres_projections} size="md" alt="ClickHouse 中的 PostgreSQL 投影"/>

相比之下，物化视图的用户必须选择适当的优化目标表，或根据过滤条件重写查询。这对用户应用程序的强调更大，并增加了客户端的复杂性。

尽管有这些优点，投影仍有一些 [固有的限制](/data-modeling/projections#when-to-use-projections)，用户应该清楚这些限制，因此不应过多使用。

我们建议在以下情况下使用投影：

- 需要对数据进行完全重排序。虽然投影中的表达式理论上可以使用 `GROUP BY`，但物化视图对维护聚合更有效。查询优化器也更可能利用使用简单重排序的投影，即 `SELECT * ORDER BY x`。用户可以在此表达式中选择部分列以减少存储占用。
- 用户对相关的存储占用和双重写入数据的开销感到满意。测试插入速度的影响并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## 非规范化 {#denormalization}

由于 Postgres 是一个关系型数据库，它的数据模型高度 [规范化](https://en.wikipedia.org/wiki/Database_normalization)，通常涉及数百个表。在 ClickHouse 中，非规范化有时可以优化 JOIN 性能。

您可以参考 [此指南](/data-modeling/denormalization)，该指南展示了在 ClickHouse 中非规范化 Stack Overflow 数据集的好处。

这就是我们为从 Postgres 迁移到 ClickHouse 的用户准备的基础指南。我们建议从 Postgres 迁移的用户阅读 [ClickHouse 中的数据建模指南](/data-modeling/schema-design)，以了解更多有关 ClickHouse 高级功能的信息。
