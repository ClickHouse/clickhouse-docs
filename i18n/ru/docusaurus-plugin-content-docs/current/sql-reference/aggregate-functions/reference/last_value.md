---
slug: /sql-reference/aggregate-functions/reference/last_value
sidebar_position: 160
title: 'last_value'
description: 'Выбирает последнее встреченное значение, подобно `anyLast`, но может принимать NULL.'
---


# last_value

Выбирает последнее встреченное значение, подобно `anyLast`, но может принимать NULL. В основном его следует использовать с [Оконными Функциями](../../window-functions/index.md). Без оконных функций результат будет случайным, если исходный поток не отсортирован.

## примеры {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) Values (1,null), (2,3), (4, 5), (6,null)
```

### пример1 {#example1}
Значение NULL игнорируется по умолчанию.
```sql
select last_value(b) from test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### пример2 {#example2}
Значение NULL игнорируется.
```sql
select last_value(b) ignore nulls from test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### пример3 {#example3}
Значение NULL принимается.
```sql
select last_value(b) respect nulls from test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### пример4 {#example4}
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
