
# ReplacingMergeTree

该引擎与 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) 的不同之处在于它通过移除具有相同 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md) 值（`ORDER BY` 表部分，而非 `PRIMARY KEY`）的重复条目来实现数据去重。

数据去重仅在合并期间发生。合并在后台以未知时间发生，因此无法计划。某些数据可能仍未处理。尽管您可以使用 `OPTIMIZE` 查询运行未调度的合并，但不应对此抱有期待，因为 `OPTIMIZE` 查询会读取和写入大量数据。

因此，`ReplacingMergeTree` 适合在后台清理重复数据以节省空间，但它并不能保证没有重复项。

:::note
关于 ReplacingMergeTree 的详细指南，包括最佳实践和如何优化性能，可以在 [此处](/guides/replacing-merge-tree) 获取。
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

有关请求参数的描述，请参见 [语句描述](../../../sql-reference/statements/create/table.md)。

:::note
行的唯一性由 `ORDER BY` 表部分确定，而不是 `PRIMARY KEY`。
:::

## ReplacingMergeTree 参数 {#replacingmergetree-parameters}

### ver {#ver}

`ver` — 版本号列。类型为 `UInt*`、`Date`、`DateTime` 或 `DateTime64`。可选参数。

在合并时，`ReplacingMergeTree` 会从所有具有相同排序键的行中保留仅一行：

   - 如果未设置 `ver`，则选择中最后一行。选择是参与合并的一组分部中的一组行。最近创建的部分（最后插入）将是选择中的最后一行。因此，在去重后，最近插入的每个唯一排序键的最后一行将被保留。
   - 如果指定了 `ver`，则选择最大版本。如果多个行的 `ver` 相同，则将对它们使用“如果 `ver` 未指定”规则，即最近插入的行将被保留。

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

`is_deleted` — 在合并期间用于确定此行数据是否表示状态或将被删除的列名；`1` 为“已删除”行，`0` 为“状态”行。

  列数据类型 — `UInt8`。

:::note
仅在使用 `ver` 时可以启用 `is_deleted`。

无论对数据执行何种操作，版本号应增加。如果两个插入行具有相同的版本号，则保留最后插入的行。

默认情况下，ClickHouse 将保留键的最后一行，即使该行是删除行。这是为了确保将来具有较低版本的行可以安全地插入，而删除行仍然会被应用。

要永久删除此类删除行，请启用表设置 `allow_experimental_replacing_merge_with_cleanup`，并且：

1. 设置表设置 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`、`min_age_to_force_merge_on_partition_only` 和 `min_age_to_force_merge_seconds`。如果分区中的所有部分都超过 `min_age_to_force_merge_seconds`，ClickHouse 将把它们全部合并为一个部分并删除任何删除行。

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

在创建 `ReplacingMergeTree` 表时，所需的 [子句](../../../engines/table-engines/mergetree-family/mergetree.md) 与创建 `MergeTree` 表时相同。

<details markdown="1">

<summary>创建表的弃用方法</summary>

:::note
在新项目中请勿使用此方法，并尽可能将旧项目切换到上述描述的方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

除了 `ver` 外，所有参数的含义与 `MergeTree` 中相同。

- `ver` - 版本号列。可选参数。有关描述，请参见上述文本。

</details>

## 查询时间去重与 FINAL {#query-time-de-duplication--final}

在合并时，ReplacingMergeTree 通过使用 `ORDER BY` 列的值（用于创建表的列）作为唯一标识符，识别重复行并仅保留最高版本。然而，这仅提供最终正确性——并不能保证行将被去重，因此您不应对其抱有信心。因此，查询可能因为更新和删除行被纳入查询而产生错误的答案。

为了获得正确答案，用户需要通过查询时间去重和删除移除补充后台合并。这可以通过使用 `FINAL` 操作符来实现。例如，考虑以下示例：

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
未使用 `FINAL` 进行查询产生错误计数（精确结果将根据合并而有所不同）：

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

添加 final 产生正确结果：

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

有关 `FINAL` 的更多详细信息，包括如何优化 `FINAL` 性能，我们建议阅读我们的 [关于 ReplacingMergeTree 的详细指南](/guides/replacing-merge-tree)。
