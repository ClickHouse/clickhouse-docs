---
'description': '与MergeTree不同之处在于它通过相同排序键值（`ORDER BY`表段，而不是`主键`）删除重复条目。'
'sidebar_label': 'ReplacingMergeTree'
'sidebar_position': 40
'slug': '/engines/table-engines/mergetree-family/replacingmergetree'
'title': 'ReplacingMergeTree'
---




# ReplacingMergeTree

该引擎与 [MergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) 的不同之处在于，它会删除具有相同 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md) 值的重复条目（表的 `ORDER BY` 部分，而不是 `PRIMARY KEY`）。

数据去重仅在合并期间发生。合并在后台以未知的时间进行，因此无法对此进行计划。一些数据可能会保持未处理状态。尽管可以使用 `OPTIMIZE` 查询手动触发合并，但不要指望依赖于它，因为 `OPTIMIZE` 查询将读取和写入大量数据。

因此，`ReplacingMergeTree` 适合在后台清理重复数据以节省空间，但不能保证不存在重复项。

:::note
有关 ReplacingMergeTree 的详细指南，包括最佳实践和如何优化性能，请访问 [这里](/guides/replacing-merge-tree)。
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
行的唯一性由 `ORDER BY` 表部分确定，而不是由 `PRIMARY KEY` 决定。
:::

## ReplacingMergeTree 参数 {#replacingmergetree-parameters}

### ver {#ver}

`ver` — 版本号列。类型为 `UInt*`、`Date`、`DateTime` 或 `DateTime64`。为可选参数。

在合并时，`ReplacingMergeTree` 仅保留具有相同排序键的所有行中的一行：

   - 如果未设置 `ver`，则为选择中最后一行。选择是一组参与合并的分区片段中的行。最近创建的分区（最后插入）将是选择中的最后一行。因此，在去重后，每个唯一排序键将保留最近插入的最后一行。
   - 如果指定了 `ver`，则为具有最大版本的那一行。如果 `ver` 对于多个行相同，则将适用“如果未指定 `ver`”的规则，即保留最近插入的行。

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

`is_deleted` — 在合并过程中用于确定该行中的数据是代表状态还是要删除的列名称；`1` 表示“已删除”行，`0` 表示“状态”行。

列数据类型 — `UInt8`。

:::note
仅当使用 `ver` 时，才能启用 `is_deleted`。

无论对数据进行哪种操作，版本号应增加。如果两个插入的行具有相同的版本号，则保留最后插入的行。

默认情况下，ClickHouse 将保留具有键的最后一行，即使该行是删除行。这是为了确保任何未来版本较低的行可以安全插入，删除行仍然会被应用。

要永久删除这样的删除行，请启用表设置 `allow_experimental_replacing_merge_with_cleanup` 并执行以下任一操作：

1. 设置表设置 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge`、`min_age_to_force_merge_on_partition_only` 和 `min_age_to_force_merge_seconds`。如果分区中的所有部分均超过 `min_age_to_force_merge_seconds`，ClickHouse 将所有它们合并为一个部分并删除任何删除行。

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

在创建 `ReplacingMergeTree` 表时，与创建 `MergeTree` 表时所需的相同 [子句](../../../engines/table-engines/mergetree-family/mergetree.md)。

<details markdown="1">

<summary>创建表的过时方法</summary>

:::note
在新项目中请勿使用此方法，如果可能，尽量将旧项目切换到上述方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] ReplacingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [ver])
```

除 `ver` 外，所有参数的含义与 `MergeTree` 中相同。

- `ver` - 版本列。可选参数。详细信息请参见上述文本。

</details>

## 查询时去重 & FINAL {#query-time-de-duplication--final}

在合并时，`ReplacingMergeTree` 识别重复行，使用 `ORDER BY` 列的值（用于创建表）作为唯一标识符，并仅保留最高版本。然而，这仅提供最终正确性——不能保证行会被去重，因此不应依赖于它。因此，由于更新和删除行在查询中被考虑，查询可能会产生不正确的结果。

为了获得正确的答案，用户需要将后台合并与查询时的去重和删除移除相结合。这可以通过使用 `FINAL` 操作符来实现。例如，考虑以下示例：

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
不使用 `FINAL` 查询产生了不正确的计数（精确结果将根据合并的不同而有所变化）：

```sql
SELECT count()
FROM rmt_example

┌─count()─┐
│     200 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

添加 `FINAL` 产生了正确的结果：

```sql
SELECT count()
FROM rmt_example
FINAL

┌─count()─┐
│     100 │
└─────────┘

1 row in set. Elapsed: 0.002 sec.
```

有关 `FINAL` 的更多详细信息，包括如何优化 `FINAL` 性能，建议阅读我们的 [ReplacingMergeTree 详细指南](/guides/replacing-merge-tree)。
