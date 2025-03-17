---
slug: /partitions
title: 表分区
description: ClickHouse 中的表分区是什么
keywords: ['partitions', 'partition by']
---

import partitions from '@site/static/images/managing-data/core-concepts/partitions.png';
import merges_with_partitions from '@site/static/images/managing-data/core-concepts/merges_with_partitions.png';
import partition_pruning from '@site/static/images/managing-data/core-concepts/partition-pruning.png';


## ClickHouse 中的表分区是什么？ {#what-are-table-partitions-in-clickhouse}

<br/>

分区将表中 [数据片段](/parts) 组织成有序、逻辑单元，这属于 [MergeTree 引擎系列](/engines/table-engines/mergetree-family) 的一种数据组织方式，这种组织方式在概念上是有意义的，并且与特定的标准（如时间范围、类别或其他关键属性）保持一致。这些逻辑单元使得管理、查询和优化数据变得更加容易。

### 按分区 {#partition-by}

在通过 [PARTITION BY 子句](/engines/table-engines/mergetree-family/custom-partitioning-key) 初始定义表时，可以启用分区。该子句可以包含任何列上的 SQL 表达式，其结果将定义一行所属的分区。

为了说明这一点，我们通过添加 `PARTITION BY toStartOfMonth(date)` 子句来 [增强](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQ&run_query=true&tab=results) [什么是表片段](/parts) 示例表，这样将表的数据片段按属性销售的月份进行组织：

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

每当一组行被插入到表中时，ClickHouse 不会创建一个包含所有插入行的单一数据片段（至少要见 [这里](/parts)），而是为插入行中每个唯一的分区键值创建一个新的数据片段：

<img src={partitions} alt='插入处理' class='image' />
<br/>

ClickHouse 服务器首先将示例插入中四行的数据按其分区键值 `toStartOfMonth(date)` 进行拆分。然后，对于每个识别的分区，行按照 [正常的方式](/parts) 进行处理，包括多个顺序步骤 (① 排序，② 列拆分，③ 压缩，④ 写入磁盘)。

请注意，在启用分区的情况下，ClickHouse 会自动为每个数据片段创建 [MinMax 索引](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341)。这些是每个在分区键表达式中使用的列的文件，包含该列在数据片段中的最小值和最大值。

### 每个分区的合并 {#per-partition-merges}

在启用分区的情况下，ClickHouse 只 [合并](/merges) 内部的数据片段，而不是跨分区。我们为上述示例表做一个简单的示意：

<img src={merges_with_partitions} alt='分区合并' class='image' />
<br/>

如上图所示，属于不同分区的片段永远不会被合并。如果选择了高基数的分区键，那么分布在数千个分区上的片段将永远不会成为合并候选者——超过预配置的限制并导致 dreaded `Too many parts` 错误。解决这个问题很简单：选择一个基数在 1000 到 10000 之间的合理的分区键 [参考](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121)。

## 监控分区 {#monitoring-partitions}

