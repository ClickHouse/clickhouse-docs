---
'description': 'Aggregate Functions 的文档'
'sidebar_label': '聚合函数'
'sidebar_position': 33
'slug': '/sql-reference/aggregate-functions/'
'title': 'Aggregate Functions'
---




# 聚合函数

聚合函数以数据库专业人士期望的[正常](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial)方式工作。

ClickHouse 还支持：

- [参数化聚合函数](/sql-reference/aggregate-functions/parametric-functions)，除了列以外还可以接受其他参数。
- [组合器](/sql-reference/aggregate-functions/combinators)，可以改变聚合函数的行为。


## NULL 处理 {#null-processing}

在聚合过程中，所有 `NULL` 参数会被跳过。如果聚合有多个参数，它会忽略任何一个或多个参数为 NULL 的行。

对此规则有一个例外，即在后面跟有修饰符 `RESPECT NULLS` 的函数 [`first_value`](../../sql-reference/aggregate-functions/reference/first_value.md)、[`last_value`](../../sql-reference/aggregate-functions/reference/last_value.md) 及其别名（分别为 `any` 和 `anyLast`）。例如，`FIRST_VALUE(b) RESPECT NULLS`。

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

假设你需要计算 `y` 列的总值：

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

`groupArray` 不会在结果数组中包含 `NULL`。

你可以使用 [COALESCE](../../sql-reference/functions/functions-for-nulls.md#coalesce) 将 NULL 更改为在你的用例中有意义的值。例如： `avg(COALESCE(column, 0))` 将在聚合中使用列的值或在 NULL 时使用零：

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

你还可以使用 [Tuple](sql-reference/data-types/tuple.md) 来解决 NULL 跳过的行为。包含唯一 `NULL` 值的 `Tuple` 不是 `NULL`，因此聚合函数不会因为那个 `NULL` 值而跳过该行。

```sql
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

请注意，当列用作聚合函数的参数时，聚合会被跳过。例如， [`count`](../../sql-reference/aggregate-functions/reference/count.md) 没有参数（`count()`）或使用常量参数（`count(1)`）会计算区块中的所有行（与 GROUP BY 列的值无关，因为它不是参数），而 `count(column)` 只会返回列不为 NULL 的行数。

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

这是使用 `RESPECT NULLS` 的 first_value 示例，我们可以看到 NULL 输入得到了尊重，它将返回读取的第一个值，无论它是否为 NULL：

```sql
SELECT
    col || '_' || ((col + 1) * 5 - 1) as range,
    first_value(odd_or_null) as first,
    first_value(odd_or_null) IGNORE NULLS as first_ignore_null,
    first_value(odd_or_null) RESPECT NULLS as first_respect_nulls
FROM
(
    SELECT
        intDiv(number, 5) AS col,
        if(number % 2 == 0, NULL, number) as odd_or_null
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
