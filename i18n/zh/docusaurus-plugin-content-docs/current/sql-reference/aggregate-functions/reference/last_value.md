
# last_value

选择最后遇到的值，类似于 `anyLast`，但可以接受 NULL。
主要应与 [Window Functions](../../window-functions/index.md) 一起使用。
如果源数据流未排序，则没有 Window Functions 时结果将是随机的。

## examples {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) Values (1,null), (2,3), (4, 5), (6,null)
```

### example1 {#example1}
默认情况下会忽略 NULL 值。
```sql
select last_value(b) from test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### example2 {#example2}
忽略 NULL 值。
```sql
select last_value(b) ignore nulls from test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### example3 {#example3}
接受 NULL 值。
```sql
select last_value(b) respect nulls from test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### example4 {#example4}
使用 `ORDER BY` 的子查询得到稳定的结果。
```sql
SELECT
    last_value_respect_nulls(b),
    last_value(b)
FROM
(
    SELECT *
    FROM test_data
    ORDER BY a ASC
)
```

```text
┌─last_value_respect_nulls(b)─┬─last_value(b)─┐
│                        ᴺᵁᴸᴸ │             5 │
└─────────────────────────────┴───────────────┘
```
