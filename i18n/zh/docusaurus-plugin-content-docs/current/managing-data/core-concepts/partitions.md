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

## ClickHouse中的表分区是什么？ {#what-are-table-partitions-in-clickhouse}

<br/>

分区将表的 [数据部分](/parts) 在 [MergeTree 引擎系列](/engines/table-engines/mergetree-family) 中分组成有组织的逻辑单元，这是根据特定标准（例如时间范围、类别或其他关键属性）来组织数据的一种方法。这些逻辑单元使得数据更易于管理、查询和优化。

### 按分区 {#partition-by}

在通过 [PARTITION BY 子句](/engines/table-engines/mergetree-family/custom-partitioning-key) 初步定义表时，可以启用分区。这条子句可以包含任何列上的 SQL 表达式，其结果将定义行属于哪个分区。

为了说明这一点，我们通过添加 `PARTITION BY toStartOfMonth(date)` 子句来 [增强](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQ&run_query=true&tab=results) [什么是表部分](/parts)的示例表，这将根据房产销售的月份对表的数据部分进行组织：

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

您可以在我们的 ClickHouse SQL Playground 中 [查询这个表](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZV9wYXJ0aXRpb25lZA&run_query=true&tab=results)。

### 磁盘上的结构 {#structure-on-disk}

每当一组行被插入到表中时，ClickHouse 并不会创建一个包含所有插入行的单一数据部分（正如 [这里](/parts) 所描述的那样），而是为插入行中每个唯一的分区键值创建一个新的数据部分：

<Image img={partitions} size="lg"  alt='INSERT PROCESSING' />

<br/>

ClickHouse 服务器首先根据示例插入中的分区键值 `toStartOfMonth(date)` 将 4 行进行拆分。然后，对于每个识别出的分区，这些行被 [照常处理](/parts)，执行多个顺序步骤（① 排序，② 拆分成列，③ 压缩，④ 写入磁盘）。

请注意，当启用分区时，ClickHouse 会自动为每个数据部分创建 [MinMax 索引](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341)。这些文件用于每个在分区键表达式中使用的表列，包含该列在数据部分中的最小值和最大值。

### 每个分区的合并 {#per-partition-merges}

启用分区后，ClickHouse 仅在分区内 [合并](/merges) 数据部分，而不跨分区合并。我们为上述示例表进行了草图描述：

<Image img={merges_with_partitions} size="lg"  alt='PART MERGES' />

<br/>

如上图所示，属于不同分区的部分决不会合并。如果选择了具有高基数的分区键，则分布在数千个分区中的部分将永远不是合并候选——超出了预设的限制，并导致令人讨厌的 `Too many parts` 错误。解决此问题的方法很简单：选择一个合理的分区键，其 [基数在 1000 到 10000 之间](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121)。

## 监控分区 {#monitoring-partitions}

