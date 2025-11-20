---
slug: /migrations/postgresql/data-modeling-techniques
title: '数据建模方法'
description: '从 PostgreSQL 迁移到 ClickHouse 指南（第 3 部分）'
keywords: ['postgres', 'postgresql']
show_related_blogs: true
sidebar_label: '第 3 部分'
doc_type: 'guide'
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';
import postgres_partitions from '@site/static/images/migrations/postgres-partitions.png';
import postgres_projections from '@site/static/images/migrations/postgres-projections.png';
import Image from '@theme/IdealImage';

> 这是从 PostgreSQL 迁移到 ClickHouse 指南的 **第 3 部分**。通过一个实际示例，它演示了在从 PostgreSQL 迁移时，如何在 ClickHouse 中进行数据建模。

我们建议正在从 Postgres 迁移的用户阅读[在 ClickHouse 中进行数据建模的指南](/data-modeling/schema-design)。该指南使用同一个 Stack Overflow 数据集，并结合 ClickHouse 的特性探索多种建模方法。


## ClickHouse 中的主键(排序键) {#primary-ordering-keys-in-clickhouse}

来自 OLTP 数据库的用户通常会在 ClickHouse 中寻找对应的概念。注意到 ClickHouse 支持 `PRIMARY KEY` 语法后,用户可能会倾向于使用与源 OLTP 数据库相同的键来定义表结构。但这种做法并不合适。

### ClickHouse 主键有何不同? {#how-are-clickhouse-primary-keys-different}

要理解为什么在 ClickHouse 中使用 OLTP 主键不合适,用户需要了解 ClickHouse 索引的基本原理。我们以 Postgres 作为对比示例,但这些通用概念同样适用于其他 OLTP 数据库。

- Postgres 主键根据定义,每行都是唯一的。使用 [B-tree 结构](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)可以通过该键高效查找单行数据。虽然 ClickHouse 可以针对单行值查找进行优化,但分析型工作负载通常需要读取少量列但涉及大量行。过滤器更常需要识别**行的子集**,然后对其执行聚合操作。
- 内存和磁盘效率对于 ClickHouse 常用的规模至关重要。数据以称为 part 的数据块形式写入 ClickHouse 表,并在后台应用规则合并这些 part。在 ClickHouse 中,每个 part 都有自己的主索引。当 part 合并时,合并后 part 的主索引也会合并。与 Postgres 不同,这些索引不是为每一行构建的。相反,part 的主索引为每组行创建一个索引条目 - 这种技术称为**稀疏索引**。
- **稀疏索引**之所以可行,是因为 ClickHouse 将 part 的行按指定键的顺序存储在磁盘上。稀疏主索引不是直接定位单行(如基于 B-Tree 的索引),而是能够快速(通过对索引条目进行二分查找)识别可能匹配查询的行组。然后,这些可能匹配的行组会并行流式传输到 ClickHouse 引擎中以找到匹配项。这种索引设计使主索引保持较小(完全适合主内存),同时仍能显著加快查询执行时间,特别是对于数据分析用例中典型的范围查询。

