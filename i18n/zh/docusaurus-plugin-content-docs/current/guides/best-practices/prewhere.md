---
'slug': '/optimize/prewhere'
'sidebar_label': 'PREWHERE 优化'
'sidebar_position': 21
'description': 'PREWHERE 通过避免读取不必要的列数据来减少 I/O.'
'title': 'PREWHERE 优化是如何工作的？'
'doc_type': 'guide'
---

import visual01 from '@site/static/images/guides/best-practices/prewhere_01.gif';
import visual02 from '@site/static/images/guides/best-practices/prewhere_02.gif';
import visual03 from '@site/static/images/guides/best-practices/prewhere_03.gif';
import visual04 from '@site/static/images/guides/best-practices/prewhere_04.gif';
import visual05 from '@site/static/images/guides/best-practices/prewhere_05.gif';
import Image from '@theme/IdealImage';


# PREWHERE优化是如何工作的？

[PREWHERE子句](/sql-reference/statements/select/prewhere) 是ClickHouse中的一种查询执行优化。它通过避免不必要的数据读取，减少I/O并提高查询速度，在从磁盘读取非过滤列之前过滤掉无关数据。

本指南解释了PREWHERE的工作原理，如何测量其影响，以及如何调整以获得最佳性能。

## 没有PREWHERE优化的查询处理 {#query-processing-without-prewhere-optimization}

我们将通过示例说明如何在不使用PREWHERE的情况下处理对[uk_price_paid_simple](/parts) 表的查询：

<Image img={visual01} size="md" alt="Query processing without PREWHERE optimization"/>

<br/><br/>
① 查询包含对`town`列的过滤，该列是表的主键的一部分，因此也是主索引的一部分。

② 为了加速查询，ClickHouse将表的主索引加载到内存中。

③ 它扫描索引条目，以识别`town`列中的哪些粒度可能包含与谓词匹配的行。

④ 这些潜在相关的粒度与任何其他需要用于查询的列的按位置对齐的粒度一起加载到内存中。

⑤ 剩余的过滤器将在查询执行期间应用。

如您所见，没有PREWHERE时，在过滤之前加载了所有潜在相关的列，即使只有少数行实际匹配。

## PREWHERE如何提高查询效率 {#how-prewhere-improves-query-efficiency}

以下动画展示了如何在上述查询上应用PREWHERE子句来处理所有查询谓词。

前三个处理步骤与之前相同：

<Image img={visual02} size="md" alt="Query processing with PREWHERE optimization"/>

<br/><br/>
① 查询包含对`town`列的过滤，该列是表的主键的一部分——因此也是主索引的一部分。

② 类似于未使用PREWHERE子句的情况，为了加速查询，ClickHouse将主索引加载到内存中。

③ 然后扫描索引条目，以识别`town`列中的哪些粒度可能包含与谓词匹配的行。

现在，多亏了PREWHERE子句，下一步有所不同：ClickHouse通过逐列过滤数据，仅加载真正需要的数据，而不是提前读取所有相关列。这大大减少了I/O，尤其是对于宽表。

在每一步中，它仅加载包含至少一行经过—即匹配—之前过滤条件的粒度。结果是，每个过滤条件需要加载和评估的粒度数量单调减少：

**步骤1：按town过滤**<br/>
ClickHouse开始PREWHERE处理，通过①读取`town`列中选定的粒度，并检查哪些实际包含与`London`匹配的行。

在我们的示例中，所有选定的粒度都匹配，因此②为下一个过滤列`date`选择了相应的按位置对齐的粒度：

<Image img={visual03} size="md" alt="Step 1: Filtering by town"/>

<br/><br/>
**步骤2：按date过滤**<br/>
接下来，ClickHouse ①读取选定的`date`列粒度以评估过滤条件`date > '2024-12-31'`。

在这种情况下，三个粒度中有两个包含匹配行，因此②仅选择它们的按位置对齐的粒度作为下一个过滤列`price`的进一步处理：

