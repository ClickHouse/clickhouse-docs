---
'description': '它是任何的别名，但为了与窗口函数兼容而引入，有时需要处理 `NULL` 值（默认情况下，所有ClickHouse聚合函数都会忽略NULL值）。'
'sidebar_position': 137
'slug': '/sql-reference/aggregate-functions/reference/first_value'
'title': 'first_value'
---




# first_value

它是[`any`](../../../sql-reference/aggregate-functions/reference/any.md)的别名，但它是为了与[窗口函数](../../window-functions/index.md)的兼容性而引入的，在这些情况下，有时需要处理`NULL`值（默认情况下，所有ClickHouse聚合函数会忽略NULL值）。

它支持声明一个修饰符以尊重空值（`RESPECT NULLS`），在[窗口函数](../../window-functions/index.md)和普通聚合中均可使用。

与`any`一样，如果没有窗口函数且源流未排序并且返回类型与输入类型匹配（只有在输入是Nullable或添加了-或Null组合器时才返回Null），则结果将是随机的。

## 示例 {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) Values (1,null), (2,3), (4, 5), (6,null);
```

### 示例1 {#example1}
默认情况下，NULL值被忽略。
```sql
select first_value(b) from test_data;
```

```text
┌─any(b)─┐
│      3 │
└────────┘
```

### 示例2 {#example2}
NULL值被忽略。
```sql
select first_value(b) ignore nulls from test_data
```

```text
┌─any(b) IGNORE NULLS ─┐
│                    3 │
└──────────────────────┘
```

### 示例3 {#example3}
接受NULL值。
```sql
select first_value(b) respect nulls from test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### 示例4 {#example4}
使用`ORDER BY`的子查询稳定化结果。
```sql
SELECT
    first_value_respect_nulls(b),
    first_value(b)
FROM
(
    SELECT *
    FROM test_data
    ORDER BY a ASC
)
```

```text
┌─any_respect_nulls(b)─┬─any(b)─┐
│                 ᴺᵁᴸᴸ │      3 │
└──────────────────────┴────────┘
```
