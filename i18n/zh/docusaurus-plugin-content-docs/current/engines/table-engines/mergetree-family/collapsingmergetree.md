---
'description': '继承自MergeTree，但在合并过程中添加了折叠行的逻辑。'
'keywords':
- 'updates'
- 'collapsing'
'sidebar_label': '合并树折叠'
'sidebar_position': 70
'slug': '/engines/table-engines/mergetree-family/collapsingmergetree'
'title': 'CollapsingMergeTree'
---




# CollapsingMergeTree

## Description {#description}

`CollapsingMergeTree` 引擎继承自 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)，并在合并过程中添加了行合并的逻辑。
`CollapsingMergeTree` 表引擎异步删除（合并）成对的行，前提是排序键（`ORDER BY`）中的所有字段相等，除了特殊字段 `Sign`，该字段可以取值 `1` 或 `-1`。没有成对相反值 `Sign` 的行会被保留。

有关更多详细信息，请参见文档的 [Collapsing](#table_engine-collapsingmergetree-collapsing) 部分。

:::note
该引擎可能显著减少存储量，从而提高 `SELECT` 查询的效率。
:::

## Parameters {#parameters}

该表引擎的所有参数（除了 `Sign` 参数）与 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 中的含义相同。

- `Sign` — 赋予某列的名称，该列的值表示行的类型，其中 `1` 是 "状态" 行，`-1` 是 "取消" 行。类型：[Int8](/sql-reference/data-types/int-uint)。

## Creating a Table {#creating-a-table}

```sql
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

<summary>创建表的弃用方法</summary>

:::note
以下方法不建议在新项目中使用。
如果可能，我们建议将旧项目更新为使用新方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) 
ENGINE [=] CollapsingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, Sign)
```

`Sign` — 赋予某列的名称，该列的值表示行的类型，其中 `1` 是 "状态" 行，`-1` 是 "取消" 行。[Int8](/sql-reference/data-types/int-uint)。

</details>

- 有关查询参数的描述，请参见 [查询描述](../../../sql-reference/statements/create/table.md)。
- 创建 `CollapsingMergeTree` 表时，需要的 [查询子句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) 与创建 `MergeTree` 表时相同。

## Collapsing {#table_engine-collapsingmergetree-collapsing}

### Data {#data}

考虑您需要为某个给定对象保存不断变化的数据的情况。
为每个对象有一行并在任何更改时更新听起来很合理，
然而，对于 DBMS 而言，更新操作成本高且缓慢，因为这些操作需要重写存储中的数据。
如果我们需要快速写入数据，进行大量更新并不是可以接受的方法，
但我们可以随时顺序写入对象的更改。
为此，我们利用特殊的列 `Sign`。

- 如果 `Sign` = `1`，则意味着该行是 "状态" 行：_包含表示当前有效状态的字段的行_。
- 如果 `Sign` = `-1`，则意味着该行是 "取消" 行：_用于取消具有相同属性的对象状态的行_。

例如，我们想计算用户在某个网站上查看了多少页面以及他们访问这些页面的时间。
在某一时刻，我们记录下用户活动的状态如下：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

在稍后的时刻，我们记录用户活动的变化并写入以下两行：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

第一行取消了对象（在此情况中为用户）的先前状态。 
它应复制除 `Sign` 外的所有排序键字段。 
上述第二行包含当前状态。

由于我们只需要用户活动的最后状态，因此可以删除我们插入的原始 "状态" 行和 "取消" 行，如下所示，合并无效（旧）对象状态：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- old "state" row can be deleted
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "cancel" row can be deleted
│ 4324182021466249494 │         6 │      185 │    1 │ -- new "state" row remains
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` 正是以这种方式在合并数据片段时执行 _合并_ 行为。

:::note
为什么每次更改需要两行的原因将在 [算法](#table_engine-collapsingmergetree-collapsing-algorithm) 这一段中进一步讨论。
:::

**这种方法的特点**

1. 写入数据的程序应记住对象的状态，以便能够取消。 "取消" 行应包含 "状态" 行的排序键字段的副本以及相反的 `Sign`。这增加了初始存储的大小，但使我们可以快速写入数据。
2. 列中长的增长数组由于写入负担的增加而降低了引擎的效率。数据越简单，效率越高。
3. `SELECT` 的结果在很大程度上依赖于对象更改历史的一致性。准备插入数据时要准确。对于不一致的数据，您可能会获得不可预测的结果。例如，对于非负指标（如会话深度）出现负值。

### Algorithm {#table_engine-collapsingmergetree-collapsing-algorithm}

当 ClickHouse 合并数据 [部分](/concepts/glossary#parts) 时， 
每组具有相同排序键（`ORDER BY`）的连续行将减少为不超过两行， 
即 `Sign` = `1` 的 "状态" 行和 `Sign` = `-1` 的 "取消" 行。 
换句话说，ClickHouse 条目将合并。

对于每个结果数据部分，ClickHouse 保存：

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 第一行 “取消” 和最后一行 “状态”，如果 “状态” 行和 “取消” 行的数量匹配且最后一行是 “状态” 行。 |
|2.| 最后一行 “状态”，如果 “状态” 行数量多于 “取消” 行数量。                                                            |
|3.| 第一行 “取消”，如果 “取消” 行数量多于 “状态” 行数量。                                                          |
|4.| 在所有其他情况下，没有任何行。                                                                                               |

此外，当 "状态" 行的数量至少比 "取消" 行多两个，或者 "取消" 行至少比 "状态" 行多两个时，合并将继续。
然而，ClickHouse 将这种情况视为逻辑错误并记录在服务器日志中。 
如果插入了相同的数据多次，则可能会发生此错误。 
因此，合并不应更改统计计算的结果。
更改逐步被合并，以便最终几乎只留下每个对象的最后状态。

`Sign` 列是必需的，因为合并算法不保证 
所有具有相同排序键的行都将在同一结果数据部分中，甚至在同一物理服务器上。 
ClickHouse 通过多个线程处理 `SELECT` 查询，且无法预测结果中行的顺序。

如果需要从 `CollapsingMergeTree` 表中获取完全 "合并" 的数据，就需要聚合。
为了最终完成合并，写一个带有 `GROUP BY` 子句和考虑 `Sign` 的聚合函数的查询。 
例如，要计算数量，使用 `sum(Sign)` 而不是 `count()`。 
要计算某物的总和，使用 `sum(Sign * x)` 并结合 `HAVING sum(Sign) > 0` 而不是 `sum(x)`，如下面的 [示例](#example-of-use) 所示。

聚合 `count`、`sum` 和 `avg` 可以这样计算。 
如果对象至少有一个未合并的状态，则可以计算聚合 `uniq`。 
而由于 `CollapsingMergeTree` 不保存合并状态的历史，因此无法计算聚合 `min` 和 `max`。

:::note
如果您需要在不聚合的情况下提取数据 
（例如，检查是否存在最新值匹配某些条件的行）， 
可以对 `FROM` 子句使用 [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修饰符。它将在返回结果之前合并数据。
对于 `CollapsingMergeTree`，每个键仅返回最新的状态行。
:::

## Examples {#examples}

### Example of Use {#example-of-use}

给定以下示例数据：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

让我们使用 `CollapsingMergeTree` 创建一个表 `UAct`：

```sql
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

接下来，我们将插入一些数据：

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

我们使用两个 `INSERT` 查询创建两个不同的数据部分。

:::note
如果我们通过单个查询插入数据，ClickHouse 只会创建一个数据部分，并且将永远不会执行任何合并。
:::

我们可以使用以下方式选择数据：

```sql
SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

让我们查看返回的数据并检查是否发生了合并...
通过两个 `INSERT` 查询，我们创建了两个数据部分。
`SELECT` 查询在两个线程中执行，得到了随机的行顺序。 
但是，合并 **并未发生**，因为数据部分尚未合并， 
且 ClickHouse 在一个未知的时刻在后台合并数据部分，这是我们无法预测的。

因此，我们需要进行聚合，
我们使用 [`sum`](/sql-reference/aggregate-functions/reference/sum) 聚合函数和 [`HAVING`](/sql-reference/statements/select/having) 子句来完成聚合：

```sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration
FROM UAct
GROUP BY UserID
HAVING sum(Sign) > 0
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

如果我们不需要聚合并且希望强制合并，我们还可以对 `FROM` 子句使用 `FINAL` 修饰符。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
:::note
这种选择数据的方式效率较低，不建议在大量扫描数据（千万行）时使用。
:::

### Example of Another Approach {#example-of-another-approach}

这种方法的思想是合并只考虑关键字段。
因此，在 "取消" 行中， 我们可以指定与上一版本行相等的负值，无需使用 `Sign` 列。

对于此示例，我们将利用以下示例数据：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

为了这种方法，必须更改 `PageViews` 和 `Duration` 的数据类型以存储负值。 
因此，当我们使用 `collapsingMergeTree` 创建我们的表 `UAct` 时，我们将这些列的值从 `UInt8` 更改为 `Int16`：

```sql
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

对于示例或小表，这种做法是可以接受的：

```sql
INSERT INTO UAct VALUES(4324182021466249494,  5,  146,  1);
INSERT INTO UAct VALUES(4324182021466249494, -5, -146, -1);
INSERT INTO UAct VALUES(4324182021466249494,  6,  185,  1);

SELECT * FROM UAct FINAL;
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

```sql
SELECT
    UserID,
    sum(PageViews) AS PageViews,
    sum(Duration) AS Duration
FROM UAct
GROUP BY UserID
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┐
│ 4324182021466249494 │         6 │      185 │
└─────────────────────┴───────────┴──────────┘
```

```sql
SELECT COUNT() FROM UAct
```

```text
┌─count()─┐
│       3 │
└─────────┘
```

```sql
OPTIMIZE TABLE UAct FINAL;

SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
