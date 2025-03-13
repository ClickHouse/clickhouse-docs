---
slug: /engines/table-engines/mergetree-family/collapsingmergetree
sidebar_position: 70
sidebar_label: CollapsingMergeTree
keywords: ['updates', 'collapsing']
title: "CollapsingMergeTree"
description: "继承自 MergeTree，但在合并过程中添加了对行进行合并的逻辑。"
---


# CollapsingMergeTree

## Description {#description}

`CollapsingMergeTree` 引擎继承自 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)，并在合并过程中添加了对行进行合并的逻辑。  
`CollapsingMergeTree` 表引擎异步删除（合并）成对的行，如果排序键（`ORDER BY`）中的所有字段相同，则保持 `Sign` 字段的特殊值，可以为 `1` 或 `-1`。没有成对的相反值的 `Sign` 的行将被保留。

有关更多细节，请参阅文档的 [Collapsing](#table_engine-collapsingmergetree-collapsing) 部分。

:::note
该引擎可能显著减少存储体积，从而提高 `SELECT` 查询的效率。
:::

## Parameters {#parameters}

此表引擎的所有参数，除了 `Sign` 参数，意义与 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 中相同。

- `Sign` — 赋予一种行类型的列的名称，其中 `1` 表示 "状态" 行，而 `-1` 表示 "取消" 行。类型：[Int8](/sql-reference/data-types/int-uint)。

## Creating a Table {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) 
ENGINE = CollapsingMergeTree(Sign)
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

<details markdown="1">

<summary>创建表的过时方法</summary>

:::note
以下方法不推荐在新项目中使用。
如果可能，我们建议将旧项目更新为使用新方法。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) 
ENGINE [=] CollapsingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, Sign)
```

`Sign` — 赋予一种行类型的列的名称，其中 `1` 表示 "状态" 行，而 `-1` 表示 "取消" 行。 [Int8](/sql-reference/data-types/int-uint)。

</details>

- 有关查询参数的描述，请参见 [query description](../../../sql-reference/statements/create/table.md)。
- 创建 `CollapsingMergeTree` 表时，与创建 `MergeTree` 表时一样需要相同的 [查询子句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。

## Collapsing {#table_engine-collapsingmergetree-collapsing}

### Data {#data}

考虑需要保存某个给定对象的持续变化数据的情况。  
每个对象拥有一行并在变化时更新听起来应该是合理的，但是，对于 DBMS 而言，更新操作是耗费资源且缓慢的，因为它们需要重写存储中的数据。  
如果我们需要快速写入数据，执行大量更新并不是可接受的方法，但我们总是可以顺序写入对象的变化。  
为此，我们使用特殊列 `Sign`。

- 如果 `Sign` = `1`，则表示该行是 "状态" 行：_一行包含表示当前有效状态的字段_。
- 如果 `Sign` = `-1`，则表示该行是 "取消" 行：_用于取消具有相同属性的对象状态的一行_。

例如，我们要计算用户在某个网站上查看了多少页以及他们访问这些页面的时长。  
在某个特定时间点，我们写入以下行以记录用户活动的状态：

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

在稍后的一段时间内，我们记录用户活动的变化，并写入以下两行：

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

第一行取消了对象的先前状态（在这种情况下表示用户）。  
它应该复制 "已取消" 行的所有排序键字段，除了 `Sign`。  
第二行包含当前状态。

由于我们只需要用户活动的最后状态，因此可以如下所示删除原始的 "状态" 行和 "取消" 行，从而合并无效（旧）的对象状态：

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- 旧的 "状态" 行可以被删除
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "取消" 行可以被删除
│ 4324182021466249494 │         6 │      185 │    1 │ -- 新的 "状态" 行保留
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` 正是通过这一 _合并_ 行为在数据部件合并时执行的。

