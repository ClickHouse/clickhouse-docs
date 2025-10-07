---
'description': '聚合函数的文档'
'sidebar_label': '聚合函数'
'sidebar_position': 33
'slug': '/sql-reference/aggregate-functions/'
'title': '聚合函数'
'doc_type': 'reference'
---


# 聚合函数

聚合函数按照数据库专家预期的 [正常](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial) 方式工作。

ClickHouse 还支持：

- [参数化聚合函数](/sql-reference/aggregate-functions/parametric-functions)，除了列之外接受其他参数。
- [组合子](/sql-reference/aggregate-functions/combinators)，改变聚合函数的行为。

## NULL 处理 {#null-processing}

在聚合过程中，所有 `NULL` 参数会被跳过。如果聚合有多个参数，它将忽略任何一个或多个参数为 NULL 的行。

这个规则有一个例外，即函数 [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md)、[`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) 及其别名（分别为 `any` 和 `anyLast`）在后跟修饰符 `RESPECT NULLS` 的情况下。例如，`FIRST_VALUE(b) RESPECT NULLS`。

**示例：**

考虑这个表：

```text
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

假设你需要对 `y` 列的值进行求和：

```sql
SELECT sum(y) FROM t_null_big
```

```text
┌─sum(y)─┐
│      7 │
└────────┘
```

现在你可以使用 `groupArray` 函数从 `y` 列创建一个数组：

```sql
SELECT groupArray(y) FROM t_null_big
```

```text
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray` 不会将 `NULL` 包含在结果数组中。

你可以使用 [COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce) 将 NULL 改成在你的用例中有意义的值。例如：`avg(COALESCE(column, 0))` 将在聚合中使用列的值，或者在 NULL 的情况下使用零：

```sql
SELECT
    avg(y),
    avg(coalesce(y, 0))
FROM t_null_big
```

```text
┌─────────────avg(y)─┬─avg(coalesce(y, 0))─┐
│ 2.3333333333333335 │                 1.4 │
└────────────────────┴─────────────────────┘
```

你也可以使用 [Tuple](sql-reference/data-types/tuple.md) 来绕过 NULL 跳过的行为。包含唯一 `NULL` 值的 `Tuple` 并不为 `NULL`，因此聚合函数不会因为该 `NULL` 值而跳过该行。

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

请注意，当列用作聚合函数的参数时，聚合将被跳过。例如，`count`（没有参数 `count()`）或使用常量（`count(1)`）会计算块中的所有行（与 GROUP BY 列的值无关，因为它不是参数），而 `count(column)` 将只返回列不为 NULL 的行数。

```sql
SELECT
    v,
    count(1),
    count(v)
FROM
(
    SELECT if(number < 10, NULL, number % 3) AS v
    FROM numbers(15)
)
GROUP BY v

┌────v─┬─count()─┬─count(v)─┐
│ ᴺᵁᴸᴸ │      10 │        0 │
│    0 │       1 │        1 │
│    1 │       2 │        2 │
│    2 │       2 │        2 │
└──────┴─────────┴──────────┘
```

这里是一个使用 `RESPECT NULLS` 的 `first_value` 示例，我们可以看到 NULL 输入被尊重，它将返回读取的第一个值，无论它是否为 NULL：

```sql
SELECT
    col || '_' || ((col + 1) * 5 - 1) AS range,
    first_value(odd_or_null) AS first,
    first_value(odd_or_null) IGNORE NULLS as first_ignore_null,
    first_value(odd_or_null) RESPECT NULLS as first_respect_nulls
FROM
(
    SELECT
        intDiv(number, 5) AS col,
        if(number % 2 == 0, NULL, number) AS odd_or_null
    FROM numbers(15)
)
GROUP BY col
ORDER BY col

┌─range─┬─first─┬─first_ignore_null─┬─first_respect_nulls─┐
│ 0_4   │     1 │                 1 │                ᴺᵁᴸᴸ │
│ 1_9   │     5 │                 5 │                   5 │
│ 2_14  │    11 │                11 │                ᴺᵁᴸᴸ │
└───────┴───────┴───────────────────┴─────────────────────┘
```
