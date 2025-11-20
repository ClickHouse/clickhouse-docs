---
slug: /optimize/prewhere
sidebar_label: 'PREWHERE 优化'
sidebar_position: 21
description: 'PREWHERE 通过避免读取不必要的列数据来减少 I/O 开销。'
title: 'PREWHERE 优化是如何工作的？'
doc_type: 'guide'
keywords: ['prewhere', 'query optimization', 'performance', 'filtering', 'best practices']
---

import visual01 from '@site/static/images/guides/best-practices/prewhere_01.gif';
import visual02 from '@site/static/images/guides/best-practices/prewhere_02.gif';
import visual03 from '@site/static/images/guides/best-practices/prewhere_03.gif';
import visual04 from '@site/static/images/guides/best-practices/prewhere_04.gif';
import visual05 from '@site/static/images/guides/best-practices/prewhere_05.gif';

import Image from '@theme/IdealImage';


# PREWHERE 优化是如何工作的？

[PREWHERE 子句](/sql-reference/statements/select/prewhere) 是 ClickHouse 中的一种查询执行优化手段。它通过避免不必要的数据读取，并在从磁盘读取非过滤列之前先过滤掉无关数据，从而减少 I/O 并提升查询速度。

本指南将介绍 PREWHERE 的工作原理、如何衡量其影响，以及如何对其进行调优以获得最佳性能。



## 不使用 PREWHERE 优化的查询处理 {#query-processing-without-prewhere-optimization}

我们首先演示在不使用 PREWHERE 的情况下,[uk_price_paid_simple](/parts) 表的查询是如何处理的:

<Image
  img={visual01}
  size='md'
  alt='不使用 PREWHERE 优化的查询处理'
/>

<br />
<br />① 查询包含对 `town` 列的过滤条件,该列是表主键的一部分,因此也是主索引的一部分。

② 为了加速查询,ClickHouse 将表的主索引加载到内存中。

③ 它扫描索引条目,以识别 town 列中哪些数据颗粒可能包含与谓词匹配的行。

④ 这些可能相关的数据颗粒会被加载到内存中,同时还会加载查询所需的其他列中位置对齐的数据颗粒。

⑤ 然后在查询执行期间应用剩余的过滤条件。

如您所见,在不使用 PREWHERE 的情况下,所有可能相关的列都会在过滤之前被加载,即使实际匹配的行很少。


## PREWHERE 如何提升查询效率 {#how-prewhere-improves-query-efficiency}

以下动画展示了当 PREWHERE 子句应用于所有查询谓词时,上述查询的处理过程。

前三个处理步骤与之前相同:

<Image
  img={visual02}
  size='md'
  alt='使用 PREWHERE 优化的查询处理'
/>

<br />
<br />① 查询包含对 `town` 列的过滤条件,该列是表主键的一部分——因此也是主索引的一部分。

② 与不使用 PREWHERE 子句的执行类似,为了加速查询,ClickHouse 将主索引加载到内存中,

③ 然后扫描索引条目以识别 `town` 列中哪些数据块可能包含与谓词匹配的行。

现在,得益于 PREWHERE 子句,下一步有所不同:ClickHouse 不再预先读取所有相关列,而是逐列过滤数据,仅加载真正需要的内容。这大幅减少了 I/O 操作,尤其是对于宽表。

在每一步中,它只加载包含至少一行通过(即匹配)前一个过滤条件的数据块。因此,每个过滤条件需要加载和评估的数据块数量单调递减:

**步骤 1:按 town 过滤**<br/>
ClickHouse 开始 PREWHERE 处理,① 读取 `town` 列中选定的数据块,并检查哪些数据块实际包含与 `London` 匹配的行。

在我们的示例中,所有选定的数据块都匹配,因此 ② 接下来选择下一个过滤列 `date` 对应的位置对齐数据块进行处理:

<Image img={visual03} size='md' alt='步骤 1:按 town 过滤' />

<br />
<br />
**步骤 2:按 date 过滤**
<br />
接下来,ClickHouse ① 读取选定的 `date` 列数据块以评估过滤条件 `date > '2024-12-31'`。

在这种情况下,三个数据块中有两个包含匹配的行,因此 ② 仅选择它们在下一个过滤列 `price` 中位置对齐的数据块进行进一步处理:

<Image img={visual04} size='md' alt='步骤 2:按 date 过滤' />

