---
'description': '마지막으로 만난 값을 선택합니다. `anyLast`와 유사하지만 NULL도 허용할 수 있습니다.'
'sidebar_position': 160
'slug': '/sql-reference/aggregate-functions/reference/last_value'
'title': 'last_value'
'doc_type': 'reference'
---


# last_value

가장 최근에 발견된 값을 선택하며, `anyLast`와 유사하지만 NULL 값을 허용할 수 있습니다. 주로 [Window Functions](../../window-functions/index.md)와 함께 사용해야 합니다. Window Functions 없이 사용하면 소스 스트림이 정렬되지 않은 경우 결과가 무작위가 될 수 있습니다.

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
기본적으로 NULL 값은 무시됩니다.
```sql
SELECT last_value(b) FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### Example 2 {#example2}
NULL 값은 무시됩니다.
```sql
SELECT last_value(b) ignore nulls FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### Example 3 {#example3}
NULL 값은 허용됩니다.
```sql
SELECT last_value(b) respect nulls FROM test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### Example 4 {#example4}
`ORDER BY`와 함께 서브 쿼리를 사용하여 안정적인 결과를 얻습니다.
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
