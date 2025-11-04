---
'description': '继承自 MergeTree，但在合并过程中添加了压缩行的逻辑。'
'keywords':
- 'updates'
- 'collapsing'
'sidebar_label': 'CollapsingMergeTree'
'sidebar_position': 70
'slug': '/engines/table-engines/mergetree-family/collapsingmergetree'
'title': 'CollapsingMergeTree'
'doc_type': 'guide'
---


# CollapsingMergeTree

## 描述 {#description}

`CollapsingMergeTree` 引擎继承自 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)，并在合并过程中添加了行折叠的逻辑。 `CollapsingMergeTree` 表引擎异步删除（折叠）成对的行，如果排序键（`ORDER BY`）中的所有字段除特殊字段 `Sign` 外都是相同的，`Sign` 可以有 `1` 或 `-1` 的值。 没有成对的相反值 `Sign` 的行将被保留。

有关更多详细信息，请参见文档的 [Collapsing](#table_engine-collapsingmergetree-collapsing) 部分。

:::note
此引擎可能会显著减少存储量，从而提高 `SELECT` 查询的效率。
:::

## 参数 {#parameters}

此表引擎的所有参数，除了 `Sign` 参数，与你在 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 中看到的含义相同。

- `Sign` — 指定一列的名称，该列的行类型，其中 `1` 是 "状态" 行，`-1` 是 "取消" 行。 类型：[Int8](/sql-reference/data-types/int-uint)。

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

<summary>创建表的废弃方法</summary>

:::note
下面的方法不建议在新项目中使用。 如果可能，我们建议将旧项目更新为使用新方法。
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

`Sign` — 指定一列的名称，该列的行类型，其中 `1` 是 "状态" 行，`-1` 是 "取消" 行。[Int8](/sql-reference/data-types/int-uint)。

</details>

- 有关查询参数的描述，请参见 [查询描述](../../../sql-reference/statements/create/table.md)。
- 创建 `CollapsingMergeTree` 表时，所需的 [查询子句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table) 与创建 `MergeTree` 表的相同。

## 折叠 {#table_engine-collapsingmergetree-collapsing}

### 数据 {#data}

考虑一种情况，你需要保存某个给定对象的持续变化数据。 将每个对象设置为一行并在任何变化时更新它似乎是合乎逻辑的，然而，更新操作对于 DBMS 而言是昂贵且缓慢的，因为它们需要在存储中重写数据。 如果我们需要快速写入数据，执行大量更新操作并不是一个可接受的方法，但我们始终可以顺序写入一个对象的更改。 为此，我们利用特殊列 `Sign`。

- 如果 `Sign` = `1`，则表示该行是 "状态" 行：_包含表示当前有效状态的字段的行_。 
- 如果 `Sign` = `-1`，则表示该行是 "取消" 行：_用于取消具有相同属性的对象状态的行_。

例如，我们想计算用户在某个网站上查看了多少页面，以及他们访问这些页面的时间。在某个特定时刻，我们记录用户活动的状态如下：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

在稍后的时刻，我们记录第一次用户活动的变化并用以下两行写入：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

第一行取消了对象的先前状态（在这个例子中表示一个用户）。 它应该复制除 `Sign` 外的所有排序键字段。 上面的第二行包含当前状态。

由于我们只需要用户活动的最后状态，因此我们可以按如下方式删除原始的 "状态" 行和我们插入的 "取消" 行，从而折叠对象的无效（旧）状态：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- old "state" row can be deleted
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "cancel" row can be deleted
│ 4324182021466249494 │         6 │      185 │    1 │ -- new "state" row remains
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` 正是实现这种 _折叠_ 行为，在数据部分合并的过程中发生。

:::note
有关为什么每次变化都需要两行的原因，详见 [算法](#table_engine-collapsingmergetree-collapsing-algorithm) 部分。
:::

**这种方法的特殊性**

1. 编写数据的程序应记住对象的状态，以便能够取消它。 "取消" 行应包含 "状态" 行的排序键字段的副本和相反的 `Sign`。 这增加了存储的初始大小，但允许我们快速写入数据。
2. 列中较长的递增数组会因写入负载增加而降低引擎效率。 数据越简单，效率越高。
3. `SELECT` 结果很大程度上依赖于对象变更历史的一致性。 准备插入数据时要准确。 数据不一致可能会导致不可预测的结果。 例如，非负指标（如会话深度）的负值。

### 算法 {#table_engine-collapsingmergetree-collapsing-algorithm}

当 ClickHouse 合并 [部分](/concepts/glossary#parts) 时，每组具有相同排序键（`ORDER BY`）的连续行最多减少为两行，即 "状态" 行与 `Sign` = `1` 和 "取消" 行与 `Sign` = `-1`。 换句话说，在 ClickHouse 条目中会进行折叠。

对于每个生成的数据部分，ClickHouse 保存：

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 如果 "状态" 行与 "取消" 行的数量相匹配，并且最后一行是 "状态" 行，则保存首个 "取消" 行和最后一个 "状态" 行。 |
|2.| 如果 "状态" 行的数量大于 "取消" 行，则保存最后一个 "状态" 行。                                                            |
|3.| 如果 "取消" 行的数量大于 "状态" 行，则保存首个 "取消" 行。                                                          |
|4.| 在所有其他情况下，不保存行。                                                                                               |

此外，当 "状态" 行数量至少比 "取消" 行数量多两个，或 "取消" 行数量至少比 "状态" 行数量多两个时，合并将继续。 但是，ClickHouse 将把此情况视为逻辑错误并记录在服务器日志中。 该错误可能会发生在相同数据多次插入的情况下。 因此，折叠不应改变计算统计结果。 更改会逐渐紧缩，最终只保留几乎每个对象的最后状态。

`Sign` 列是必需的，因为合并算法并不能保证所有具有相同排序键的行会在同一结果数据部分中，甚至在同一物理服务器上。 ClickHouse 使用多个线程处理 `SELECT` 查询，无法预测结果中行的顺序。

如果需要从 `CollapsingMergeTree` 表中获取完全 "折叠" 的数据，则需要聚合。 为了完成折叠，请使用 `GROUP BY` 子句和适当考虑符号的聚合函数来编写查询。 例如，计算数量时，使用 `sum(Sign)` 而不是 `count()`。 要计算某个值的总和，使用 `sum(Sign * x)` 并结合 `HAVING sum(Sign) > 0`，而不是 `sum(x)`，如 [示例](#example-of-use) 中所示。

聚合 `count`、`sum` 和 `avg` 可以这样计算。 如果一个对象有至少一个未折叠的状态，则可以计算聚合 `uniq`。 聚合 `min` 和 `max` 不能计算，因为 `CollapsingMergeTree` 不保存折叠状态的历史。

:::note
如果你需要提取没有聚合的数据（例如，检查是否存在行其最新值符合某些条件），可以使用 `FROM` 子句的 [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修饰符。 它会在返回结果之前合并数据。 对于 CollapsingMergeTree，将仅返回每个键的最新状态行。
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

我们使用 `CollapsingMergeTree` 创建表 `UAct`：

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

我们使用两个 `INSERT` 查询来创建两个不同的数据部分。

:::note
如果我们用一个查询插入数据，ClickHouse 只会创建一个数据部分，并且不会执行任何合并。
:::

我们可以使用以下语句选择数据：

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

让我们查看上面返回的数据，看看是否发生了折叠... 
通过两个 `INSERT` 查询，我们创建了两个数据部分。 
`SELECT` 查询在两个线程中执行，我们得到了随机顺序的行。 
然而，折叠 **并未发生**，因为数据部分尚未合并，而 ClickHouse 在一个未知的时刻在后台合并数据部分，我们无法预测。

因此，我们需要一个聚合，我们使用 [`sum`](/sql-reference/aggregate-functions/reference/sum) 聚合函数和 [`HAVING`](/sql-reference/statements/select/having) 子句来执行：

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

如果我们不需要聚合并希望强制进行折叠，我们也可以对 `FROM` 子句使用 `FINAL` 修饰符。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
:::note
这种选择数据的方式效率较低，并且不建议在大量扫描数据（数百万行）时使用。
:::

### 另一种方法的示例 {#example-of-another-approach}

该方法的基本思想是合并仅考虑键字段。 因此，在 "取消" 行中，我们可以指定负值，以在求和时抵消行的先前版本，而不使用 `Sign` 列。

对于此示例，我们将使用以下示例数据：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

对于这种方法，有必要将 `PageViews` 和 `Duration` 的数据类型更改为存储负值。 因此，我们在使用 `collapsingMergeTree` 创建 `UAct` 表时，将这些列的值从 `UInt8` 更改为 `Int16`：

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

对于示例或小表，使用此方法是可以接受的：

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
