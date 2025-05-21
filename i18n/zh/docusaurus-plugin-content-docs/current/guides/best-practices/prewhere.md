---
'slug': '/optimize/prewhere'
'sidebar_label': 'PREWHERE 优化'
'sidebar_position': 21
'description': 'PREWHERE 通过避免读取不必要的列数据来减少I/O。'
'title': 'PREWHERE 优化是如何工作的？'
---

import visual01 from '@site/static/images/guides/best-practices/prewhere_01.gif';
import visual02 from '@site/static/images/guides/best-practices/prewhere_02.gif';
import visual03 from '@site/static/images/guides/best-practices/prewhere_03.gif';
import visual04 from '@site/static/images/guides/best-practices/prewhere_04.gif';
import visual05 from '@site/static/images/guides/best-practices/prewhere_05.gif';
import Image from '@theme/IdealImage';


# PREWHERE 优化是如何工作的？

[PREWHERE 子句](/sql-reference/statements/select/prewhere) 是 ClickHouse 中的一种查询执行优化。通过避免不必要的数据读取，并在从磁盘读取非过滤列之前过滤掉不相关的数据，PREWHERE 可以减少 I/O，并提高查询速度。

本指南解释了 PREWHERE 的工作原理，如何测量其影响，以及如何进行调优以获得最佳性能。


## 没有使用 PREWHERE 优化的查询处理 {#query-processing-without-prewhere-optimization}

我们将首先说明如何在没有使用 PREWHERE 的情况下处理针对 [uk_price_paid_simple](/parts) 表的查询：

<Image img={visual01} size="md" alt="没有使用 PREWHERE 优化的查询处理"/>

<br/><br/>
① 查询在 `town` 列上包含一个过滤器，该列是表的主键的一部分，因此也是主索引的一部分。

② 为了加速查询，ClickHouse 将表的主索引加载到内存中。

③ 它扫描索引条目，以识别 `town` 列中的哪些粒度可能包含匹配谓词的行。

④ 这些潜在相关的粒度与任何其他所需列的按位置对齐的粒度一起加载到内存中。

⑤ 然后在查询执行期间应用剩余的过滤器。

如您所见，在没有 PREWHERE 的情况下，所有潜在相关的列都会在过滤之前加载，即使只有少数行实际上匹配。


## PREWHERE 如何提高查询效率 {#how-prewhere-improves-query-efficiency}

以下动画展示了如何将 PREWHERE 子句应用于上面查询中的所有谓词来处理查询。

前三个处理步骤与之前相同：

<Image img={visual02} size="md" alt="使用 PREWHERE 优化的查询处理"/>

<br/><br/>
① 查询在 `town` 列上包含一个过滤器，该列是表的主键的一部分——因此也是主索引的一部分。

② 与没有 PREWHERE 子句的运行类似，为了加速查询，ClickHouse 将主索引加载到内存中。

③ 然后扫描索引条目，以识别 `town` 列中的哪些粒度可能包含匹配谓词的行。

现在，得益于 PREWHERE 子句，下一步不同：ClickHouse 按列过滤数据，而不是一次性读取所有相关列，只加载真正需要的内容。这大幅减少了 I/O，特别是对于宽表。

在每一步，它仅加载包含至少一行匹配的粒度，即与之前的过滤器匹配的粒度。因此，加载和评估每个过滤器的粒度数量单调减少：

**步骤 1：按 town 过滤**<br/>
ClickHouse 开始 PREWHERE 处理，① 读取 `town` 列中选定的粒度，并检查哪些实际包含匹配 `London` 的行。

在我们的示例中，所有选定的粒度都匹配，因此 ② 随后选择下一过滤列——`date`——的相应位置对齐粒度进行处理：

<Image img={visual03} size="md" alt="步骤 1：按 town 过滤"/>

<br/><br/>
**步骤 2：按 date 过滤**<br/>
接下来，ClickHouse ① 读取选定的 `date` 列粒度以评估过滤器 `date > '2024-12-31'`。

