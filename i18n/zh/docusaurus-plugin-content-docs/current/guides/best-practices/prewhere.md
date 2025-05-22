---
'slug': '/optimize/prewhere'
'sidebar_label': 'PREWHERE 优化'
'sidebar_position': 21
'description': 'PREWHERE 通过避免读取不必要的列数据来减少 I/O。'
'title': 'PREWHERE 优化如何工作？'
---

import visual01 from '@site/static/images/guides/best-practices/prewhere_01.gif';
import visual02 from '@site/static/images/guides/best-practices/prewhere_02.gif';
import visual03 from '@site/static/images/guides/best-practices/prewhere_03.gif';
import visual04 from '@site/static/images/guides/best-practices/prewhere_04.gif';
import visual05 from '@site/static/images/guides/best-practices/prewhere_05.gif';
import Image from '@theme/IdealImage';


# PREWHERE 优化是如何工作的？

[PREWHERE 子句](/sql-reference/statements/select/prewhere) 是 ClickHouse 中的一种查询执行优化。它通过避免不必要的数据读取，减少 I/O 并提高查询速度，在从磁盘读取非过滤列之前筛选掉不相关的数据。

本指南解释了 PREWHERE 的工作原理、如何测量其影响以及如何对其进行优化以获得最佳性能。


## 无 PREWHERE 优化的查询处理 {#query-processing-without-prewhere-optimization}

我们将首先说明如何在不使用 PREWHERE 的情况下处理对 [uk_price_paid_simple](/parts) 表的查询：

<Image img={visual01} size="md" alt="无 PREWHERE 优化的查询处理"/>

<br/><br/>
① 查询包含一个对 `town` 列的过滤条件，该列是表的主键的一部分，因此也是主索引的一部分。

② 为了加速查询，ClickHouse 将表的主索引加载到内存中。

③ 它扫描索引条目，以确定 `town` 列中哪些区块可能包含与谓词匹配的行。

④ 这些潜在相关的区块被加载到内存中，并且与查询所需的任何其他列的区块按位置对齐。

⑤ 然后，在查询执行过程中应用剩余的过滤条件。

如您所见，在没有 PREWHERE 的情况下，即使只有少量行实际匹配，所有潜在相关的列也会在过滤之前全部加载。


## PREWHERE 如何提高查询效率 {#how-prewhere-improves-query-efficiency}

以下动画展示了如何在所有查询谓词上应用 PREWHERE 子句时处理上述查询。

前三个处理步骤与之前相同：

<Image img={visual02} size="md" alt="应用 PREWHERE 优化的查询处理"/>

<br/><br/>
① 查询包含一个对 `town` 列的过滤条件，该列是表的主键的一部分——因此也是主索引的一部分。

② 与没有 PREWHERE 子句的运行类似，为了加速查询，ClickHouse 将主索引加载到内存中，

③ 然后扫描索引条目，以确定 `town` 列中哪些区块可能包含与谓词匹配的行。

现在，得益于 PREWHERE 子句，下一步不同：ClickHouse 逐列过滤数据，仅加载真正需要的内容，而不是提前读取所有相关列。这大大减少了 I/O，尤其是对于宽表。

在每一步中，它只加载包含至少一行通过——即匹配——先前过滤的区块。因此，每个过滤条件可加载和评估的区块数单调减少：

**步骤 1：按城市过滤**<br/>
ClickHouse 开始 PREWHERE 处理，通过 ①读取 `town` 列中选定的区块，并检查哪些区块实际上包含与 `London` 匹配的行。

在我们的例子中，所有选定的区块都匹配，因此 ② 选择下一个过滤列——`date`——的相应位置对齐的区块进行处理：

<Image img={visual03} size="md" alt="步骤 1：按城市过滤"/>

<br/><br/>
**步骤 2：按日期过滤**<br/>
接下来，ClickHouse ①读取选定的 `date` 列区块以评估过滤条件 `date > '2024-12-31'`。

在这种情况下，三个区块中有两个包含匹配的行，因此 ② 仅选择它们的相应位置对齐的区块——来自下一个过滤列——`price`——进行进一步处理：

<Image img={visual04} size="md" alt="步骤 2：按日期过滤"/>

<br/><br/>
**步骤 3：按价格过滤**<br/>
最后，ClickHouse ①读取 `price` 列中选定的两个区块以评估最后的过滤条件 `price > 10_000`。

仅有两个区块中的一个包含匹配的行，因此 ② 仅需加载从 `SELECT` 列——`street`——的相应位置对齐的区块进行进一步处理：

<Image img={visual05} size="md" alt="步骤 2：按价格过滤"/>

<br/><br/>
通过最后一步，仅加载包含匹配行的最小列区块集合。这导致较低的内存使用、更少的磁盘 I/O 和更快的查询执行。

:::note PREWHERE 减少读取数据，而不是处理的行
请注意，ClickHouse 在 PREWHERE 和非 PREWHERE 版本的查询中处理的行数相同。然而，应用了 PREWHERE 优化后，并不需要为每个处理的行加载所有列值。
:::

## PREWHERE 优化是自动应用的 {#prewhere-optimization-is-automatically-applied}

