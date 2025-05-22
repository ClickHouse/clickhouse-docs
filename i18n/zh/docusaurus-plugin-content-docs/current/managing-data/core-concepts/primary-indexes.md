---
'slug': '/primary-indexes'
'title': '主键索引'
'description': 'ClickHouse中的稀疏主键索引是如何工作的'
'keywords':
- 'sparse primary index'
- 'primary index'
- 'index'
---

import visual01 from '@site/static/images/managing-data/core-concepts/primary-index-light_01.gif';
import visual02 from '@site/static/images/managing-data/core-concepts/primary-index-light_02.gif';
import visual03 from '@site/static/images/managing-data/core-concepts/primary-index-light_03.gif';
import Image from '@theme/IdealImage';

:::tip 寻找高级索引详细信息？
本页面介绍了 ClickHouse 的稀疏主键索引，包括它是如何构建的、如何运作的以及如何帮助加速查询。

有关高级索引策略和更深层次的技术细节，请参阅 [主键索引深度探讨](/guides/best-practices/sparse-primary-indexes)。
:::


## ClickHouse 中的稀疏主键索引如何工作？ {#how-does-the-sparse-primary-index-work-in-clickHouse}

<br/>

ClickHouse 中的稀疏主键索引可以有效地识别 [粒度](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)—可能包含与表主键列的查询条件匹配的数据的行块。下一部分将解释该索引是如何从这些列的值中构造的。

### 稀疏主键索引创建 {#sparse-primary-index-creation}

