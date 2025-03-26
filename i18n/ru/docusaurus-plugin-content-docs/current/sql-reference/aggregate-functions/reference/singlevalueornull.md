---
description: 'Агрегатная функция `singleValueOrNull` используется для реализации операторов подзапросов, таких как `x = ALL (SELECT ...)`. Она проверяет, есть ли только одно уникальное ненулевое значение в данных.'
sidebar_position: 184
slug: /sql-reference/aggregate-functions/reference/singlevalueornull
title: 'singleValueOrNull'
---


# singleValueOrNull

Агрегатная функция `singleValueOrNull` используется для реализации операторов подзапросов, таких как `x = ALL (SELECT ...)`. Она проверяет, есть ли только одно уникальное ненулевое значение в данных. Если есть только одно уникальное значение, функция возвращает его. Если ноль или по крайней мере два различных значения, она возвращает NULL.

**Синтаксис**

```sql
singleValueOrNull(x)
```

**Параметры**

- `x` — Столбец любого [типа данных](../../data-types/index.md) (кроме [Map](../../data-types/map.md), [Array](../../data-types/array.md) или [Tuple](../../data-types/tuple), которые не могут быть типа [Nullable](../../data-types/nullable.md)).

**Возвращаемые значения**

- Уникальное значение, если в `x` есть только одно уникальное ненулевое значение.
- `NULL`, если есть ноль или по крайней мере два различных значения.

**Примеры**

Запрос:

```sql
CREATE TABLE test (x UInt8 NULL) ENGINE=Log;
INSERT INTO test (x) VALUES (NULL), (NULL), (5), (NULL), (NULL);
SELECT singleValueOrNull(x) FROM test;
```

Результат:

```response
┌─singleValueOrNull(x)─┐
│                    5 │
└──────────────────────┘
```

Запрос:

```sql
INSERT INTO test (x) VALUES (10);
SELECT singleValueOrNull(x) FROM test;
```

Результат:

```response
┌─singleValueOrNull(x)─┐
│                 ᴺᵁᴸᴸ │
└──────────────────────┘
```
