---
'description': '与 MergeTree 不同，它通过相同排序键值 (`ORDER BY` 表部分，而不是 `PRIMARY KEY`) 来移除重复条目。'
'sidebar_label': 'ReplacingMergeTree'
'sidebar_position': 40
'slug': '/engines/table-engines/mergetree-family/replacingmergetree'
'title': 'ReplacingMergeTree'
---


# ReplacingMergeTree

该引擎与 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) 的不同之处在于它删除具有相同 [sorting key](../../../engines/table-engines/mergetree-family/mergetree.md) 值的重复条目（`ORDER BY` 表部分，而不是 `PRIMARY KEY`）。

数据去重仅在合并时发生。合并在背景中以未知的时间进行，因此无法进行计划。一些数据可能会保持未处理状态。尽管可以使用 `OPTIMIZE` 查询运行非计划性合并，但不要依赖它，因为 `OPTIMIZE` 查询将读取和写入大量数据。

因此，`ReplacingMergeTree` 适合在后台清除重复数据以节省空间，但不能保证不存在重复项。

:::note
有关 ReplacingMergeTree 的详细指南，包括最佳实践和如何优化性能，可以在 [这里](/guides/replacing-merge-tree) 找到。
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

有关请求参数的描述，请参阅 [statement description](../../../sql-reference/statements/create/table.md)。

:::note
行的唯一性由 `ORDER BY` 表部分确定，而不是由 `PRIMARY KEY`。
:::

## ReplacingMergeTree 参数 {#replacingmergetree-parameters}

### ver {#ver}

`ver` — 版本号列。类型为 `UInt*`、`Date`、`DateTime` 或 `DateTime64`。可选参数。

在合并时，`ReplacingMergeTree` 会从所有具有相同排序键的行中仅保留一个：

- 如果未设置 `ver`，则选择中的最后一行。选择是一组参与合并的一组分区中的行。最近创建的分区（最后插入的）将在选择中排在最后。因此，在去重之后，对于每个唯一排序键，来自最近插入的最后一行将保留下来。
- 如果指定了 `ver`，则保留最大版本的行。如果 `ver` 对于几行相同，则将对它们应用“如果未指定 `ver`”的规则，即保留最近插入的行。

示例：

```sql
-- without ver - the last inserted 'wins'
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


-- with ver - the row with the biggest ver 'wins'
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

`is_deleted` — 在合并过程中用于判断该行数据是否表示状态或需被删除的列名称；`1` 为“已删除”行，`0` 为“状态”行。

列数据类型 — `UInt8`。

:::note
仅在使用 `ver` 时，可以启用 `is_deleted`。

无论对数据执行何种操作，版本应增加。如果两个插入的行具有相同的版本号，则保留最后插入的行。

默认情况下，即使该行是删除行，ClickHouse 也会保留某个键的最后一行。这是为了确保可以安全地插入任何未来具有较低版本的行，并且删除行仍会被应用。

要永久删除这些删除行，请启用表设置 `allow_experimental_replacing_merge_with_cleanup`，并执行以下任一操作：

1. 设置表设置 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`、`min_age_to_force_merge_on_partition_only` 和 `min_age_to_force_merge_seconds`。如果分区中的所有分区片段均超过 `min_age_to_force_merge_seconds`，ClickHouse 将将它们全部合并为一个单一的分区并移除任何删除行。

2. 手动运行 `OPTIMIZE TABLE table [PARTITION partition | PARTITION ID 'partition_id'] FINAL CLEANUP`。
:::

示例：
```sql
-- with ver and is_deleted
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

-- delete rows with is_deleted
OPTIMIZE TABLE myThirdReplacingMT FINAL CLEANUP;

INSERT INTO myThirdReplacingMT Values (1, 'first', '2020-01-01 00:00:00', 0);

select * from myThirdReplacingMT final;

┌─key─┬─someCol─┬───────────eventTime─┬─is_deleted─┐
│   1 │ first   │ 2020-01-01 00:00:00 │          0 │
└─────┴─────────┴─────────────────────┴────────────┘
```

## 查询子句 {#query-clauses}

在创建 `ReplacingMergeTree` 表时需要与创建 `MergeTree` 表时相同的 [子句](../../../engines/table-engines/mergetree-family/mergetree.md)。

<details markdown="1">

<summary>创建表的已弃用方法</summary>

:::note
在新项目中不要使用此方法，如果可能，请将旧项目切换到上述描述的方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

除 `ver` 外的所有参数在 `MergeTree` 中具有相同的含义。

- `ver` - 版本列。可选参数。有关描述，请参见上述文本。

</details>

## 查询时间去重 & FINAL {#query-time-de-duplication--final}

在合并时，ReplacingMergeTree 识别重复行，使用 `ORDER BY` 列的值（用于创建表）作为唯一标识符，保留唯一标识符的最高版本。然而，这仅提供最终正确性 - 并不保证行会被去重，您不应依赖它。因此，查询可能会由于更新和删除行被考虑在内而产生不正确的答案。

为了获得正确的答案，用户需要在后台合并的基础上补充查询时间的去重和删除。这可以使用 `FINAL` 操作符来实现。例如，考虑以下示例：

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
不使用 `FINAL` 的查询产生不正确的计数（确切结果将根据合并而有所不同）：

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

添加 `FINAL` 产生正确的结果：

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

有关 `FINAL` 的进一步详细信息，包括如何优化 `FINAL` 性能，我们建议您阅读我们的 [关于 ReplacingMergeTree 的详细指南](/guides/replacing-merge-tree)。