为了说明稀疏主键索引是如何构建的，我们使用 [uk_price_paid_simple](https://clickhouse.com/docs/parts) 表以及一些动画。

作为一个 [提醒](https://clickhouse.com/docs/parts)，在我们的 ① 示例表中，主键为 (town, street)，② 插入的数据 ③ 在磁盘上存储，被主键列值排序并压缩到每列的单独文件中：

<Image img={visual01} size="lg"/>

<br/><br/>

在处理过程中，每列的数据被 ④ 逻辑地划分为粒度—每个粒度覆盖 8,192 行—这是 ClickHouse 数据处理机制工作的最小单位。

这种粒度结构也是使主键索引 **稀疏** 的原因：ClickHouse 仅从每个粒度中存储 ⑤ 一个行的主键值—具体来说，就是第一行的值。这导致每个粒度只有一个索引条目：

<Image img={visual02} size="lg"/>

<br/><br/>

得益于其稀疏性，主键索引足够小，可以完全放入内存，从而实现对主键列谓词查询的快速过滤。在下一部分中，我们将展示它是如何帮助加速这些查询的。

### 主键索引使用 {#primary-index-usage}

我们通过另一个动画概述稀疏主键索引在查询加速中的使用：

<Image img={visual03} size="lg"/>

<br/><br/>

① 示例查询包含了对两个主键列的谓词：`town = 'LONDON' AND street = 'OXFORD STREET'`。

② 为了加速查询，ClickHouse 将表的主键索引加载到内存中。

③ 然后，它扫描索引条目以识别可能包含与谓词匹配的行的粒度—换句话说，识别无法跳过的粒度。

④ 然后，这些可能相关的粒度被加载并 [处理](/optimize/query-parallelism) 在内存中，连同查询所需的任何其他列的相应粒度一起。

## 监控主键索引 {#monitoring-primary-indexes}

表中的每个 [数据部分](/parts) 都有自己的主键索引。我们可以使用 [mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex) 表函数检查这些索引的内容。

以下查询列出了我们示例表中每个数据部分的主键索引条目数量：

```sql
SELECT
    part_name,
    max(mark_number) as entries
FROM mergeTreeIndex('uk', 'uk_price_paid_simple')
GROUP BY part_name;
```


```txt
   ┌─part_name─┬─entries─┐
1. │ all_2_2_0 │     914 │
2. │ all_1_1_0 │    1343 │
3. │ all_0_0_0 │    1349 │
   └───────────┴─────────┘
```

此查询显示了当前一个数据部分主键索引的前 10 个条目。请注意，这些部分在后台连续 [合并](/merges) 为更大的部分：

```sql
SELECT 
    mark_number + 1 as entry,
    town,
    street
FROM mergeTreeIndex('uk', 'uk_price_paid_simple')
WHERE part_name = (SELECT any(part_name) FROM mergeTreeIndex('uk', 'uk_price_paid_simple')) 
ORDER BY mark_number ASC
LIMIT 10;
```


```txt
    ┌─entry─┬─town───────────┬─street───────────┐
 1. │     1 │ ABBOTS LANGLEY │ ABBEY DRIVE      │
 2. │     2 │ ABERDARE       │ RICHARDS TERRACE │
 3. │     3 │ ABERGELE       │ PEN Y CAE        │
 4. │     4 │ ABINGDON       │ CHAMBRAI CLOSE   │
 5. │     5 │ ABINGDON       │ THORNLEY CLOSE   │
 6. │     6 │ ACCRINGTON     │ MAY HILL CLOSE   │
 7. │     7 │ ADDLESTONE     │ HARE HILL        │
 8. │     8 │ ALDEBURGH      │ LINDEN ROAD      │
 9. │     9 │ ALDERSHOT      │ HIGH STREET      │
10. │    10 │ ALFRETON       │ ALMA STREET      │
    └───────┴────────────────┴──────────────────┘
```

最后，我们使用 [EXPLAIN](/sql-reference/statements/explain) 子句查看所有数据部分的主键索引如何用于跳过不可能包含与示例查询谓词匹配的行的粒度。这些粒度被完全排除在加载和处理之外：
```sql
EXPLAIN indexes = 1
SELECT
    max(price)
FROM
    uk.uk_price_paid_simple
WHERE
    town = 'LONDON' AND street = 'OXFORD STREET';
```


```txt
    ┌─explain────────────────────────────────────────────────────────────────────────────────────────────────────┐
 1. │ Expression ((Project names + Projection))                                                                  │
 2. │   Aggregating                                                                                              │
 3. │     Expression (Before GROUP BY)                                                                           │
 4. │       Expression                                                                                           │
 5. │         ReadFromMergeTree (uk.uk_price_paid_simple)                                                        │
 6. │         Indexes:                                                                                           │
 7. │           PrimaryKey                                                                                       │
 8. │             Keys:                                                                                          │
 9. │               town                                                                                         │
10. │               street                                                                                       │
11. │             Condition: and((street in ['OXFORD STREET', 'OXFORD STREET']), (town in ['LONDON', 'LONDON'])) │
12. │             Parts: 3/3                                                                                     │
13. │             Granules: 3/3609                                                                               │
    └────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```


请注意，以上 EXPLAIN 输出的第 13 行显示，在所有数据部分中，共有 3,609 个粒度中仅选择了 3 个进行处理。其余粒度被完全跳过。

我们还可以通过简单运行查询来观察到大多数数据被跳过：
```sql
SELECT max(price)
FROM uk.uk_price_paid_simple
WHERE (town = 'LONDON') AND (street = 'OXFORD STREET');
```


```txt
   ┌─max(price)─┐
1. │  263100000 │ -- 263.10 million
   └────────────┘

1 row in set. Elapsed: 0.010 sec. Processed 24.58 thousand rows, 159.04 KB (2.53 million rows/s., 16.35 MB/s.)
Peak memory usage: 13.00 MiB.
```

如上所示，示例表中大约 3,000 万行数据，实际处理的仅约 25,000 行：
```sql
SELECT count() FROM uk.uk_price_paid_simple;
```

```txt
   ┌──count()─┐
1. │ 29556244 │ -- 29.56 million
   └──────────┘
```

##  关键要点 {#key-takeaways}

* **稀疏主键索引** 帮助 ClickHouse 跳过不必要的数据，通过识别哪些粒度可能包含与主键列的查询条件匹配的行。

* 每个索引仅存储 **每个粒度的第一行** 的主键值（默认情况下，粒度包含 8,192 行），使其足够紧凑以适应内存。

* **MergeTree 表中的每个数据部分** 都有 **自己的主键索引**，在查询执行期间独立使用。

* 在查询过程中，该索引允许 ClickHouse **跳过粒度**，减少 I/O 和内存使用，同时加速性能。

* 您可以使用 `mergeTreeIndex` 表函数 **检查索引内容**，并通过 `EXPLAIN` 子句监控索引使用情况。

## 在哪里找到更多信息 {#where-to-find-more-information}

要深入了解 ClickHouse 中稀疏主键索引的工作原理，包括它们与传统数据库索引的不同之处以及使用它们的最佳实践，请查看我们详细的索引 [深度探讨](/guides/best-practices/sparse-primary-indexes)。

如果您对 ClickHouse 如何以高度并行的方式处理由主键索引扫描选中的数据感兴趣，请查看查询并行性指南 [这里](/optimize/query-parallelism)。
