---
'description': '允许快速写入不断变化的对象状态，并在后台删除旧的对象状态。'
'sidebar_label': 'VersionedCollapsingMergeTree'
'sidebar_position': 80
'slug': '/engines/table-engines/mergetree-family/versionedcollapsingmergetree'
'title': 'VersionedCollapsingMergeTree'
'doc_type': 'reference'
---


# VersionedCollapsingMergeTree

该引擎：

- 允许快速写入持续变化的对象状态。
- 在后台删除旧对象状态。这显著减少了存储量。

有关更多详细信息，请参见[Collapsing](#table_engines_versionedcollapsingmergetree)部分。

该引擎继承自[MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)，并为合并数据部分的算法添加了行合并的逻辑。`VersionedCollapsingMergeTree`的目的与[CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md)相同，但使用不同的合并算法，使得可以在任意顺序中使用多个线程插入数据。尤其是，`Version`列可以帮助正确合并行，即使它们以错误的顺序插入。相比之下，`CollapsingMergeTree`只允许严格连续的插入。

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

| 参数      | 描述                                                                 | 类型                                                                                                                                                                                                                                                                                    |
|-----------|-------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sign`    | 包含行类型的列名：`1`是“状态”行，`-1`是“取消”行。                        | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                    |
| `version` | 包含对象状态版本的列名。                                               | [`Int*`](/sql-reference/data-types/int-uint), [`UInt*`](/sql-reference/data-types/int-uint), [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32), [`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64) |

### 查询子句 {#query-clauses}

创建`VersionedCollapsingMergeTree`表时，与创建`MergeTree`表时所需的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)相同。

<details markdown="1">

<summary>创建表的过时方法</summary>

:::note
请勿在新项目中使用此方法。如有可能，请将旧项目切换到上述描述的方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

除`sign`和`version`外，所有参数与`MergeTree`中的含义相同。

- `sign` — 包含行类型的列名：`1`是“状态”行，`-1`是“取消”行。

    列数据类型 — `Int8`。

- `version` — 包含对象状态版本的列名。

    列数据类型应为`UInt*`。

</details>

## 合并 {#table_engines_versionedcollapsingmergetree}

### 数据 {#data}

考虑一种情况，您需要保存某个对象的持续变化的数据。合理的做法是为一个对象保留一行，并在发生更改时更新该行。然而，对于DBMS来说，更新操作成本高且缓慢，因为它需要在存储中重写数据。如果需要快速写入数据，则不可接受更新，但可以按顺序写入对象的更改，如下所示。

在写入行时使用`Sign`列。如果`Sign = 1`，这意味着该行是对象的状态（我们称之为“状态”行）。如果`Sign = -1`，则表示取消具有相同属性的对象状态（我们称之为“取消”行）。还使用`Version`列，该列应为每个对象的状态标识唯一的数字。

例如，我们希望计算用户在某个网站上访问了多少页面以及他们在上面待了多长时间。在某个时刻，我们写入表示用户活动状态的如下行：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

稍后，我们记录用户活动的变化并写入以下两行。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

第一行取消了对象（用户）的上一个状态。它应复制所有被取消状态的字段，除了`Sign`。

第二行包含当前状态。

由于我们只需要用户活动的最后状态，因此可以删除行

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

，合并对象的无效（旧）状态。`VersionedCollapsingMergeTree`在合并数据部分时执行此操作。

要了解为什么我们需要每次变化两行，请参见[算法](#table_engines-versionedcollapsingmergetree-algorithm)。

**使用注意事项**

1. 写入数据的程序应记住对象的状态，以便能够取消它。“取消”字符串应包含主键字段的副本和“状态”字符串的版本以及相反的`Sign`。这增加了初始存储的大小，但允许快速写入数据。
2. 列中长而增长的数组会因写入负载而降低引擎的效率。数据越简单，效率越好。
3. `SELECT`结果强烈依赖于对象更改历史的一致性。在准备插入数据时请保持准确性。使用不一致的数据可能会导致不可预测的结果，例如，对于会话深度等非负指标的负值。

### 算法 {#table_engines-versionedcollapsingmergetree-algorithm}

当ClickHouse合并数据部分时，它会删除每一对具有相同主键和版本且`Sign`不同的行。行的顺序无关紧要。

当ClickHouse插入数据时，它会根据主键对行进行排序。如果`Version`列不在主键中，ClickHouse会将其隐式添加到主键作为最后一个字段，并使用它进行排序。

## 选择数据 {#selecting-data}

ClickHouse不保证具有相同主键的所有行将位于同一个结果数据部分中，甚至同一物理服务器上。这对于写入数据和随后合并数据部分都是如此。此外，ClickHouse使用多个线程处理`SELECT`查询，无法预测结果中的行顺序。这意味着，如果需要从`VersionedCollapsingMergeTree`表中获取完全“合并”的数据，则需要进行聚合。

为了最终合并，请写入包含`GROUP BY`子句和考虑到符号的聚合函数的查询。例如，要计算数量，请使用`sum(Sign)`而不是`count()`。要计算某个值的总和，请使用`sum(Sign * x)`而不是`sum(x)`，并添加`HAVING sum(Sign) > 0`。

聚合`count`、`sum`和`avg`可以以这种方式计算。如果对象至少有一个未合并的状态，则可以计算聚合`uniq`。聚合`min`和`max`无法计算，因为`VersionedCollapsingMergeTree`不保存合并状态的值历史。

如果您需要提取带有“合并”但不进行聚合的数据（例如，检查最新值是否匹配某些条件的行是否存在），可以对`FROM`子句使用`FINAL`修饰符。这种方法效率低下，不应与大表一起使用。

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

我们使用两个`INSERT`查询创建两个不同的数据部分。如果我们通过单个查询插入数据，ClickHouse将创建一个数据部分，并且永远不会执行任何合并。

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
我们通过两个`INSERT`查询创建了两个数据部分。`SELECT`查询在两个线程中执行，结果是行的随机顺序。
合并未发生，因为数据部分尚未合并。ClickHouse在我们无法预测的时间点合并数据部分。

这就是我们需要聚合的原因：

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

如果我们不需要聚合并想强制合并，可以对`FROM`子句使用`FINAL`修饰符。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

这是一种选择数据的非常低效的方法。请勿在大表上使用它。
