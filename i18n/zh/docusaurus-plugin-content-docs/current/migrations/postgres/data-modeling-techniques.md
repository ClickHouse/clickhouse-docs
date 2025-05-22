---
'slug': '/migrations/postgresql/data-modeling-techniques'
'title': '数据建模技术'
'description': '从 PostgreSQL 迁移到 ClickHouse 的数据建模'
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

> 这是关于从 PostgreSQL 迁移到 ClickHouse 的指南的 **第 3 部分**。通过一个实际的例子，它展示了如果从 PostgreSQL 迁移，如何在 ClickHouse 中建模数据。

我们建议从 Postgres 迁移的用户阅读 [ClickHouse 中建模数据的指南](/data-modeling/schema-design)。本指南使用相同的 Stack Overflow 数据集，并探讨了使用 ClickHouse 特性的多种方法。

## ClickHouse 中的主键（排序键） {#primary-ordering-keys-in-clickhouse}

来自 OLTP 数据库的用户通常会寻找 ClickHouse 中的等效概念。当注意到 ClickHouse 支持 `PRIMARY KEY` 语法时，用户可能会倾向于使用与其源 OLTP 数据库相同的键定义表架构。这是不合适的。

### ClickHouse 的主键有什么不同？ {#how-are-clickhouse-primary-keys-different}

为了解释为什么在 ClickHouse 中使用 OLTP 主键是不合适的，用户应了解 ClickHouse 索引的基本知识。我们以 Postgres 作为示例比较，但这些概念也适用于其他 OLTP 数据库。

- PostgreSQL 主键按定义对每行都是唯一的。使用 [B-树结构](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) 允许通过该键高效查找单行。虽然 ClickHouse 可以针对单行值进行优化查找，但分析工作负载通常需要读取少量列，但涉及很多行。过滤器更常需要识别 **一组行的子集**，将在其上执行聚合。
- 内存和磁盘效率在 ClickHouse 通常使用的规模中至关重要。数据以称为部分的块写入 ClickHouse 表，并在后台应用合并这些部分的规则。在 ClickHouse 中，每个部分都有自己的主索引。当部分合并时，合并部分的主索引也会合并。与 PostgreSQL 不同，这些索引不是为每行构建的。相反，部分的主索引对每组行有一个索引条目——这种技术称为 **稀疏索引**。
- **稀疏索引** 是可能的，因为 ClickHouse 将部分的行按指定的键在磁盘上有序存储。稀疏主索引允许通过对索引条目进行二进制搜索快速（识别一组可能匹配查询的行。定位的潜在匹配行组然后被并行传输到 ClickHouse 引擎，以寻找匹配项。这种索引设计允许主索引保持较小（完全适合主内存），并显著加快查询执行时间，特别是对于在数据分析用例中典型的范围查询。

