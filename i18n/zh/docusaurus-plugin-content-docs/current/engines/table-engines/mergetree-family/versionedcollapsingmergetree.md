---
slug: /engines/table-engines/mergetree-family/versionedcollapsingmergetree
sidebar_position: 80
sidebar_label:  版本化合并树
title: "版本化合并树"
description: "允许快速写入不断变化的对象状态，并在后台删除旧的对象状态。"
---


# 版本化合并树

这个引擎：

- 允许快速写入不断变化的对象状态。
- 在后台删除旧的对象状态。这显著减少了存储量。

有关详细信息，请参见 [合并](#table_engines_versionedcollapsingmergetree) 部分。

该引擎从 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) 继承，并为合并数据部分的算法添加了行合并逻辑。`VersionedCollapsingMergeTree` 的目的与 [CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md) 相同，但使用了不同的合并算法，允许使用多个线程以任意顺序插入数据。特别是，`Version` 列有助于正确合并行，即使它们以错误的顺序插入。相比之下，`CollapsingMergeTree` 仅允许严格连续的插入。

## 创建表 {#creating-a-table}

``` sql
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

有关查询参数的描述，请参见 [查询描述](../../../sql-reference/statements/create/table.md)。

### 引擎参数 {#engine-parameters}

``` sql
VersionedCollapsingMergeTree(sign, version)
```

| 参数     | 描述                                                                 | 类型                                                                                                                                                                                                                                                                                    |
|----------|----------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sign`   | 表示行类型的列的名称：`1` 表示“状态”行，`-1` 表示“取消”行。         | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                    |
| `version`| 表示对象状态版本的列的名称。                                      | [`Int*`](/sql-reference/data-types/int-uint), [`UInt*`](/sql-reference/data-types/int-uint), [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32), [`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64) |

### 查询子句 {#query-clauses}

创建 `VersionedCollapsingMergeTree` 表时，所需的 [子句](../../../engines/table-engines/mergetree-family/mergetree.md) 与创建 `MergeTree` 表时相同。

<details markdown="1">

<summary>已弃用的创建表方法</summary>

:::note
请在新项目中不要使用此方法。如果可能，请将旧项目切换为上述描述的方法。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

除 `sign` 和 `version` 外的所有参数在 `MergeTree` 中具有相同的意义。

- `sign` — 表示行类型的列的名称：`1` 是“状态”行，`-1` 是“取消”行。

    列数据类型 — `Int8`.

- `version` — 表示对象状态版本的列的名称。

    列数据类型应为 `UInt*`。

</details>

## 合并 {#table_engines_versionedcollapsingmergetree}

### 数据 {#data}

考虑一种情况，需要保存某个对象不断变化的数据。合理的做法是为一个对象保留一行，并在发生变化时更新该行。然而，对于 DBMS 来说，更新操作开销大且缓慢，因为它需要重写存储中的数据。如果需要快速写入数据，则更新不可接受，但可以按顺序写入对象的更改，如下所示。

在写入行时使用 `Sign` 列。如果 `Sign = 1`，表示这一行是对象的状态（我们称之为“状态”行）。如果 `Sign = -1`，则表示取消具有相同属性的对象状态（我们称之为“取消”行）。还要使用 `Version` 列，该列应以单独的编号标识对象的每个状态。

例如，我们想计算用户在某个网站上访问了多少页面以及他们停留了多长时间。在某个时刻，我们写下以下行以记录用户活动的状态：

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

之后的某个时刻，我们记录用户活动的变化，并写下以下两行。

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

第一行取消了对象（用户）的先前状态。它应该复制已取消状态的所有字段，除了 `Sign`。

第二行包含当前状态。

由于我们只需要用户活动的最新状态，因此行

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

可以被删除，从而合并无效（旧）状态的对象。`VersionedCollapsingMergeTree` 在合并数据部分时执行此操作。

要了解为什么每个更改需要两行，请参见 [算法](#table_engines-versionedcollapsingmergetree-algorithm)。

**使用说明**

1.  写入数据的程序应记住对象的状态，以便能够取消它。“取消”行应包含主键字段的副本、状态行的版本以及相反的 `Sign`。这增加了存储的初始大小，但允许快速写入数据。
2.  列中的长数组会降低引擎的效率，因为写入负担增加。数据越简单，效率越高。
3.  `SELECT` 结果强烈依赖于对象变化历史的一致性。准备插入数据时请保持准确。使用不一致的数据可能会导致不可预知的结果，例如非负指标的负值，如会话深度。

### 算法 {#table_engines-versionedcollapsingmergetree-algorithm}

当 ClickHouse 合并数据部分时，它会删除每对具有相同主键和版本但 `Sign` 不同的行。行的顺序无关紧要。

当 ClickHouse 插入数据时，它按主键对行进行排序。如果 `Version` 列不在主键中，ClickHouse 会将其隐式添加到主键作为最后一个字段，并用它进行排序。

## 选择数据 {#selecting-data}

ClickHouse 并不保证所有具有相同主键的行都将位于同一结果数据部分中，甚至在同一物理服务器上。这在数据写入和后续合并数据部分时都是如此。此外，ClickHouse 使用多个线程处理 `SELECT` 查询，因此无法预测结果中的行顺序。这意味着如果需要从 `VersionedCollapsingMergeTree` 表中获取完全“合并”的数据，则需要进行聚合。

为了最终完成合并，请写入带有 `GROUP BY` 子句和考虑 `Sign` 的聚合函数的查询。例如，要计算数量，请使用 `sum(Sign)` 而不是 `count()`。要计算某个值的总和，请使用 `sum(Sign * x)` 而不是 `sum(x)`，并添加 `HAVING sum(Sign) > 0`。

聚合函数 `count`、`sum` 和 `avg` 可以这样计算。如果对象有至少一个未合并的状态，则可以计算聚合函数 `uniq`。聚合函数 `min` 和 `max` 不能计算，因为 `VersionedCollapsingMergeTree` 不保存合并状态的值历史。

如果您需要提取“合并”但不需要聚合的数据（例如，检查是否存在最新值符合某些条件的行），可以对 `FROM` 子句使用 `FINAL` 修饰符。这种方法效率低下，不应与大量数据表一起使用。

## 使用示例 {#example-of-use}

示例数据：

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

创建表：

``` sql
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

``` sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1, 1)
```

``` sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1, 1),(4324182021466249494, 6, 185, 1, 2)
```

我们使用两个 `INSERT` 查询来创建两个不同的数据部分。如果我们通过单个查询插入数据，ClickHouse 将创建一个数据部分，永远不会执行任何合并。

获取数据：

``` sql
SELECT * FROM UAct
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 │
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

我们在这里看到了什么，合并的部分在哪里？
我们使用两个 `INSERT` 查询创建了两个数据部分。`SELECT` 查询在两个线程中执行，结果是随机行的顺序。
合并没有发生，因为数据部分尚未合并。ClickHouse 在我们无法预测的未知时间合并数据部分。

这就是我们需要聚合的原因：

``` sql
SELECT
    UserID,
    sum(PageViews * Sign) AS PageViews,
    sum(Duration * Sign) AS Duration,
    Version
FROM UAct
GROUP BY UserID, Version
HAVING sum(Sign) > 0
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │       2 │
└─────────────────────┴───────────┴──────────┴─────────┘
```

如果我们不需要聚合并希望强制合并，可以对 `FROM` 子句使用 `FINAL` 修饰符。

``` sql
SELECT * FROM UAct FINAL
```

``` text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

这是一种非常低效的选择数据方式。不要在大型表上使用它。
