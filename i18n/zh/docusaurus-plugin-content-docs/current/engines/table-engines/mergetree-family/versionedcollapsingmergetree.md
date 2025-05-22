
# VersionedCollapsingMergeTree

这个引擎：

- 允许快速写入不断变化的对象状态。
- 在后台删除旧的对象状态。这显著减少了存储的体积。

详细信息请参见[合并](#table_engines_versionedcollapsingmergetree)部分。

该引擎继承自[MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)，并在合并数据片段的算法中添加了合并行的逻辑。 `VersionedCollapsingMergeTree`具有与[CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md)相同的目的，但使用不同的合并算法，可允许使用多个线程以任意顺序插入数据。特别是，`Version`列有助于正确地合并行，即使它们是按错误顺序插入的。相比之下，`CollapsingMergeTree`仅允许严格连续插入。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = VersionedCollapsingMergeTree(sign, version)
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

有关查询参数的描述，请参见[查询描述](../../../sql-reference/statements/create/table.md)。

### 引擎参数 {#engine-parameters}

```sql
VersionedCollapsingMergeTree(sign, version)
```

| 参数      | 描述                                                                 | 类型                                                                                                                                                                                                                                                                               |
|-----------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sign`    | 存储行类型的列的名称：`1` 是“状态”行，`-1` 是“取消”行。          | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                     |
| `version` | 存储对象状态版本的列的名称。                                        | [`Int*`](/sql-reference/data-types/int-uint), [`UInt*`](/sql-reference/data-types/int-uint), [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32), [`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64) |

### 查询子句 {#query-clauses}

创建 `VersionedCollapsingMergeTree` 表时，所需的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)与创建 `MergeTree` 表时相同。

<details markdown="1">

<summary>创建表的弃用方法</summary>

:::note
请勿在新项目中使用此方法。如果可能，切换旧项目到上述描述的方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

除 `sign` 和 `version` 之外，所有参数的含义与 `MergeTree` 中的相同。

- `sign` — 存储行类型的列的名称：`1` 是“状态”行，`-1` 是“取消”行。

    列数据类型 — `Int8`。

- `version` — 存储对象状态版本的列的名称。

    列数据类型应为 `UInt*`。

</details>

## 合并 {#table_engines_versionedcollapsingmergetree}

### 数据 {#data}

考虑一个需要保存某个对象的不断变化的数据的情况。为一个对象保留一行并在有变化时更新该行是合理的。然而，更新操作对于DBMS来说是昂贵且缓慢的，因为它需要在存储中重写数据。如果需要快速写入数据，更新是不可接受的，但可以按照如下方式顺序写入数据的变化。

写入行时使用 `Sign` 列。如果 `Sign = 1`，这意味着该行是对象的一个状态（我们称之为“状态”行）。如果 `Sign = -1`，则表示取消具有相同属性的对象的状态（我们称之为“取消”行）。还要使用 `Version` 列，作为每个对象状态的唯一标识符。

例如，我们想计算用户在某个网站上访问了多少页面，以及他们停留了多长时间。在某个时间点，我们写入以下行以表征用户活动状态：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

稍后我们记录用户活动的变化，并写入以下两行。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

第一行取消了对象（用户）的先前状态。它应该复制取消状态的所有字段，但不包括 `Sign`。

第二行包含当前状态。

由于我们只需要用户活动的最后状态，因此可以删除行

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

以合并对象的无效（旧）状态。`VersionedCollapsingMergeTree` 在合并数据部分时执行此操作。

要了解为什么我们需要两行表示每个变化，请参见[算法](#table_engines-versionedcollapsingmergetree-algorithm)。

**使用注意事项**

1. 编写数据的程序应记住对象的状态，以便能够取消它。“取消”字符串应包含主键字段的副本和“状态”字符串的版本及相反的 `Sign`。这增加了初始存储的大小，但允许快速写入数据。
2. 列中的长增长数组会由于写入负担而降低引擎的效率。数据越简单，效率越高。
3. `SELECT` 结果在很大程度上依赖于对象变化历史的一致性。在准备插入数据时要准确。如果数据不一致，您可能会得到不可预测的结果，例如会话深度等非负指标的负值。

### 算法 {#table_engines-versionedcollapsingmergetree-algorithm}

当 ClickHouse 合并数据部分时，它会删除每对具有相同主键和版本且 `Sign` 不同的行。行的顺序无关紧要。

当 ClickHouse 插入数据时，它会按主键对行进行排序。如果 `Version` 列不在主键中，ClickHouse 会将其作为最后一个字段隐式添加到主键中，并用于排序。

## 选择数据 {#selecting-data}

ClickHouse 不保证所有具有相同主键的行都在同一个结果数据部分内，甚至不在同一物理服务器上。这对于写入数据和随后的数据部分合并都是如此。此外，ClickHouse 使用多个线程处理 `SELECT` 查询，无法预测结果中行的顺序。这意味着如果需要从 `VersionedCollapsingMergeTree` 表中获取完全“合并”的数据，则需要进行聚合。

为了最终完成合并，写入带有 `GROUP BY` 子句和考虑到签名的聚合函数的查询。例如，要计算数量，使用 `sum(Sign)` 而不是 `count()`。要计算某些内容的总和，请使用 `sum(Sign * x)` 而不是 `sum(x)`，并添加 `HAVING sum(Sign) > 0`。

聚合 `count`、`sum` 和 `avg` 可以通过这种方式计算。如果对象至少具有一个未合并的状态，可以计算聚合 `uniq`。无法计算聚合 `min` 和 `max`，因为 `VersionedCollapsingMergeTree` 不保存合并状态值的历史。

如果您需要提取"合并"但不需要聚合的数据（例如，检查是否存在其最新值符合某些条件的行），您可以对 `FROM` 子句使用 `FINAL` 修饰符。这种方法效率低下，不应与大表一起使用。

## 使用示例 {#example-of-use}

示例数据：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

创建表：

```sql
CREATE TABLE UAct
(
    UserID UInt64,
    PageViews UInt8,
    Duration UInt8,
    Sign Int8,
    Version UInt8
)
ENGINE = VersionedCollapsingMergeTree(Sign, Version)
ORDER BY UserID
```

插入数据：

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1, 1),(4324182021466249494, 6, 185, 1, 2)
```

我们使用两个 `INSERT` 查询来创建两个不同的数据部分。如果我们使用单个查询插入数据，ClickHouse 将创建一个数据部分并且永远不会进行任何合并。

获取数据：

```sql
SELECT * FROM UAct
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 │
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

我们在这里看到什么，合并部分在哪里？
我们使用两个 `INSERT` 查询创建了两个数据部分。 `SELECT` 查询在两个线程中执行，结果是行的随机顺序。合并没有发生，因为数据部分尚未合并。ClickHouse 在一个不确定的时刻合并数据部分，我们无法预测。

这就是为什么我们需要聚合：

```sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration,
    Version
FROM UAct
GROUP BY UserID, Version
HAVING sum(Sign) > 0
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │       2 │
└─────────────────────┴───────────┴──────────┴─────────┘
```

如果我们不需要聚合并希望强制合并，可以对 `FROM` 子句使用 `FINAL` 修饰符。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

这是一种非常低效的选择数据的方法。不要在大表上使用它。
