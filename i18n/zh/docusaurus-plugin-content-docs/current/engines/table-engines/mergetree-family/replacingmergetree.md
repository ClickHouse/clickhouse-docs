---
description: '不同于 MergeTree，它会移除具有相同排序键值（表定义中的 `ORDER BY` 部分，而不是 `PRIMARY KEY`）的重复记录。'
sidebar_label: 'ReplacingMergeTree'
sidebar_position: 40
slug: /engines/table-engines/mergetree-family/replacingmergetree
title: 'ReplacingMergeTree 表引擎'
doc_type: 'reference'
---



# ReplacingMergeTree 表引擎 {#replacingmergetree-table-engine}

该引擎与 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) 的不同之处在于，它会删除具有相同[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)值的重复记录（指表的 `ORDER BY` 子句，而非 `PRIMARY KEY`）。

数据去重仅在合并期间发生。合并在后台于未知时间执行，因此无法提前规划，且部分数据可能长时间保持未处理状态。尽管可以通过 `OPTIMIZE` 查询触发一次临时合并，但不要依赖这种方式，因为 `OPTIMIZE` 查询会读写大量数据。

因此，`ReplacingMergeTree` 适用于在后台清理重复数据以节省存储空间，但并不能保证数据中完全不存在重复项。

:::note
关于 ReplacingMergeTree 的详细指南（包括最佳实践以及性能优化方法）可在[此处](/guides/replacing-merge-tree)查阅。
:::



## 创建数据表 {#creating-a-table}

```sql
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

有关请求参数的说明，请参阅[语句说明](../../../sql-reference/statements/create/table.md)。

:::note
行的唯一性是由表的 `ORDER BY` 子句决定的，而不是由 `PRIMARY KEY` 决定。
:::


## ReplacingMergeTree 参数 {#replacingmergetree-parameters}

### `ver` {#ver}

`ver` — 带有版本号的列。类型为 `UInt*`、`Date`、`DateTime` 或 `DateTime64`。可选参数。

在合并时，`ReplacingMergeTree` 会在所有具有相同排序键的行中只保留一行：

* 如果未设置 `ver`，则保留选集中最后一行。一次选集是指参与该次合并的多个数据 part 中的一组行。最新创建的 part（最后一次插入）会排在选集的最后。因此，去重后，对于每个唯一排序键，将保留最近一次插入中的最后一行。
* 如果指定了 `ver`，则保留具有最大版本号的行。如果多行的 `ver` 相同，则对这些行应用“未指定 `ver` 时”的规则，即保留最新插入的那一行。

示例：

```sql
-- 没有 ver - 最后插入的'获胜'
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


-- 有 ver - 具有最大 ver 的行'获胜'
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

### `is_deleted` {#is_deleted}

`is_deleted` — 在合并过程中用于确定该行数据表示的是当前状态还是应被删除的列名；`1` 表示“删除”行，`0` 表示“状态”行。

列数据类型 — `UInt8`。

:::note
只有在使用 `ver` 时才可以启用 `is_deleted`。

无论对数据执行何种操作，都应增加版本号。如果插入的两行数据具有相同的版本号，则会保留最后插入的那一行。

默认情况下，即使最后一行是删除行，ClickHouse 也会为某个键保留最后一行。这样可以确保将来插入版本号更低的行时，仍然可以安全插入，并且删除行依然会被应用。

要永久删除此类删除行，请启用表设置 `allow_experimental_replacing_merge_with_cleanup`，并执行以下任一操作：

1. 设置表设置项 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`、`min_age_to_force_merge_on_partition_only` 和 `min_age_to_force_merge_seconds`。如果某个分区中的所有 part 的存在时间都超过 `min_age_to_force_merge_seconds`，ClickHouse 会将它们全部合并为单个 part 并移除所有删除行。

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
```


select * from myThirdReplacingMT final;

0 行记录。耗时：0.003 秒。

-- 删除带有 is&#95;deleted 的行
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, &#39;first&#39;, &#39;2020-01-01 00:00:00&#39;, 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is&#95;deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘

```
```


## 查询子句 {#query-clauses}

在创建 `ReplacingMergeTree` 表时，需要使用与创建 `MergeTree` 表时相同的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)。

<details markdown="1">

<summary>已弃用的建表方法</summary>

:::note
不要在新项目中使用此方法，如有可能，请将旧项目迁移到上面所述的方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

除 `ver` 之外的所有参数与 `MergeTree` 中的含义相同。

- `ver` - 版本列。可选参数。相关说明参见上文。
</details>



## 查询时去重 &amp; FINAL {#query-time-de-duplication--final}

在合并阶段，ReplacingMergeTree 使用 `ORDER BY` 列（用于创建表）中的值作为唯一标识来识别重复行，并仅保留版本最高的那一行。不过，这种方式只能在最终状态上接近正确——它并不保证所有重复行都会被去重，因此不应将其作为严格依赖。由于更新和删除记录在查询时仍可能被计算在内，查询结果因此可能不正确。

为了获得准确的结果，用户需要在后台合并的基础上，再配合查询时去重以及删除记录的剔除。这可以通过使用 `FINAL` 运算符来实现。例如，考虑以下示例：

```sql
CREATE TABLE rmt_example
(
    `number` UInt16
)
ENGINE = ReplacingMergeTree
ORDER BY number

INSERT INTO rmt_example SELECT floor(randUniform(0, 100)) AS number
FROM numbers(1000000000)

返回 0 行。耗时：19.958 秒。处理了 10 亿行，8.00 GB（每秒 5011 万行，400.84 MB/s）。
```

在不使用 `FINAL` 的情况下进行查询会返回不正确的计数结果（具体数值会因合并情况而异）：

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

返回 1 行。耗时: 0.002 秒。
```

添加 FINAL 后即可得到正确的结果：

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 行在集合中。耗时: 0.002 秒。
```

若需了解 `FINAL` 的更多细节，包括如何优化 `FINAL` 的性能，建议阅读我们的 [ReplacingMergeTree 详细指南](/guides/replacing-merge-tree)。
