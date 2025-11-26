---
description: 'CoalescingMergeTree 继承自 MergeTree 引擎。其关键特性是在数据部分（part）合并期间，能够自动保留每列最后一个非空（non-null）值。'
sidebar_label: 'CoalescingMergeTree'
sidebar_position: 50
slug: /engines/table-engines/mergetree-family/coalescingmergetree
title: 'CoalescingMergeTree 表引擎'
keywords: ['CoalescingMergeTree']
show_related_blogs: true
doc_type: 'reference'
---



# CoalescingMergeTree 表引擎

:::note Available from version 25.6
此表引擎从 25.6 及更高版本开始在 OSS 和 Cloud 中可用。
:::

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/mergetree)。关键区别在于数据部分的合并方式：对于 `CoalescingMergeTree` 表，ClickHouse 会将所有具有相同主键（更准确地说，相同的[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行合并为一行，该行在每一列上都包含最新的非 NULL 值。

这实现了列级别的 upsert（插入或更新），也就是说，您可以只更新特定列，而不是整行。

`CoalescingMergeTree` 旨在与非键列中的 Nullable 类型配合使用。如果这些列不是 Nullable，其行为与 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 相同。



## 创建表

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

有关请求参数的说明，请参阅[请求描述](../../../sql-reference/statements/create/table.md)。

### CoalescingMergeTree 的参数

#### 列

`columns` - 一个包含需要合并其值的列名的元组（tuple）。可选参数。
这些列必须是数值类型，并且不能出现在分区键或排序键中。

如果未指定 `columns`，ClickHouse 会合并所有不在排序键中的列的值。

### 查询子句

在创建 `CoalescingMergeTree` 表时，所需的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)与创建 `MergeTree` 表时相同。

<details markdown="1">
  <summary>已弃用的建表方法</summary>

  :::note
  不要在新项目中使用此方法，并尽可能将旧项目切换到上面描述的方法。
  :::

  ```sql
  CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
  (
      name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
      name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
      ...
  ) ENGINE [=] CoalescingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
  ```

  除 `columns` 之外的所有参数与 `MergeTree` 中的含义相同。

  * `columns` — 一个包含列名的元组（tuple），这些列的值将被求和。可选参数。相关说明见上文。
</details>


## 使用示例

请看下表：

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

结果将如下：

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

获取最终正确结果的推荐查询：

```sql
SELECT * FROM test_table FINAL ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   2 │        10 │ test         │ 2025-02-01 │
└─────┴───────────┴──────────────┴────────────┘
```

在查询中使用 `FINAL` 修饰符会强制 ClickHouse 在查询阶段应用合并逻辑，确保能够为每一列得到正确、已合并的“最新”值。在从 CoalescingMergeTree 表查询时，这是最安全且最精确的方法。

:::note

如果底层数据分片（parts）尚未完全合并，使用 `GROUP BY` 的方式可能会返回不正确的结果。

```sql
SELECT key, last_value(value_int), last_value(value_string), last_value(value_date)  FROM test_table GROUP BY key; -- 不建议使用。
```

:::
