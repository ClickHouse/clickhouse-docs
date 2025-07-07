---
'slug': '/migrations/postgresql/data-modeling-techniques'
'title': '数据建模技术'
'description': '用于从 PostgreSQL 迁移到 ClickHouse 的数据建模'
'keywords':
- 'postgres'
- 'postgresql'
'show_related_blogs': true
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';
import postgres_partitions from '@site/static/images/migrations/postgres-partitions.png';
import postgres_projections from '@site/static/images/migrations/postgres-projections.png';
import Image from '@theme/IdealImage';

> 这是关于从 PostgreSQL 迁移到 ClickHouse 的指南的 **第 3 部分**。通过一个实际示例，它演示了如果从 PostgreSQL 迁移，如何在 ClickHouse 中建模数据。

我们建议从 PostgreSQL 迁移的用户阅读 [ClickHouse 中数据建模的指南](/data-modeling/schema-design)。本指南使用相同的 Stack Overflow 数据集，并探索多种使用 ClickHouse 特性的方式。

## ClickHouse 中的主（排序）键 {#primary-ordering-keys-in-clickhouse}

来自 OLTP 数据库的用户通常会寻找 ClickHouse 中的等效概念。在注意到 ClickHouse 支持 `PRIMARY KEY` 语法后，用户可能会倾向于使用与其源 OLTP 数据库相同的键来定义其表模式。这是不合适的。

### ClickHouse 主键有何不同？ {#how-are-clickhouse-primary-keys-different}

要理解为什么在 ClickHouse 中使用 OLTP 主键不合适，用户需要了解 ClickHouse 索引的基本知识。我们以 Postgres 为例，但这些一般概念适用于其他 OLTP 数据库。

- Postgres 主键在定义上是每行唯一的。使用 [B-tree 结构](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) 可以通过此键有效查找单行。虽然 ClickHouse 可以优化单行值的查找，但分析工作负载通常需要读取几个列，但对于很多行。过滤器通常需要识别 **一部分行**，在其上执行聚合。
- 内存和磁盘效率对于 ClickHouse 通常使用的规模至关重要。数据以称为部分的块写入 ClickHouse 表，并在后台应用合并部分的规则。在 ClickHouse 中，每个部分都有自己的主索引。当部分被合并时，合并部分的主索引也会合并。与 Postgres 不同，这些索引并不是为每一行构建的。相反，一个部分的主索引为每组行有一个索引条目 - 这种技术称为 **稀疏索引**。
- **稀疏索引** 是可能的，因为 ClickHouse 将部分的行在磁盘上按指定键的顺序存储。与直接定位单行（如基于 B-Tree 的索引）不同，稀疏主索引允许它快速（通过对索引条目进行二分查找）识别可能匹配查询的行组。定位的可能匹配行组随后会并行流入 ClickHouse 引擎以找到匹配项。这种索引设计允许主索引较小（完全适合主内存），同时仍显著加速查询执行时间，尤其是对于数据分析用例中典型的范围查询。