有关更多详细信息,我们推荐这份[深入指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={postgres_b_tree} size='lg' alt='PostgreSQL B-Tree 索引' />

<Image img={postgres_sparse_index} size='lg' alt='PostgreSQL 稀疏索引' />

在 ClickHouse 中选择的键不仅决定索引,还决定数据写入磁盘的顺序。因此,它会显著影响压缩级别,进而影响查询性能。使大多数列的值以连续顺序写入的排序键将使所选的压缩算法(和编解码器)更有效地压缩数据。

> 表中的所有列都将根据指定排序键的值进行排序,无论它们是否包含在键本身中。例如,如果使用 `CreationDate` 作为键,则所有其他列中值的顺序将与 `CreationDate` 列中值的顺序相对应。可以指定多个排序键 - 这将使用与 `SELECT` 查询中 `ORDER BY` 子句相同的语义进行排序。

### 选择排序键 {#choosing-an-ordering-key}

有关选择排序键的注意事项和步骤,以 posts 表为例,请参见[此处](/data-modeling/schema-design#choosing-an-ordering-key)。

使用 CDC 进行实时复制时,需要考虑额外的约束,请参阅此[文档](/integrations/clickpipes/postgres/ordering_keys)了解如何使用 CDC 自定义排序键的技术。


## 分区 {#partitions}

Postgres 用户应该熟悉表分区的概念,它通过将表划分为更小、更易管理的片段(称为分区)来增强大型数据库的性能和可管理性。分区可以通过指定列上的范围(例如日期)、定义的列表或基于键的哈希来实现。这使管理员能够根据特定标准(如日期范围或地理位置)组织数据。分区通过启用分区裁剪和更高效的索引来加快数据访问,从而有助于提高查询性能。它还通过允许对单个分区而非整个表执行操作来简化备份和数据清除等维护任务。此外,分区可以通过在多个分区之间分配负载来显著提高 PostgreSQL 数据库的可扩展性。

在 ClickHouse 中,分区在表初始定义时通过 `PARTITION BY` 子句指定。该子句可以包含针对任何列的 SQL 表达式,其结果将决定行被发送到哪个分区。

<Image
  img={postgres_partitions}
  size='md'
  alt='PostgreSQL 分区到 ClickHouse 分区'
/>

数据部分在磁盘上与每个分区逻辑关联,并且可以单独查询。在下面的示例中,我们使用表达式 `toYear(CreationDate)` 按年对 `posts` 表进行分区。当行插入到 ClickHouse 时,该表达式将针对每一行进行求值,并路由到相应的分区(如果该分区存在;如果该行是某年的第一行,则会创建该分区)。

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

有关分区的完整说明,请参阅["表分区"](/partitions)。

### 分区的应用 {#applications-of-partitions}

ClickHouse 中的分区与 Postgres 中的应用类似,但存在一些细微差异。更具体地说:

- **数据管理** - 在 ClickHouse 中,用户应主要将分区视为数据管理功能,而非查询优化技术。通过基于键逻辑分离数据,每个分区可以独立操作,例如删除。这使用户能够在[存储层](/integrations/s3#storage-tiers)之间高效移动分区(以及子集),或者[使数据过期/从集群中高效删除](/sql-reference/statements/alter/partition)。在下面的示例中,我们删除了 2008 年的帖子。

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


- **查询优化** - 虽然分区可以辅助提升查询性能,但这在很大程度上取决于访问模式。如果查询仅针对少数分区(理想情况下是一个分区),性能可能会有所提升。这通常仅在分区键不在主键中且您按分区键进行过滤时才有用。然而,需要覆盖多个分区的查询可能比不使用分区时性能更差(因为分区可能导致更多的数据部分)。如果分区键已经是主键中的靠前条目,那么针对单个分区的优势将更不明显甚至不复存在。如果每个分区中的值是唯一的,分区也可以用于[优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。然而,总体而言,用户应确保主键已优化,并且仅在访问模式针对特定可预测的数据子集的特殊情况下才考虑将分区作为查询优化技术,例如按天分区,且大多数查询针对最近一天的数据。

### 分区建议 {#recommendations-for-partitions}

用户应将分区视为一种数据管理技术。当处理时间序列数据且需要从集群中淘汰过期数据时,分区是理想的选择,例如可以[直接删除](/sql-reference/statements/alter/partition#drop-partitionpart)最旧的分区。

**重要提示:** 确保您的分区键表达式不会产生高基数集合,即应避免创建超过 100 个分区。例如,不要按客户端标识符或名称等高基数列对数据进行分区。相反,应将客户端标识符或名称作为 ORDER BY 表达式中的第一列。

> 在内部,ClickHouse 会为插入的数据[创建数据部分](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着更多数据的插入,数据部分的数量会增加。为了防止数据部分数量过多(这会降低查询性能,因为需要读取更多文件),数据部分会在后台异步进程中合并。如果数据部分的数量超过预配置的限制,ClickHouse 将在插入时抛出异常 - 即"数据部分过多"错误。这在正常操作下不应发生,仅在 ClickHouse 配置错误或使用不当时才会出现,例如进行大量小批量插入。

> 由于数据部分是按分区独立创建的,增加分区数量会导致数据部分数量增加,即数据部分数量是分区数量的倍数。因此,高基数分区键可能导致此错误,应避免使用。


## 物化视图与投影 {#materialized-views-vs-projections}

Postgres 允许在单个表上创建多个索引,从而针对各种访问模式进行优化。这种灵活性使管理员和开发人员能够根据特定查询和操作需求定制数据库性能。ClickHouse 的投影概念虽然与此并非完全类似,但允许用户为表指定多个 `ORDER BY` 子句。

在 ClickHouse [数据建模文档](/data-modeling/schema-design)中,我们探讨了如何在 ClickHouse 中使用物化视图来预计算聚合、转换行以及针对不同访问模式优化查询。

对于后者,我们提供了[一个示例](/materialized-view/incremental-materialized-view#lookup-table),其中物化视图将行发送到目标表,该目标表使用与接收插入的原始表不同的排序键。

例如,考虑以下查询:

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

此查询需要扫描所有 9000 万行(虽然速度很快),因为 `UserId` 不是排序键。
之前,我们使用物化视图作为 `PostId` 的查找表来解决此问题。同样的问题可以通过[投影](/data-modeling/projections)来解决。下面的命令为 `ORDER BY user_id` 添加了一个投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意,我们必须首先创建投影,然后将其物化。后一个命令会导致数据以两种不同的顺序在磁盘上存储两次。投影也可以在创建表时定义,如下所示,并且会在插入数据时自动维护。

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

如果通过 `ALTER` 创建投影,则在发出 `MATERIALIZE PROJECTION` 命令时,创建过程是异步的。用户可以使用以下查询确认此操作的进度,等待 `is_done=1`。

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

如果我们重复上述查询,可以看到性能显著提升,代价是额外的存储空间。

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

使用 `EXPLAIN` 命令,我们还可以确认投影被用于处理此查询:

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

```


┌─explain─────────────────────────────────────────────┐

1. │ 表达式 ((Projection + Before ORDER BY))              │
2. │   聚合                                               │
3. │   过滤                                               │
4. │           ReadFromMergeTree (comments&#95;user&#95;id)      │
5. │           索引：                                     │
6. │           PrimaryKey                                │
7. │           键：                                       │
8. │           UserId                                    │
9. │           条件：(UserId in [8592047, 8592047])      │
10. │           数据片段：2/2                             │
11. │           数据粒度：2/11360                         │
    └─────────────────────────────────────────────────────┘

11 行结果。耗时：0.004 秒。

```

### 何时使用投影 {#when-to-use-projections}

投影对新用户来说是一个极具吸引力的特性,因为它们会在数据插入时自动维护。此外,查询只需发送到单个表,投影会在可能的情况下自动被利用以加快响应时间。

<Image img={postgres_projections} size="md" alt="ClickHouse 中的 PostgreSQL 投影"/>

这与物化视图形成对比,在物化视图中,用户必须根据过滤条件选择合适的优化目标表或重写查询。这对用户应用程序提出了更高的要求,并增加了客户端的复杂性。

尽管有这些优势,投影也存在一些[固有限制](/data-modeling/projections#when-to-use-projections),用户应该了解这些限制,因此应谨慎使用。

我们建议在以下情况下使用投影:

- 需要对数据进行完全重新排序。虽然投影中的表达式理论上可以使用 `GROUP BY`,但物化视图在维护聚合数据方面更有效。查询优化器也更有可能利用使用简单重新排序的投影,即 `SELECT * ORDER BY x`。用户可以在此表达式中选择列的子集以减少存储占用。
- 用户能够接受相关的存储占用增加以及两次写入数据的开销。测试对插入速度的影响并[评估存储开销](/data-compression/compression-in-clickhouse)。

:::note
从 25.5 版本开始,ClickHouse 在投影中支持虚拟列 `_part_offset`。这解锁了一种更节省空间的投影存储方式。

更多详情请参阅["投影"](/data-modeling/projections)
:::
```


## 反规范化 {#denormalization}

由于 Postgres 是关系型数据库,其数据模型高度[规范化](https://en.wikipedia.org/wiki/Database_normalization),通常涉及数百个表。在 ClickHouse 中,反规范化在某些情况下有助于优化 JOIN 性能。

您可以参考此[指南](/data-modeling/denormalization),了解在 ClickHouse 中对 Stack Overflow 数据集进行反规范化的优势。

至此,我们完成了从 Postgres 迁移到 ClickHouse 的基础指南。我们建议从 Postgres 迁移的用户阅读 [ClickHouse 数据建模指南](/data-modeling/schema-design),以深入了解 ClickHouse 的高级特性。
