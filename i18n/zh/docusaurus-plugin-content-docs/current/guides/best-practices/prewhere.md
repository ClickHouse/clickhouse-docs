import visual01 from '@site/static/images/guides/best-practices/prewhere_01.gif';
import visual02 from '@site/static/images/guides/best-practices/prewhere_02.gif';
import visual03 from '@site/static/images/guides/best-practices/prewhere_03.gif';
import visual04 from '@site/static/images/guides/best-practices/prewhere_04.gif';
import visual05 from '@site/static/images/guides/best-practices/prewhere_05.gif';
import Image from '@theme/IdealImage';

# PREWHERE 优化是如何工作的？

[PREWHERE 子句](/sql-reference/statements/select/prewhere) 是 ClickHouse 中的一种查询执行优化。它通过避免不必要的数据读取，并在从磁盘读取非过滤列之前过滤掉无关数据，从而减少 I/O 并提高查询速度。

本指南解释了 PREWHERE 的工作原理、如何衡量其影响以及如何优化以获得最佳性能。


## 没有 PREWHERE 优化的查询处理 {#query-processing-without-prewhere-optimization}

我们将通过示例说明如何在不使用 PREWHERE 的情况下处理对 [uk_price_paid_simple](/parts) 表的查询：

<Image img={visual01} size="md" alt="没有 PREWHERE 优化的查询处理"/>

<br/><br/>
① 查询包含对 `town` 列的过滤，该列是表的主键的一部分，因此也是主索引的一部分。

② 为加速查询，ClickHouse 将表的主索引加载到内存中。

③ 它扫描索引条目以识别来自 `town` 列的哪些 granules 可能包含匹配谓词的行。

④ 这些潜在相关的 granules 被加载到内存中，同时也将所需的其他列的相应 granules 一并加载。

⑤ 在查询执行期间，然后应用其余的过滤器。

如您所见，在没有 PREWHERE 的情况下，所有潜在相关的列在过滤之前都会被加载，即使只有少数行实际匹配。


## PREWHERE 如何提高查询效率 {#how-prewhere-improves-query-efficiency}

以下动画展示了如何将 PREWHERE 子句应用于上述查询谓词来处理查询。

前三个处理步骤与之前相同：

<Image img={visual02} size="md" alt="有 PREWHERE 优化的查询处理"/>

<br/><br/>
① 查询包含对 `town` 列的过滤，该列是表的主键的一部分，因此也是主索引的一部分。

② 与没有 PREWHERE 子句的运行类似，为加速查询，ClickHouse 将主索引加载到内存中。

③ 然后扫描索引条目以识别来自 `town` 列的哪些 granules 可能包含匹配谓词的行。

现在，由于 PREWHERE 子句的存在，下一步有所不同：ClickHouse 按列过滤数据，只加载真正需要的内容，而不是提前读取所有相关列。这大大减少了 I/O，特别是对于宽表。

在每个步骤中，它仅加载包含至少一行存活（即匹配）之前过滤条件的 granules。结果，加载和评估每个过滤器的 granules 数量单调减少：

**步骤 1：按城镇过滤**<br/>
ClickHouse 首先通过 ① 读取 `town` 列中所选的 granules，并检查其中哪些确实包含匹配 `London` 的行。

在我们的示例中，所有选定的 granules 均匹配，因此 ② 选择对应的下一过滤列 `date` 的位置对齐的 granules 进行处理：

<Image img={visual03} size="md" alt="步骤 1：按城镇过滤"/>

<br/><br/>
**步骤 2：按日期过滤**<br/>
接下来，ClickHouse ① 读取所选的 `date` 列 granules，以评估过滤条件 `date > '2024-12-31'`。

在这种情况下，三条 granules 中有两条包含匹配行，因此 ② 仅选择其对应的下一过滤列 `price` 的位置对齐 granules 进行进一步处理：

<Image img={visual04} size="md" alt="步骤 2：按日期过滤"/>

