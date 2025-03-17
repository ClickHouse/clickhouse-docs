---
slug: /engines/table-engines/mergetree-family/replacingmergetree
sidebar_position: 40
sidebar_label:  ReplacingMergeTree
title: 'ReplacingMergeTree'
description: '与 MergeTree 不同，它会删除具有相同排序键值（`ORDER BY` 表部分，而不是 `PRIMARY KEY`）的重复条目。'
---


# ReplacingMergeTree

该引擎与 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) 的不同之处在于它会删除具有相同 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md) 值的重复条目（`ORDER BY` 表部分，而不是 `PRIMARY KEY`）。

数据去重仅在合并期间发生。合并在后台以未知时间进行，因此无法进行规划。某些数据可能仍未处理。尽管可以通过 `OPTIMIZE` 查询运行未调度的合并，但请不要依赖于它，因为 `OPTIMIZE` 查询将读取和写入大量数据。

因此，`ReplacingMergeTree` 适合在后台清除重复数据以节省空间，但并不能保证没有重复项。

:::note
有关 ReplacingMergeTree 的详细指南，包括最佳实践和如何优化性能，可以在 [这里](/guides/replacing-merge-tree) 查阅。
:::

## 创建表 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = ReplacingMergeTree([ver [, is_deleted]])
[PARTITION BY expr]
[ORDER BY expr]
[PRIMARY KEY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

有关请求参数的描述，请参阅 [语句描述](../../../sql-reference/statements/create/table.md)。

:::note
行的唯一性由 `ORDER BY` 表部分决定，而不是 `PRIMARY KEY`。
:::

## ReplacingMergeTree 参数 {#replacingmergetree-parameters}

### ver {#ver}

`ver` — 版本号列。类型为 `UInt*`、`Date`、`DateTime` 或 `DateTime64`。可选参数。

合并时，`ReplacingMergeTree` 会从所有具有相同排序键的行中只保留一行：

   - 如果未设置 `ver`，则选择中的最后一行。选择是参与合并的一组分区片段中的一组行。最近创建的分区（最新插入的）将在选择中排最后。因此，去重后，每个唯一排序键的最新插入的行将保留。
   - 如果指定了 `ver`，则保留最大版本的行。如果 `ver` 对于多行相同，则将对它们应用“如果未指定 `ver`”的规则，即最新插入的行将保留。

示例：

```sql
-- 没有 ver - 最新插入的 '胜出'
CREATE TABLE myFirstReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime
)
ENGINE = ReplacingMergeTree
ORDER BY key;

INSERT INTO myFirstReplacingMT Values (1, 'first', '2020-01-01 01:01:01');
INSERT INTO myFirstReplacingMT Values (1, 'second', '2020-01-01 00:00:00');

SELECT * FROM myFirstReplacingMT FINAL;

┌─key─┬─someCol─┬───────────eventTime─┐
│   1 │ second  │ 2020-01-01 00:00:00 │
└─────┴─────────┴─────────────────────┘


-- 使用 ver - 拥有最大 ver 的行 '胜出'
CREATE TABLE mySecondReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime
)
ENGINE = ReplacingMergeTree(eventTime)
ORDER BY key;

INSERT INTO mySecondReplacingMT Values (1, 'first', '2020-01-01 01:01:01');
INSERT INTO mySecondReplacingMT Values (1, 'second', '2020-01-01 00:00:00');

SELECT * FROM mySecondReplacingMT FINAL;

┌─key─┬─someCol─┬───────────eventTime─┐
│   1 │ first   │ 2020-01-01 01:01:01 │
└─────┴─────────┴─────────────────────┘
```

### is_deleted {#is_deleted}

`is_deleted` — 在合并时用于确定这一行中的数据是否表示状态或要删除的列的名称；`1` 是“已删除”行，`0` 是“状态”行。

  列数据类型 — `UInt8`。

:::note
仅当使用 `ver` 时，`is_deleted` 才能启用。

无论对数据进行何种操作，版本都应增加。如果两个插入的行具有相同的版本号，则保留最后插入的行。

默认情况下，ClickHouse 将保留某个键的最后一行，即使该行是删除行。这是为了确保可以安全插入任何版本较低的未来行，删除行仍然会被应用。

要永久删除此类删除行，请启用表设置 `allow_experimental_replacing_merge_with_cleanup`，并且：

1. 设置表设置 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`、`min_age_to_force_merge_on_partition_only` 和 `min_age_to_force_merge_seconds`。如果分区中的所有部分都大于 `min_age_to_force_merge_seconds`，ClickHouse 将将它们全部合并为一个部分并删除任何删除行。

2. 手动运行 `OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 'partition_id'] FINAL CLEANUP`。
:::

示例：
```sql
-- 使用 ver 和 is_deleted
CREATE OR REPLACE TABLE myThirdReplacingMT
(
    `key` Int64,
    `someCol` String,
    `eventTime` DateTime,
    `is_deleted` UInt8
)
ENGINE = ReplacingMergeTree(eventTime, is_deleted)
ORDER BY key
SETTINGS allow_experimental_replacing_merge_with_cleanup = 1;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 01:01:01', 0);
INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 01:01:01', 1);

select * from myThirdReplacingMT final;

0 rows in set. Elapsed: 0.003 sec.

-- 删除带有 is_deleted 的行
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 00:00:00', 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

## 查询子句 {#query-clauses}

在创建 `ReplacingMergeTree` 表时，与创建 `MergeTree` 表时所需的 [子句](../../../engines/table-engines/mergetree-family/mergetree.md) 相同。

<details markdown="1">

<summary>创建表的弃用方法</summary>

:::note
在新项目中不要使用此方法，如果可能的话，将旧项目切换到上述描述的方法。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

除 `ver` 之外的所有参数在 `MergeTree` 中具有相同的含义。

- `ver` - 版本列。可选参数。有关描述，请参见上述文本。

</details>

## 查询时间去重与 FINAL {#query-time-de-duplication--final}

在合并时，ReplacingMergeTree 识别重复行，使用 `ORDER BY` 列的值（用于创建表）作为唯一标识符，并仅保留最高版本。但是，这仅提供最终的正确性 - 它不保证行会被去重，因此您不应依赖它。因此，由于更新和删除行在查询中的考虑，查询可能会产生不正确的答案。

为了获得正确的答案，用户需要通过查询时间去重和删除移除来补充后台合并。这可以通过使用 `FINAL` 操作符来实现。例如，考虑以下示例：

```sql
CREATE TABLE rmt_example
(
    `number` UInt16
)
ENGINE = ReplacingMergeTree
ORDER BY number

INSERT INTO rmt_example SELECT floor(randUniform(0, 100)) AS number
FROM numbers(1000000000)

0 rows in set. Elapsed: 19.958 sec. Processed 1.00 billion rows, 8.00 GB (50.11 million rows/s., 400.84 MB/s.)
```
没有使用 `FINAL` 的查询会产生不正确的计数（确切结果将根据合并而有所不同）：

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

添加 `FINAL` 会产生正确的结果：

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

有关 `FINAL` 的更多详细信息，包括如何优化 `FINAL` 性能，我们建议阅读我们的 [详细指南关于 ReplacingMergeTree](/guides/replacing-merge-tree)。