在这种情况下，三颗粒度中的两个包含匹配的行，因此 ② 仅选择其位置对齐的粒度，来自下一个过滤列——`price`——进行进一步处理：

<Image img={visual04} size="md" alt="步骤 2：按 date 过滤"/>

<br/><br/>
**步骤 3：按 price 过滤**<br/>
最后，ClickHouse ① 读取 `price` 列中的两个选定粒度，以评估最后一个过滤器 `price > 10_000`。

只有两个粒度中的一个包含匹配的行，因此 ② 仅其对应位置对齐的粒度——`street`——需要加载以进行进一步处理：

<Image img={visual05} size="md" alt="步骤 3：按 price 过滤"/>

<br/><br/>
到最后一步时，仅加载包含匹配行的最小列粒度集。这导致了更低的内存占用、更少的磁盘 I/O 和更快的查询执行。

:::note PREWHERE 减少数据读取，而不是处理的行
请注意，ClickHouse 在 PREWHERE 和非 PREWHERE 查询版本中处理的行数相同。然而，应用了 PREWHERE 优化后，并不需要为每个处理的行加载所有列值。
:::

## PREWHERE 优化是自动应用的 {#prewhere-optimization-is-automatically-applied}

PREWHERE 子句可以手动添加，如上例所示。然而，您不需要手动编写 PREWHERE。当设置 [`optimize_move_to_prewhere`](/operations/settings/settings#optimize_move_to_prewhere) 被启用时（默认值为 true），ClickHouse 会自动将过滤条件从 WHERE 移动到 PREWHERE，优先处理那些将减少读取量最多的条件。

这个想法是较小的列扫描速度更快，当处理较大的列时，大多数粒度已经被过滤掉。由于所有列具有相同数量的行，因此列的大小主要由其数据类型决定，例如，`UInt8` 列通常比 `String` 列小得多。

ClickHouse 默认采用此策略，自版本 [23.2](https://clickhouse.com/blog/clickhouse-release-23-02#multi-stage-prewhere--alexander-gololobov) 以来，按未压缩的大小以升序排序 PREWHERE 过滤列，以进行多步骤处理。

从版本 [23.11](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere) 开始，可选的列统计可以通过基于实际数据选择性选择过滤处理顺序，从而进一步改善这一点，而不仅仅依赖列大小。


## 如何衡量 PREWHERE 的影响 {#how-to-measure-prewhere-impact}

为验证 PREWHERE 是否有助于您的查询，您可以比较启用和禁用 `optimize_move_to_prewhere` 设置时的查询性能。

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

在处理 231 万行的查询过程中，ClickHouse 读取了 **23.36 MB** 的列数据。

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

处理的行数相同（231 万），但是 благодаря 的 PREWHERE，ClickHouse 读取的列数据少于三倍——仅 6.74 MB，而不是 23.36 MB——从而将总运行时间缩短了三倍。

要深入了解 ClickHouse 如何在后台应用 PREWHERE，请使用 EXPLAIN 和跟踪日志。

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

我们在此省略了大部分计划输出，因为它相当冗长。实质上，它显示所有三个列谓词都已自动移动到 PREWHERE。

当您自己重复此操作时，您会在查询计划中看到这些谓词的顺序是基于列的数据类型大小。由于我们没有启用列统计，ClickHouse 使用大小作为决定 PREWHERE 处理顺序的后备方案。

如果您想更深入地了解内部机制，可以指示 ClickHouse 返回查询执行期间的所有测试级日志条目，以观察每个单独的 PREWHERE 处理步骤：
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

* PREWHERE 避免读取将被后续过滤的数据列，节省了 I/O 和内存。
* 当启用 `optimize_move_to_prewhere` 时，它会自动工作（默认）。
* 过滤顺序很重要：小而选择性强的列应该排在前面。
* 使用 `EXPLAIN` 和日志来验证 PREWHERE 是否被应用并理解其效果。
* PREWHERE 对于宽表和带有选择性过滤的大的扫描最为有效。
