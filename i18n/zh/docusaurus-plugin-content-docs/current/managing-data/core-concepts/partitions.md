---
'slug': '/partitions'
'title': '表分区'
'description': 'ClickHouse 中的表分区是什么'
'keywords':
- 'partitions'
- 'partition by'
---

import partitions from '@site/static/images/managing-data/core-concepts/partitions.png';
import merges_with_partitions from '@site/static/images/managing-data/core-concepts/merges_with_partitions.png';
import partition_pruning from '@site/static/images/managing-data/core-concepts/partition-pruning.png';
import Image from '@theme/IdealImage';

## 在 ClickHouse 中，表分区是什么？ {#what-are-table-partitions-in-clickhouse}

<br/>

分区将表中 [数据部分](/parts) 分组到 [MergeTree 引擎系列](/engines/table-engines/mergetree-family) 中，形成有组织的、逻辑的单元，这是一种符合特定标准（如时间范围、类别或其他主要属性）的数据组织方式。这些逻辑单元使数据更容易管理、查询和优化。

### 按分区 {#partition-by}

在通过 [PARTITION BY 子句](/engines/table-engines/mergetree-family/custom-partitioning-key) 初始定义表时，可以启用分区。此子句可以包含任何列上的 SQL 表达式，其结果将定义一行属于哪个分区。

为了说明这一点，我们 [完善](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQ&run_query=true&tab=results) 上述的 [表部分是什么](/parts) 示例表，添加一个 `PARTITION BY toStartOfMonth(date)` 子句，根据物业销售的月份组织表的数据部分：

```sql
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
ORDER BY (town, street)
PARTITION BY toStartOfMonth(date);
```

您可以在我们的 ClickHouse SQL Playground 中 [查询此表](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZV9wYXJ0aXRpb25lZA&run_query=true&tab=results)。

### 磁盘上的结构 {#structure-on-disk}

