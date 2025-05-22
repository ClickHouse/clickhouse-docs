
# CollapsingMergeTree

## Description {#description}

`CollapsingMergeTree` 引擎继承自 [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md)，并在合并过程中添加了用于折叠行的逻辑。
当所有排序键 (`ORDER BY`) 中的字段都相等且特殊字段 `Sign` 的值为 `1` 或 `-1` 时，`CollapsingMergeTree` 表引擎将异步删除（折叠）成对的行。
没有成对的相反值 `Sign` 的行将被保留。

有关更多详细信息，请参见文档的 [Collapsing](#table_engine-collapsingmergetree-collapsing) 部分。

:::note
此引擎可能显著减少存储量，从而提高 `SELECT` 查询的效率。
:::

## Parameters {#parameters}

此表引擎的所有参数（`Sign` 参数除外）与 [`MergeTree`](/engines/table-engines/mergetree-family/mergetree) 中的含义相同。

- `Sign` — 指定行类型的列名，其中 `1` 为“状态”行，`-1` 为“取消”行。类型：[Int8](/sql-reference/data-types/int-uint)。

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

<summary>不推荐的方法创建表</summary>

:::note
下面的方法不建议在新项目中使用。
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

`Sign` — 指定行类型的列名，其中 `1` 为“状态”行，`-1` 为“取消”行。[Int8](/sql-reference/data-types/int-uint)。

</details>

- 有关查询参数的描述，请参见 [查询描述](../../../sql-reference/statements/create/table.md)。
- 创建 `CollapsingMergeTree` 表时，需要与创建 `MergeTree` 表时相同的 [查询子句](../../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table)。

## Collapsing {#table_engine-collapsingmergetree-collapsing}

### Data {#data}

考虑需要为某个给定对象保存不断变化的数据的情况。
每个对象一行并在每次更改时更新听起来很合理，
然而，更新操作对 DBMS 来说开销大且缓慢，因为它们需要重写存储中的数据。
如果我们需要快速写入数据，执行大量更新不是可接受的方法，
但我们可以始终按顺序写入对象的变化。
为此，我们利用特殊列 `Sign`。

- 如果 `Sign` = `1`，则表示该行是“状态”行：_包含代表当前有效状态的字段的行_。
- 如果 `Sign` = `-1`，则表示该行是“取消”行：_用于取消具有相同属性对象状态的行_。

例如，我们想要计算用户在某些网站上查看了多少页面及其访问时间。
在某一个时刻，我们写入用户活动的以下行：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

稍后的某个时刻，我们记录用户活动的变化，并写入以下两行：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

第一行取消对象（在此情况下代表用户）的先前状态。
它应该复制“已取消”行的所有排序键字段，除了 `Sign`。
上面的第二行包含当前状态。

由于我们只需要用户活动的最后状态，因此可以按照如下方式删除插入的原始“状态”行和“取消”行，从而折叠对象的无效（旧）状态：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │ -- old "state" row can be deleted
│ 4324182021466249494 │         5 │      146 │   -1 │ -- "cancel" row can be deleted
│ 4324182021466249494 │         6 │      185 │    1 │ -- new "state" row remains
└─────────────────────┴───────────┴──────────┴──────┘
```

`CollapsingMergeTree` 在数据部分合并时执行正是这种 _折叠_ 行为。

:::note
为何每个变化需要两行的原因将在 [算法](#table_engine-collapsingmergetree-collapsing-algorithm) 段落中进一步讨论。
:::

**这种方法的特殊性**

1.  写入数据的程序应记住对象的状态，以便能够取消它。“取消”行应包含“状态”的排序键字段的副本以及相反的 `Sign`。这增加了存储的初始大小，但允许我们快速写入数据。
2.  列中的长增长数组由于写入负载增加而降低引擎效率。数据越简单，效率越高。
3.  `SELECT` 结果在很大程度上依赖于对象更改历史的一致性。在准备插入数据时请准确。使用不一致的数据可能会导致无法预测的结果。例如，对于非负指标，如会话深度，出现负值。

### Algorithm {#table_engine-collapsingmergetree-collapsing-algorithm}

当 ClickHouse 合并数据 [parts](/concepts/glossary#parts) 时，
每个具有相同排序键 (`ORDER BY`) 的连续行组将减少到最多两行，
“状态”行 `Sign` = `1` 和“取消”行 `Sign` = `-1`。
换句话说，ClickHouse 条目被折叠。

对于每个结果数据部分，ClickHouse 保存：

|  |                                                                                                                                     |
|--|-------------------------------------------------------------------------------------------------------------------------------------|
|1.| 如果“状态”行和“取消”行的数量匹配，且最后一行是“状态”行，则为第一“取消”和最后“状态”行。 |
|2.| 如果“状态”行的数量超过“取消”行，则保留最后的“状态”行。                                                            |
|3.| 如果“取消”行的数量超过“状态”行，则保留第一的“取消”行。                                                          |
|4.| 在所有其他情况下，不保留任何行。                                                                                               |

此外，当“状态”行数量超过“取消”行数量两个或更多时，
或者“取消”行数量超过“状态”行数量两个或更多时，合并将继续。
但是，ClickHouse 将这一情况视为逻辑错误，并将其记录在服务器日志中。
如果同样的数据插入超过一次，则可能会发生此错误。
因此，折叠不应改变计算统计信息的结果。
变化是逐渐折叠的，因此最终几乎每个对象的最后状态只会保留一次。

`Sign` 列是必需的，因为合并算法并不保证所有具有相同排序键的行都在同一个结果数据部分中，甚至在同一物理服务器上。
ClickHouse 使用多个线程处理 `SELECT` 查询，无法预测结果中行的顺序。

如果需要从 `CollapsingMergeTree` 表中获取完全“折叠”的数据，则需要聚合。
要完成折叠，请编写带有 `GROUP BY` 子句和考虑到 Sign 的聚合函数的查询。
例如，要计算数量，请使用 `sum(Sign)` 而不是 `count()`。
要计算某个值的总和，请使用 `sum(Sign * x)` 并结合 `HAVING sum(Sign) > 0` 而不是 `sum(x)`，如以下 [示例](#example-of-use) 所示。

聚合 `count`、`sum` 和 `avg` 可以用这种方式计算。
如果对象至少有一个未折叠状态，则可以计算聚合 `uniq`。
但是无法计算聚合 `min` 和 `max`，因为 `CollapsingMergeTree` 不保存折叠状态的历史记录。

:::note
如果需要在不进行聚合的情况下提取数据 
（例如，检查是否存在与某些条件匹配的最新值的行）， 
可以使用 `FROM` 子句的 [`FINAL`](../../../sql-reference/statements/select/from.md#final-modifier) 修饰符。它将在返回结果之前合并数据。
对于 CollapsingMergeTree，仅返回每个键的最新状态行。
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

接下来我们将插入一些数据：

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1),(4324182021466249494, 6, 185, 1)
```

我们使用两个 `INSERT` 查询创建两个不同的数据部分。

:::note
如果我们用单个查询插入数据，ClickHouse 只会创建一个数据部分，并且不会执行任何合并。
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

让我们查看返回的数据，看看是否发生了折叠...
通过两个 `INSERT` 查询，我们创建了两个数据部分。
`SELECT` 查询是在两个线程中执行的，得到了随机的行顺序。
然而，折叠 **并未发生**，因为数据部分尚未合并，而 ClickHouse 在我们无法预测的未知时刻后台合并数据部分。

因此，我们需要进行聚合，
我们使用 [`sum`](/sql-reference/aggregate-functions/reference/sum) 聚合函数和 [`HAVING`](/sql-reference/statements/select/having) 子句进行聚合：

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

如果我们不需要聚合并想要强制折叠，我们还可以使用 `FROM` 子句的 `FINAL` 修饰符。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```
:::note
这种选择数据的方式效率较低，对于大量扫描数据（数百万行）不建议使用。
:::

### Example of Another Approach {#example-of-another-approach}

这种方法的思想是合并只考虑关键字段。
因此在“取消”行中，我们可以指定负值，
在求和时使其与行的先前版本相等，而无需使用 `Sign` 列。

在此示例中，我们将利用以下示例数据：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┐
│ 4324182021466249494 │         5 │      146 │    1 │
│ 4324182021466249494 │        -5 │     -146 │   -1 │
│ 4324182021466249494 │         6 │      185 │    1 │
└─────────────────────┴───────────┴──────────┴──────┘
```

对于这种方法，需要将 `PageViews` 和 `Duration` 的数据类型更改为存储负值。
因此，当我们使用 `collapsingMergeTree` 创建表 `UAct` 时，将这些列的值从 `UInt8` 更改为 `Int16`：

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

对于示例或小表，然而，这是可以接受的：

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
