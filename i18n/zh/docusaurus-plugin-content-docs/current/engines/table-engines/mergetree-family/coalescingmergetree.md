---
description: 'CoalescingMergeTree 继承自 MergeTree 引擎。其主要特性是在数据片段合并时，能够为每列自动保留最后一个非空值。'
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
此表引擎自 25.6 版本起在 OSS 和 Cloud 中均可用。
:::

该引擎继承自 [MergeTree](/engines/table-engines/mergetree-family/mergetree)。关键差异在于数据部分（parts）的合并方式：对于 `CoalescingMergeTree` 表，ClickHouse 会将所有具有相同主键（或者更准确地说，相同[排序键](../../../engines/table-engines/mergetree-family/mergetree.md)）的行替换为一行，其中每一列都包含该列最新的非 NULL 值。

这支持列级 upsert，这意味着可以只更新特定列，而无需更新整行。

`CoalescingMergeTree` 适用于在非键列中使用 Nullable 类型的场景。如果列不是 Nullable，则其行为与 [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree) 相同。



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

有关请求参数的说明,请参阅[请求说明](../../../sql-reference/statements/create/table.md)。

### CoalescingMergeTree 的参数 {#parameters-of-coalescingmergetree}

#### 列 {#columns}

`columns` - 包含需要合并值的列名的元组。可选参数。
这些列必须是数值类型,且不能在分区键或排序键中。

如果未指定 `columns`,ClickHouse 将合并所有不在排序键中的列的值。

### 查询子句 {#query-clauses}

创建 `CoalescingMergeTree` 表时,需要与创建 `MergeTree` 表相同的[子句](../../../engines/table-engines/mergetree-family/mergetree.md)。

<details markdown="1">

<summary>已弃用的建表方法</summary>

:::note
请勿在新项目中使用此方法,如有可能,请将旧项目切换到上述方法。
:::

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE [=] CoalescingMergeTree(date-column [, sampling_expression], (primary, key), index_granularity, [columns])
```

除 `columns` 外的所有参数与 `MergeTree` 中的含义相同。

- `columns` — 包含需要求和的列名的元组。可选参数。有关说明,请参阅上文。

</details>


## 使用示例 {#usage-example}

考虑以下表结构:

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

向表中插入数据:

```sql
INSERT INTO test_table VALUES(1, NULL, NULL, '2025-01-01'), (2, 10, 'test', NULL);
INSERT INTO test_table VALUES(1, 42, 'win', '2025-02-01');
INSERT INTO test_table(key, value_date) VALUES(2, '2025-02-01');
```

查询结果如下所示:

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

获取正确最终结果的推荐查询方式:

```sql
SELECT * FROM test_table FINAL ORDER BY key;
```

```text
┌─key─┬─value_int─┬─value_string─┬─value_date─┐
│   1 │        42 │ win          │ 2025-02-01 │
│   2 │        10 │ test         │ 2025-02-01 │
└─────┴───────────┴──────────────┴────────────┘
```

使用 `FINAL` 修饰符会强制 ClickHouse 在查询时应用合并逻辑,确保获得每列正确合并后的"最新"值。这是从 CoalescingMergeTree 表查询数据时最安全、最准确的方法。

:::note

如果底层数据分区尚未完全合并,使用 `GROUP BY` 的方式可能会返回不正确的结果。

```sql
SELECT key, last_value(value_int), last_value(value_string), last_value(value_date)  FROM test_table GROUP BY key; -- 不推荐
```

:::
