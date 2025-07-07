---
'slug': '/partitions'
'title': '表分区'
'description': '在 ClickHouse 中，什么是表分区'
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

分区将[数据部分](/parts)组织到[MergeTree引擎系列](/engines/table-engines/mergetree-family)中的表中，形成有序的逻辑单元，这是一种以概念上有意义的方式组织数据的方法，并与特定标准（如时间范围、类别或其他关键属性）对齐。这些逻辑单元使数据更容易管理、查询和优化。

### 分区依据 {#partition-by}

在通过[PARTITION BY子句](/engines/table-engines/mergetree-family/custom-partitioning-key)定义表时，可以启用分区。此子句可以包含任何列上的SQL表达式，其结果将定义某一行属于哪个分区。

为此，我们通过添加一个 `PARTITION BY toStartOfMonth(date)`子句来[增强](https://sql.clickhouse.com/?query=U0hPVyBDUkVBVEUgVEFCTEUgdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQ&run_query=true&tab=results) [表部分是什么](/parts)的示例表，该子句根据物业销售的月份组织表的数据部分：

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

您可以在我们的ClickHouse SQL Playground中[查询此表](https://sql.clickhouse.com/?query=U0VMRUNUICogRlJPTSB1ay51a19wcmljZV9wYWlkX3NpbXBsZV9wYXJ0aXRpb25lZA&run_query=true&tab=results)。

### 磁盘上的结构 {#structure-on-disk}

每当一组行被插入到表中时，ClickHouse不会创建（至少）一个包含所有插入行的单一数据部分（如[这里所述](/parts)），而是为每个插入行中唯一的分区键值创建一个新的数据部分：

<Image img={partitions} size="lg"  alt='插入处理' />

<br/>

ClickHouse服务器首先根据示例插入中4行的分区键值 `toStartOfMonth(date)`来拆分行。
然后，对于每个识别出的分区，这些行按[常规](/parts)进行处理，执行多个顺序步骤（① 排序，② 拆分为列，③ 压缩，④ 写入磁盘）。

请注意，启用分区后，ClickHouse会自动为每个数据部分创建[MinMax索引](https://github.com/ClickHouse/ClickHouse/blob/dacc8ebb0dac5bbfce5a7541e7fc70f26f7d5065/src/Storages/MergeTree/IMergeTreeDataPart.h#L341)。这些索引只是用于分区键表达式中的每个表列的文件，包含该列在数据部分中的最小值和最大值。

### 每个分区合并 {#per-partition-merges}

启用分区后，ClickHouse仅会[合并](/merges)分区内的数据部分，而不会跨分区合并。我们为上面的示例表简单绘制如下：

<Image img={merges_with_partitions} size="lg"  alt='部分合并' />

<br/>

如上图所示，属于不同分区的部分永远不会被合并。如果选择一个高基数的分区键，则分布在数千个分区上的部分将永远不是合并候选，超出预配置的限制，导致可怕的 `Too many parts` 错误。解决这个问题的方法很简单：选择一个基数在[1000到10000之间](https://github.com/ClickHouse/ClickHouse/blob/ffc5b2c56160b53cf9e5b16cfb73ba1d956f7ce4/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L121)的合理分区键。

## 监控分区 {#monitoring-partitions}

您可以使用[虚拟列](/engines/table-engines#table_engines-virtual_columns) `_partition_value`查询我们示例表的所有现有唯一分区列表：

```sql runnable
SELECT DISTINCT _partition_value AS partition
FROM uk.uk_price_paid_simple_partitioned
ORDER BY partition ASC;
```

另外，ClickHouse在[system.parts](/operations/system-tables/parts)系统表中跟踪所有表的所有部分和分区，以下查询[返回](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICBwYXJ0aXRpb24sCiAgICBjb3VudCgpIEFTIHBhcnRzLAogICAgc3VtKHJvd3MpIEFTIHJvd3MKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgID0gJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJykgQU5EIGFjdGl2ZQpHUk9VUCBCWSBwYXJ0aXRpb24KT1JERVIgQlkgcGFydGl0aW9uIEFTQzs&run_query=true&tab=results)关于我们上面的示例表的所有分区列表，以及每个分区中的当前活动部分和行总数：

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

在ClickHouse中，分区主要是一项数据管理功能。通过基于分区表达式逻辑组织数据，每个分区可以独立管理。例如，上述示例表中的分区方案使得场景得以实现，只有过去12个月的数据会保留在主表中，利用[TTL规则](/guides/developer/ttl)自动删除旧数据（请参见DDL语句中添加的最后一行）：

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
由于该表由 `toStartOfMonth(date)`分区，满足TTL条件的整个分区（[表部分](/parts)的集合）将被删除，从而使清理操作更高效，而[不必重写部分](/sql-reference/statements/alter#mutations)。

同样，不是删除旧数据，而是可以将其自动高效地移动到更具成本效益的[存储层](/integrations/s3#storage-tiers)中：

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

分区可以帮助提高查询性能，但这在很大程度上依赖于访问模式。如果查询仅针对少数几个分区（理想情况下是一个），性能可能会有所改善。这通常只有在分区键不在主键中，并且您正在按其过滤时才有用，如下面示例查询所示。

```sql runnable
SELECT MAX(price) AS highest_price
FROM uk.uk_price_paid_simple_partitioned
WHERE date >= '2020-12-01'
  AND date <= '2020-12-31'
  AND town = 'LONDON';
```

该查询在上述示例表上运行并[计算](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIGRhdGUgPj0gJzIwMjAtMTItMDEnCiAgQU5EIGRhdGUgPD0gJzIwMjAtMTItMzEnCiAgQU5EIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results)出2020年12月在伦敦所有已售物业的最高价格，按照同时使用表的分区键中的一个列（`date`）和主键中的一个列（`town`）进行过滤（`date`并不是主键的一部分）。

ClickHouse通过应用一系列剪枝技术来处理该查询，以避免评估不相关的数据：

<Image img={partition_pruning} size="lg"  alt='PART MERGES 2' />

<br/>

① **分区剪枝**：[MinMax索引](/partitions#what-are-table-partitions-in-clickhouse)用于忽略整个不符合查询对表分区键中使用的列的过滤条件的分区（部分集合）。

② **粒度剪枝**：对于步骤①之后的剩余数据部分，使用其[主索引](/guides/best-practices/sparse-primary-indexes)忽略所有逻辑上与查询对表主键中使用的列的过滤条件不匹配的[粒度](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行块）。

我们可以通过[检查](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgZGF0ZSA-PSAnMjAyMC0xMi0wMScKICBBTkQgZGF0ZSA8PSAnMjAyMC0xMi0zMScKICBBTkQgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)我们上面示例查询的物理查询执行计划，通过[EXPLAIN](/sql-reference/statements/explain)子句：

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

上面的输出显示：

① 分区剪枝：EXPLAIN输出的第7到18行显示，ClickHouse首先使用`date`字段的[MinMax索引](/partitions#what-are-table-partitions-in-clickhouse)来识别3257个现有[粒度](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行块）中的11个，它们存储在436个现有活动数据部分中的1个中，这些数据部分包含匹配查询的`date`过滤条件的行。

② 粒度剪枝：EXPLAIN输出的第19到24行表明，ClickHouse随后使用步骤①中标识的数据部分的[主索引](/guides/best-practices/sparse-primary-indexes)（在`town`字段上创建）进一步将粒度数量（可能也包含匹配查询的`town`过滤条件的行）从11减少到1。这在我们进一步上面的查询运行中打印的ClickHouse客户端输出中也得到了反映：

```response
... Elapsed: 0.006 sec. Processed 8.19 thousand rows, 57.34 KB (1.36 million rows/s., 9.49 MB/s.)
Peak memory usage: 2.73 MiB.
```

这意味着ClickHouse在6毫秒内扫描和处理了1个粒度（[8192](/operations/settings/merge-tree-settings#index_granularity)行块），以计算查询结果。

### 分区主要是数据管理功能 {#partitioning-is-primarily-a-data-management-feature}

请注意，在所有分区上查询通常比在未分区表上运行相同的查询会更慢。

有了分区，数据通常分布在更多的数据部分上，这通常导致ClickHouse扫描和处理大量数据。

我们可以通过在[表部分是什么](/parts)示例表（未启用分区）和我们上面的当前示例表（启用分区）上运行相同查询来证明这一点。这两个表[包含](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIHN1bShyb3dzKSBBUyByb3dzCkZST00gc3lzdGVtLnBhcnRzCldIRVJFIChkYXRhYmFzZSA9ICd1aycpIEFORCAoYHRhYmxlYCBJTiBbJ3VrX3ByaWNlX3BhaWRfc2ltcGxlJywgJ3VrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkJ10pIEFORCBhY3RpdmUKR1JPVVAgQlkgdGFibGU7&run_query=true&tab=results)相同的数据和行数：

```sql runnable
SELECT
    table,
    sum(rows) AS rows
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;
```

然而，启用了分区的表[具有](https://sql.clickhouse.com/?query=U0VMRUNUCiAgICB0YWJsZSwKICAgIGNvdW50KCkgQVMgcGFydHMKRlJPTSBzeXN0ZW0ucGFydHMKV0hFUkUgKGRhdGFiYXNlID0gJ3VrJykgQU5EIChgdGFibGVgIElOIFsndWtfcHJpY2VfcGFpZF9zaW1wbGUnLCAndWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQnXSkgQU5EIGFjdGl2ZQpHUk9VUCBCWSB0YWJsZTs&run_query=true&tab=results)更多的活动[data parts](/parts)，因为，如上所述，ClickHouse仅在分区内[合并](/parts)数据部分，而不跨分区合并：

```sql runnable
SELECT
    table,
    count() AS parts
FROM system.parts
WHERE (database = 'uk') AND (table IN ['uk_price_paid_simple', 'uk_price_paid_simple_partitioned']) AND active
GROUP BY table;

```
如上所示，分区表 `uk_price_paid_simple_partitioned` 拥有超过600个分区，因此有306个活动数据部分。而对于我们的未分区表 `uk_price_paid_simple`，所有[初始](/parts)数据部分都可以通过后台合并合并为单个活动部分。


当我们[检查](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGVfcGFydGl0aW9uZWQKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)上面示例查询的物理查询执行计划时，使用[EXPLAIN](/sql-reference/statements/explain)子句，针对分区表的查询未使用分区过滤，下面输出的第19和20行中可以看到，ClickHouse识别出671个现有[粒度](/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)（行块），分布在436个现有活动数据部分上，这些部分可能包含匹配查询过滤的行，因此将被查询引擎扫描和处理：

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

对于相同的示例查询在未分区表上运行的物理查询执行计划[显示](https://sql.clickhouse.com/?query=RVhQTEFJTiBpbmRleGVzID0gMQpTRUxFQ1QgTUFYKHByaWNlKSBBUyBoaWdoZXN0X3ByaWNlCkZST00gdWsudWtfcHJpY2VfcGFpZF9zaW1wbGUKV0hFUkUgdG93biA9ICdMT05ET04nOw&run_query=true&tab=results)，输出的第11和12行中可以看到，ClickHouse识别出241个现有行块，在表的单个活动数据部分中，这些行块可能包含匹配查询过滤的行：

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

对于[运行](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlX3BhcnRpdGlvbmVkCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results)分区版本表的查询，ClickHouse在90毫秒内扫描和处理了671个行块（约550万行）：

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


而对于[运行](https://sql.clickhouse.com/?query=U0VMRUNUIE1BWChwcmljZSkgQVMgaGlnaGVzdF9wcmljZQpGUk9NIHVrLnVrX3ByaWNlX3BhaWRfc2ltcGxlCldIRVJFIHRvd24gPSAnTE9ORE9OJzs&run_query=true&tab=results)未分区表的查询，ClickHouse在12毫秒内扫描和处理了241个行块（约200万行）：

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
