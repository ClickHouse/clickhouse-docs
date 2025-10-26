---
'description': 'CoalescingMergeTree 继承自 MergeTree 引擎。其主要特征是在分区合并期间自动存储每个列的最后非空值。'
'sidebar_label': 'CoalescingMergeTree'
'sidebar_position': 50
'slug': '/engines/table-engines/mergetree-family/coalescingmergetree'
'title': 'CoalescingMergeTree'
'keywords':
- 'CoalescingMergeTree'
'show_related_blogs': true
'doc_type': 'reference'
---


# CoalescingMergeTree

:::note 从版本 25.6 开始提供
该表引擎从版本 25.6 及更高版本在 OSS 和 Cloud 中提供。
:::

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/mergetree)。主要区别在于数据分片的合并方式：对于 `CoalescingMergeTree` 表，ClickHouse 会将所有具有相同主键（或者更准确地说，具有相同的 [排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行替换为一行，该行包含每列的最新非 NULL 值。

这使得列级的 upserts 成为可能，这意味着您可以仅更新特定的列，而不是整个行。

`CoalescingMergeTree` 旨在与非键列中的 Nullable 类型一起使用。如果列不是 Nullable，则行为与 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 相同。

## 创建表 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = CoalescingMergeTree([columns])
[PARTITION BY expr]
[ORDER BY expr]
[SAMPLE BY expr]
[SETTINGS name=value, ...]
```

有关请求参数的描述，请参阅 [请求描述](../../../sql-reference/statements/create/table.md)。

### CoalescingMergeTree 的参数 {#parameters-of-coalescingmergetree}

#### 列 {#columns}

`columns` - 一个包含将要合并的列名的元组。可选参数。
    这些列必须是数字类型，并且不得在分区或排序键中。

 如果未指定 `columns`，ClickHouse 将合并所有不在排序键中的列的值。

### 查询子句 {#query-clauses}

创建 `CoalescingMergeTree` 表时，所需的 [子句](../../../engines/table-engines/mergetree-family/mergetree.md) 与创建 `MergeTree` 表时相同。

<details markdown="1">

<summary>创建表的弃用方法</summary>

:::note
在新项目中不要使用此方法，如果可能，请将旧项目切换到上述方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] CoalescingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

除了 `columns` 之外，所有参数的含义与 `MergeTree` 相同。

- `columns` — 一个包含将被合并的列名的元组。可选参数。有关描述，请参见上面的文字。

</details>

## 示例 {#usage-example}

考虑以下表：

```sql
CREATE TABLE test_table
(
    key UInt64,
    value_int Nullable(UInt32),
    value_string Nullable(String),
    value_date Nullable(Date)
)
ENGINE = CoalescingMergeTree()
ORDER BY key
```

向其中插入数据：

```sql
INSERT INTO test_table VALUES(1, NULL, NULL, '2025-01-01'), (2, 10, 'test', NULL);
INSERT INTO test_table VALUES(1, 42, 'win', '2025-02-01');
INSERT INTO test_table(key, value_date) VALUES(2, '2025-02-01');
```

结果将如下所示：

```sql
SELECT * FROM test_table ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   1 │      ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │ 2025-01-01 │
│   2 │      ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ         │ 2025-02-01 │
│   2 │        10 │ test         │       ᴺᵁᴸᴸ │
└─────┴───────────┴──────────────┴────────────┘
```

推荐的查询以获得正确和最终的结果：

```sql
SELECT * FROM test_table FINAL ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   2 │        10 │ test         │ 2025-02-01 │
└─────┴───────────┴──────────────┴────────────┘
```

使用 `FINAL` 修饰符强制 ClickHouse 在查询时应用合并逻辑，确保您获得每列的正确合并的“最新”值。这是在从 CoalescingMergeTree 表中查询时最安全和最准确的方法。

:::note

如果基础分片尚未完全合并，则使用 `GROUP BY` 的方法可能会返回不正确的结果。

```sql
SELECT key, last_value(value_int), last_value(value_string), last_value(value_date)  FROM test_table GROUP BY key; -- Not recommended.
```

:::
