---
'slug': '/migrations/postgresql/data-modeling-techniques'
'title': '数据建模技术'
'description': '关于从 PostgreSQL 迁移到 ClickHouse 的指南第 3 部分'
'keywords':
- 'postgres'
- 'postgresql'
'show_related_blogs': true
'sidebar_label': '第 3 部分'
'doc_type': 'guide'
---

import postgres_b_tree from '@site/static/images/migrations/postgres-b-tree.png';
import postgres_sparse_index from '@site/static/images/migrations/postgres-sparse-index.png';
import postgres_partitions from '@site/static/images/migrations/postgres-partitions.png';
import postgres_projections from '@site/static/images/migrations/postgres-projections.png';
import Image from '@theme/IdealImage';

> 这是关于从 PostgreSQL 迁移到 ClickHouse 的指南的 **第 3 部分**。通过一个实际的例子，它演示了如果从 PostgreSQL 迁移，如何在 ClickHouse 中建模数据。

我们建议从 Postgres 迁移的用户阅读 [ClickHouse 中建模数据的指南](/data-modeling/schema-design)。本指南使用相同的 Stack Overflow 数据集，并探索了多种利用 ClickHouse 特性的不同方法。

## ClickHouse 中的主键（排序键） {#primary-ordering-keys-in-clickhouse}

来自 OLTP 数据库的用户通常会寻找 ClickHouse 中的等效概念。在注意到 ClickHouse 支持 `PRIMARY KEY` 语法时，用户可能会倾向于使用与其源 OLTP 数据库相同的键来定义表模式。这并不合适。

### ClickHouse 主键有何不同？ {#how-are-clickhouse-primary-keys-different}

为了理解为什么在 ClickHouse 中使用 OLTP 主键不合适，用户应该了解 ClickHouse 索引的基础知识。我们以 Postgres 作为比较的例子，但这些一般概念适用于其他 OLTP 数据库。

