---
description: '继承自 MergeTree，但添加了在合并过程中折叠行的逻辑。'
keywords: ['更新', '折叠']
sidebar_label: 'CollapsingMergeTree'
sidebar_position: 70
slug: /engines/table-engines/mergetree-family/collapsingmergetree
title: 'CollapsingMergeTree 表引擎'
doc_type: 'guide'
---

# CollapsingMergeTree 表引擎 {#collapsingmergetree-table-engine}

## 描述 {#description}

`CollapsingMergeTree` 引擎继承自 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)，
并在合并过程中增加了对行进行折叠的逻辑。
`CollapsingMergeTree` 表引擎会异步删除（折叠）
成对的行，如果排序键（`ORDER BY`）中的所有字段都相同，且仅特殊字段 `Sign` 不同，
并且 `Sign` 字段只能取值 `1` 或 `-1`。
没有与之构成 `Sign` 取值相反配对的行会被保留。

更多详细信息，参见本文档的 [Collapsing](#table_engine-collapsingmergetree-collapsing) 部分。

:::note
此引擎可以显著减少存储空间占用，
从而提高 `SELECT` 查询的效率。
:::

## 参数 {#parameters}

此表引擎的所有参数（`Sign` 参数除外）与 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 中的含义相同。

- `Sign` — 行类型标记列的名称，其中 `1` 表示“状态”行，`-1` 表示“撤销”行。类型：[Int8](/sql-reference/data-types/int-uint)。

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
  <summary>已弃用的建表方法</summary>

  :::note
  以下方法不建议在新项目中使用。
  如果可能，建议将旧项目更新为使用新方法。
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

  `Sign` — 分配给某列的名称，该列用于表示行的类型，其中 `1` 表示“state”行，`-1` 表示“cancel”行。[Int8](/sql-reference/data-types/int-uint)。
</details>

* 有关查询参数的说明，请参阅[查询说明](../../../sql-reference/statements/create/table.md)。
* 创建 `CollapsingMergeTree` 表时，需要与创建 `MergeTree` 表时相同的[查询子句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。

## 折叠 {#table_engine-collapsingmergetree-collapsing}

### 数据 {#data}

考虑这样一种情况：你需要为某个给定对象保存持续变化的数据。
看起来为每个对象只保留一行并在有变化时更新它似乎是合乎逻辑的，
然而，更新操作对数据库管理系统（DBMS）来说代价高且缓慢，因为它们需要在存储中重写数据。
如果我们需要快速写入数据，执行大量更新操作并不是可接受的方法，
但我们始终可以按顺序写入某个对象的变更。
为此，我们使用特殊列 `Sign`。

* 如果 `Sign` = `1`，表示该行是一个“状态（state）”行：*一行包含表示当前有效状态的字段*。
* 如果 `Sign` = `-1`，表示该行是一个“撤销（cancel）”行：*一行用于撤销具有相同属性的对象状态*。

例如，我们希望统计用户在某个网站上查看了多少页面以及访问这些页面的时长。
在某个给定时间点，我们写入如下记录用户活动状态的一行数据：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

随后，当我们检测到用户活动发生变化时，会使用以下两行将其写入表中：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

第一行会取消该对象之前的状态（在本例中表示一个用户）。
对于该“已取消”行，应复制所有排序键字段，`Sign` 字段除外。
上面的第二行表示当前状态。

由于我们只需要用户活动的最终状态，原始的 “state” 行和我们插入的 “cancel”
行可以像下方所示那样删除，从而折叠对象的无效（旧）状态：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- old "state" row can be deleted
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "cancel" row can be deleted
│ 4324182021466249494 │         6 │      185 │    1 │ -- new "state" row remains
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` 在合并数据分片时，会执行这种*折叠*行为。

:::note
关于为什么每次更改需要两行的原因，
将在[算法](#table_engine-collapsingmergetree-collapsing-algorithm)一节中进一步讨论。
:::

**这种方法的特点**

1. 写入数据的程序必须记住对象的状态，才能在需要时将其取消。“cancel” 行应包含与 “state” 行相同的排序键字段副本，以及相反的 `Sign`。这会增加初始存储占用，但可以让我们快速写入数据。
2. 列中不断增长的长数组会因为写入负载增加而降低引擎效率。数据越简单，效率越高。
3. `SELECT` 的结果高度依赖于对象变更历史的一致性。在准备要插入的数据时要谨慎。对于不一致的数据，可能会得到不可预测的结果。例如，本应非负的指标（如会话深度）出现负值。

### 算法 {#table_engine-collapsingmergetree-collapsing-algorithm}

当 ClickHouse 合并数据[分片](/concepts/glossary#parts)时，
每组具有相同排序键（`ORDER BY`）的连续行会被折叠为最多两行，
一行 `Sign` = `1` 的 “state” 行和一行 `Sign` = `-1` 的 “cancel” 行。
换言之，ClickHouse 会对这些记录进行折叠处理。

对于每个生成的数据部分，ClickHouse 会保存：

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 如果 `"state"` 行和 `"cancel"` 行的数量相同，且最后一行为 `"state"` 行，则保存第一条 `"cancel"` 行和最后一条 `"state"` 行。 |
|2.| 如果 `"state"` 行多于 `"cancel"` 行，则保存最后一条 `"state"` 行。                                                            |
|3.| 如果 `"cancel"` 行多于 `"state"` 行，则保存第一条 `"cancel"` 行。                                                          |
|4.| 在所有其他情况下，不保存任何行。                                                                                               |

另外，当 `"state"` 行比 `"cancel"` 行至少多 2 行，或者 `"cancel"` 行比 `"state"` 行至少多 2 行时，合并会继续进行。
不过，ClickHouse 会将这种情况视为逻辑错误，并将其记录到服务器日志中。
如果相同的数据被多次插入，就有可能出现此错误。
因此，折叠不应改变统计结果。
变更会被逐步折叠，最终几乎只保留每个对象的最后状态。

需要 `Sign` 列，是因为合并算法不能保证具有相同排序键的所有行都处于同一个结果数据部分中，甚至不在同一台物理服务器上。
ClickHouse 使用多个线程处理 `SELECT` 查询，因此无法预测结果中行的顺序。

如果需要从 `CollapsingMergeTree` 表中获取完全“折叠”的数据，则需要进行聚合。
要完成折叠，请编写带有 `GROUP BY` 子句的查询，并使用会考虑 `Sign` 值的聚合函数。
例如，要计算数量，应使用 `sum(Sign)` 而不是 `count()`。
要计算某个量的总和，应使用 `sum(Sign * x)` 并配合 `HAVING sum(Sign) > 0`，而不是像下面[示例](#example-of-use)中那样使用 `sum(x)`。

聚合函数 `count`、`sum` 和 `avg` 可以用这种方式计算。
如果对象至少有一个未折叠的状态，则可以计算聚合函数 `uniq`。
聚合函数 `min` 和 `max` 无法计算，
因为 `CollapsingMergeTree` 不保存已折叠状态的历史。

:::note
如果需要在不进行聚合的情况下提取数据
（例如，检查其最新值满足某些条件的行是否存在），
可以在 `FROM` 子句中使用 [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修饰符。它会在返回结果之前合并数据。
对于 CollapsingMergeTree，每个键只返回最新的状态行。
:::

## 示例 {#examples}

### 使用示例 {#example-of-use}

给出以下示例数据：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

接下来使用 `CollapsingMergeTree` 创建一张名为 `UAct` 的表：

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

我们使用两个 `INSERT` 查询来创建两个不同的数据片段。

:::note
如果我们使用单个查询插入数据，ClickHouse 只会创建一个数据片段，并且之后不会执行任何合并操作。
:::

我们可以使用以下方式来查询数据：

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

让我们来看一下上面返回的数据，检查是否发生了折叠（collapsing）……
通过两条 `INSERT` 语句，我们创建了两个数据 part。
`SELECT` 语句在两个线程中执行，因此得到的行顺序是随机的。
然而，折叠**并没有发生**，因为这些数据 part 尚未被合并，
而 ClickHouse 会在后台的某个未知时间点合并数据 part，这一点是无法预测的。

因此，我们需要进行一次聚合，
可以使用 [`sum`](/sql-reference/aggregate-functions/reference/sum)
聚合函数，并配合 [`HAVING`](/sql-reference/statements/select/having) 子句：

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

如果我们不需要聚合并且想要强制折叠，还可以在 `FROM` 子句中使用 `FINAL` 修饰符。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

:::note
这种数据选取方式效率较低，不建议在扫描数据量很大（数百万行）时使用。
:::

### 另一种方法示例 {#example-of-another-approach}

这种方法的思路是，合并操作只考虑键字段。
因此，在 &quot;cancel&quot; 行中，我们可以指定负值，
使其在不使用 `Sign` 列进行求和时抵消该行的先前版本。

在本示例中，我们将使用下面的示例数据：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

对于这种方法，需要将 `PageViews` 和 `Duration` 的数据类型更改为可以存储负值的类型。
因此，在使用 `collapsingMergeTree` 创建表 `UAct` 时，我们将这些列的数据类型从 `UInt8` 更改为 `Int16`：

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

让我们通过向表中插入数据来测试此方法。

不过，对于示例或小型表，这样做是可以接受的：

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
