---
slug: /sql-reference/aggregate-functions/reference/first_value
sidebar_position: 137
title: 'first_value'
description: 'Это псевдоним для any, но он был введен для совместимости с фунциями окон, где иногда необходимо обрабатывать значения NULL (по умолчанию все агрегирующие функции ClickHouse игнорируют значения NULL).'
---


# first_value

Это псевдоним для [`any`](../../../sql-reference/aggregate-functions/reference/any.md), но он был введен для совместимости с [функциями окон](../../window-functions/index.md), где иногда необходимо обрабатывать значения `NULL` (по умолчанию все агрегирующие функции ClickHouse игнорируют значения NULL).

Он поддерживает объявление модификатора для учета нулей (`RESPECT NULLS`), как в [функциях окон](../../window-functions/index.md), так и в обычных агрегатах.

Как и в случае с `any`, без функций окон результат будет случайным, если исходный поток не упорядочен и тип возвращаемого значения соответствует типу входного значения (Null возвращается только в том случае, если входное значение является Nullable или добавлен комбинированный -OrNull).

## примеры {#examples}

```sql
CREATE TABLE test_data
(
    a Int64,
    b Nullable(Int64)
)
ENGINE = Memory;

INSERT INTO test_data (a, b) Values (1,null), (2,3), (4, 5), (6,null);
```

### пример1 {#example1}
По умолчанию значение NULL игнорируется.
```sql
select first_value(b) from test_data;
```

```text
┌─any(b)─┐
│      3 │
└────────┘
```

### пример2 {#example2}
Значение NULL игнорируется.
```sql
select first_value(b) ignore nulls from test_data
```

```text
┌─any(b) IGNORE NULLS ─┐
│                    3 │
└──────────────────────┘
```

### пример3 {#example3}
Значение NULL принимается.
```sql
select first_value(b) respect nulls from test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### пример4 {#example4}
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