:::note
为什么每次更改需要两行的原因在 [Algorithm](#table_engine-collapsingmergetree-collapsing-algorithm) 段落中有进一步讨论。
:::

**这种方法的特点**

1. 写入数据的程序应该记住对象的状态，以便能够取消它。 "取消" 行应包含 "状态" 行的排序键字段的副本，以及相反的 `Sign`。这增加了初始存储的大小，但允许我们快速写入数据。
2. 列中长增长的数组由于写入负载增加而降低了引擎的效率。数据越简单，效率越高。
3. `SELECT` 结果强烈依赖于对象更改历史的一致性。在准备插入数据时要小心。不一致的数据可能会导致不可预测的结果。例如，非负度量的负值，如会话深度。

### Algorithm {#table_engine-collapsingmergetree-collapsing-algorithm}

当 ClickHouse 合并数据 [parts](/concepts/glossary#parts) 时，  
具有相同排序键（`ORDER BY`）的每组连续行减少为最多两行，  
即 `Sign` = `1` 的 "状态" 行和 `Sign` = `-1` 的 "取消" 行。  
换句话说，ClickHouse 的条目被合并。

对于每个结果数据部分，ClickHouse 保存：

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 第一个 "取消" 行和最后一个 "状态" 行，如果 "状态" 行和 "取消" 行的数量匹配且最后一行是 "状态" 行。 |
|2.| 最后一个 "状态" 行，如果 "状态" 行的数量多于 "取消" 行的数量。                                                            |
|3.| 第一个 "取消" 行，如果 "取消" 行的数量多于 "状态" 行的数量。                                                          |
|4.| 在所有其他情况下，不保存任何行。                                                                                               |

此外，当 "状态" 行的数量比 "取消" 行多至少两个时，或者 "取消" 行的数量比 "状态" 行多至少两个时，合并继续。  
然而，ClickHouse 将这种情况视为逻辑错误，并将其记录在服务器日志中。  
该错误可能发生在相同数据被多次插入的情况下。  
因此，合并应不改变统计计算的结果。  
更改逐渐被合并，以便最终仅保留几乎每个对象的最后状态。

`Sign` 列是必需的，因为合并算法并不能保证所有相同排序键的行都会在同一结果数据部分中，甚至在同一物理服务器上。  
ClickHouse 以多个线程处理 `SELECT` 查询，无法预测结果中的行顺序。

如果需要从 `CollapsingMergeTree` 表中获取完全 "合并" 的数据，则需要聚合。  
要完成合并，请编写包含 `GROUP BY` 子句和考虑 `Sign` 的聚合函数的查询。  
例如，要计算数量，使用 `sum(Sign)` 而不是 `count()`。  
要计算某个值的总和，使用 `sum(Sign * x)`，并与 `HAVING sum(Sign) > 0` 一起使用，而不是 `sum(x)`，如下面的 [example](#example-of-use)。

可以通过这种方式计算聚合 `count`、`sum` 和 `avg`。  
如果某个对象至少有一个未合并的状态，则可以计算聚合 `uniq`。  
聚合 `min` 和 `max` 则无法计算，因为 `CollapsingMergeTree` 不保存合并状态的历史记录。

:::note
如果需要提取数据而不进行聚合（例如，检查是否存在符合某些条件的最新值的行），  
可以在 `FROM` 子句中使用 [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修饰符。  
这将在返回结果之前合并数据。对于 CollapsingMergeTree，仅返回每个键的最新状态行。
:::

## Examples {#examples}

### Example of Use {#example-of-use}

给定以下示例数据：

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

我们使用 `CollapsingMergeTree` 创建表 `UAct`：

``` sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID
```

接下来我们插入一些数据：

``` sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

``` sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

我们使用两个 `INSERT` 查询创建两个不同的数据部分。

:::note
如果使用单个查询插入数据，ClickHouse 只会创建一个数据部分，并且永远不会执行任何合并。
:::

我们可以使用以下方式选择数据：

``` sql
SELECT * FROM UAct
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

让我们查看上面返回的数据，看看是否发生了合并...  
通过两个 `INSERT` 查询，我们创建了两个数据部分。  
`SELECT` 查询在两个线程中执行，因此我们得到了随机的行顺序。  
然而，合并 **并没有发生**，因为数据部分还没有合并，ClickHouse 在未知的时刻在后台合并数据部分。

因此，我们需要进行聚合，  
这可以通过 [`sum`](/sql-reference/aggregate-functions/reference/sum) 聚合函数和 [`HAVING`](/sql-reference/statements/select/having) 子句来完成：

``` sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration
FROM UAct
GROUP BY UserID
HAVING sum(Sign) > 0
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

如果我们不需要聚合并且希望强制合并，我们还可以在 `FROM` 子句中使用 `FINAL` 修饰符。

``` sql
SELECT * FROM UAct FINAL
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
:::note
这种方式选择数据会导致效率较低，不建议在扫描大量数据（百万行）时使用。
:::

### Example of Another Approach {#example-of-another-approach}

这种方法的想法是，合并只考虑键字段。  
因此，在 "取消" 行中，我们可以指定负值，从而在汇总时平衡行的先前版本，而无需使用 `Sign` 列。

对于这个例子，我们将使用下面的示例数据：

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

对于这种方法，必须更改 `PageViews` 和 `Duration` 的数据类型以存储负值。  
因此，我们在使用 `collapsingMergeTree` 创建表 `UAct` 时，将这些列的值从 `UInt8` 更改为 `Int16`：

``` sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews Int16,
    Duration Int16,
    Sign Int8
)
ENGINE = CollapsingMergeTree(Sign)
ORDER BY UserID
```

让我们通过向表中插入数据来测试该方法。

对于示例或小表来说，这是可以接受的：

``` sql
INSERT INTO UAct VALUES(4324182021466249494,  5,  146,  1);
INSERT INTO UAct VALUES(4324182021466249494, -5, -146, -1);
INSERT INTO UAct VALUES(4324182021466249494,  6,  185,  1);

SELECT * FROM UAct FINAL;
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

``` sql
SELECT
    UserID,
    sum(PageViews) AS PageViews,
    sum(Duration) AS Duration
FROM UAct
GROUP BY UserID
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

``` sql
SELECT COUNT() FROM UAct
```

``` text
┌─count()─┐
│       3 │
└─────────┘
```

``` sql
OPTIMIZE TABLE UAct FINAL;

SELECT * FROM UAct
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
