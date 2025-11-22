---
description: '统计行数或非 NULL 值的个数。'
sidebar_position: 120
slug: /sql-reference/aggregate-functions/reference/count
title: 'count'
doc_type: 'reference'
---

# count

计算行数或非 NULL 值的数量。

ClickHouse 支持以下 `count` 语法：

* `count(expr)` 或 `COUNT(DISTINCT expr)`。
* `count()` 或 `COUNT(*)`。`count()` 语法是 ClickHouse 特有的。

**参数**

该函数可以接受：

* 零个参数。
* 一个[表达式](/sql-reference/syntax#expressions)。

**返回值**

* 如果函数在没有参数的情况下被调用，则统计行数。
* 如果传入了[表达式](/sql-reference/syntax#expressions)，则函数统计该表达式返回非 NULL 的次数。如果表达式返回的是 [Nullable](../../../sql-reference/data-types/nullable.md) 类型的值，则 `count` 的结果依然不是 `Nullable`。如果对所有行该表达式都返回 `NULL`，函数返回 0。

无论哪种情况，返回值的类型都是 [UInt64](../../../sql-reference/data-types/int-uint.md)。

**细节**

ClickHouse 支持 `COUNT(DISTINCT ...)` 语法。该语法的行为取决于 [count&#95;distinct&#95;implementation](../../../operations/settings/settings.md#count_distinct_implementation) 设置。该设置定义执行此操作时使用的 [uniq*](/sql-reference/aggregate-functions/reference/uniq) 函数。默认使用 [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) 函数。

`SELECT count() FROM table` 查询默认会使用 MergeTree 的元数据进行优化。如果需要使用行级安全控制，请通过 [optimize&#95;trivial&#95;count&#95;query](/operations/settings/settings#optimize_trivial_count_query) 设置禁用此优化。

此外，可以通过启用 [optimize&#95;functions&#95;to&#95;subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置来优化 `SELECT count(nullable_column) FROM table` 查询。当 `optimize_functions_to_subcolumns = 1` 时，函数只读取 [null](../../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取并处理整列数据。查询 `SELECT count(n) FROM table` 会被转换为 `SELECT sum(NOT n.null) FROM table`。

**提升 COUNT(DISTINCT expr) 的性能**

如果 `COUNT(DISTINCT expr)` 查询较慢，可以考虑为查询添加 [`GROUP BY`](/sql-reference/statements/select/group-by) 子句，因为这有助于提升并行度。还可以使用[投影](../../../sql-reference/statements/alter/projection.md)，在与 `COUNT(DISTINCT target_col)` 一起使用的目标列上创建索引。

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

此示例表明，`count(DISTINCT num)` 会根据 `count_distinct_implementation` 的设置值由 `uniqExact` 函数来执行。
