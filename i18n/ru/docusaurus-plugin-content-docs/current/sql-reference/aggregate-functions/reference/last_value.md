---
description: 'Выбирает последнее встреченное значение, аналогично `anyLast`, но может принимать NULL.'
sidebar_position: 160
slug: /sql-reference/aggregate-functions/reference/last_value
title: 'last_value'
doc_type: 'reference'
---



# last_value

Выбирает последнее встреченное значение, аналогично `anyLast`, но может принимать значение NULL.
В основном должна использоваться с [оконными функциями](../../window-functions/index.md).
Без оконных функций результат будет случайным, если входной поток не упорядочен.



## примеры {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) VALUES (1,null), (2,3), (4, 5), (6,null)
```

### Пример 1 {#example1}

Значение NULL игнорируется по умолчанию.

```sql
SELECT last_value(b) FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### Пример 2 {#example2}

Значение NULL игнорируется.

```sql
SELECT last_value(b) ignore nulls FROM test_data
```

```text
┌─last_value_ignore_nulls(b)─┐
│                          5 │
└────────────────────────────┘
```

### Пример 3 {#example3}

Значение NULL учитывается.

```sql
SELECT last_value(b) respect nulls FROM test_data
```

```text
┌─last_value_respect_nulls(b)─┐
│                        ᴺᵁᴸᴸ │
└─────────────────────────────┘
```

### Пример 4 {#example4}

Стабильный результат при использовании подзапроса с `ORDER BY`.

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
