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

> 这是关于从 PostgreSQL 导入 ClickHouse 的指南的 **第 3 部分**。通过一个实际示例，它演示了如果从 PostgreSQL 迁移，如何在 ClickHouse 中建模数据。

我们建议从 Postgres 迁移的用户阅读 [在 ClickHouse 中建模数据的指南](/data-modeling/schema-design)。本指南采用相同的 Stack Overflow 数据集，并使用 ClickHouse 功能探索多种方法。

## ClickHouse 中的主（排序）键 {#primary-ordering-keys-in-clickhouse}

来自 OLTP 数据库的用户通常会寻找 ClickHouse 中的等效概念。在注意到 ClickHouse 支持 `PRIMARY KEY` 语法时，用户可能会倾向于使用与源 OLTP 数据库相同的键来定义其表架构。这并不合适。

### ClickHouse 主键有何不同？ {#how-are-clickhouse-primary-keys-different}

为了解释为什么在 ClickHouse 中使用 OLTP 主键并不合适，用户应该理解 ClickHouse 索引的基本知识。我们使用 Postgres 作为比较示例，但这些一般概念适用于其他 OLTP 数据库。

- Postgres 主键在定义上是每行唯一的。使用 [B 树结构](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) 允许通过此键有效查找单行。虽然 ClickHouse 可以优化单行值的查找，但分析工作负载通常要求读取几个列但针对多个行。筛选器更常需要识别**一组行的子集**，将在其上进行聚合。
- 内存和磁盘效率对于 ClickHouse 通常使用的规模至关重要。数据通过称为 parts 的块写入 ClickHouse 表，并在后台应用合并这些部分的规则。在 ClickHouse 中，每个部分都有自己的主索引。当合并部分时，合并部分的主索引也被合并。与 Postgres 不同，这些索引并不是为每一行构建的。相反，部分的主索引为每组行有一个索引条目——这种技术称为**稀疏索引**。
- **稀疏索引**之所以可行，是因为 ClickHouse 在磁盘上按指定键的顺序存储行。稀疏主索引允许它快速（通过对索引条目的二分查找）识别可能匹配查询的行组，而不是直接定位单个行。定位的潜在匹配行组随后以并行方式流入 ClickHouse 引擎以查找匹配项。此索引设计允许主索引较小（完全适合主内存），同时显著加快查询执行时间，尤其对于数据分析用例中典型的范围查询。

