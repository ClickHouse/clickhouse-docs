---
description: '允许快速写入不断变化的对象状态，并在后台删除旧的对象状态。'
sidebar_label: 'VersionedCollapsingMergeTree'
sidebar_position: 80
slug: /engines/table-engines/mergetree-family/versionedcollapsingmergetree
title: 'VersionedCollapsingMergeTree 表引擎'
doc_type: 'reference'
---



# VersionedCollapsingMergeTree 表引擎

该引擎：

- 允许快速写入持续变化的对象状态。
- 在后台删除旧的对象状态，从而显著减少存储占用。

详情参见 [Collapsing](#table_engines_versionedcollapsingmergetree) 一节。

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree)，并在数据部分合并算法中增加了折叠行（collapsing rows）的逻辑。`VersionedCollapsingMergeTree` 与 [CollapsingMergeTree](../../../engines/table-engines/mergetree-family/collapsingmergetree.md) 具有相同的用途，但使用了不同的折叠算法，该算法允许以任意顺序并通过多线程插入数据。尤其是，`Version` 列有助于在行插入顺序不正确时仍能正确折叠这些行。相比之下，`CollapsingMergeTree` 仅允许严格按顺序插入。



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

有关查询参数的说明,请参阅[查询说明](../../../sql-reference/statements/create/table.md)。

### 引擎参数 {#engine-parameters}

```sql
VersionedCollapsingMergeTree(sign, version)
```

| 参数 | 说明                                                                            | 类型                                                                                                                                                                                                                                                                                          |
| --------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sign`    | 指定行类型的列名:`1` 表示"状态"行,`-1` 表示"取消"行。 | [`Int8`](/sql-reference/data-types/int-uint)                                                                                                                                                                                                                                                  |
| `version` | 指定对象状态版本的列名。                               | [`Int*`](/sql-reference/data-types/int-uint)、[`UInt*`](/sql-reference/data-types/int-uint)、[`Date`](/sql-reference/data-types/date)、[`Date32`](/sql-reference/data-types/date32)、[`DateTime`](/sql-reference/data-types/datetime) 或 [`DateTime64`](/sql-reference/data-types/datetime64) |

### 查询子句 {#query-clauses}

创建 `VersionedCollapsingMergeTree` 表时,需要与创建 `MergeTree` 表相同的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)。

<details markdown="1">

<summary>已弃用的创建表方法</summary>

:::note
请勿在新项目中使用此方法。如有可能,请将旧项目迁移到上述方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] VersionedCollapsingMergeTree(date-column [, samp#table_engines_versionedcollapsingmergetreeling_expression], (primary, key), index_granularity, sign, version)
```

除 `sign` 和 `version` 之外的所有参数与 `MergeTree` 中的含义相同。

- `sign` — 指定行类型的列名:`1` 表示"状态"行,`-1` 表示"取消"行。

  列数据类型 — `Int8`。

- `version` — 指定对象状态版本的列名。

  列数据类型应为 `UInt*`。

</details>


## 折叠 {#table_engines_versionedcollapsingmergetree}

### 数据 {#data}

考虑这样一种场景:您需要保存某个对象持续变化的数据。合理的做法是为对象保留一行记录,并在发生变化时更新该行。然而,对于数据库管理系统来说,更新操作代价高昂且速度缓慢,因为它需要重写存储中的数据。如果您需要快速写入数据,更新操作是不可接受的,但您可以按如下方式顺序写入对象的变更。

写入行时使用 `Sign` 列。如果 `Sign = 1`,表示该行是对象的一个状态(我们称之为"状态"行)。如果 `Sign = -1`,则表示取消具有相同属性的对象状态(我们称之为"取消"行)。同时使用 `Version` 列,该列应使用单独的数字标识对象的每个状态。

例如,我们想要计算用户在某个网站上访问了多少页面以及停留了多长时间。在某个时间点,我们写入以下包含用户活动状态的行:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

在稍后的某个时间点,我们记录用户活动的变化,并用以下两行写入:

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
│ 4324182021466249494 │         6 │      185 │    1 │       2 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