您可以通过使用 [虚拟列](/engines/table-engines#table_engines-virtual_columns) `_partition_value` 来 [查询](https://sql.clickhouse.com/?query=U0VMRUNUIERJU1RJTkNUIF9wYXJ0aXRpb25fdmFsdWUgQVMgcGFydGl0aW9uCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKT1JERVIgQlkgcGFydGl0aW9uIEFTQw&run_query=true&tab=results) 我们示例表中所有现有的唯一分区列表：

```sql runnable
SELECT DISTINCT _partition_value AS partition
FROM uk.uk_price_paid_simple_partitioned
ORDER BY partition ASC;
```

此外，ClickHouse 在 [system.parts](/operations/system-tables/parts) 系统表中跟踪所有表的所有部分和分区，以下查询 [返回](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results) 我们上面的示例表中的所有分区列表，包括每个分区中的活动部分的当前数量以及这些部分中的行总数：

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

## 表分区的用途是什么？ {#what-are-table-partitions-used-for}

### 数据管理 {#data-management}

在 ClickHouse 中，分区主要是一种数据管理特性。通过根据分区表达式逻辑组织数据，每个分区可以独立管理。例如，上述示例表中的分区方案允许仅在主表中保留过去 12 个月的数据，通过使用 [TTL 规则](/guides/developer/ttl) 自动删除旧数据（请参见 DDL 语句中添加的最后一行）：

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

由于表是按 `toStartOfMonth(date)` 分区的，满足 TTL 条件的整个分区（[表部分](/parts) 的集合）将被删除，从而使清理操作更高效，而 [无需重写部分](/sql-reference/statements/alter#mutations)。

同样，可以通过将旧数据自动和高效地移动到更具成本效益的 [存储层](/integrations/s3#storage-tiers) 来替代删除旧数据：

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

分区可以辅助查询性能，但这在很大程度上取决于访问模式。如果查询仅针对几个分区（理想情况下是一个），性能可能会有所提高。只有在分区键不在主键中并且您针对它进行过滤时，这通常才有用，如以下示例查询所示。

```sql runnable
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';
```

该查询运行在我们上述示例表上，并且 [计算](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) 2020年12月伦敦所有已售物业的最高价格，通过过滤一个在表的分区键中使用的列（`date`）和在表的主键中使用的列（`town`）进行计算（并且 `date` 不是主键的一部分）。

ClickHouse 通过应用一系列剪裁技术来处理该查询，以避免评估无关数据：

<Image img={partition_pruning} size="lg"  alt='PART MERGES 2' />

<br/>

① **分区剪裁**：使用 [MinMax 索引](/partitions#what-are-table-partitions-in-clickhouse) 忽略在逻辑上无法与查询的分区键中使用的列的过滤条件匹配的整个分区（部分集合）。

② **粒度剪裁**：对于在步骤①之后的剩余数据部分，使用其 [主索引](/guides/best-practices/sparse-primary-indexes) 来忽略所有无法与查询的主键中使用的列的过滤条件匹配的 [粒度](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行块）。

通过 [检查](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) 我们的上述示例查询的物理查询执行计划，可以观察到这些数据剪裁步骤：

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

① 分区剪裁：EXPLAIN 输出的第 7 行到第 18 行显示，ClickHouse 首先使用 `date` 字段的 [MinMax 索引](/partitions#what-are-table-partitions-in-clickhouse) 来识别在查询的 `date` 过滤条件下与 3257 个现有 [粒度](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（存储中的行块）匹配的 11 个。

② 粒度剪裁：EXPLAIN 输出的第 19 行到第 24 行表明，ClickHouse 然后使用在步骤①中识别的数据部分的 [主索引](/guides/best-practices/sparse-primary-indexes)（在 `town` 字段上创建）进一步减少粒度的数量（包含可能也与查询的 `town` 过滤条件匹配的行）从 11 减少到 1。这也反映在我们前面为查询运行的 ClickHouse 客户端输出中：

```response
... Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 million rows/s., 9.49 MB/s.)
Peak memory usage: 2.73 MiB.
```

这意味着 ClickHouse 扫描并处理了 1 个粒度（[8192](/operations/settings/merge-tree-settings#index_granularity) 行块），耗时 6 毫秒来计算查询结果。

### 分区主要是一种数据管理特性 {#partitioning-is-primarily-a-data-management-feature}

请注意，跨所有分区进行查询通常比在非分区表上运行相同的查询要慢。

使用分区时，数据通常分布在更多的数据部分中，这通常导致 ClickHouse 扫描和处理更大体量的数据。

我们可以通过在 [什么是表部分](/parts) 示例表（未启用分区）和我们上面的示例表（启用分区）上运行相同的查询来证明这一点。两个表 [包含相同数据和行数](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results)：

```sql runnable
SELECT
    table,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;
```

然而，启用分区的表 [具有](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIGNvdW50KCkgQVMgcGFydHMKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgIElOIFsndWtfcHJpY2VfcGFpZF9zaW1wbGUnLCAndWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQnXSkgQU5EIGFjdGl2ZQpHUk9VUCBCWSB0YWJsZTs&run_query=true&tab=results) 更多的活动 [数据部分](/parts)，正如前面提到的，ClickHouse 仅在分区内 [合并](/parts) 数据部分，而不跨分区：

```sql runnable
SELECT
    table,
    count() AS parts
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;

```

如上文所示，分区表 `uk_price_paid_simple_partitioned` 具有超过 600 个分区，因此有 600306 个活跃数据部分。而对于我们的非分区表 `uk_price_paid_simple`，所有 [初始](/parts) 数据部分都可以通过后台合并合并为单个活动部分。

当我们 [检查](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) 没有分区过滤条件的物理查询执行计划时，我们可以看到输出的第 19 行和第 20 行，ClickHouse 识别出 671 个在 3257 个现有 [粒度](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行块）中的，分散在 436 个现有活跃数据部分中，这些部分可能包含符合查询过滤条件的行，因此会被查询引擎扫描和处理：

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

运行同一示例查询在没有分区的表上的物理查询执行计划 [显示](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) 输出的第 11 行和第 12 行显示，ClickHouse 在表的单个活动数据部分中识别出 241 个在 3083 个现有的行块中，这些行块可能包含符合查询过滤条件的行：

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

对于 [运行](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) 在分区版本表上的查询，ClickHouse 扫描和处理了 671 个行块（约 550 万行），耗时 90 毫秒：

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

而对于 [在非分区表上运行](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) 查询时，ClickHouse 扫描和处理了 241 个行块（约 200 万行），耗时 12 毫秒：

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