有关更多详细信息，我们推荐这份 [深入指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={postgres_b_tree} size="lg" alt="PostgreSQL B-Tree Index"/>

<Image img={postgres_sparse_index} size="lg" alt="PostgreSQL Sparse Index"/>

在 ClickHouse 中选择的键不仅会决定索引，还会决定数据在磁盘上写入的顺序。因此，它可以显著影响压缩级别，这反过来又会影响查询性能。导致大多数列的值按连续顺序写入的排序键将允许所选的压缩算法（和编解码器）更有效地压缩数据。

> 表中的所有列将根据指定排序键的值进行排序，无论它们是否包含在键中。例如，如果 `CreationDate` 被用作键，则所有其他列中的值的顺序将与 `CreationDate` 列中的值的顺序相对应。可以指定多个排序键 - 这将具有与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义。

### 选择排序键 {#choosing-an-ordering-key}

有关选择排序键的考虑和步骤，使用 `posts` 表作为示例，请见 [这里](/data-modeling/schema-design#choosing-an-ordering-key)。

在使用实时复制与 CDC 时，还需考虑其他约束，参考此 [文档](/integrations/clickpipes/postgres/ordering_keys) 以获取如何使用 CDC 自定义排序键的技术。

## 分区 {#partitions}

Postgres 用户将熟悉通过将表分为更小、更易于管理的部分，称为分区，来增强大数据库性能和可管理性的表分区概念。这种分区可以通过在指定列上使用范围（例如，日期）、定义的列表或通过键的哈希来实现。这使管理员能够根据特定标准（如日期范围或地理位置）组织数据。分区通过允许更快的数据访问，帮助提高查询性能，通过分区修剪和更有效的索引。它还帮助维护任务，如备份和数据清除，因为可以对单个分区进行操作，而不是整个表。此外，分区可以通过将负载分散到多个分区来显著提高 PostgreSQL 数据库的可扩展性。

在 ClickHouse 中，分区在通过 `PARTITION BY` 子句最初定义表时指定。该子句可以包含任何列上的 SQL 表达式，其结果将定义行被发送到哪个分区。

<Image img={postgres_partitions} size="md" alt="PostgreSQL 分区到 ClickHouse 分区"/>

数据部分在磁盘上与每个分区逻辑关联，可以单独查询。以下示例中，我们使用表达式 `toYear(CreationDate)` 按年份对 `posts` 表进行分区。当行插入 ClickHouse 时，此表达式将针对每行进行评估，并在存在时路由到结果分区（如果该行是年份的第一个，则将创建该分区）。

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

ClickHouse 中的分区与 Postgres 中的应用相似，但有一些细微差异。更具体地说：

- **数据管理** - 在 ClickHouse 中，用户应主要将分区视为数据管理功能，而不是查询优化技术。通过根据关键字逻辑上分离数据，每个分区可以独立操作，例如删除。这允许用户在时间上有效地在 [存储层](/integrations/s3#storage-tiers) 之间移动分区，从而移动子集，或通过 [有效地从集群中过期或删除数据](/sql-reference/statements/alter/partition)。在下面的示例中，我们移除 2008 年的帖子。

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

- **查询优化** - 尽管分区可以帮助提高查询性能，但这在很大程度上取决于访问模式。如果查询仅针对少数几个分区（理想情况下是一个），性能可以得到提升。通常情况下，仅在分区键不在主键中并且您通过它进行过滤的情况下，这才有用。然而，需要覆盖许多分区的查询可能性能会比不使用分区的情况更差（因为可能会产生更多分区片段）。如果分区键已经是主键中的一个早期条目，面向单个分区的好处将变得微乎其微甚至不存在。分区还可以用于 [优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)，如果每个分区中的值是唯一的。然而，通常情况下，用户应确保主键被优化，仅在访问模式访问特定可预测的子集的特殊情况下考虑分区，例如按天分区，并且大多数查询是在最后一天。

### 分区的建议 {#recommendations-for-partitions}

用户应将分区视为一种数据管理技术。在处理时间序列数据时，当需要从集群中过期数据时，它是理想的。例如，最旧的分区可以 [简单地被删除](/sql-reference/statements/alter/partition#drop-partitionpart)。

**重要事项：** 确保您的分区键表达式不会导致高基数集，即应该避免创建超过 100 个分区。例如，不要通过高基数列（如客户标识符或姓名）对数据进行分区。相反，在 `ORDER BY` 表达式中将客户标识符或姓名设置为第一列。

> 内部，ClickHouse [创建分区](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) 用于插入的数据。随着更多数据的插入，部分数量增加。为了防止过多的部分，这会降低查询性能（需要读取更多文件），部分在后台异步进程中合并。如果部分数量超过预配置的限制，则 ClickHouse 将在插入时抛出异常 - 作为“部分过多”错误。在正常操作下，这不应发生，仅在 ClickHouse 配置不当或使用不当时（例如，许多小插入）会发生。

> 由于每个分区内部隔离地创建部分，因此增加分区数量会导致部分数量增加，即它是分区数量的倍数。因此，高基数分区键可能导致此错误，应该避免使用。

## 物化视图与投影 {#materialized-views-vs-projections}

Postgres 允许在单个表上创建多个索引，以优化多种访问模式。这种灵活性使管理员和开发人员能够根据特定查询和操作需求调整数据库性能。ClickHouse 的投影概念尽管与此不完全相同，但允许用户为一个表指定多个 `ORDER BY` 子句。

在 ClickHouse [数据建模文档](/data-modeling/schema-design) 中，我们探讨了如何在 ClickHouse 中使用物化视图来预计算聚合、转换行和优化不同访问模式的查询。

对于这些，展示了 [一个示例](/materialized-view/incremental-materialized-view#lookup-table)，物化视图将行发送到目标表，该表的排序键与接收插入的原始表不同。

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

该查询需要扫描所有 9000 万行（虽然速度很快），因为 `UserId` 并不是排序键。之前，我们使用物化视图作为 `PostId` 的查找解决了这个问题。通过 [投影](/data-modeling/projections) 可以解决同样的问题。下面的命令为 `ORDER BY user_id` 添加了一个投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

注意，我们必须先创建投影，然后使其物化。后一条命令会导致数据在磁盘上以不同顺序存储两次。投影也可以在数据创建时定义，如下所示，并将在数据插入时自动维护。

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

如果通过 `ALTER` 创建投影，则在发出 `MATERIALIZE PROJECTION` 命令时创建是异步的。用户可以使用以下查询确认此操作的进度，等待 `is_done=1`。

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

如果我们重复上述查询，可以看到性能显著提高，代价是额外的存储。

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

使用 `EXPLAIN` 命令，我们还确认了投影被用于服务此查询：

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

投影对于新用户来说是一个吸引人的特性，因为它们在插入数据时会自动维护。此外，查询可以简单地发送到单个表，在可能的情况下利用投影以加快响应时间。

<Image img={postgres_projections} size="md" alt="PostgreSQL 在 ClickHouse 中的投影"/>

这与物化视图形成对比，物化视图要求用户选择适当的优化目标表或根据过滤器重写查询。这在用户应用中增加了更大的复杂性，并增加了客户端的复杂性。

尽管有这些优势，投影也有一些 [固有限制](/data-modeling/projections#when-to-use-projections)，用户应该意识到，因此应谨慎使用。

我们建议在以下情况下使用投影：

- 需要完全重新排序数据。虽然投影中的表达式可以理论上使用 `GROUP BY`，但物化视图更有效地维护聚合。查询优化器也更可能利用使用简单重新排序的投影，即 `SELECT * ORDER BY x`。用户可以在该表达式中选择列的子集，以减少存储占用。
- 用户对相关的存储占用和重复写入数据的开销感到满意。测试插入速度的影响，并 [评估存储开销](/data-compression/compression-in-clickhouse)。

## 反规范化 {#denormalization}

由于 Postgres 是关系型数据库，其数据模型通常高度 [规范化](https://en.wikipedia.org/wiki/Database_normalization)，通常涉及数百个表。在 ClickHouse 中，反规范化有时可以优化 JOIN 性能。

您可以参考这份 [指南](/data-modeling/denormalization)，显示了在 ClickHouse 中反规范化 Stack Overflow 数据集的好处。

这结束了我们为从 Postgres 迁移到 ClickHouse 的用户提供的基本指南。我们建议从 Postgres 迁移的用户阅读 [ClickHouse 中数据建模的指南](/data-modeling/schema-design)，以了解有关 ClickHouse 高级功能的更多信息。
