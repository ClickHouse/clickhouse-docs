---
slug: /migrations/postgresql/data-modeling-techniques
title: '数据建模方法'
description: '从 PostgreSQL 迁移到 ClickHouse 指南（第三部分）'
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

> 这是《从 PostgreSQL 迁移到 ClickHouse》指南的 **第 3 部分**。通过一个实际示例，演示了在从 PostgreSQL 迁移时，如何在 ClickHouse 中进行数据建模。

我们建议正在从 Postgres 迁移的用户阅读[在 ClickHouse 中进行数据建模的指南](/data-modeling/schema-design)。本指南使用相同的 Stack Overflow 数据集，并基于 ClickHouse 的功能探索多种建模方案。

## ClickHouse 中的主键（排序键） {#primary-ordering-keys-in-clickhouse}

来自 OLTP 数据库的用户通常会在 ClickHouse 中寻找对应的概念。注意到 ClickHouse 支持 `PRIMARY KEY` 语法后，用户可能会倾向于直接沿用源 OLTP 数据库中的同一组键来定义表模式。这种做法并不合适。

### ClickHouse 的主键有何不同？ {#how-are-clickhouse-primary-keys-different}

要理解为什么在 ClickHouse 中直接使用 OLTP 的主键是不合适的，首先需要了解 ClickHouse 索引的一些基础知识。这里以 Postgres 作为对比示例，但这些通用概念同样适用于其他 OLTP 数据库。

- Postgres 的主键按照定义对每一行都是唯一的。借助 [B-tree 结构](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales)，可以高效地通过此键查找单行记录。虽然 ClickHouse 也可以针对单行值查找进行优化，但分析型工作负载通常需要在大量行上读取少量列。筛选条件更常见的需求是识别要执行聚合操作的**行子集**。
- 在 ClickHouse 通常运行的规模下，内存和磁盘效率至关重要。数据以称为 part 的数据块形式写入 ClickHouse 表，并在后台根据一定规则对这些 part 进行合并。在 ClickHouse 中，每个 part 都有自己的主索引。当 part 被合并时，合并后 part 的主索引也会一并合并。与 Postgres 不同，这些索引并不是为每一行构建的。相反，一个 part 的主索引只为一组行维护一个索引项——这种技术称为**稀疏索引（sparse indexing）**。
- 之所以可以使用**稀疏索引**，是因为 ClickHouse 会根据指定的键，对某个 part 中的行在磁盘上的存储顺序进行排序。稀疏主索引并不像基于 B-Tree 的索引那样直接定位单行记录，而是通过对索引项进行二分查找，快速定位可能与查询匹配的成组行。随后，这些被定位到的潜在匹配行集合会并行地流入 ClickHouse 引擎，以找到真正匹配的记录。这种索引设计使得主索引可以非常小（可完全常驻主内存），同时仍能显著加速查询执行时间，尤其是数据分析场景中常见的范围查询。 