<br />
<br />
**步骤 3:按 price 过滤**
<br />
最后,ClickHouse ① 读取 `price` 列中选定的两个数据块以评估最后一个过滤条件 `price > 10_000`。

两个数据块中只有一个包含匹配的行,因此 ② 只需加载其在 `SELECT` 列 `street` 中位置对齐的数据块进行进一步处理:

<Image img={visual05} size='md' alt='步骤 3:按 price 过滤' />

<br />
<br />
到最后一步,仅加载最小的列数据块集合,即那些包含匹配行的数据块。这降低了内存使用量,减少了磁盘 I/O,并加快了查询执行速度。

:::note PREWHERE 减少数据读取量,而非处理的行数
请注意,ClickHouse 在使用和不使用 PREWHERE 的查询版本中处理相同数量的行。但是,应用 PREWHERE 优化后,并非每个处理的行都需要加载所有列的值。
:::


## PREWHERE 优化自动应用 {#prewhere-optimization-is-automatically-applied}

PREWHERE 子句可以手动添加,如上例所示。但是,您无需手动编写 PREWHERE。当设置 [`optimize_move_to_prewhere`](/operations/settings/settings#optimize_move_to_prewhere) 启用时(默认为 true),ClickHouse 会自动将过滤条件从 WHERE 移动到 PREWHERE,优先处理那些能最大程度减少读取量的条件。

其原理是较小的列扫描速度更快,当处理较大的列时,大部分数据颗粒已经被过滤掉了。由于所有列具有相同的行数,列的大小主要由其数据类型决定,例如,`UInt8` 列通常比 `String` 列小得多。

从版本 [23.2](https://clickhouse.com/blog/clickhouse-release-23-02#multi-stage-prewhere--alexander-gololobov) 开始,ClickHouse 默认遵循此策略,按未压缩大小的升序对 PREWHERE 过滤列进行排序,以进行多步处理。

从版本 [23.11](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere) 开始,可选的列统计信息可以进一步改进此功能,根据实际数据选择性而非仅列大小来选择过滤处理顺序。


## 如何衡量 PREWHERE 的影响 {#how-to-measure-prewhere-impact}

要验证 PREWHERE 是否对查询有帮助,可以比较启用和禁用 `optimize_move_to_prewhere` 设置时的查询性能。

首先在禁用 `optimize_move_to_prewhere` 设置的情况下运行查询:

```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' AND date > '2024-12-31' AND price < 10_000
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

ClickHouse 在处理该查询的 231 万行数据时读取了 **23.36 MB** 的列数据。

接下来,在启用 `optimize_move_to_prewhere` 设置的情况下运行查询。(请注意,此设置是可选的,因为该设置默认已启用):

```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' AND date > '2024-12-31' AND price < 10_000
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

处理的行数相同(231 万行),但得益于 PREWHERE,ClickHouse 读取的列数据减少了三倍多——仅 6.74 MB 而非 23.36 MB——使总运行时间缩短了 3 倍。

要深入了解 ClickHouse 如何在后台应用 PREWHERE,可以使用 EXPLAIN 和跟踪日志。

使用 [EXPLAIN](/sql-reference/statements/explain#explain-plan) 子句检查查询的逻辑计划:

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

此处省略了大部分计划输出,因为内容相当冗长。本质上,它显示所有三个列谓词都被自动移至 PREWHERE。

当您自己重现此操作时,还会在查询计划中看到这些谓词的顺序是基于列的数据类型大小。由于我们没有启用列统计信息,ClickHouse 使用大小作为确定 PREWHERE 处理顺序的后备方案。

如果想更深入地了解底层机制,可以通过指示 ClickHouse 在查询执行期间返回所有测试级别的日志条目来观察每个单独的 PREWHERE 处理步骤:

```sql
SELECT
    street
FROM
   uk.uk_price_paid_simple
WHERE
   town = 'LONDON' AND date > '2024-12-31' AND price < 10_000
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

- PREWHERE 可避免读取后续会被过滤掉的列数据,从而节省 I/O 和内存开销。
- 当 `optimize_move_to_prewhere` 启用时(默认启用),该功能会自动生效。
- 过滤顺序很重要:应优先使用数据量小且选择性强的列。
- 使用 `EXPLAIN` 和日志来验证 PREWHERE 是否已应用并了解其效果。
- PREWHERE 在宽表和使用选择性过滤器的大规模扫描场景中效果最为显著。
