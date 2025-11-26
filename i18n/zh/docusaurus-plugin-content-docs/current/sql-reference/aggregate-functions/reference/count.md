---
description: '计算行数或非 NULL 值的个数。'
sidebar_position: 120
slug: /sql-reference/aggregate-functions/reference/count
title: 'count'
doc_type: 'reference'
---

# count

统计行数或非 NULL 值的数量。

ClickHouse 支持以下 `count` 语法形式：

* `count(expr)` 或 `COUNT(DISTINCT expr)`。
* `count()` 或 `COUNT(*)`。`count()` 语法是 ClickHouse 特有的。

**参数**

该函数可以接受：

* 零个参数。
* 一个[表达式](/sql-reference/syntax#expressions)。

**返回值**

* 如果函数在没有参数的情况下被调用，则统计行数。
* 如果传入了[表达式](/sql-reference/syntax#expressions)，则函数统计该表达式返回非 NULL 的次数。如果表达式返回的是 [Nullable](../../../sql-reference/data-types/nullable.md) 类型的值，则 `count` 的结果仍然不是 `Nullable`。如果该表达式对所有行都返回 `NULL`，函数返回 0。

在这两种情况下，返回值的类型都是 [UInt64](../../../sql-reference/data-types/int-uint.md)。

**详情**

ClickHouse 支持 `COUNT(DISTINCT ...)` 语法。这种写法的行为取决于 [count&#95;distinct&#95;implementation](../../../operations/settings/settings.md#count_distinct_implementation) 设置。它定义执行该操作时使用哪个 [uniq*](/sql-reference/aggregate-functions/reference/uniq) 函数。默认使用 [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) 函数。

`SELECT count() FROM table` 查询默认会利用 MergeTree 的元数据进行优化。如果你需要使用行级安全控制（row-level security），请通过 [optimize&#95;trivial&#95;count&#95;query](/operations/settings/settings#optimize_trivial_count_query) 设置禁用此优化。

同时，可以通过启用 [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置来优化 `SELECT count(nullable_column) FROM table` 查询。当 `optimize_functions_to_subcolumns = 1` 时，函数只会读取 [null](../../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取并处理整个列的数据。查询 `SELECT count(n) FROM table` 会被重写为 `SELECT sum(NOT n.null) FROM table`。

**改进 COUNT(DISTINCT expr) 的性能**

如果你的 `COUNT(DISTINCT expr)` 查询速度较慢，考虑添加 [`GROUP BY`](/sql-reference/statements/select/group-by) 子句以提升并行化能力。你也可以使用[投影](../../../sql-reference/statements/alter/projection.md)，在 `COUNT(DISTINCT target_col)` 所使用的目标列上创建索引。

**示例**

示例 1：

```sql
SELECT count() FROM t
```

```text
┌─count()─┐
│       5 │
└─────────┘
```

示例 2：

```sql
SELECT name, value FROM system.settings WHERE name = 'count_distinct_implementation'
```

```text
┌─name──────────────────────────┬─value─────┐
│ count_distinct_implementation │ uniqExact │
└───────────────────────────────┴───────────┘
```

```sql
SELECT count(DISTINCT num) FROM t
```

```text
┌─uniqExact(num)─┐
│              3 │
└────────────────┘
```

此示例表明，根据 `count_distinct_implementation` 设置的值，`count(DISTINCT num)` 会由 `uniqExact` 函数执行。