第一行取消对象(用户)的先前状态。它应该复制被取消状态的所有字段,除了 `Sign`。

第二行包含当前状态。

因为我们只需要用户活动的最新状态,所以这些行

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         5 │      146 │    1 │       1 |
│ 4324182021466249494 │         5 │      146 │   -1 │       1 |
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

可以被删除,从而折叠对象的无效(旧)状态。`VersionedCollapsingMergeTree` 在合并数据部分时执行此操作。

要了解为什么每次变更需要两行,请参阅[算法](#table_engines-versionedcollapsingmergetree-algorithm)。

**使用说明**

1.  写入数据的程序应该记住对象的状态以便能够取消它。"取消"行应包含主键字段的副本、"状态"行的版本以及相反的 `Sign`。这会增加存储的初始大小,但允许快速写入数据。
2.  列中不断增长的长数组会由于写入负载而降低引擎的效率。数据越简单,效率越高。
3.  `SELECT` 结果强烈依赖于对象变更历史的一致性。准备插入数据时要准确。不一致的数据可能会导致不可预测的结果,例如非负指标(如会话深度)出现负值。

### 算法 {#table_engines-versionedcollapsingmergetree-algorithm}

当 ClickHouse 合并数据部分时,它会删除具有相同主键和版本但 `Sign` 不同的每对行。行的顺序无关紧要。

当 ClickHouse 插入数据时,它按主键对行进行排序。如果 `Version` 列不在主键中,ClickHouse 会隐式地将其作为最后一个字段添加到主键中,并使用它进行排序。


## 查询数据 {#selecting-data}

ClickHouse 不保证具有相同主键的所有行都位于同一个数据分区中,甚至不保证它们位于同一台物理服务器上。无论是写入数据还是后续合并数据分区,都是如此。此外,ClickHouse 使用多线程处理 `SELECT` 查询,因此无法预测结果中行的顺序。这意味着如果需要从 `VersionedCollapsingMergeTree` 表中获取完全"折叠"后的数据,就必须进行聚合操作。

要完成折叠,需要编写带有 `GROUP BY` 子句和考虑符号的聚合函数的查询。例如,要计算数量,应使用 `sum(Sign)` 而不是 `count()`。要计算某项的总和,应使用 `sum(Sign * x)` 而不是 `sum(x)`,并添加 `HAVING sum(Sign) > 0`。

聚合函数 `count`、`sum` 和 `avg` 可以通过这种方式计算。如果对象至少有一个未折叠状态,则可以计算聚合函数 `uniq`。聚合函数 `min` 和 `max` 无法计算,因为 `VersionedCollapsingMergeTree` 不保存已折叠状态值的历史记录。

如果需要提取经过"折叠"但不进行聚合的数据(例如,检查是否存在最新值满足特定条件的行),可以在 `FROM` 子句中使用 `FINAL` 修饰符。这种方法效率较低,不应用于大型表。


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

我们使用两个 `INSERT` 查询来创建两个不同的数据分区。如果使用单个查询插入数据，ClickHouse 会创建一个数据分区，并且不会执行任何合并操作。

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

这里看到了什么？折叠的数据分区在哪里？
我们使用两个 `INSERT` 查询创建了两个数据分区。`SELECT` 查询在两个线程中执行，结果中行的顺序是随机的。
折叠操作没有发生，因为数据分区尚未合并。ClickHouse 会在一个无法预测的时间点合并数据分区。

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

如果不需要聚合并希望强制执行折叠，可以在 `FROM` 子句中使用 `FINAL` 修饰符。

```sql
SELECT * FROM UAct FINAL
```

```text
┌──────────────UserID─┬─PageViews─┬─Duration─┬─Sign─┬─Version─┐
│ 4324182021466249494 │         6 │      185 │    1 │       2 │
└─────────────────────┴───────────┴──────────┴──────┴─────────┘
```

这是一种非常低效的数据查询方式。不要在大表上使用。
