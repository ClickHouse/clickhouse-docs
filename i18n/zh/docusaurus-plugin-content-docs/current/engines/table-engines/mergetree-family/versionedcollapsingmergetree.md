---
description: '允许对持续变化的对象状态进行快速写入，并在后台删除旧的对象状态。'
sidebar_label: 'VersionedCollapsingMergeTree'
sidebar_position: 80
slug: /engines/table-engines/mergetree-family/versionedcollapsingmergetree
title: 'VersionedCollapsingMergeTree 表引擎'
doc_type: 'reference'
---

# VersionedCollapsingMergeTree 表引擎 \\{#versionedcollapsingmergetree-table-engine\\}

该引擎：

- 允许快速写入持续变化的对象状态。
- 在后台删除旧的对象状态，从而显著减少存储占用。

详细信息参见 [Collapsing](#table_engines_versionedcollapsingmergetree) 部分。

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)，并在数据部分合并算法中增加了对行进行折叠的逻辑。`VersionedCollapsingMergeTree` 与 [CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md) 具有相同用途，但使用了不同的折叠算法，允许在多线程环境下以任意顺序插入数据。特别是，`Version` 列有助于在插入顺序不正确时仍能正确折叠行。相比之下，`CollapsingMergeTree` 只允许严格按顺序插入。

## 创建表 \\{#creating-a-table\\}

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

有关查询参数的详细说明，请参阅[查询说明](../../../sql-reference/statements/create/table.md)。

### 引擎参数 \\{#engine-parameters\\}

```sql
VersionedCollapsingMergeTree(sign, version)
```

| Parameter | Description                              | Type                                                                                                                                                                                                                                                                                         |
| --------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sign`    | 行类型列的列名：`1` 表示“state”行，`-1` 表示“cancel”行。 | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                                 |
| `version` | 对象状态版本列的列名。                              | [`Int*`](/sql-reference/data-types/int-uint), [`UInt*`](/sql-reference/data-types/int-uint), [`Date`](/sql-reference/data-types/date), [`Date32`](/sql-reference/data-types/date32), [`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64) |

### 查询子句 \\{#query-clauses\\}

在创建 `VersionedCollapsingMergeTree` 表时，需要与创建 `MergeTree` 表时相同的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)。