如需更多详细信息，推荐参阅这篇[深度指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={postgres_b_tree} size="lg" alt="PostgreSQL B-Tree 索引"/>

<Image img={postgres_sparse_index} size="lg" alt="PostgreSQL 稀疏索引"/>

在 ClickHouse 中，所选择的键不仅决定索引本身，还决定数据在磁盘上的写入顺序。正因为如此，它会显著影响压缩率，而压缩率又会反过来影响查询性能。能够让大多数量的列值按连续顺序写入的排序键，将使所选压缩算法（以及编解码器）能够更高效地压缩数据。

> 表中的所有列都会根据指定排序键的值进行排序，而不论这些列本身是否包含在该键中。例如，如果使用 `CreationDate` 作为键，则所有其他列的值顺序都会与 `CreationDate` 列中的值顺序相对应。可以指定多个排序键——排序语义与 `SELECT` 查询中的 `ORDER BY` 子句相同。

### 选择排序键 {#choosing-an-ordering-key}

关于选择排序键时的考虑因素与步骤，并以 posts 表为示例，请参阅[此处](/data-modeling/schema-design#choosing-an-ordering-key)。

在使用 CDC 实时复制时，还需要考虑额外的约束条件。有关在 CDC 场景下如何自定义排序键的技术，请参考这篇[文档](/integrations/clickpipes/postgres/ordering_keys)。

## 分区 {#partitions}

Postgres 用户对表分区这一概念应该很熟悉：通过将表拆分为更小、更易管理的片段（称为分区），以提升大型数据库的性能和可管理性。分区可以通过在指定列（例如日期）上使用范围、指定列表，或基于键的哈希来实现。这使管理员可以基于特定条件（如日期范围或地理位置）来组织数据。分区有助于通过分区裁剪和更高效的索引来提升查询性能，从而实现更快速的数据访问。同时，它也有助于维护任务，例如备份和数据清理，因为可以针对单个分区而不是整个表执行操作。此外，通过将负载分布到多个分区，分区还能显著提高 PostgreSQL 数据库的可扩展性。

在 ClickHouse 中，分区是在表初始定义时通过 `PARTITION BY` 子句指定的。该子句可以包含基于任意列的 SQL 表达式，其结果将决定每一行被发送到哪个分区。

<Image img={postgres_partitions} size="md" alt="PostgreSQL partitions to ClickHouse partitions" />

数据片段在磁盘上按分区进行逻辑组织，并且可以被单独查询。对于下面的示例，我们使用表达式 `toYear(CreationDate)` 按年份对 `posts` 表进行分区。当行被插入到 ClickHouse 时，该表达式会针对每一行进行计算，并在对应分区已存在时将其路由到该分区（如果该行是某一年的第一行，则会创建该分区）。

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

有关分区的完整介绍，请参阅 [&quot;Table partitions&quot;](/partitions)。

### 分区的应用场景 {#applications-of-partitions}

ClickHouse 中的分区与 Postgres 的应用场景类似，但也存在一些细微差别。更具体地说：

* **数据管理** - 在 ClickHouse 中，用户应主要将分区视为一种数据管理功能，而不是查询优化技术。通过基于某个键对数据进行逻辑划分，每个分区都可以被独立操作，例如删除。这样，用户可以按时间等条件在不同[存储层级](/integrations/s3#storage-tiers)之间高效地迁移分区（也就是数据子集），或者[设置数据过期 / 高效地从集群中删除数据](/sql-reference/statements/alter/partition)。例如，下面我们会删除 2008 年的帖子。

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

查询返回 17 行。用时:0.002 秒。

ALTER TABLE posts
(DROP PARTITION '2008')

执行成功。

查询返回 0 行。用时:0.103 秒。
```

- **查询优化** - 分区虽然可以帮助提升查询性能，但这在很大程度上取决于访问模式。如果查询只会命中少量分区（理想情况下是一个），性能有可能得到提升。只有在分区键不在主键中且你按该分区键进行过滤时，这才通常有用。然而，如果查询需要覆盖大量分区，其性能可能会比完全不使用分区时更差（因为分区可能会导致产生更多的 part）。如果分区键已经是主键中的前置列，则只针对单个分区的性能收益会大幅降低，甚至可以忽略不计。如果每个分区中的值是唯一的，分区还可以用于[优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。但总体而言，用户应首先确保主键已得到优化，只在极少数情况下将分区作为查询优化手段——仅当访问模式只会访问一天中某个可预测的特定时间子集时才考虑，例如按天分区且大部分查询都是针对最近一天的数据。

### 分区使用建议 {#recommendations-for-partitions}

用户应将分区视为一种数据管理技术。当在处理时序数据并需要从集群中淘汰数据时，它非常理想，例如可以[直接删除](/sql-reference/statements/alter/partition#drop-partitionpart)最老的分区。

**重要：** 确保你的分区键表达式不会产生高基数集合，即应避免创建超过 100 个分区。例如，不要按高基数列（如客户端标识符或名称）对数据进行分区。相反，应将客户端标识符或名称作为 ORDER BY 表达式中的第一列。

> 在内部，ClickHouse 会为插入的数据[创建 part](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着数据不断插入，part 的数量会增加。为了防止 part 数量过高（会导致要读取的文件增加，从而降低查询性能），系统会通过后台异步进程将多个 part 合并。如果 part 的数量超过预配置的上限，ClickHouse 会在插入时抛出异常——即 "too many parts" 错误。在正常运行下不应发生这种情况，只会在 ClickHouse 配置错误或使用方式不当（例如大量小批量插入操作）时出现。

> 由于 part 是在每个分区内独立创建的，增加分区数量会导致 part 数量相应增加，即 part 数量是分区数量的倍数。因此，高基数的分区键可能会导致上述错误，应当避免。

## 物化视图与投影 {#materialized-views-vs-projections}

Postgres 允许在单个表上创建多个索引，从而可以针对多种访问模式进行优化。这种灵活性使管理员和开发人员能够根据特定查询和运维需求定制数据库性能。ClickHouse 的投影（projections）概念虽然与此并非完全等价，但允许用户为一张表指定多个 `ORDER BY` 子句。

在 ClickHouse [数据建模文档](/data-modeling/schema-design)中，我们探讨了如何在 ClickHouse 中使用物化视图来预先计算聚合、转换行，以及针对不同访问模式优化查询。

在上述用途中，对于最后一种，我们给出了[一个示例](/materialized-view/incremental-materialized-view#lookup-table)，其中物化视图将行写入一个目标表，该目标表的排序键与接收插入数据的原始表不同。

例如，考虑以下查询：

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

返回 1 行。用时:0.040 秒。已处理 9038 万行,361.59 MB(22.5 亿行/秒,9.01 GB/秒)。
峰值内存使用量:201.93 MiB。
```

由于 `UserId` 不是排序键，这个查询需要扫描全部 9,000 万行数据（尽管速度仍然很快）。
之前，我们使用一个用于查找 `PostId` 的物化视图来解决这个问题。同样的问题也可以通过
[projection](/data-modeling/projections) 来解决。下面的命令会添加一个
以 `ORDER BY user_id` 为排序键的 projection。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意，我们必须先创建 projection，然后再对其进行物化。后一个命令会使数据以两种不同的顺序在磁盘上各存储一份。projection 也可以在创建数据时一并定义，如下所示，并且在插入数据时会被自动维护。

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

如果通过 `ALTER` 创建投影，那么在执行 `MATERIALIZE PROJECTION` 命令时，其创建过程是异步进行的。用户可以使用如下查询来确认该操作的进度，并等待直到 `is_done=1`。

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

返回 1 行。用时:0.003 秒。
```

如果我们再次执行上述查询，可以看到性能以增加额外存储为代价而显著提升。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

返回 1 行。用时:0.008 秒。已处理 1.636 万行,98.17 KB(215 万行/秒,12.92 MB/秒)。
内存峰值:4.06 MiB。
```

通过 `EXPLAIN` 命令，我们还可以确认该查询确实使用了这个 projection：

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047
```

┌─explain─────────────────────────────────────────────┐

1. │ 表达式 ((Projection + ORDER BY 之前))                 │
2. │   聚合                                              │
3. │   过滤                                              │
4. │           ReadFromMergeTree (comments&#95;user&#95;id)      │
5. │           索引：                                    │
6. │           主键                                      │
7. │           键：                                      │
8. │           UserId                                    │
9. │           条件： (UserId in [8592047, 8592047])     │
10. │           数据片段： 2/2                            │
11. │           粒度： 2/11360                            │
    └─────────────────────────────────────────────────────┘

11 行记录。耗时：0.004 秒。

```

### 何时使用投影 {#when-to-use-projections}

投影对新用户来说是一个极具吸引力的特性,因为它们会在数据插入时自动维护。此外,查询只需发送到单个表,投影会在可能的情况下自动被利用以加快响应时间。

<Image img={postgres_projections} size="md" alt="ClickHouse 中的 PostgreSQL 投影"/>

这与物化视图形成对比,在物化视图中,用户必须根据过滤条件选择相应的优化目标表或重写查询。这对用户应用程序提出了更高要求,并增加了客户端复杂性。

尽管有这些优势,投影也存在一些[固有限制](/data-modeling/projections#when-to-use-projections),用户应当了解这些限制,因此应谨慎部署。

我们建议在以下情况下使用投影:

- 需要对数据进行完全重新排序。虽然投影中的表达式理论上可以使用 `GROUP BY`,但物化视图在维护聚合方面更为有效。查询优化器也更有可能利用使用简单重新排序的投影,即 `SELECT * ORDER BY x`。用户可以在此表达式中选择列的子集以减少存储占用。
- 用户能够接受相关的存储占用增加以及两次写入数据的开销。测试对插入速度的影响并[评估存储开销](/data-compression/compression-in-clickhouse)。

:::note
从 25.5 版本开始,ClickHouse 在投影中支持虚拟列 `_part_offset`。这提供了一种更节省空间的投影存储方式。

有关更多详细信息,请参阅["投影"](/data-modeling/projections)
:::
```

## 反规范化 {#denormalization}

由于 Postgres 是关系型数据库，其数据模型高度[规范化](https://en.wikipedia.org/wiki/Database_normalization)，通常会涉及数百张表。在 ClickHouse 中，为了优化 JOIN 性能，在某些情况下进行反规范化会更有利。

可参考这篇[指南](/data-modeling/denormalization)，了解在 ClickHouse 中对 Stack Overflow 数据集进行反规范化所带来的收益。

本篇基础指南到此结束，面向的是从 Postgres 迁移到 ClickHouse 的用户。建议正在从 Postgres 迁移的用户阅读[在 ClickHouse 中进行数据建模的指南](/data-modeling/schema-design)，以进一步了解 ClickHouse 的高级特性。
