---
'description': '选择最后一个遇到的值，类似于 `anyLast`，但可以接受 NULL。'
'sidebar_position': 160
'slug': '/sql-reference/aggregate-functions/reference/last_value'
'title': 'last_value'
'doc_type': 'reference'
---


# last_value

选择最后遇到的值，类似于 `anyLast`，但可以接受 NULL。
主要应与 [Window Functions](../../window-functions/index.md) 一起使用。
如果源流未排序，则没有 Window Functions 的结果将是随机的。

## examples {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) VALUES (1,null), (2,3), (4, 5), (6,null)
```

### Example 1 {#example1}
NULL 值默认为被忽略。
```sql
SELECT last_value(b) FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### Example 2 {#example2}
NULL 值被忽略。
```sql
SELECT last_value(b) ignore nulls FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### Example 3 {#example3}
NULL 值被接受。
```sql
SELECT last_value(b) respect nulls FROM test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### Example 4 {#example4}
使用带有 `ORDER BY` 的子查询稳定化结果。
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