<Image img={visual04} size="md" alt="Step 2: Filtering by date"/>

<br/><br/>
**步骤3：按price过滤**<br/>
最后，ClickHouse ①读取`price`列中选择的两个粒度以评估最后的过滤条件`price > 10_000`。

只有两个粒度中的一个包含匹配行，因此②仅需要加载其按位置对齐的粒度，即`SELECT`列中的`street`，以进行进一步处理：

<Image img={visual05} size="md" alt="Step 2: Filtering by price"/>

<br/><br/>
到最后一步时，仅加载包含匹配行的最小列粒度集。这导致较低的内存使用，减少磁盘I/O，并加快查询执行速度。

:::note PREWHERE减少数据读取，而不是处理的行数
请注意，在PREWHERE和非PREWHERE版本的查询中，ClickHouse处理的行数是相同的。然而，应用PREWHERE优化后，不需要为每个处理的行加载所有列值。
:::

## PREWHERE优化是自动应用的 {#prewhere-optimization-is-automatically-applied}

可以手动添加PREWHERE子句，如上述示例所示。然而，您不需要手动编写PREWHERE。当设置[`optimize_move_to_prewhere`](/operations/settings/settings#optimize_move_to_prewhere)启用时（默认值为true），ClickHouse会自动将过滤条件从WHERE移到PREWHERE，优先处理那些将最大程度减少读取量的条件。

其思想是，较小的列扫描速度更快，并且在处理较大的列时，大多数粒度通常已经被过滤掉。由于所有列的行数相同，列的大小主要由其数据类型决定，例如，`UInt8`列通常远小于`String`列。

自版本[23.2](https://clickhouse.com/blog/clickhouse-release-23-02#multi-stage-prewhere--alexander-gololobov)以来，ClickHouse默认遵循此策略，为多步骤处理按未压缩大小升序排序PREWHERE过滤列。

自版本[23.11](https://clickhouse.com/blog/clickhouse-release-23-11#column-statistics-for-prewhere)起，可选的列统计信息可以进一步改善这一点，通过根据实际数据选择性选择过滤处理顺序，而不仅仅是列大小。

## 如何测量PREWHERE的影响 {#how-to-measure-prewhere-impact}

要验证PREWHERE对您的查询是否有帮助，您可以比较启用和未启用`optimize_move_to_prewhere设置`的查询性能。

我们从禁用`optimize_move_to_prewhere`设置开始运行查询：

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

ClickHouse在处理2.31百万行时读取了**23.36 MB**的列数据。

接下来，我们运行启用`optimize_move_to_prewhere`设置的查询。（请注意，虽然这个设置是可选的，但默认情况下是启用的）：
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

处理的行数相同（2.31百万），但由于PREWHERE，ClickHouse读取的列数据减少了超过三倍——仅6.74 MB，而不是23.36 MB——这将总运行时间缩短了3倍。

为了深入了解ClickHouse如何在后台应用PREWHERE，您可以使用EXPLAIN和跟踪日志。

我们使用[EXPLAIN](/sql-reference/statements/explain#explain-plan)子句检查查询的逻辑计划：
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

我们在此省略大部分计划输出，因为它相当冗长。本质上，它显示所有三个列谓词已被自动移动到PREWHERE。

在您自己复制此过程时，您还会在查询计划中看到这些谓词的顺序是基于列的数据类型大小。由于我们未启用列统计，ClickHouse使用大小作为确定PREWHERE处理顺序的后备。

如果您想更深入了解，您可以通过指示ClickHouse在查询执行期间返回所有测试级日志条目来观察每个单独的PREWHERE处理步骤：
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

* PREWHERE避免读取后续将被过滤掉的列数据，从而节省I/O和内存。
* 当`optimize_move_to_prewhere`启用时（默认），它会自动工作。
* 过滤顺序很重要：小且选择性强的列应优先。
* 使用`EXPLAIN`和日志验证PREWHERE是否应用，并理解其影响。
* PREWHERE对宽表和大扫描与选择性过滤条件的影响最大。