有关更多详细信息，我们推荐这份 [深入指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={postgres_b_tree} size="lg" alt="PostgreSQL B-Tree Index"/>

<Image img={postgres_sparse_index} size="lg" alt="PostgreSQL Sparse Index"/>

在 ClickHouse 中选择的键不仅将决定索引，还将决定数据在磁盘上的写入顺序。因此，它能够显著影响压缩等级，进而影响查询性能。造成大多数列的值以连续顺序写入的排序键将允许所选的压缩算法（和编解码器）更有效地压缩数据。

> 表中的所有列将基于指定排序键的值进行排序，无论它们是否包含在键中。例如，如果 `CreationDate` 被用作键，则其他所有列中的值的顺序将与 `CreationDate` 列中的值的顺序相对应。可以指定多个排序键——这将按照与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义进行排序。

### 选择排序键 {#choosing-an-ordering-key}

关于选择排序键的考虑和步骤，以帖子表为例，可以查看 [这里](/data-modeling/schema-design#choosing-an-ordering-key)。

在使用带有 CDC 的实时复制时，还有其他约束需要考虑，请参考这份 [文档](/integrations/clickpipes/postgres/ordering_keys)，了解如何使用 CDC 自定义排序键的技术。

## 分区 {#partitions}

PostgreSQL 用户对表分区的概念会很熟悉，通过将表拆分为称为分区的更小、更易管理的部分，从而提高大数据库的性能和可管理性。此分区可以通过在指定列（例如，日期）上使用范围、定义列表或通过键进行哈希来完成。这使管理员能够根据特定标准（如日期范围或地理位置）组织数据。分区通过启用更快的数据访问（通过分区修剪）和更高效的索引来改善查询性能。它还通过允许对各个分区而不是整个表进行操作，帮助维护任务，如备份和数据清理。此外，分区还可以通过在多个分区之间分配负载，显著提高 PostgreSQL 数据库的可扩展性。

在 ClickHouse 中，当通过 `PARTITION BY` 子句初始定义表时，指定分区。该子句可以包含任何列上的 SQL 表达式，其结果将定义行被发送到哪个分区。

<Image img={postgres_partitions} size="md" alt="将 PostgreSQL 分区映射到 ClickHouse 分区"/>

数据部分在磁盘上与每个分区逻辑上关联，并可以单独查询。在下面的示例中，我们使用表达式 `toYear(CreationDate)` 按年份对 `posts` 表进行分区。当行被插入到 ClickHouse 时，这个表达式将针对每一行进行评估，并如果存在则路由到相应的分区（如果该年是第一行，则将创建分区）。

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

有关分区的完整描述，请参见 ["表分区"](/partitions)。

### 分区的应用 {#applications-of-partitions}

ClickHouse 中的分区应用与 PostgreSQL 中类似，但有一些微妙的差异。更具体地说：

- **数据管理** - 在 ClickHouse 中，用户应主要将分区视为数据管理功能，而不是查询优化技术。通过基于某个键逻辑地分离数据，每个分区可以独立操作，例如被删除。这使用户能够有效地在时间上或在 [存储层](/integrations/s3#storage-tiers) 之间移动分区，从而处理子集，或 [过期数据/有效删除从集群中](/sql-reference/statements/alter/partition)。例如，下面我们将移除 2008 年的帖子。

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

- **查询优化** - 虽然分区可以帮助提高查询性能，但这在很大程度上取决于访问模式。如果查询仅针对少数几个分区（理想情况下是一个），则性能可能会提高。这通常只有在分区键不在主键中并且你正在按其过滤时才有用。然而，需要覆盖多个分区的查询的性能可能会比不使用分区的情况更差（因为分区可能会导致更多部分）。如果分区键已在主键中的早期条目中，则指向单个分区的益处甚至可能微不足道。分区还可以用于[优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key) ，如果每个分区中的值是唯一的。然而，通常情况下，用户应确保主键是优化的，仅在访问模式确定性地访问具体可预测的子集时，才应考虑将分区作为查询优化技术，例如，按天分区，对于大多数查询使用的是前一天。

### 分区的建议 {#recommendations-for-partitions}

用户应将分区视为数据管理技术。在处理时间序列数据时，当需要从集群中过期数据时，它是理想的，例如，最旧的分区可以 [简单地被删除](/sql-reference/statements/alter/partition#drop-partitionpart)。

**重要:** 确保您的分区键表达式不会导致高基数集，即应该避免创建超过 100 个分区。例如，不要通过客户端标识符或姓名等高基数列来对数据进行分区。相反，将客户端标识符或姓名作为 ORDER BY 表达式中的第一列。

> 在内部，ClickHouse [为插入数据创建部分](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着更多数据的插入，部分的数量增加。为了防止过高数量的部分导致查询性能下降（需要读取更多文件），在后台异步过程中会将部分合并。如果部分的数量超过预先配置的限制，则 ClickHouse 将在插入时抛出异常——作为“部分过多”的错误。正常操作时不应出现此情况，仅在 ClickHouse 配置错误或使用不当（例如，许多小插入）时出现。

> 由于部分是独立于每个分区创建的，增加分区数量会导致部分数量增加，即这是分区数量的倍数。因此，高基数的分区键可能会导致此错误，应避免使用。

## 物化视图与投影 {#materialized-views-vs-projections}

Postgres 允许在单个表上创建多个索引，从而针对各种访问模式进行优化。这种灵活性使管理员和开发人员能够根据具体的查询和操作需求调整数据库性能。ClickHouse 的投影概念虽然与此不完全相似，但允许用户为一个表指定多个 `ORDER BY` 子句。

在 ClickHouse [数据建模文档](/data-modeling/schema-design) 中，我们探讨了如何在 ClickHouse 中使用物化视图预计算聚合、转换行和优化不同访问模式的查询。

在后者中，我们提供了[一个示例](/materialized-view/incremental-materialized-view#lookup-table) ，该物化视图将行发送到一个目标表，该表的排序键与原始表接收插入时不同。

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

该查询要求扫描所有 90m 行（诚然相对较快），因为 `UserId` 不是排序键。
之前，我们使用物化视图作为 `PostId` 的查找来解决这个问题。相同的问题可以通过 [投影](/data-modeling/projections) 来解决。下面的命令为 `ORDER BY user_id` 添加了一个投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意，我们必须首先创建投影，然后再将其物化。后一个命令会导致数据以两种不同的顺序在磁盘上存储两次。投影也可以在数据创建时定义，如下所示，并会在数据插入时自动维护。

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

如果通过 `ALTER` 创建投影，则在发出 `MATERIALIZE PROJECTION` 命令时创建是异步的。用户可以通过以下查询确认此操作的进度，等待 `is_done=1`。

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

如果我们重复上述查询，我们可以看到性能显著提高，但代价是额外的存储。

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

通过 `EXPLAIN` 命令，我们也确认了投影被用于服务此查询：

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

投影是新用户的一个吸引特性，因为随着数据插入，它们会被自动维护。此外，查询可以发送到单个表，尽可能利用投影加快响应时间。

<Image img={postgres_projections} size="md" alt="PostgreSQL 在 ClickHouse 中的投影"/>

这与物化视图形成对比，在这种情况下，用户必须选择适当的优化目标表或根据过滤条件重写查询。这增加了对用户应用的重视，并增加了客户端的复杂性。

尽管有这些优势，投影也带来了一些 [固有限制](/data-modeling/projections#when-to-use-projections)，用户应该注意，因此应谨慎使用。

我们建议在以下情况下使用投影：

- 需要对数据进行完全的重新排序。虽然投影中的表达式在理论上可以使用 `GROUP BY`，但物化视图对于维护聚合更有效。查询优化器也更可能利用使用简单重新排序的投影，即 `SELECT * ORDER BY x`。用户可以在此表达式中选择子集列以减少存储占用。
- 用户对额外的存储占用和重复写入数据的开销感到满意。测试对插入速度的影响，并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## 非规范化 {#denormalization}

由于 Postgres 是关系数据库，其数据模型高度 [规范化](https://en.wikipedia.org/wiki/Database_normalization)，通常涉及数百个表。在 ClickHouse 中，非规范化在优化 JOIN 性能时可能是有益的。

您可以参考这份 [指南](/data-modeling/denormalization)，说明在 ClickHouse 中非规范化 Stack Overflow 数据集的好处。

这就是我们为从 Postgres 迁移到 ClickHouse 的用户提供的基本指南。我们建议从 Postgres 迁移的用户阅读 [ClickHouse 中建模数据的指南](/data-modeling/schema-design)，以了解更多关于高级 ClickHouse 特性的内容。
