---
description: '继承自 MergeTree，但在合并过程中增加了对行进行折叠的逻辑。'
keywords: ['updates', 'collapsing']
sidebar_label: 'CollapsingMergeTree'
sidebar_position: 70
slug: /engines/table-engines/mergetree-family/collapsingmergetree
title: 'CollapsingMergeTree 表引擎'
doc_type: 'guide'
---



# CollapsingMergeTree 表引擎



## Description {#description}

`CollapsingMergeTree` 引擎继承自 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md),
并在合并过程中增加了行折叠的逻辑。
`CollapsingMergeTree` 表引擎会异步删除(折叠)
成对的行,条件是排序键(`ORDER BY`)中除特殊字段 `Sign` 外的所有字段值都相同,
其中 `Sign` 字段的值为 `1` 或 `-1`。
没有相反 `Sign` 值配对的行会被保留。

更多详细信息,请参阅文档的 [Collapsing](#table_engine-collapsingmergetree-collapsing) 部分。

:::note
该引擎可以显著减少存储空间占用,
从而提高 `SELECT` 查询的效率。
:::


## 参数 {#parameters}

除 `Sign` 参数外,该表引擎的所有参数与 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 中的含义相同。

- `Sign` — 用于指定行类型的列名,其中 `1` 表示"状态"行,`-1` 表示"取消"行。类型:[Int8](/sql-reference/data-types/int-uint)。


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

<summary>已弃用的创建表方法</summary>

:::note
不建议在新项目中使用以下方法。
我们建议在可能的情况下,将旧项目更新为使用新方法。
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

`Sign` — 列名,用于标识行的类型,其中 `1` 表示"状态"行,`-1` 表示"取消"行。[Int8](/sql-reference/data-types/int-uint)。

</details>

- 有关查询参数的说明,请参阅[查询说明](../../../sql-reference/statements/create/table.md)。
- 创建 `CollapsingMergeTree` 表时,需要使用与创建 `MergeTree` 表相同的[查询子句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。


## 折叠 {#table_engine-collapsingmergetree-collapsing}

### 数据 {#data}

考虑这样一种场景:您需要为某个对象保存持续变化的数据。
为每个对象保留一行并在发生变化时更新它似乎是合理的做法,
然而,更新操作对于数据库管理系统来说既昂贵又缓慢,因为它们需要重写存储中的数据。
如果需要快速写入数据,执行大量更新操作并不是可行的方法,
但我们可以按顺序写入对象的变更记录。
为此,我们使用特殊列 `Sign`。

- 如果 `Sign` = `1`,表示该行是"状态"行:_包含表示当前有效状态字段的行_。
- 如果 `Sign` = `-1`,表示该行是"取消"行:_用于取消具有相同属性的对象状态的行_。

例如,我们想要计算用户在某个网站上查看了多少页面以及访问时长。
在某个特定时刻,我们写入以下包含用户活动状态的行:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

在稍后的时刻,我们记录用户活动的变化并写入以下两行:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

第一行取消对象的先前状态(在本例中代表用户)。
它应该复制"已取消"行的所有排序键字段,除了 `Sign`。
第二行包含当前状态。

由于我们只需要用户活动的最新状态,原始的"状态"行和我们插入的"取消"
行可以被删除,如下所示,折叠对象的无效(旧)状态:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- 旧的"状态"行可以被删除
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "取消"行可以被删除
│ 4324182021466249494 │         6 │      185 │    1 │ -- 新的"状态"行保留
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` 在数据部分合并时会精确执行这种_折叠_行为。

:::note
每次变更需要两行的原因
在[算法](#table_engine-collapsingmergetree-collapsing-algorithm)段落中进一步讨论。
:::

**这种方法的特点**

1.  写入数据的程序应该记住对象的状态以便能够取消它。"取消"行应该包含"状态"行的排序键字段副本以及相反的 `Sign`。这会增加存储的初始大小,但允许我们快速写入数据。
2.  列中不断增长的长数组会由于写入负载增加而降低引擎的效率。数据越简单,效率越高。
3.  `SELECT` 结果强烈依赖于对象变更历史的一致性。在准备插入数据时要确保准确性。不一致的数据可能会产生不可预测的结果。例如,非负指标(如会话深度)出现负值。

### 算法 {#table_engine-collapsingmergetree-collapsing-algorithm}

当 ClickHouse 合并数据[部分](/concepts/glossary#parts)时,
具有相同排序键(`ORDER BY`)的每组连续行会被归约为不超过两行,
即 `Sign` = `1` 的"状态"行和 `Sign` = `-1` 的"取消"行。
换句话说,在 ClickHouse 中条目会发生折叠。


对于每个生成的数据分片，ClickHouse 会保存：

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 如果 `"state"` 行与 `"cancel"` 行的行数相等且最后一行是 `"state"` 行，则保存第一行 `"cancel"` 和最后一行 `"state"`。 |
|2.| 如果 `"state"` 行多于 `"cancel"` 行，则保存最后一行 `"state"`。                                                            |
|3.| 如果 `"cancel"` 行多于 `"state"` 行，则保存第一行 `"cancel"`。                                                          |
|4.| 在所有其他情况下，不保存任何行。                                                                                               |

此外，当 `"state"` 行至少比 `"cancel"` 行多两行，或 `"cancel"` 行至少比 `"state"` 行多两行时，合并会继续进行。
然而，ClickHouse 将这种情况视为逻辑错误，并将其记录到服务器日志中。
如果相同数据被多次插入，就可能出现此错误。
因此，折叠操作不应改变统计计算的结果。
变更会被逐步折叠，以便最终几乎每个对象只保留其最后状态。

`Sign` 列是必需的，因为合并算法并不保证具有相同排序键的所有行都会位于同一个生成的数据分片中，甚至不保证位于同一物理服务器上。
ClickHouse 使用多个线程处理 `SELECT` 查询，因此它无法预测结果中行的顺序。

如果需要从 `CollapsingMergeTree` 表中获取完全“折叠”的数据，则需要进行聚合。
要完成折叠，请编写带有 `GROUP BY` 子句的查询，并使用考虑符号列的聚合函数。
例如，要计算数量，请使用 `sum(Sign)` 而不是 `count()`。
要计算某个值的总和，请使用 `sum(Sign * x)` 并配合 `HAVING sum(Sign) > 0`，而不是像下面[示例](#example-of-use)中那样使用 `sum(x)`。

可以用这种方式计算聚合 `count`、`sum` 和 `avg`。
如果某个对象至少有一个未折叠的状态，则可以计算聚合 `uniq`。
无法计算聚合 `min` 和 `max`，
因为 `CollapsingMergeTree` 不保存已折叠状态的历史。

:::note
如果需要在不做聚合的情况下提取数据
（例如，用于检查其最新值是否满足某些条件的行是否存在），
可以在 `FROM` 子句中使用 [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修饰符。它会在返回结果之前先合并数据。
对于 `CollapsingMergeTree` 表，每个键只返回最新的状态行。
:::



## 示例 {#examples}

### 使用示例 {#example-of-use}

假设有以下示例数据:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

使用 `CollapsingMergeTree` 创建表 `UAct`:

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

接下来插入一些数据:

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

我们使用两个 `INSERT` 查询来创建两个不同的数据部分。

:::note
如果使用单个查询插入数据,ClickHouse 只会创建一个数据部分,并且永远不会执行任何合并。
:::

可以使用以下方式查询数据:

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

查看上面返回的数据,看看是否发生了折叠...
通过两个 `INSERT` 查询,我们创建了两个数据部分。
`SELECT` 查询在两个线程中执行,因此得到了随机的行顺序。
然而,折叠**并未发生**,因为数据部分尚未合并,
而 ClickHouse 会在无法预测的未知时刻在后台合并数据部分。

因此需要进行聚合,
使用 [`sum`](/sql-reference/aggregate-functions/reference/sum)
聚合函数和 [`HAVING`](/sql-reference/statements/select/having) 子句:

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

如果不需要聚合并希望强制折叠,也可以在 `FROM` 子句中使用 `FINAL` 修饰符。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

:::note
这种查询数据的方式效率较低,不建议用于扫描大量数据(数百万行)的场景。
:::

### 另一种方法的示例 {#example-of-another-approach}

这种方法的思路是合并只考虑键字段。
因此在"取消"行中,可以指定负值,
在求和时抵消该行的先前版本,而无需使用 `Sign` 列。

在此示例中,将使用以下示例数据:


```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

对于这种方法，我们需要将 `PageViews` 和 `Duration` 的数据类型更改为可以存储负值。
因此，在使用 `collapsingMergeTree` 创建表 `UAct` 时，将这两列的数据类型从 `UInt8` 修改为 `Int16`：

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

让我们通过向表中插入数据来测试这种方法。

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
