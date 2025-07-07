---
'description': '继承自 MergeTree，但在合并过程中添加了崩溃行的逻辑。'
'keywords':
- 'updates'
- 'collapsing'
'sidebar_label': 'CollapsingMergeTree'
'sidebar_position': 70
'slug': '/engines/table-engines/mergetree-family/collapsingmergetree'
'title': 'CollapsingMergeTree'
---


# CollapsingMergeTree

## 描述 {#description}

`CollapsingMergeTree` 引擎继承自 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)，并在合并过程中添加了行合并的逻辑。
`CollapsingMergeTree` 表引擎异步删除（合并）一对行，前提是排序键 (`ORDER BY`) 中的所有字段相等，除了特殊字段 `Sign`，其值可以是 `1` 或 `-1`。
没有相反值 `Sign` 的行会被保留。

有关更多详细信息，请参见文档的 [Collapsing](#table_engine-collapsingmergetree-collapsing) 部分。

:::note
该引擎可以显著减少存储量，从而提高 `SELECT` 查询的效率。
:::

## 参数 {#parameters}

该表引擎的所有参数，除了 `Sign` 参数外，具有与 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 相同的含义。

- `Sign` — 代表行类型的列的名称，其中 `1` 是 "状态" 行, `-1` 是 "取消" 行。类型：[Int8](/sql-reference/data-types/int-uint)。

## 创建表 {#creating-a-table}

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
下面的方法不建议在新项目中使用。
我们建议，如果可能，更新旧项目以使用新方法。
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

`Sign` — 代表行类型的列的名称，其中 `1` 是 "状态" 行, `-1` 是 "取消" 行。[Int8](/sql-reference/data-types/int-uint)。

</details>

- 有关查询参数的描述，请参见 [查询描述](../../../sql-reference/statements/create/table.md)。
- 创建 `CollapsingMergeTree` 表时，所需的 [查询子句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) 与创建 `MergeTree` 表时所需的相同。

## 合并 {#table_engine-collapsingmergetree-collapsing}

### 数据 {#data}

考虑需要为某一给定对象保存不断变化的数据的情况。
每个对象有一行并在每次变化时更新听起来很合理，然而，更新操作对 DBMS 来说开销大且缓慢，因为它们需要重写存储中的数据。
如果我们需要快速写入数据，执行大量更新的方法是不可接受的，但我们可以始终顺序写入对象的更改。
为此，我们使用特殊列 `Sign`。

- 如果 `Sign` = `1`，则表示该行是 "状态" 行：_包含表示当前有效状态的字段的行_。
- 如果 `Sign` = `-1`，则表示该行是 "取消" 行：_用于取消具有相同属性的对象状态的行_。

例如，我们想计算用户在某个网站上查看了多少页面以及他们访问页面的持续时间。
在某一时刻，我们写入以下表示用户活动状态的行：

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

第一行取消了对象的先前状态（在这种情况下表示用户）。它应复制 "取消" 行的所有排序键字段，除了 `Sign`。
上面的第二行包含当前状态。

由于我们只需要用户活动的最后状态，因此可以删除我们插入的原始 "状态" 行和 "取消" 行，如下所示，合并对象的无效（旧）状态：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- old "state" row can be deleted
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "cancel" row can be deleted
│ 4324182021466249494 │         6 │      185 │    1 │ -- new "state" row remains
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` 在数据分片合并时执行确切的 _合并_ 行为。

:::note
对此为何每次更改需要两行的原因将在 [算法](#table_engine-collapsingmergetree-collapsing-algorithm) 段落中进一步讨论。
:::

**这种方法的特殊性**

1. 编写数据的程序应该记住对象的状态，以便能取消它。"取消" 行应包含 "状态" 行的排序键字段的副本和相反的 `Sign`。这增加了初始存储大小，但使我们能够快速写入数据。
2. 列中长的增长数组由于写入的负载增加而降低引擎的效率。数据越简单，效率越高。
3. `SELECT` 结果在很大程度上取决于对象变化历史的一致性。准备插入数据时要准确。使用不一致的数据可能会导致不可预测的结果。例如，非负指标如会话深度的负值。

### 算法 {#table_engine-collapsingmergetree-collapsing-algorithm}

当 ClickHouse 合并数据 [片段](/concepts/glossary#parts) 时，具有相同排序键 (`ORDER BY`) 的连续行组最多合并为两行，即 "状态" 行 `Sign` = `1` 和 "取消" 行 `Sign` = `-1`。
换句话说，在 ClickHouse 中条目会合并。

对于每个生成的数据片段，ClickHouse 保存：

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 第一个 "取消" 行和最后一个 "状态" 行，如果 "状态" 行和 "取消" 行的数量相匹配，并且最后一行是 "状态" 行。 |
|2.| 如果 "状态" 行的数量多于 "取消" 行，则最后一个 "状态" 行。                                                            |
|3.| 如果 "取消" 行的数量多于 "状态" 行，则第一个 "取消" 行。                                                          |
|4.| 在所有其他情况下，没有行。                                                                                               |

此外，当 "状态" 行的数量至少比 "取消" 行多两个或 "取消" 行的数量至少比 "状态" 行多两个时，合并将继续。
然而，ClickHouse 将这种情况视为逻辑错误，并记录在服务器日志中。
若同一数据被插入多次，就会出现此错误。因此，合并不应改变统计计算的结果。
更改会逐渐合并，最终几乎每个对象只留下最后状态。

`Sign` 列是必需的，因为合并算法无法保证所有具有相同排序键的行都会位于同一生成的数据片段中，甚至在同一物理服务器上。
ClickHouse 通过多个线程处理 `SELECT` 查询，无法预测结果中的行顺序。

如果需要从 `CollapsingMergeTree` 表获取完全"合并"的数据，则需要聚合。
为了最终完成合并，编写带有 `GROUP BY` 子句和考虑到 Sign 的聚合函数的查询。
例如，要计算数量，使用 `sum(Sign)` 而不是 `count()`。
要计算某物的总和，使用 `sum(Sign * x)` 和 `HAVING sum(Sign) > 0`，而不是 `sum(x)`，如以下 [示例](#example-of-use) 所示。

聚合 `count`、`sum` 和 `avg` 可以这样计算。
如果一个对象至少有一个未合并的状态，则可以计算聚合 `uniq`。
聚合 `min` 和 `max` 不能计算，因为 `CollapsingMergeTree` 不保存合并状态的历史。

:::note
如果您需要无聚合地提取数据（例如，检查最新值是否符合特定条件的行是否存在），您可以使用 `FROM` 子句的 [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修饰符。它会在返回结果之前合并数据。
对于 `CollapsingMergeTree`，仅返回每个键的最新状态行。
:::

## 示例 {#examples}

### 使用示例 {#example-of-use}

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

接下来我们将插入一些数据：

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

我们使用两个 `INSERT` 查询创建两个不同的数据片段。

:::note
如果我们通过单个查询插入数据，ClickHouse 只会创建一个数据片段，并且将不会执行任何合并。
:::

我们可以使用以下内容选择数据：

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

让我们查看上面返回的数据，看看合并是否发生...
通过两个 `INSERT` 查询，我们创建了两个数据片段。
该 `SELECT` 查询在两个线程中执行，并且我们得到了随机的行顺序。
然而，合并 **没有发生**，因为数据片段尚未合并，而 ClickHouse 在我们无法预测的时刻在后台合并数据片段。

因此，我们需要进行一次聚合
我们通过 [`sum`](/sql-reference/aggregate-functions/reference/sum) 聚合函数和 [`HAVING`](/sql-reference/statements/select/having) 子句来执行：

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

如果我们不需要聚合并希望强制合并，也可以对 `FROM` 子句使用 `FINAL` 修饰符。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
:::note
这种选择数据的方式效率较低，不建议在扫描大量数据（数百万行）时使用。
:::

### 另一种方法的示例 {#example-of-another-approach}

该方法的想法是，合并仅考虑关键字段。
因此，在 "取消" 行中，我们可以指定负值，在求和时等同于先前版本的行，而无需使用 `Sign` 列。

对于此示例，我们将使用以下样本数据：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

为此方法，必须更改 `PageViews` 和 `Duration` 的数据类型以存储负值。
因此，在使用 `collapsingMergeTree` 创建我们的表 `UAct` 时，我们将这些列的值从 `UInt8` 更改为 `Int16`：

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

让我们通过向我们的表插入数据来测试该方法。

对于示例或小表，然而，是可接受的：

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