PREWHERE 子句可以手动添加，如上面的示例所示。然而，您不需要手动编写 PREWHERE。当设置 [`optimize_move_to_prewhere`](/operations/settings/settings#optimize_move_to_prewhere) 被启用（默认为 true）时，ClickHouse 会自动将过滤条件从 WHERE 移动到 PREWHERE，优先考虑那些能够最大程度减少读取量的条件。

其思想是较小的列更快地扫描，而在处理较大列的时候，大多数区块已经被过滤掉。由于所有列的行数相同，因此列的大小主要取决于其数据类型，例如，`UInt8` 列通常比 `String` 列小得多。

作为从版本 [23.2](https://clickhouse.com/blog/clickhouse-release-23-02#multi-stage-prewhere--alexander-gololobov) 起 ClickHouse 默认遵循此策略，按未压缩大小的升序对 PREWHERE 过滤列进行排序以进行多步处理。

从版本 [23.11](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere) 开始，可选的列统计信息可以通过根据实际数据选择性选择过滤处理顺序进一步改善这一点，而不仅仅依赖列的大小。


## 如何测量 PREWHERE 的影响 {#how-to-measure-prewhere-impact}

要验证 PREWHERE 是否帮助了您的查询，您可以比较启用和禁用 `optimize_move_to_prewhere` 设置时查询的性能。

我们首先在禁用 `optimize_move_to_prewhere` 设置的情况下运行查询：

```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' and date > '2024-12-31' and price < 10_000
SETTINGS optimize_move_to_prewhere = false;
```

```txt
   ┌─street──────┐
1. │ MOYSER ROAD │
2. │ AVENUE ROAD │
3. │ AVENUE ROAD │
   └─────────────┘

3 rows in set. Elapsed: 0.056 sec. Processed 2.31 million rows, 23.36 MB (41.09 million rows/s., 415.43 MB/s.)
Peak memory usage: 132.10 MiB.
```

在处理 231 万行查询时，ClickHouse 读取了 **23.36 MB** 的列数据。

接下来，我们在启用 `optimize_move_to_prewhere` 设置的情况下运行查询。（请注意，此设置是可选的，因为该设置默认启用）：
```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' and date > '2024-12-31' and price < 10_000
SETTINGS optimize_move_to_prewhere = true;
```

```txt
   ┌─street──────┐
1. │ MOYSER ROAD │
2. │ AVENUE ROAD │
3. │ AVENUE ROAD │
   └─────────────┘

3 rows in set. Elapsed: 0.017 sec. Processed 2.31 million rows, 6.74 MB (135.29 million rows/s., 394.44 MB/s.)
Peak memory usage: 132.11 MiB.
```

处理的行数相同（231 万），但得益于 PREWHERE，ClickHouse 读取的列数据量减少了三倍——仅 6.74 MB，而不是 23.36 MB——这使得总运行时间减少了 3 倍。

要深入了解 ClickHouse 是如何在背后应用 PREWHERE 的，请使用 EXPLAIN 和跟踪日志。

我们使用 [EXPLAIN](/sql-reference/statements/explain#explain-plan) 子句检查查询的逻辑计划：
```sql
EXPLAIN PLAN actions = 1
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' and date > '2024-12-31' and price < 10_000;
```

```txt
...
Prewhere info                                                                                                                                                                                                                                          
  Prewhere filter column: 
    and(greater(__table1.date, '2024-12-31'_String), 
    less(__table1.price, 10000_UInt16), 
    equals(__table1.town, 'LONDON'_String)) 
...
```

我们在此省略了计划输出中的大部分内容，因为它相当冗长。本质上，它显示所有三个列谓词都自动移动到了 PREWHERE。

当您自己重现时，您还会在查询计划中看到这些谓词的顺序是基于列的数据类型大小。由于我们没有启用列统计信息，ClickHouse 使用大小作为确定 PREWHERE 处理顺序的后备依据。

如果您想进一步探究，您可以通过指示 ClickHouse 在查询执行期间返回所有测试级别的日志条目来观察每个个体的 PREWHERE 处理步骤：
```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' and date > '2024-12-31' and price < 10_000
SETTINGS send_logs_level = 'test';
```

```txt
...
<Trace> ... Condition greater(date, '2024-12-31'_String) moved to PREWHERE
<Trace> ... Condition less(price, 10000_UInt16) moved to PREWHERE
<Trace> ... Condition equals(town, 'LONDON'_String) moved to PREWHERE
...
<Test> ... Executing prewhere actions on block: greater(__table1.date, '2024-12-31'_String)
<Test> ... Executing prewhere actions on block: less(__table1.price, 10000_UInt16)
...
```

## 关键要点 {#key-takeaways}

* PREWHERE 避免了读取后续过滤掉的列数据，从而节省 I/O 和内存。
* 当 `optimize_move_to_prewhere` 启用时（默认），它会自动工作。
* 过滤顺序很重要：小而选择性的列应优先处理。
* 使用 `EXPLAIN` 和日志验证 PREWHERE 的应用并理解其影响。
* PREWHERE 在宽表和具有选择性过滤的大规模扫描中效果最为显著。
