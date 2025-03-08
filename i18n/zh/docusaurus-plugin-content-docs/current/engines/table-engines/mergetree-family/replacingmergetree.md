---
slug: /engines/table-engines/mergetree-family/replacingmergetree
sidebar_position: 40
sidebar_label:  ReplacingMergeTree
title: "ReplacingMergeTree"
description: "与 MergeTree 的不同之处在于，它会删除具有相同排序键值 (`ORDER BY` 表部分，而不是 `PRIMARY KEY`) 的重复条目。"
---


# ReplacingMergeTree

该引擎与 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) 的不同之处在于，它会删除具有相同 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md) 值的重复条目（`ORDER BY` 表部分，而不是 `PRIMARY KEY`）。

数据去重仅在合并过程中发生。合并在后台以未知的时间发生，因此您无法对此进行计划。一些数据可能仍会保持未处理状态。虽然可以使用 `OPTIMIZE` 查询运行非计划的合并，但不要指望使用它，因为 `OPTIMIZE` 查询将读取和写入大量数据。

因此，`ReplacingMergeTree` 适合在后台清除重复数据以节省空间，但不保证没有重复。

:::note
有关 ReplacingMergeTree 的详细指南，包括最佳实践和如何优化性能，请访问 [这里](/guides/replacing-merge-tree)。
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

有关请求参数的描述，请参见 [statement description](../../../sql-reference/statements/create/table.md)。

:::note
行的唯一性由 `ORDER BY` 表部分决定，而不是 `PRIMARY KEY`。
:::

## ReplacingMergeTree 参数 {#replacingmergetree-parameters}

### ver {#ver}

`ver` — 版本号列。类型为 `UInt*`、`Date`、`DateTime` 或 `DateTime64`。可选参数。

在合并时，`ReplacingMergeTree` 会从所有具有相同排序键的行中保留唯一一行：

   - 如果未设置 `ver`，则在选择中最后一行“胜出”。选择是一组参与合并的部分中的行。最近创建的部分（最后插入的内容）将是选择中的最后一项。因此，去重后，每个唯一排序键将保留来自最新插入的最后一行。
   - 如果指定了 `ver`，则保留具有最大版本的行。如果 `ver` 对于多行相同，那么它将使用“如果未指定 `ver`”的规则，即保留最近插入的行。

示例：

```sql
-- 不带 ver - 最后插入的“胜出”
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


-- 带 ver - 最大 ver 的行“胜出”
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

`is_deleted` — 在合并过程中用于确定该行数据是否表示已删除状态的列名；`1` 是“已删除”行，`0` 是“状态”行。

列数据类型为 `UInt8`。

:::note
`is_deleted` 只有在使用 `ver` 时才能启用。

只有在 `OPTIMIZE ... FINAL CLEANUP` 时，该行才会被删除。默认情况下不允许使用此 `CLEANUP` 特殊关键字，除非启用了 `allow_experimental_replacing_merge_with_cleanup` MergeTree 设置。

无论对数据执行何种操作，版本必须增加。如果两行插入的版本号相同，则保留最后插入的行。

:::

示例：
```sql
-- 带 ver 和 is_deleted
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

创建 `ReplacingMergeTree` 表时，所需的 [子句](../../../engines/table-engines/mergetree-family/mergetree.md) 与创建 `MergeTree` 表时相同。

<details markdown="1">

<summary>创建表的弃用方法</summary>

:::note
在新项目中请勿使用此方法，并且如果可能，请将旧项目切换到上述描述的方法。
:::

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

除 `ver` 之外的所有参数的含义与 `MergeTree` 中相同。

- `ver` - 版本列。可选参数。有关描述，请参见上文。

</details>

## 查询时去重 & FINAL {#query-time-de-duplication--final}

在合并时，ReplacingMergeTree 通过使用 `ORDER BY` 列的值（用于创建表）作为唯一标识符来识别重复行，并仅保留最高版本。然而，这仅提供最终的一致性——并不能保证行会被去重，因此您不应依赖它。因此，查询可能会由于更新和删除行在查询中被考虑而产生不正确的答案。

为了获得正确的答案，用户需要使用查询时的去重和删除移除来补充后台合并。可以使用 `FINAL` 运算符来实现。例如，请考虑以下示例：

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
不使用 `FINAL` 查询将产生不正确的计数（确切结果将根据合并而有所不同）：

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

有关 `FINAL` 的进一步详细信息，包括如何优化 `FINAL` 性能，我们建议阅读我们的 [关于 ReplacingMergeTree 的详细指南](/guides/replacing-merge-tree)。
