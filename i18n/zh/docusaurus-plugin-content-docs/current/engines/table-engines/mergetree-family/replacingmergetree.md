---
description: '与 MergeTree 不同，它会删除具有相同排序键值（表的 `ORDER BY` 子句，而非 `PRIMARY KEY`）的重复条目。'
sidebar_label: 'ReplacingMergeTree'
sidebar_position: 40
slug: /engines/table-engines/mergetree-family/replacingmergetree
title: 'ReplacingMergeTree 表引擎'
doc_type: 'reference'
---



# ReplacingMergeTree 表引擎

该引擎与 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) 的不同之处在于，它会删除具有相同[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)值的重复记录（基于表的 `ORDER BY` 子句，而不是 `PRIMARY KEY`）。

数据去重仅在合并期间发生。合并在后台于不确定的时间执行，因此无法对其进行规划。部分数据可能会保持未处理状态。尽管可以通过 `OPTIMIZE` 查询触发一次临时合并，但不要依赖这种方式，因为 `OPTIMIZE` 查询会读取和写入大量数据。

因此，`ReplacingMergeTree` 适用于在后台清理重复数据以节省空间，但并不保证完全没有重复记录。

:::note
关于 ReplacingMergeTree 的详细指南（包括最佳实践以及如何优化性能）请参见[此文](/guides/replacing-merge-tree)。
:::



## 创建表 {#creating-a-table}

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

有关请求参数的描述,请参阅[语句说明](../../../sql-reference/statements/create/table.md)。

:::note
行的唯一性由 `ORDER BY` 表部分决定,而非 `PRIMARY KEY`。
:::


## ReplacingMergeTree 参数 {#replacingmergetree-parameters}

### `ver` {#ver}

`ver` — 版本号列。类型为 `UInt*`、`Date`、`DateTime` 或 `DateTime64`。可选参数。

合并时,`ReplacingMergeTree` 从所有具有相同排序键的行中仅保留一行:

- 如果未设置 `ver`,则保留选择集中的最后一行。选择集是参与合并的数据分区集合中的行集合。最近创建的分区(最后一次插入)将是选择集中的最后一个。因此,去重后,每个唯一排序键将保留最近一次插入的最后一行。
- 如果指定了 `ver`,则保留版本号最大的行。如果多行的 `ver` 相同,则对这些行应用"未指定 `ver`"的规则,即保留最近插入的行。

示例:

```sql
-- 不使用 ver - 最后插入的行"获胜"
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


-- 使用 ver - 具有最大 ver 值的行"获胜"
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

`is_deleted` — 合并期间用于确定该行中的数据是表示状态还是将被删除的列名;`1` 表示"已删除"行,`0` 表示"状态"行。

列数据类型 — `UInt8`。

:::note
`is_deleted` 只能在使用 `ver` 时启用。

无论对数据执行何种操作,都应增加版本号。如果两个插入的行具有相同的版本号,则保留最后插入的行。

默认情况下,即使某行是删除行,ClickHouse 也会为某个键保留最后一行。这样可以安全地插入任何版本号较低的未来行,并且删除行仍将被应用。

要永久删除此类删除行,请启用表设置 `allow_experimental_replacing_merge_with_cleanup` 并执行以下任一操作:

1. 设置表设置 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`、`min_age_to_force_merge_on_partition_only` 和 `min_age_to_force_merge_seconds`。如果分区中的所有数据分区都早于 `min_age_to_force_merge_seconds`,ClickHouse 将把它们全部合并为单个数据分区并删除所有删除行。

2. 手动运行 `OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 'partition_id'] FINAL CLEANUP`。
   :::

示例:

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

0 rows in set. Elapsed: 0.003 sec.

-- 删除带有 is&#95;deleted 标记的行
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, &#39;first&#39;, &#39;2020-01-01 00:00:00&#39;, 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is&#95;deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘

```
```


## Query clauses {#query-clauses}

创建 `ReplacingMergeTree` 表时需要使用与创建 `MergeTree` 表相同的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)。

<details markdown="1">

<summary>已弃用的建表方法</summary>

:::note
请勿在新项目中使用此方法,如有可能,请将旧项目迁移至上述方法。
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

- `ver` - 版本列。可选参数。详细说明请参阅上文。

</details>


## 查询时去重与 FINAL {#query-time-de-duplication--final}

在合并时,ReplacingMergeTree 使用 `ORDER BY` 列(用于创建表)的值作为唯一标识符来识别重复行,并仅保留最高版本。然而,这仅提供最终一致性 - 它不保证行一定会被去重,您不应依赖此机制。因此,由于更新和删除的行会被纳入查询,查询可能会产生不正确的结果。

为了获得正确的结果,用户需要在后台合并的基础上补充查询时去重和删除移除操作。这可以通过使用 `FINAL` 操作符来实现。例如,请参考以下示例:

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

不使用 `FINAL` 进行查询会产生不正确的计数(确切结果会因合并情况而异):

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

添加 FINAL 会产生正确的结果:

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

有关 `FINAL` 的更多详细信息,包括如何优化 `FINAL` 性能,我们建议阅读 [ReplacingMergeTree 详细指南](/guides/replacing-merge-tree)。
