---
slug: '/sql-reference/aggregate-functions/reference/first_value'
sidebar_position: 137
description: 'Это алиас для any, но он был введен для совместимости с оконными функциями,'
title: first_value
doc_type: reference
---
# first_value

Это псевдоним для [`any`](../../../sql-reference/aggregate-functions/reference/any.md), но он был введён для совместимости с [оконными функциями](../../window-functions/index.md), где иногда необходимо обрабатывать значения `NULL` (по умолчанию все агрегатные функции ClickHouse игнорируют значения NULL).

Он поддерживает объявление модификатора для учета NULL (`RESPECT NULLS`), как в [оконных функциях](../../window-functions/index.md), так и в обычных агрегациях.

Как и с `any`, без оконных функций результат будет случайным, если исходный поток не упорядочен, и тип возвращаемого значения соответствует входному типу (NULL возвращается только если входной тип является Nullable или добавлен комбинатор -OrNull).

## примеры {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) VALUES (1,null), (2,3), (4, 5), (6,null);
```

### Пример 1 {#example1}
По умолчанию значение NULL игнорируется.
```sql
SELECT first_value(b) FROM test_data;
```

```text
┌─any(b)─┐
│      3 │
└────────┘
```

### Пример 2 {#example2}
Значение NULL игнорируется.
```sql
SELECT first_value(b) ignore nulls FROM test_data
```

```text
┌─any(b) IGNORE NULLS ─┐
│                    3 │
└──────────────────────┘
```

### Пример 3 {#example3}
Значение NULL принимается.
```sql
SELECT first_value(b) respect nulls FROM test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### Пример 4 {#example4}
Стабилизированный результат с использованием подзапроса с `ORDER BY`.
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