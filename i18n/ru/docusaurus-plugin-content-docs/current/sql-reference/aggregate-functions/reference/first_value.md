---
description: 'Это псевдоним для любой, но он был введён для совместимости с Оконными Функциями, где иногда необходимо обрабатывать `NULL` значения (по умолчанию все агрегатные функции ClickHouse игнорируют значения NULL).'
sidebar_position: 137
slug: /sql-reference/aggregate-functions/reference/first_value
title: 'first_value'
---


# first_value

Это псевдоним для [`any`](../../../sql-reference/aggregate-functions/reference/any.md), но он был введён для совместимости с [Оконными Функциями](../../window-functions/index.md), где иногда необходимо обрабатывать `NULL` значения (по умолчанию все агрегатные функции ClickHouse игнорируют значения NULL).

Он поддерживает объявление модификатора, который учитывает null (`RESPECT NULLS`), как в [Оконных Функциях](../../window-functions/index.md), так и в обычной агрегации.

Как и в случае с `any`, без Оконных Функций результат будет случайным, если исходный поток не упорядочен, а возвращаемый тип соответствует входному типу (Null будет возвращён только если входной тип является Nullable или добавлен комбинирующий -OrNull).

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
Значение NULL учитывается.
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
