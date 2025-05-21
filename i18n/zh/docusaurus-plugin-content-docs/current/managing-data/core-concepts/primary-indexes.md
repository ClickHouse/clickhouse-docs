---
'slug': '/primary-indexes'
'title': '主键索引'
'description': '稀疏主键索引在ClickHouse中是如何工作的'
'keywords':
- 'sparse primary index'
- 'primary index'
- 'index'
---

import visual01 from '@site/static/images/managing-data/core-concepts/primary-index-light_01.gif';
import visual02 from '@site/static/images/managing-data/core-concepts/primary-index-light_02.gif';
import visual03 from '@site/static/images/managing-data/core-concepts/primary-index-light_03.gif';
import Image from '@theme/IdealImage';

:::tip 寻找高级索引细节？
本页介绍了 ClickHouse 的稀疏主索引，如何构建它，如何工作，以及它如何加速查询。

有关高级索引策略和更深入的技术细节，请参见 [主索引深入探讨](/guides/best-practices/sparse-primary-indexes)。
:::

## ClickHouse 中的稀疏主索引如何工作？ {#how-does-the-sparse-primary-index-work-in-clickHouse}

<br/>

ClickHouse 中的稀疏主索引有助于有效识别 [粒度](https://clickhouse.com/docs/guides/best-practices/sparse-primary-indexes#data-is-organized-into-granules-for-parallel-data-processing)—可能包含与查询条件匹配的主键列数据的行块。在下一部分，我们将解释如何通过这些列中的值构建该索引。

### 稀疏主索引创建 {#sparse-primary-index-creation}

为了说明稀疏主索引是如何构建的，我们使用 [uk_price_paid_simple](https://clickhouse.com/docs/parts) 表以及一些动画。

作为 [提醒](https://clickhouse.com/docs/parts)，在我们的 ① 示例表中，主键为 (town, street)，② 插入的数据为 ③ 存储在磁盘上，按主键列值排序并压缩，分为每列的单独文件：

<Image img={visual01} size="lg"/>

<br/><br/>

在处理过程中，每列的数据被 ④ 逻辑地划分为粒度—每个粒度覆盖 8,192 行—这是 ClickHouse 数据处理机制所使用的最小单位。

这一粒度结构也使得主索引 **稀疏**：ClickHouse 并不是对每一行进行索引，而是仅存储 ⑤ 每个粒度中第一行的主键值。这导致每个粒度只有一个索引条目：

<Image img={visual02} size="lg"/>

<br/><br/>

由于其稀疏性，主索引的大小可以完全放入内存，从而能快速过滤主键列上的查询谓词。在下一部分，我们将展示它如何加速此类查询。

### 主索引使用 {#primary-index-usage}

我们通过另一个动画来简要说明稀疏主索引如何用于查询加速：

<Image img={visual03} size="lg"/>

<br/><br/>

① 示例查询在两个主键列上包含一个谓词： `town = 'LONDON' AND street = 'OXFORD STREET'`。

② 为了加速查询，ClickHouse 将表的主索引加载到内存中。

③ 然后扫描索引条目，以识别哪些粒度可能包含匹配谓词的行——换句话说，哪些粒度不能被跳过。

④ 这些潜在相关的粒度随后会被加载并在内存中与查询所需的其他列的对应粒度 [处理](/optimize/query-parallelism)。

## 监视主索引 {#monitoring-primary-indexes}

表中的每个 [数据部分](/parts) 都有自己的主索引。我们可以使用 [mergeTreeIndex](/sql-reference/table-functions/mergeTreeIndex) 表函数检查这些索引的内容。

以下查询列出了我们示例表中每个数据部分的主索引条目数量：

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

该查询显示了当前数据部分的主索引中的前 10 个条目。请注意，这些部分在后台连续 [合并](/merges) 成更大的部分：

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

最后，我们使用 [EXPLAIN](/sql-reference/statements/explain) 子句查看所有数据部分的主索引如何用于跳过不可能包含匹配示例查询谓词的行的粒度。这些粒度在加载和处理时被排除：
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


请注意，EXPLAIN 输出的第 13 行显示，所有数据部分中仅有 3 个粒度在主索引分析中被选择用于处理，而剩余的粒度则完全被跳过。

我们还可以通过简单运行查询来观察大部分数据是如何被跳过的：
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

如上所示，在示例表中，约 3000 万行中仅处理了约 25,000 行：
```sql
SELECT count() FROM uk.uk_price_paid_simple;
```

```txt
   ┌──count()─┐
1. │ 29556244 │ -- 29.56 million
   └──────────┘
```

##  关键要点 {#key-takeaways}

* **稀疏主索引** 通过识别可能包含主键列上查询条件匹配的行的粒度，帮助 ClickHouse 跳过不必要的数据。

* 每个索引仅存储 **每个粒度的第一行** 的主键值（一个粒度默认有 8,192 行），使其紧凑到可以放入内存。

* **MergeTree 表中的每个数据部分** 都有 **自己的主索引**，在查询执行过程中独立使用。

* 在查询过程中，索引允许 ClickHouse **跳过粒度**，降低 I/O 和内存使用，同时加速性能。

* 您可以使用 `mergeTreeIndex` 表函数 **检查索引内容**，并通过 `EXPLAIN` 子句监视索引使用情况。

## 哪里可以找到更多信息 {#where-to-find-more-information}

有关稀疏主索引在 ClickHouse 中如何工作的更深入了解，包括它们与传统数据库索引的区别以及使用它们的最佳实践，请查看我们详细的索引 [深入探讨](/guides/best-practices/sparse-primary-indexes)。

如果您对 ClickHouse 如何以高度并行的方式处理由主索引扫描选择的数据感兴趣，请参阅查询并行性指南 [这里](/optimize/query-parallelism)。
