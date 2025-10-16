---
slug: '/sql-reference/aggregate-functions/reference/last_value'
sidebar_position: 160
description: 'Выбирает последнее встреченное значение, аналогично `anyLast`, но'
title: last_value
doc_type: reference
---
# last_value

Выбирает последнее встреченное значение, аналогично `anyLast`, но может принимать NULL. 
В основном его следует использовать с [Window Functions](../../window-functions/index.md). 
Без Window Functions результат будет случайным, если исходный поток не отсортирован.

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
Значение NULL игнорируется по умолчанию.
```sql
SELECT last_value(b) FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### Example 2 {#example2}
Значение NULL игнорируется.
```sql
SELECT last_value(b) ignore nulls FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### Example 3 {#example3}
Значение NULL принимается.
```sql
SELECT last_value(b) respect nulls FROM test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### Example 4 {#example4}
Стабилизированный результат с использованием подзапроса с `ORDER BY`.
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