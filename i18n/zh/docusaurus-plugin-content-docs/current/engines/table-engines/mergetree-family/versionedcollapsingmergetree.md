---
'description': 'Allows for quick writing of object states that are continually changing,
  and deleting old object states in the background.'
'sidebar_label': '版本合并树 (VersionedCollapsingMergeTree)'
'sidebar_position': 80
'slug': '/engines/table-engines/mergetree-family/versionedcollapsingmergetree'
'title': 'VersionedCollapsingMergeTree'
---




# VersionedCollapsingMergeTree

此引擎：

- 允许快速写入不断变化的对象状态。
- 在后台删除旧的对象状态。这显著减少了存储的数量。

有关详细信息，请参见[合并](#table_engines_versionedcollapsingmergetree)部分。

该引擎继承自[MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)，并在合并数据部分的算法中添加了合并行的逻辑。`VersionedCollapsingMergeTree`的目的是类似于[CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md)，但使用不同的合并算法，这允许使用多个线程以任意顺序插入数据。特别地，`Version`列帮助正确合并行，即使它们以错误的顺序插入。相比之下，`CollapsingMergeTree`仅允许严格连续的插入。

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

| 参数      | 描述                                                                                 | 类型                                                                                                                                                                                                                     |
|-----------|--------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sign`    | 指示行类型的列名称：`1`表示“状态”行，`-1`表示“取消”行。                          | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                     |
| `version` | 表示对象状态版本的列名称。                                                          | [`Int*`](/sql-reference/data-types/int-uint), [`UInt*`](/sql-reference/data-types/int-uint), [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32), [`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64) |

### 查询子句 {#query-clauses}

创建`VersionedCollapsingMergeTree`表时，需要的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)与创建`MergeTree`表时相同。

<details markdown="1">

<summary>创建表的弃用方法</summary>

:::note
在新项目中请勿使用此方法。如果可能，请将旧项目切换到上面描述的方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

除`sign`和`version`外，所有参数的含义与`MergeTree`中相同。

- `sign` — 指示行类型的列名称：`1`表示“状态”行，`-1`表示“取消”行。

    列数据类型 — `Int8`。

- `version` — 表示对象状态版本的列名称。

    列数据类型应为`UInt*`。

</details>

## 合并 {#table_engines_versionedcollapsingmergetree}

### 数据 {#data}

考虑一种情况，你需要为某个对象保存不断变化的数据。合理的做法是为一个对象保留一行，并在发生变化时更新该行。然而，更新操作对DBMS来说是昂贵且缓慢的，因为它需要重写存储中的数据。如果需要快速写入数据，则更新是不可接受的，但可以按顺序写入对象的变化，如下所示。

在写入行时使用`Sign`列。如果`Sign = 1`，则表示该行是对象的状态（我们称之为“状态”行）。如果`Sign = -1`，则表示取消具有相同属性的对象的状态（我们称之为“取消”行）。还要使用`Version`列，该列应识别对象的每个状态并分配一个独特的编号。

例如，我们想计算用户在某个网站上访问了多少页面以及他们在那里停留了多长时间。在某个时刻，我们写入以下用户活动状态的行：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

稍后我们注册用户活动的变化并写入以下两行。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

第一行取消了对象（用户）之前的状态。它应复制取消状态的所有字段，除了`Sign`。

第二行包含当前状态。

因为我们只需要用户活动的最后状态，行

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

可以被删除，从而合并对象的无效（旧）状态。`VersionedCollapsingMergeTree`在合并数据部分时执行此操作。

要了解为什么每个变化需要两行，参见[算法](#table_engines-versionedcollapsingmergetree-algorithm)。

**使用注意事项**

1.  写入数据的程序应该记住对象的状态，以便能够取消它。“取消”字符串应包含主键字段的副本以及“状态”字符串的版本和相反的`Sign`。这会增加初始存储空间的大小，但可以快速写入数据。
2.  列中较长的增长数组会因为写入负载而降低引擎的效率。数据越简单，效率越好。
3.  `SELECT`的结果在很大程度上取决于对象变化历史的一致性。在准备插入数据时要小心。使用不一致数据可能会导致不可预测的结果，例如，对非负度量（如会话深度）产生负值。

### 算法 {#table_engines-versionedcollapsingmergetree-algorithm}

当ClickHouse合并数据部分时，它会删除每对具有相同主键和版本但`Sign`不同的行。行的顺序无关紧要。

当ClickHouse插入数据时，它会按主键对行进行排序。如果`Version`列不在主键中，ClickHouse会将其作为最后一个字段隐式添加到主键中并用于排序。

## 选择数据 {#selecting-data}

ClickHouse不保证所有具有相同主键的行将位于同一个结果数据部分中，甚至在同一物理服务器上。这对于写入数据和随后合并数据部分都是如此。此外，ClickHouse使用多个线程处理`SELECT`查询，无法预测结果中行的顺序。这意味着如果需要从`VersionedCollapsingMergeTree`表中获取完全“合并”的数据，则需要进行聚合。

为完成合并，请编写包含`GROUP BY`子句和考虑到`sign`的聚合函数的查询。例如，要计算数量，请使用`sum(Sign)`而不是`count()`。要计算某个值的总和，请使用`sum(Sign * x)`而不是`sum(x)`，并添加`HAVING sum(Sign) > 0`。

可以通过这种方式计算聚合`count`、`sum`和`avg`。如果对象至少具有一个未合并状态，可以计算聚合`uniq`。由于`VersionedCollapsingMergeTree`不保存合并状态的值历史，因此无法计算聚合`min`和`max`。

如果需要提取具有“合并”但不进行聚合的数据（例如，检查最近的值是否匹配某些条件的行是否存在），可以为`FROM`子句使用`FINAL`修饰符。这种方法效率低下，不应在大表中使用。

## 示例 {#example-of-use}

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

我们使用两个`INSERT`查询来创建两个不同的数据部分。如果我们使用单个查询插入数据，ClickHouse将创建一个数据部分，并且不会执行任何合并。

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
我们使用两个`INSERT`查询创建了两个数据部分。`SELECT`查询在两个线程中执行，结果是一组随机顺序的行。
合并没有发生，因为数据部分尚未合并。ClickHouse在无法预测的时间点合并数据部分。

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

如果我们不需要聚合并希望强制执行合并，可以为`FROM`子句使用`FINAL`修饰符。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

这是一种非常低效的选择数据的方法。不要在大表中使用它。