<br/><br/>
**步骤 3：按价格过滤**<br/>
最后，ClickHouse ① 读取 `price` 列中两个选定的 granules，以评估最后的过滤条件 `price > 10_000`。

只有两个 granules 中的一个包含匹配行，因此 ② 仅加载其位置对齐的 `SELECT` 列的 granule —— `street` —— 进行进一步处理：

<Image img={visual05} size="md" alt="步骤 2：按价格过滤"/>

<br/><br/>
在最终步骤中，仅加载包含匹配行的最小列 granules 集合。这导致更低的内存使用、更少的磁盘 I/O 和更快速的查询执行。

:::note PREWHERE 减少读取数据，而不是处理行
请注意，ClickHouse 在 PREWHERE 和非 PREWHERE 版本的查询中处理的行数是相同的。然而，应用了 PREWHERE 优化后，并不是所有列值都需要为每个处理的行加载。
:::

## PREWHERE 优化是自动应用的 {#prewhere-optimization-is-automatically-applied}

可以手动添加 PREWHERE 子句，如上例所示。然而，您不需要手动编写 PREWHERE。当设置 [`optimize_move_to_prewhere`](/operations/settings/settings#optimize_move_to_prewhere) 被启用时（默认为 true），ClickHouse 会自动将 WHERE 中的过滤条件移到 PREWHERE，优先考虑那些能最大程度减少读取量的条件。

这个想法是，小的列扫描更快，而在处理较大的列时，大多数 granules 已经被过滤掉。由于所有列的行数相同，列的大小主要由其数据类型决定，例如，`UInt8` 列通常比 `String` 列小得多。

ClickHouse 从版本 [23.2](https://clickhouse.com/blog/clickhouse-release-23-02#multi-stage-prewhere--alexander-gololobov) 开始默认遵循此策略，按未压缩大小的升序对 PREWHERE 过滤列进行排序，以进行多步处理。

从版本 [23.11](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere) 开始，可选的列统计信息可以进一步通过根据实际数据选择性选择过滤处理顺序来改进此策略，而不仅仅依据列大小。


## 如何衡量 PREWHERE 的影响 {#how-to-measure-prewhere-impact}

要验证 PREWHERE 是否对您的查询有帮助，您可以比较启用和禁用 `optimize_move_to_prewhere` 设置的查询性能。

我们首先运行查询，禁用 `optimize_move_to_prewhere` 设置：

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

在处理 231 万行的查询时，ClickHouse 读取了 **23.36 MB** 的列数据。

接下来，我们运行启用 `optimize_move_to_prewhere` 设置的查询。（请注意，此设置是可选的，因为默认情况下该设置是启用的）：
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

处理的行数相同（231 万），但由于 PREWHERE，ClickHouse 读取的列数据减少了三倍——仅为 6.74 MB，而不是 23.36 MB——这将总运行时间缩短了三倍。

要深入了解 ClickHouse 背后如何应用 PREWHERE，可以使用 EXPLAIN 和跟踪日志。

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

我们在这里省略了大部分计划输出，因为它相当冗长。本质上，它显示所有三个列谓词都被自动移动到 PREWHERE。

当你自己重复这个过程时，你还会在查询计划中看到这些谓词的顺序是基于列的数据类型大小。由于我们没有启用列统计信息，ClickHouse 使用大小作为确定 PREWHERE 处理顺序的后备。

如果您想更深入了解，您可以通过指示 ClickHouse 在查询执行期间返回所有测试级别日志条目来观察每个单独的 PREWHERE 处理步骤：
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

* PREWHERE 避免读取将在之后被过滤的数据，节省 I/O 和内存。
* 当 `optimize_move_to_prewhere` 启用时（默认设置），它会自动工作。
* 过滤顺序很重要：小而选择性强的列应优先放置。
* 使用 `EXPLAIN` 和日志验证 PREWHERE 是否被应用并理解其影响。
* 在宽表和具有选择性过滤的较大扫描中，PREWHERE 的影响最为显著。