您可以通过使用虚拟列 [查找](https://sql.clickhouse.com/?query=U0VMRUNUIERJU1RJTkNUIF9wYXJ0aXRpb25fdmFsdWUgQVMgcGFydGl0aW9uCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKT1JERVIgQlkgcGFydGl0aW9uIEFTQw&run_query=true&tab=results) 我们示例表中所有现有唯一分区的列表，使用虚拟列 `/engines/table-engines#table_engines-virtual_columns` `_partition_value`：

```sql
SELECT DISTINCT _partition_value AS partition
FROM uk.uk_price_paid_simple_partitioned
ORDER BY partition ASC;


     ┌─partition──────┐
  1. │ ('1995-01-01') │
  2. │ ('1995-02-01') │
  3. │ ('1995-03-01') │
 ...
304. │ ('2021-04-01') │
305. │ ('2021-05-01') │
306. │ ('2021-06-01') │
     └────────────────┘
```

另外，ClickHouse 在 [system.parts](/operations/system-tables/parts) 系统表中跟踪所有表的所有部分和分区，以下查询 [返回](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results) 所有分区的列表，以及每个分区中活动部分的当前数量和这些部分中行的总数：

```sql
SELECT
    partition,
    count() AS parts,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (`table` = 'uk_price_paid_simple_partitioned') AND active
GROUP BY partition
ORDER BY partition ASC;


     ┌─partition──┬─parts─┬───rows─┐
  1. │ 1995-01-01 │     1 │  50473 │
  2. │ 1995-02-01 │     1 │  50840 │
  3. │ 1995-03-01 │     1 │  71276 │
 ...
304. │ 2021-04-01 │     3 │  23160 │
305. │ 2021-05-01 │     3 │  17607 │
306. │ 2021-06-01 │     3 │   5652 │
     └─partition──┴─parts─┴───rows─┘
```


## 表分区的用途是什么？ {#what-are-table-partitions-used-for}

### 数据管理 {#data-management}

在 ClickHouse 中，分区主要是一种数据管理功能。通过基于分区表达式逻辑地组织数据，每个分区都可以独立管理。例如，上述示例表中的分区方案使得可以通过使用 [TTL 规则](/guides/developer/ttl) 自动删除旧数据，在主表中仅保留过去 12 个月的数据（见 DDL 语句的最后添加的行）：

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
由于表是按 `toStartOfMonth(date)` 分区的，因此符合 TTL 条件的整个分区（[表片段](/parts) 的集合）将被删除，从而使清理操作更高效，而不必 [重写片段](/sql-reference/statements/alter#mutations)。

同样，可以将旧数据自动而高效地移动到更具成本效益的 [存储层  /integrations/s3#storage-tiers](/integrations/s3#storage-tiers) 中，而不是删除旧数据：

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

分区可以帮助提高查询性能，但这在很大程度上取决于访问模式。如果查询只针对少数几个分区（理想情况下是一个），则性能可能会得到改善。这通常仅在分区键不在主键中并且您正在按其过滤时才有用，如下面的示例查询所示。

```sql
SELECT MAX(price) AS highest_price
FROM uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';


   ┌─highest_price─┐
1. │     296280000 │ -- 2.9628 亿
   └───────────────┘

1 行结果。耗时: 0.006 秒。处理了 8190 行，57.34 KB (1.36 百万行/秒，9.49 MB/秒)
峰值内存使用: 2.73 MiB。
```

该查询运行在我们上述的示例表上，并 [计算](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) 2020 年 12 月伦敦所有出售物业的最高价格，通过过滤表中分区键使用的一列（`date`）和主键用的一列（`town`）（且 `date` 不是主键的一部分）。

ClickHouse 通过应用一系列修剪技术，

以避免评估不相关的数据来处理该查询：

<img src={partition_pruning} alt='分区修剪' class='image' />
<br/>

① **分区修剪**：使用 [MinMax 索引](/partitions#what-are-table-partitions-in-clickhouse) 来忽略逻辑上无法与查询过滤器匹配的整个分区（片段集合）。

② **粒度修剪**：在步骤 ① 之后，对剩余的数据片段使用其 [主索引](/guides/best-practices/sparse-primary-indexes) 来忽略逻辑上无法与查询的过滤器匹配的所有 [粒度](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行块）。

我们可以通过 [检查](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) 我们上述样例查询的物理查询执行计划，通过 [EXPLAIN](/sql-reference/statements/explain) 子句：

```sql
EXPLAIN indexes = 1
SELECT MAX(price) AS highest_price
FROM uk_price_paid_simple_partitioned
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

① 分区修剪：EXPLAIN 输出中第 7 行到第 18 行显示，ClickHouse 首先使用 `date` 字段的 [MinMax 索引](/partitions#what-are-table-partitions-in-clickhouse) 来识别 1 个包含匹配查询 `date` 过滤器的行的 11 个现有 [粒度](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（存储的行块）。

② 粒度修剪：EXPLAIN 输出中第 19 行到第 24 行表示，ClickHouse 然后使用在步骤 ① 中识别的数据部分的 [主索引](/guides/best-practices/sparse-primary-indexes)（创建在 `town` 字段上）来进一步减少粒度的数量（包含潜在也匹配查询 `town` 过滤器的行）从 11 减少到 1。 这也反映在我们为查询打印的 ClickHouse 客户端输出中：

```response
... Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 million rows/s., 9.49 MB/s.)
Peak memory usage: 2.73 MiB.
```

这意味着 ClickHouse 在 6 毫秒内扫描并处理了 1 个粒度（8192 行的 [块](/operations/settings/merge-tree-settings#index_granularity)）以计算查询结果。

### 分区主要是一种数据管理功能 {#partitioning-is-primarily-a-data-management-feature}

请注意，跨所有分区的查询通常比在非分区表上运行相同的查询要慢。

使用分区后，数据通常分散在多个数据片段中，这通常会导致 ClickHouse 扫描和处理更多的数据量。

我们可以通过在没有分区的表上和在启用分区的表上运行相同查询来证明这一点。

两个表 [包含](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results) 相同的数据和行数：

```sql
SELECT
    table,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;

   ┌─table────────────────────────────┬─────rows─┐
1. │ uk_price_paid_simple             │ 25248433 │
2. │ uk_price_paid_simple_partitioned │ 25248433 │
   └──────────────────────────────────┴──────────┘
```

然而，启用分区的表 [有](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIGNvdW50KCkgQVMgcGFydHMKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgIElOIFsndWtfcHJpY2VfcGFpZF9zaW1wbGUnLCAndWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQnXSkgQU5EIGFjdGl2ZQpHUk9VUCBCWSB0YWJsZTs&run_query=true&tab=results) 更多活动的 [数据片段](/parts)，因为，如前所述，ClickHouse 只 [合并](/parts) 内部的数据片段，而不是跨分区：

```sql
SELECT
    table,
    count() AS parts
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;


   ┌─table────────────────────────────┬─parts─┐
1. │ uk_price_paid_simple             │     1 │
2. │ uk_price_paid_simple_partitioned │   436 │
   └──────────────────────────────────┴───────┘
```

如上所述，分区表 `uk_price_paid_simple_partitioned` 有 306 个分区，因此至少有 306 个活动数据片段。而在我们的非分区表 `uk_price_paid_simple` 中，所有 [初始](/parts) 数据片段都可以通过后台合并合并为一个活动部分。

当我们 [检查](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results) 启用分区情况下的物理查询执行计划，通过 [EXPLAIN](/sql-reference/statements/explain) 子句对上述示例查询进行分析时，我们可以在输出的第 19 和 20 行看到 ClickHouse 确认了 671 个存在于 436 个活跃数据片段中的 [粒度](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行块），其中可能包含匹配查询的过滤器的行，并因此将被查询引擎扫描和处理：

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

相同示例查询的物理查询执行计划显示，当在无分区的表上运行时，在输出中的第 11 和 12 行中，ClickHouse 确认 241 个存在于表的单个活动数据部分中的行块，可能包含匹配查询过滤器的行：

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

在 [启用分区的表上运行](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) 查询时，ClickHouse 扫描和处理了 671 个行块（约 550 万行）耗时 90 毫秒：

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE town = 'LONDON';


   ┌─highest_price─┐
1. │     594300000 │ -- 5.943 亿
   └───────────────┘

1 行结果。耗时: 0.090 秒。处理了 5480000 行，27.95 MB (60.66 百万行/秒，309.51 MB/秒)
峰值内存使用: 163.44 MiB。
```

而在 [运行](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results) 无分区的表时，ClickHouse 扫描和处理了 241 个行块（约 200 万行）耗时 12 毫秒：

```sql
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple
WHERE town = 'LONDON';


   ┌─highest_price─┐
1. │     594300000 │ -- 5.943 亿
   └───────────────┘

1 行结果。耗时: 0.012 秒。处理了 1970000 行，9.87 MB (162.23 万行/秒，811.17 MB/秒)
峰值内存使用: 62.02 MiB。
```
