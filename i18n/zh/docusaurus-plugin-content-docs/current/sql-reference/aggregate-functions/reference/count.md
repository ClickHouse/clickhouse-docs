---
'description': '计算行数或非 NULL 值的数量。'
'sidebar_position': 120
'slug': '/sql-reference/aggregate-functions/reference/count'
'title': 'count'
'doc_type': 'reference'
---


# count

计算行数或非NULL值的数量。

ClickHouse支持以下`count`的语法：

- `count(expr)`或`COUNT(DISTINCT expr)`。
- `count()`或`COUNT(*)`。`count()`语法是ClickHouse特有的。

**参数**

该函数可以接受：

- 零个参数。
- 一个 [表达式](/sql-reference/syntax#expressions)。

**返回值**

- 如果函数不带参数调用，则计算行数。
- 如果传递了[表达式](/sql-reference/syntax#expressions)，则函数计算该表达式返回非NULL的次数。如果该表达式返回[Nullable](../../../sql-reference/data-types/nullable.md)类型的值，则`count`的结果保持为非`Nullable`。如果该表达式对于所有行返回`NULL`，则函数返回0。

在这两种情况下，返回值的类型为[UInt64](../../../sql-reference/data-types/int-uint.md)。

**详细信息**

ClickHouse支持`COUNT(DISTINCT ...)`语法。这种结构的行为依赖于[count_distinct_implementation](../../../operations/settings/settings.md#count_distinct_implementation)设置。该设置定义用于执行操作的[uniq*](/sql-reference/aggregate-functions/reference/uniq)函数。默认值是[uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)函数。

`SELECT count() FROM table`查询默认通过使用MergeTree中的元数据进行优化。如果需要使用行级安全性，请使用[optimize_trivial_count_query](/operations/settings/settings#optimize_trivial_count_query)设置来禁用优化。

然而，`SELECT count(nullable_column) FROM table`查询可以通过启用[optimize_functions_to_subcolumns](/operations/settings/settings#optimize_functions_to_subcolumns)设置来进行优化。通过将`optimize_functions_to_subcolumns = 1`，该函数只读取[null](../../../sql-reference/data-types/nullable.md#finding-null)子列，而不是读取和处理整个列数据。查询`SELECT count(n) FROM table`会转换为`SELECT sum(NOT n.null) FROM table`。

**提高COUNT(DISTINCT expr)性能**

如果你的`COUNT(DISTINCT expr)`查询速度较慢，可以考虑添加一个[`GROUP BY`](/sql-reference/statements/select/group-by)子句，因为这可以改善并行化。你也可以使用[projection](../../../sql-reference/statements/alter/projection.md)在用于`COUNT(DISTINCT target_col)`的目标列上创建索引。

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

此示例显示`count(DISTINCT num)`是根据`count_distinct_implementation`设置值通过`uniqExact`函数执行的。