每当一组行被插入表中时，而不是创建（[至少](/operations/settings/settings#max_insert_block_size)）一个包含所有插入行的单一数据部分（如 [这里](https://clickhouse.tech/docs/en/operations/settings/settings/#max_insert_block_size) 所述），ClickHouse 会为每个独特的分区键值创建一个新的数据部分：

<Image img={partitions} size="lg" alt='INSERT PROCESSING' />

<br/>

ClickHouse 服务器首先通过它们的分区键值 `toStartOfMonth(date)` 将如上图所示的包含 4 行的示例插入中的行进行拆分。
然后，对于每个识别出的分区，这些行会按照 [常规方式](/parts) 通过执行几个顺序步骤（① 排序，② 拆分成列，③ 压缩，④ 写入磁盘）进行处理。

请注意，启用分区时，ClickHouse 会自动为每个数据部分创建 [MinMax 索引](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341)。这些实际上是每个用于分区键表达式的表列的文件，包含该列在数据部分中的最小值和最大值。

### 每个分区合并 {#per-partition-merges}

启用分区后，ClickHouse 仅在分区内 [合并](/merges) 数据部分，而不跨分区合并。我们为上面的示例表进行了如下示意：

<Image img={merges_with_partitions} size="lg" alt='PART MERGES' />

<br/>

如上图所示，属于不同分区的部分从不合并。如果选择具有高基数的分区键，则跨数千个分区的部分将永远不会是合并候选——这会超过预配置限制并导致可怕的 `Too many parts` 错误。解决此问题很简单：选择一个基数低于 1000..10000 的合理分区键 [（见此处）](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121)。

## 监控分区 {#monitoring-partitions}

您可以使用虚拟列 [(/engines/table-engines#table_engines-virtual_columns) ](_partition_value) 查询我们示例表中所有现有唯一分区的列表：

```sql runnable
SELECT DISTINCT _partition_value AS partition
FROM uk.uk_price_paid_simple_partitioned
ORDER BY partition ASC;
```

此外，ClickHouse 将所有表的所有部分和分区跟踪在 [system.parts](/operations/system-tables/parts) 系统表中，以下查询 [返回](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results) 我们上面的示例表中所有分区的列表，以及每个分区中活动部分的当前数量和这些部分的行总数：

```sql runnable
SELECT
    partition,
    count() AS parts,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple_partitioned') AND active
GROUP BY partition
ORDER BY partition ASC;
```

## 表分区用于什么？ {#what-are-table-partitions-used-for}

### 数据管理 {#data-management}

在 ClickHouse 中，分区主要是一个数据管理功能。通过基于分区表达式对数据进行逻辑组织，每个分区可以独立管理。例如，上述示例表中的分区方案使得仅保留最近 12 个月的数据在主表中，通过使用 [TTL 规则](/guides/developer/ttl) 自动删除更旧的数据（请参见 DDL 语句中新添加的最后一行）：

```sql
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
PARTITION BY toStartOfMonth(date)
ORDER BY (town, street)
TTL date + INTERVAL 12 MONTH DELETE;
```
由于表是按 `toStartOfMonth(date)` 分区的，所以满足 TTL 条件的整个分区（[表部分](/parts) 的集合）将被删除，从而使清理操作更高效，[而无需重写部分](/sql-reference/statements/alter#mutations)。

类似地，可以将旧数据自动且高效地转移到更具成本效益的 [存储层](/integrations/s3#storage-tiers)：

```sql
CREATE TABLE uk.uk_price_paid_simple_partitioned
(
    date Date,
    town LowCardinality(String),
    street LowCardinality(String),
    price UInt32
)
ENGINE = MergeTree
PARTITION BY toStartOfMonth(date)
ORDER BY (town, street)
TTL date + INTERVAL 12 MONTH TO VOLUME 'slow_but_cheap';
```

### 查询优化 {#query-optimization}

分区可以帮助提高查询性能，但这在很大程度上取决于访问模式。如果查询仅针对少量分区（理想情况下是一个），性能可能会改善。这在分区键不在主键中并且您将其用于过滤时尤为有用，如下例查询所示。

```sql runnable
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';
```

该查询在我们上面的示例表上运行，并 [计算](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) 2020年12月伦敦所有售出物业的最高价格，通过按列 (`date`) 进行过滤，这列也是表的分区键，同时也过滤表的主键列 (`town`)（并且 `date` 不是主键的一部分）。

ClickHouse 通过应用一系列修剪技术来处理该查询，以避免评估无关数据：

<Image img={partition_pruning} size="lg" alt='PART MERGES 2' />

<br/>

① **分区修剪**：使用 [MinMax 索引](/partitions#what-are-table-partitions-in-clickhouse) 来忽略整个在逻辑上无法匹配查询在表分区键上列的过滤条件的分区（部分的集合）。

② **颗粒修剪**：对步骤①之后剩余的数据部分，使用它们的 [主索引](/guides/best-practices/sparse-primary-indexes) 来忽略在逻辑上无法匹配查询在主键上列的过滤条件的所有 [颗粒](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行块）。

我们可以通过 [检查](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) 上述示例查询的物理查询执行计划，通过 [EXPLAIN](/sql-reference/statements/explain) 子句：

```sql style="fontSize:13px"
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';


    ┌─explain──────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                                                                    │
 2. │   Aggregating                                                                                                │
 3. │     Expression (Before GROUP BY)                                                                             │
 4. │       Expression                                                                                             │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple_partitioned)                                              │
 6. │         Indexes:                                                                                             │
 7. │           MinMax                                                                                             │
 8. │             Keys:                                                                                            │
 9. │               date                                                                                           │
10. │             Condition: and((date in (-Inf, 18627]), (date in [18597, +Inf)))                                 │
11. │             Parts: 1/436                                                                                     │
12. │             Granules: 11/3257                                                                                │
13. │           Partition                                                                                          │
14. │             Keys:                                                                                            │
15. │               toStartOfMonth(date)                                                                           │
16. │             Condition: and((toStartOfMonth(date) in (-Inf, 18597]), (toStartOfMonth(date) in [18597, +Inf))) │
17. │             Parts: 1/1                                                                                       │
18. │             Granules: 11/11                                                                                  │
19. │           PrimaryKey                                                                                         │
20. │             Keys:                                                                                            │
21. │               town                                                                                           │
22. │             Condition: (town in ['LONDON', 'LONDON'])                                                        │
23. │             Parts: 1/1                                                                                       │
24. │             Granules: 1/11                                                                                   │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

上述输出显示：

① 分区修剪：EXPLAIN 输出的第 7 行到第 18 行显示 ClickHouse 首先使用 `date` 字段的 [MinMax 索引](/partitions#what-are-table-partitions-in-clickhouse) 来确定 3257 个现有 [颗粒](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（存储的行块）中有 11 个与查询的 `date` 过滤条件匹配的行，它们保存在 436 个现有活动数据部分中的 1 个中。

② 颗粒修剪：EXPLAIN 输出的第 19 行到第 24 行表明 ClickHouse 然后使用步骤 ① 中识别的数据部分的 [主索引](/guides/best-practices/sparse-primary-indexes)（在 `town` 字段上创建的）进一步减少颗粒的数量（这些颗粒可能也匹配查询的 `town` 过滤条件）从 11 到 1。这也反映在我们在上面打印的 ClickHouse 客户端输出中：

```response
... Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 million rows/s., 9.49 MB/s.)
Peak memory usage: 2.73 MiB.
```

这意味着 ClickHouse 扫描并处理了 1 个颗粒（[8192](/operations/settings/merge-tree-settings#index_granularity) 行块），用时 6 毫秒来计算查询结果。

### 分区主要是数据管理功能 {#partitioning-is-primarily-a-data-management-feature}

请注意，跨所有分区查询通常比在非分区表上运行相同查询要慢。

启用分区后，数据通常分布在更多的数据部分上，这往往导致 ClickHouse 扫描和处理更大量的数据。

我们可以通过在 [表部分是什么](/parts) 示例表（未启用分区）和上述示例表（已启用分区）上执行相同的查询来证明这一点。两个表 [包含](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results) 相同的数据和行数：

```sql runnable
SELECT
    table,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;
```

然而，启用分区的表 [拥有](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIGNvdW50KCkgQVMgcGFydHMKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgIElOIFsndWtfcHJpY2VfcGFpZF9zaW1wbGUnLCAndWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQnXSkgQU5EIGFjdGl2ZQpHUk9VUCBCWSB0YWJsZTs&run_query=true&tab=results) 更多活动 [数据部分](/parts)，因为，正如上面提到的，ClickHouse 仅在分区内 [合并](/parts) 数据部分，而不跨分区：

```sql runnable
SELECT
    table,
    count() AS parts
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;

```
如上所示，分区表 `uk_price_paid_simple_partitioned` 具有超过 600 个分区，因此有 600 306 个活动数据部分。而对于我们的非分区表 `uk_price_paid_simple`，所有 [初始](/parts) 数据部分都可以通过后台合并合并为单个活动部分。

当我们 [检查](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) 物理查询执行计划，通过 [EXPLAIN](/sql-reference/statements/explain) 子句，针对上面的示例查询，没有分区过滤在分区表上运行，我们可以在输出的第 19 行和第 20 行看到，ClickHouse 确定了 3257 个现有 [颗粒](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行块）中有 671 个分布在 436 个现有活动数据部分中，这可能包含与查询的过滤条件匹配的行，因此将被扫描和处理：

```sql
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';


    ┌─explain─────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                       │
 2. │   Aggregating                                                   │
 3. │     Expression (Before GROUP BY)                                │
 4. │       Expression                                                │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple_partitioned) │
 6. │         Indexes:                                                │
 7. │           MinMax                                                │
 8. │             Condition: true                                     │
 9. │             Parts: 436/436                                      │
10. │             Granules: 3257/3257                                 │
11. │           Partition                                             │
12. │             Condition: true                                     │
13. │             Parts: 436/436                                      │
14. │             Granules: 3257/3257                                 │
15. │           PrimaryKey                                            │
16. │             Keys:                                               │
17. │               town                                              │
18. │             Condition: (town in ['LONDON', 'LONDON'])           │
19. │             Parts: 431/436                                      │
20. │             Granules: 671/3257                                  │
    └─────────────────────────────────────────────────────────────────┘
```

在没有分区的表上运行相同示例查询的物理查询执行计划 [显示](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) 输出的第 11 行和第 12 行中，ClickHouse 确定了 3083 个现有行块中有 241 个，这些行块可能包含与查询的过滤条件匹配的行，这些行块位于表的单个活动数据部分中：

```sql
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';


    ┌─explain───────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))             │
 2. │   Aggregating                                         │
 3. │     Expression (Before GROUP BY)                      │
 4. │       Expression                                      │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple)   │
 6. │         Indexes:                                      │
 7. │           PrimaryKey                                  │
 8. │             Keys:                                     │
 9. │               town                                    │
10. │             Condition: (town in ['LONDON', 'LONDON']) │
11. │             Parts: 1/1                                │
12. │             Granules: 241/3083                        │
    └───────────────────────────────────────────────────────┘
```

对于 [运行](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) 在分区表上的分区版本的查询，ClickHouse 扫描和处理了 671 个行块（约 5.5 百万行），用时 90 毫秒：

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';

┌─highest_price─┐
│     594300000 │ -- 594.30 million
└───────────────┘

1 row in set. Elapsed: 0.090 sec. Processed 5.48 million rows, 27.95 MB (60.66 million rows/s., 309.51 MB/s.)
Peak memory usage: 163.44 MiB.
```

而对于 [运行](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) 在非分区表上的查询，ClickHouse 扫描和处理了 241 个行块（约 2 百万行），用时 12 毫秒：

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';

┌─highest_price─┐
│     594300000 │ -- 594.30 million
└───────────────┘

1 row in set. Elapsed: 0.012 sec. Processed 1.97 million rows, 9.87 MB (162.23 million rows/s., 811.17 MB/s.)
Peak memory usage: 62.02 MiB.
```
