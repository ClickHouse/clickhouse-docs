---
slug: /sql-reference/aggregate-functions/reference/singlevalueornull
sidebar_position: 184
title: 'singleValueOrNull'
description: 'Агрегатная функция `singleValueOrNull` используется для реализации операторов подзапросов, таких как `x = ALL (SELECT ...)`. Она проверяет, существует ли только одно уникальное ненулевое значение в данных.'
---


# singleValueOrNull

Агрегатная функция `singleValueOrNull` используется для реализации операторов подзапросов, таких как `x = ALL (SELECT ...)`. Она проверяет, существует ли только одно уникальное ненулевое значение в данных. Если существует только одно уникальное значение, оно возвращается. Если нуль или по крайней мере два различных значения, возвращается NULL.

**Синтаксис**

``` sql
singleValueOrNull(x)
```

**Параметры**

- `x` — Колонка любого [типа данных](../../data-types/index.md) (за исключением [Map](../../data-types/map.md), [Array](../../data-types/array.md) или [Tuple](../../data-types/tuple), которые не могут быть типа [Nullable](../../data-types/nullable.md)).

**Возвращаемые значения**

- Уникальное значение, если существует только одно уникальное ненулевое значение в `x`.
- `NULL`, если существует нуль или по крайней мере два различных значения.

**Примеры**

Запрос:

``` sql
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