- Postgres 主键根据定义，每行都是唯一的。使用 [B-树结构](/guides/best-practices/sparse-primary-indexes#an-index-design-for-massive-data-scales) 允许通过该键高效查找单行。虽然 ClickHouse 可以优化单行值的查找，但分析工作负载通常需要读取少量列但处理许多行。过滤器更常需要识别 **一部分行**，以便进行聚合处理。
- 内存和磁盘效率在 ClickHouse 通常使用的规模中至关重要。数据以称为部分的块写入 ClickHouse 表，同时应用后台合并部分的规则。在 ClickHouse 中，每个部分都有自己独立的主索引。当部分被合并时，合并部分的主索引也会合并。与 Postgres 不同，这些索引不是为每行构建的。相反，一个部分的主索引为每组行有一个索引条目——该技术称为 **稀疏索引**。
- **稀疏索引** 是可能的，因为 ClickHouse 将部分的行根据指定的键有序存储在磁盘上。与直接定位单行不同（如基于 B-树的索引），稀疏主索引允许它通过索引条目上的二分查找快速识别可能匹配查询的行组。定位到的潜在匹配行组随后会并行流入 ClickHouse 引擎以查找匹配项。此索引设计允许主索引变小（它完全适合主内存），同时仍显著加快查询执行时间，特别是在数据分析用例中典型的范围查询时。

要获取更多细节，我们推荐查看该 [深入指南](/guides/best-practices/sparse-primary-indexes)。

<Image img={postgres_b_tree} size="lg" alt="PostgreSQL B-Tree Index"/>

<Image img={postgres_sparse_index} size="lg" alt="PostgreSQL Sparse Index"/>

在 ClickHouse 中选择的键不仅会确定索引，还会确定数据在磁盘上的写入顺序。因此，它可以显著影响压缩级别，这反过来又会影响查询性能。导致大多数列值以连续顺序写入的排序键，将允许所选的压缩算法（和编解码器）更有效地压缩数据。

> 表中的所有列都会根据指定排序键的值进行排序，无论它们是否包含在键中。例如，如果 `CreationDate` 被用作键，则其他所有列中值的顺序将与 `CreationDate` 列中的值的顺序相对应。可以指定多个排序键——这将以与 `SELECT` 查询中的 `ORDER BY` 子句相同的语义进行排序。

### 选择排序键 {#choosing-an-ordering-key}

有关选择排序键的考虑因素和步骤，以帖子表为例，请参见 [此处](/data-modeling/schema-design#choosing-an-ordering-key)。

使用带有 CDC 的实时复制时，还需考虑其他约束，请参阅该 [文档](/integrations/clickpipes/postgres/ordering_keys)，了解如何使用 CDC 自定义排序键的技术。

## 分区 {#partitions}

Postgres 用户会熟悉表分区的概念，通过将表划分为更小、更易管理的部分来增强大型数据库的性能和可管理性。这种分区可以通过在指定列（例如，日期）上定义范围、定义列表或通过键的哈希来实现。这使得管理员可以根据特定标准（如日期范围或地理位置）组织数据。分区有助于通过启用更快的数据访问（通过分区裁剪）和更有效的索引来提高查询性能。它还通过允许对单个分区而不是整个表进行操作，帮助维护任务，例如备份和数据清理。此外，分区可以通过在多个分区之间分配负载显著提高 PostgreSQL 数据库的可扩展性。

在 ClickHouse 中，分区在表最初通过 `PARTITION BY` 子句定义时指定。该子句可以包含任何列的 SQL 表达式，其结果将定义一行发送到哪个分区。

<Image img={postgres_partitions} size="md" alt="PostgreSQL partitions to ClickHouse partitions"/>

数据部分在磁盘上与每个分区逻辑关联，并可以单独查询。在下面的例子中，我们使用表达式 `toYear(CreationDate)` 按年对 `posts` 表进行分区。当行插入到 ClickHouse 时，将针对每行评估此表达式，并在存在分区时路由到结果分区（如果该行是某一年的第一行，则该分区将被创建）。

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

ClickHouse 中的分区与 Postgres 中的应用相似，但有一些细微差别。更具体地说：

- **数据管理** - 在 ClickHouse 中，用户应主要将分区视为数据管理特性，而不是查询优化技术。通过根据键逻辑分离数据，可以独立操作每个分区，例如删除。这使得用户能够高效地在 [存储层](/integrations/s3#storage-tiers) 之间移动分区，进而移动子集，或者 [过期数据/有效地从集群中删除](/sql-reference/statements/alter/partition)。例如，在下面的案例中，我们删除 2008 年的帖子。

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

- **查询优化** - 尽管分区可以帮助提升查询性能，但这在很大程度上依赖于访问模式。如果查询仅针对少数分区（理想情况下是一个），性能可能会有所提升。这通常只有在分区键不在主键中，且你按照该键进行过滤时才有效。然而，需要覆盖多个分区的查询可能性能较差，这可能是因为由于分区产生更多部分。针对单一区域的目标的好处在分区键已在主键中占据前面位置时甚至更不明显。如果每个分区中的值是唯一的，分区还可以用来 [优化 GROUP BY 查询](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。但通常，用户应确保主键经过优化，并且仅在访问模式访问具体可预测的子集（例如，按天分区，大部分查询在最后一天）时考虑分区作为查询优化技术。

### 对于分区的建议 {#recommendations-for-partitions}

用户应将分区视为一种数据管理技术。当处理时间序列数据时，尤其是需要从集群中过期数据时是理想的，例如，可以 [简便地删除](https://www.baidu.com) 最古老的分区(/sql-reference/statements/alter/partition#drop-partitionpart)。

**重要**：确保你的分区键表达式不会导致高基数集，即应避免创建超过 100 个分区。例如，不要通过客户端标识符或名称等高基数字段对数据进行分区。相反，使用客户端标识符或名称作为 `ORDER BY` 表达式中的首列。

> 内部上， ClickHouse [为插入的数据创建部分](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)。随着更多数据的插入，部分数量增加。为了防止过多的部分导致查询性能下降（需要读取更多文件），部分在后台异步进程中被合并。如果部分的数量超过预配置的限制，则 ClickHouse 在插入时会抛出异常—作为“部分太多”的错误。在正常操作下不会发生这种情况，仅在 ClickHouse 配置错误或使用不当时（例如，大量小插入）才会发生。

> 由于部分是在每个分区中独立创建的，增加分区的数量会导致部分数增加，即是分区数量的倍数。因此，高基数的分区键可能引发此错误，需予以避免。

## 物化视图与投影 {#materialized-views-vs-projections}

Postgres 允许在单个表上创建多个索引，以优化各种访问模式。这种灵活性使管理员和开发人员能够根据特定的查询和操作需求调整数据库性能。 ClickHouse 的投影概念虽然与此并不完全相同，但允许用户为表指定多个 `ORDER BY` 子句。

在 ClickHouse [数据建模文档](/data-modeling/schema-design) 中，我们探讨了如何在 ClickHouse 中使用物化视图来预计算聚合、转换行，并针对不同的访问模式优化查询。

对于最后一个例子，我们提供了 [一个示例](/materialized-view/incremental-materialized-view#lookup-table)，其中物化视图将行发送到目标表，并具有与原始接收插入的表不同的排序键。

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

该查询要求扫描所有 9000 万行（虽然速度很快），因为 `UserId` 不是排序键。之前，我们通过一个作为 `PostId` 查找的物化视图解决了这个问题。相同的问题可以通过 [投影](/data-modeling/projections) 来解决。下面的命令为 `ORDER BY user_id` 添加了一个投影。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

请注意，我们必须先创建该投影，然后对其进行物化。该后续命令将导致数据在磁盘上以两种不同的顺序存储两次。投影也可以在创建数据时定义，如下所示，并在数据插入时自动维护。

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

如果通过 `ALTER` 创建投影，则在发出 `MATERIALIZE PROJECTION` 命令时，创建是异步的。用户可以使用以下查询确认该操作的进度，等待 `is_done=1`。

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

如果我们重复上述查询，我们可以看到性能显著提高，虽然增加了存储成本。

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

通过 `EXPLAIN` 命令，我们还确认使用了投影来处理此查询：

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

对于新用户而言，投影是一项吸引人的特性，因为随着数据的插入，它们会自动维护。此外，查询可以仅发送到单个表，并根据可能的情况利用投影来加快响应时间。

<Image img={postgres_projections} size="md" alt="PostgreSQL projections in ClickHouse"/>

与物化视图不同，后者用户必须根据过滤条件选择适当的优化目标表或重写查询。这对用户应用程序施加了更大的强调，并增加了客户端的复杂性。

尽管有这些优势，投影也有一些 [固有的限制](/data-modeling/projections#when-to-use-projections)，用户应注意，因此应谨慎部署。

我们建议在以下情况下使用投影：

- 需要对数据进行全面重新排序。虽然投影中的表达式理论上可以使用 `GROUP BY`，但物化视图更有效地维护聚合。查询优化器也更可能利用使用简单重新排序的投影，即 `SELECT * ORDER BY x`。用户可以在该表达式中选择一部分列，以减小存储占用。
- 用户对相关的存储占用增加和双重写入数据的开销感到满意。测试对插入速度的影响，并 [评估存储开销](/data-compression/compression-in-clickhouse)。

:::note
自 25.5 版以来， ClickHouse 在投影中支持虚拟列 `_part_offset` ，这开启了一种更节省空间的投影存储方式。

有关更多细节，请参见 ["投影"](/data-modeling/projections)
:::

## 反规范化 {#denormalization}

由于 Postgres 是关系数据库，因此其数据模型通常高度 [规范化](https://en.wikipedia.org/wiki/Database_normalization)，通常涉及数百个表。在 ClickHouse 中，反规范化有时可以提高 JOIN 性能。

你可以参考该 [指南](/data-modeling/denormalization)，展示在 ClickHouse 中反规范化 Stack Overflow 数据集的好处。

这结束了我们为从 Postgres 迁移到 ClickHouse 的用户准备的基本指南。我们建议从 Postgres 迁移的用户阅读 [ClickHouse 中建模数据的指南](/data-modeling/schema-design)，以了解更多关于 ClickHouse 高级特性的内容。
