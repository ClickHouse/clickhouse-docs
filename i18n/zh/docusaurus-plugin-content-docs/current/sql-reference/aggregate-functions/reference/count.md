---
'description': '计算行数或非空数值。'
'sidebar_position': 120
'slug': '/sql-reference/aggregate-functions/reference/count'
'title': '计数'
---




# count

计算行数或非 NULL 值的数量。

ClickHouse 支持以下 `count` 的语法：

- `count(expr)` 或 `COUNT(DISTINCT expr)`。
- `count()` 或 `COUNT(*)`。`count()` 语法是 ClickHouse 特有的。

**参数**

该函数可以接受：

- 零个参数。
- 一个 [表达式](/sql-reference/syntax#expressions)。

**返回值**

- 如果函数在没有参数的情况下被调用，则计算行数。
- 如果传递了 [表达式](/sql-reference/syntax#expressions)，则该函数计算该表达式返回非 NULL 值的次数。如果表达式返回一个 [Nullable](../../../sql-reference/data-types/nullable.md)-类型的值，则 `count` 的结果保持为非 `Nullable`。如果该表达式对于所有行都返回 `NULL`，则函数返回 0。

在这两种情况下，返回值的类型为 [UInt64](../../../sql-reference/data-types/int-uint.md)。

**详细信息**

ClickHouse 支持 `COUNT(DISTINCT ...)` 语法。该构造的行为取决于 [count_distinct_implementation](../../../operations/settings/settings.md#count_distinct_implementation) 设置。它定义了用于执行该操作的 [uniq\*](/sql-reference/aggregate-functions/reference/uniq) 函数。默认是使用 [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact) 函数。

`SELECT count() FROM table` 查询默认使用 MergeTree 的元数据进行了优化。如果需要使用行级安全，可以使用 [optimize_trivial_count_query](/operations/settings/settings#optimize_trivial_count_query) 设置来禁用优化。

然而 `SELECT count(nullable_column) FROM table` 查询可以通过启用 [optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns) 设置来优化。将 `optimize_functions_to_subcolumns = 1` 时，函数只读取 [null](../../../sql-reference/data-types/nullable.md#finding-null) 子列，而不是读取和处理整个列的数据。查询 `SELECT count(n) FROM table` 转换为 `SELECT sum(NOT n.null) FROM table`。

**提高 COUNT(DISTINCT expr) 性能**

如果你的 `COUNT(DISTINCT expr)` 查询较慢，可以考虑添加 [`GROUP BY`](/sql-reference/statements/select/group-by) 子句，因为这可以提高并行化。你还可以使用 [投影](../../../sql-reference/statements/alter/projection.md) 在与 `COUNT(DISTINCT target_col)` 一起使用的目标列上创建索引。

**示例**

示例 1:

```sql
SELECT count() FROM t
```

```text
┌─count()─┐
│       5 │
└─────────┘
```

示例 2:

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

此示例表明，根据 `count_distinct_implementation` 设置值，`count(DISTINCT num)` 是由 `uniqExact` 函数执行的。
