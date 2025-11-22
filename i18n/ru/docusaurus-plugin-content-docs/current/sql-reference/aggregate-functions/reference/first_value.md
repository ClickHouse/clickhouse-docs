---
description: 'Это псевдоним функции any, введённый для совместимости с оконными функциями, где иногда необходимо обрабатывать значения `NULL` (по умолчанию все агрегатные функции ClickHouse игнорируют значения `NULL`).'
sidebar_position: 137
slug: /sql-reference/aggregate-functions/reference/first_value
title: 'first_value'
doc_type: 'reference'
---



# first_value

Это псевдоним для [`any`](../../../sql-reference/aggregate-functions/reference/any.md), но он был введён для совместимости с [оконными функциями](../../window-functions/index.md), где иногда необходимо обрабатывать значения `NULL` (по умолчанию все агрегатные функции ClickHouse игнорируют значения `NULL`).

Функция поддерживает указание модификатора для учёта значений `NULL` (`RESPECT NULLS`) как при использовании [оконных функций](../../window-functions/index.md), так и в обычных агрегатных вычислениях.

Как и в случае с `any`, без оконных функций результат будет недетерминированным, если входной поток не упорядочен, а возвращаемый тип совпадает с входным типом (`NULL` возвращается только в том случае, если входной тип является `Nullable` или добавлен комбинатор `-OrNull`).



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

Значение NULL учитывается.

```sql
SELECT first_value(b) respect nulls FROM test_data
```

```text
┌─any(b) RESPECT NULLS ─┐
│                  ᴺᵁᴸᴸ │
└───────────────────────┘
```

### Пример 4 {#example4}

Стабильный результат при использовании подзапроса с `ORDER BY`.

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