有关更详细的信息，我们推荐此 [深入指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={postgres_b_tree} size="lg" alt="PostgreSQL B-Tree Index"/>

<Image img={postgres_sparse_index} size="lg" alt="PostgreSQL Sparse Index"/>

在 ClickHouse 中选择的键不仅决定了索引，还决定了数据在磁盘上的写入顺序。因此，它会对压缩水平产生显著影响，这反过来又影响查询性能。导致大多数列值按连续顺序写入的排序键将允许所选的压缩算法（和编解码器）更有效地压缩数据。

> 表中的所有列将根据指定的排序键的值进行排序，无论它们是否包含在键中。例如，如果 `CreationDate` 用作键，则所有其他列的值的顺序将与 `CreationDate` 列中的值的顺序相对应。可以指定多个排序键——这将具有与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义。

### 选择排序键 {#choosing-an-ordering-key}

有关选择排序键的考虑和步骤，以帖子表为例，请参见 [这里](/data-modeling/schema-design#choosing-an-ordering-key)。

在使用带 CDC 的实时复制时，还有其他约束需要考虑，可以参考此 [文档](/integrations/clickpipes/postgres/ordering_keys) 获取有关如何使用 CDC 自定义排序键的技术。

## 分区 {#partitions}

Postgres 用户将对表分区的概念感到熟悉，这通过将表划分为称为分区的较小、更易管理的部分以提升性能和可管理性。这个分区可以通过对指定列（例如日期）进行范围设置、定义列表或通过键进行哈希来实现。这允许管理员根据特定标准（例如日期范围或地理位置）组织数据。分区通过启用更快的数据访问来改善查询性能，支持分区修剪和更高效的索引。它还通过允许操作各个分区而不是整个表来帮助维护任务，例如备份和数据清除。此外，分区还可以通过在多个分区之间分配负载来显著提高 PostgreSQL 数据库的可扩展性。

在 ClickHouse 中，在最初通过 `PARTITION BY` 子句定义表时指定分区。此子句可以包含针对任何列的 SQL 表达式，其结果将定义一行被发送到哪个分区。

<Image img={postgres_partitions} size="md" alt="PostgreSQL partitions to ClickHouse partitions"/>

数据部分按逻辑与磁盘上的每个分区相关联，并可以单独查询。在下面的示例中，我们使用表达式 `toYear(CreationDate)` 按年对 `posts` 表进行分区。随着行被插入到 ClickHouse，该表达式将针对每行进行评估，并如果结果分区存在（如果该行为某一年的第一个，则该分区将被创建），将其路由到该分区。

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

有关分区的完整说明，请参见 ["表分区"](/partitions)。

### 分区的应用 {#applications-of-partitions}

ClickHouse 中的分区应用与 Postgres 类似，但有一些细微的差别。更具体地说：

- **数据管理** - 在 ClickHouse 中，用户应主要将分区视为数据管理特性，而不是查询优化技术。通过根据键逻辑分隔数据，每个分区都可以独立操作，例如删除。这允许用户在有效的时间内高效地在 [存储层次](/integrations/s3#storage-tiers) 之间移动分区，因此可以过期数据/高效地从集群中删除。例如，下面我们删除了 2008 年的帖子。

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

- **查询优化** - 虽然分区可以协助查询性能，但这在很大程度上取决于访问模式。如果查询仅针对少数分区（理想情况下为一个），则性能可能会得到提高。这通常只有在分区键不在主键中并且您通过其进行过滤时才有用。然而，必须覆盖多个分区的查询可能会比不使用分区的情况表现更差（因为这可能会导致更多部分的存在）。如果分区键已在主键中作为较早的条目，则目标单一分区的好处将更不明显。分区也可以用于 [优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)，前提是每个分区中的值是唯一的。然而，通常情况下，用户应确保主键得到优化，并仅在访问模式访问特定可预测子集（例如按天分区，同时大多数查询在最后一天）时考虑将分区作为查询优化技术。

### 分区建议 {#recommendations-for-partitions}

用户应将分区视为数据管理技术。它在处理时间序列数据时，是处理集群中过期数据的理想选择，例如，最古老的分区可以 [简单地被删除](/sql-reference/statements/alter/partition#drop-partitionpart)。

**重要：** 确保您的分区键表达式不会导致高基数集，即，应该避免创建超过 100 个分区。例如，不要通过高基数列（如客户端标识符或名称）对数据进行分区。相反，请将客户端标识符或名称作为 `ORDER BY` 表达式中的第一列。

> 在内部，ClickHouse [为插入的数据创建 parts](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着更多数据的插入，部分的数量增加。为防止部分数量过多，从而降低查询性能（需要读取更多文件），部分会在后台异步进程中合并。如果部分数量超过预配置限制，则 ClickHouse 在插入时会抛出异常——作为“部分过多”的错误。正常情况下不应该发生这种情况，仅发生在 ClickHouse 配置错误或使用不当的情况下，例如，许多小的插入操作。

> 由于部分是在各自的分区中孤立创建的，增加分区的数量会导致部分数量增加，即部分数量是分区数量的倍数。因此，高基数的分区键可能会导致此错误，并应避免使用。

## 物化视图与投影 {#materialized-views-vs-projections}

Postgres 允许在单个表上创建多个索引，从而优化各种访问模式。这种灵活性允许管理员和开发人员根据特定查询和操作需求量身定制数据库性能。ClickHouse 的投影概念虽然与之并不完全对应，但允许用户为表指定多个 `ORDER BY` 子句。

在 ClickHouse [数据建模文档](/data-modeling/schema-design) 中，我们探讨了如何在 ClickHouse 中使用物化视图预计算聚合、转换行以及针对不同访问模式优化查询。

对于后者，我们提供了 [一个示例](/materialized-view/incremental-materialized-view#lookup-table)，其中物化视图将行发送到具有与接收插入的原始表不同的排序键的目标表。

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

此查询需要扫描所有 9000 万行（虽然速度很快），因为 `UserId` 不是排序键。之前，我们使用物化视图充当 `PostId` 的查找表来解决这个问题。相同的问题也可以用 [投影](/data-modeling/projections) 来解决。以下命令为 `ORDER BY user_id` 添加了一个投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意，我们必须首先创建投影，然后对其进行物化。此后者命令会导致数据在磁盘上以两种不同的顺序存储两次。投影也可以在数据创建时定义，如下所示，并将在数据插入时自动维护。

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

如果通过 `ALTER` 创建投影，则在发出 `MATERIALIZE PROJECTION` 命令时，创建过程是异步的。用户可以通过以下查询确认此操作的进度，等待 `is_done=1`。

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

如果我们重复上述查询，可以观察到性能明显提高，但需要额外的存储空间。

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

投影对于新用户来说是一个吸引人的特性，因为它们在数据插入时会自动维护。此外，查询只需发送到单个表，在可能的情况下利用投影来加速响应时间。

<Image img={postgres_projections} size="md" alt="PostgreSQL projections in ClickHouse"/>

这与物化视图形成对比，在物化视图中，用户必须选择适当的优化目标表，或者根据过滤条件重写查询。这增加了对用户应用的重视，并提高了客户端的复杂性。

尽管有这些优势，投影也有一些 [固有的限制](/data-modeling/projections#when-to-use-projections)，用户应该了解这些限制，因此应谨慎使用。

我们建议在以下情况下使用投影：

- 需要全面重新排序数据。虽然投影中的表达式理论上可以使用 `GROUP BY`，但物化视图对于维护聚合更为有效。查询优化器也更有可能利用使用简单重新排序的投影，即 `SELECT * ORDER BY x`。用户可以在此表达式中选择子集列以减少存储占用。
- 用户对将数据写入两次所带来的存储占用和开销感到满意。测试插入速度的影响并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## 反规范化 {#denormalization}

由于 Postgres 是关系数据库，其数据模型常常高度 [规范化](https://en.wikipedia.org/wiki/Database_normalization)，通常涉及数百个表。在 ClickHouse 中，反规范化有时可以优化 JOIN 性能。

您可以参考这个 [指南](/data-modeling/denormalization)，展示了在 ClickHouse 中对 Stack Overflow 数据集进行反规范化的好处。

这就结束了我们为从 Postgres 迁移到 ClickHouse 的用户准备的基本指南。我们建议从 Postgres 迁移的用户阅读 [在 ClickHouse 中建模数据的指南](/data-modeling/schema-design)，以了解更多关于 ClickHouse 高级功能的信息。