<details markdown="1">
  <summary>已弃用的建表方法</summary>

  :::note
  请不要在新项目中使用此方法。如有可能，请将旧项目切换为上文所述的方法。
  :::

  ```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

  除 `sign` 和 `version` 之外的所有参数，其含义与 `MergeTree` 中相同。

  * `sign` — 行类型列的列名：`1` 表示“state”行，`-1` 表示“cancel”行。

    列数据类型 — `Int8`。

  * `version` — 对象状态版本列的列名。

    列数据类型应为 `UInt*`。
</details>

## 折叠 \\{#table_engines_versionedcollapsingmergetree\\}

### 数据 \\{#data\\}

考虑这样一种情况：你需要为某个对象保存不断变化的数据。为某个对象仅保留一行记录，并在有变化时更新这一行是合理的。然而，对于 DBMS 来说，执行 `UPDATE` 操作代价高且速度慢，因为这需要在存储中重写数据。如果你需要快速写入数据，则不适合使用 `UPDATE`，但可以按如下方式顺序写入对象的变更。

在写入行时使用 `Sign` 列。如果 `Sign = 1`，表示该行为对象的某个状态（我们称其为“state”行）。如果 `Sign = -1`，表示对具有相同属性的对象状态进行取消（我们称其为“cancel”行）。还需要使用 `Version` 列，它应通过不同的数字标识对象的每一个状态。

例如，我们希望统计用户在某个网站上访问了多少页面以及停留了多长时间。在某个时间点，我们写入如下记录来表示用户活动的状态：

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

在随后的某个时间点，我们检测到用户活动发生变化，并通过下面这两行将其写入表中。

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

第一行会抵销对象（用户）之前的状态。它应当复制被抵销状态中除 `Sign` 字段以外的所有字段。

第二行表示当前状态。

因为我们只需要用户活动的最终状态，这些行

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

这些行可以被删除，从而折叠该对象无效（旧）的状态。`VersionedCollapsingMergeTree` 在合并数据分片时执行这一操作。

要了解为什么每次更改需要两行，请参阅[算法](#table_engines-versionedcollapsingmergetree-algorithm)。

**使用注意事项**

1. 写入数据的程序应当记住对象的状态，以便能够对其进行撤销。“Cancel” 行应包含主键字段的副本、“state” 行的版本以及相反的 `Sign`。这会增加初始存储空间占用，但可以实现快速写入。
2. 列中持续增长的长数组会因为写入负载而降低引擎效率。数据越简单直接，引擎效率越高。
3. `SELECT` 结果高度依赖于对象变更历史的一致性。在准备要插入的数据时要非常谨慎。对于不一致的数据，你可能会得到不可预测的结果，例如本应为非负指标（如会话深度）的负值。

### 算法 \\{#table_engines-versionedcollapsingmergetree-algorithm\\}

当 ClickHouse 合并数据分片时，会删除每一对具有相同主键和版本、但 `Sign` 不同的行。行的顺序无关紧要。

当 ClickHouse 插入数据时，会按主键对行进行排序。如果 `Version` 列不在主键中，ClickHouse 会隐式地将其作为最后一个字段加入主键，并使用它进行排序。

## 选择数据 \\{#selecting-data\\}

ClickHouse 不保证具有相同主键的所有行会位于同一个结果数据部件中，甚至不保证在同一台物理服务器上。这对于数据写入以及之后的数据部件合并都成立。此外，ClickHouse 会使用多个线程处理 `SELECT` 查询，因此无法预测结果集中各行的顺序。这意味着，如果需要从 `VersionedCollapsingMergeTree` 表中获取完全“折叠”的数据，就必须进行聚合。

要完成折叠，编写带有 `GROUP BY` 子句的查询，并使用能够考虑符号（Sign）的聚合函数。例如，要计算数量，用 `sum(Sign)` 代替 `count()`。要计算某个字段的和，用 `sum(Sign * x)` 代替 `sum(x)`，并添加 `HAVING sum(Sign) > 0`。

可以通过这种方式计算的聚合函数包括 `count`、`sum` 和 `avg`。如果对象至少有一个未折叠状态，则可以计算聚合函数 `uniq`。无法计算聚合函数 `min` 和 `max`，因为 `VersionedCollapsingMergeTree` 不保存折叠状态的值历史。

如果需要在不进行聚合的情况下以“折叠”的方式提取数据（例如，检查是否存在其最新值满足某些条件的行），可以在 `FROM` 子句中使用 `FINAL` 修饰符。这种方法效率较低，不应在大表上使用。

## 使用示例 \\{#example-of-use\\}

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

写入数据：

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, 1, 1)
```

```sql
INSERT INTO UAct VALUES (4324182021466249494, 5, 146, -1, 1),(4324182021466249494, 6, 185, 1, 2)
```

我们使用两个 `INSERT` 查询来创建两个不同的数据块。如果我们使用单个查询插入数据，ClickHouse 只会创建一个数据块，并且永远不会执行任何合并。

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

我们在这里看到了什么？折叠后的数据去了哪里？
我们通过两条 `INSERT` 查询创建了两个数据 part。`SELECT` 查询在两个线程中执行，因此结果中行的顺序是随机的。
没有发生折叠，是因为这些数据 part 尚未被合并。ClickHouse 会在一个我们无法预知的时间点合并数据 part。

这就是我们需要进行聚合的原因：

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

如果我们不需要聚合，并且希望强制进行折叠，可以在 `FROM` 子句中使用 `FINAL` 修饰符。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

这是一种非常低效的数据检索方式。不要在大表上使用。
