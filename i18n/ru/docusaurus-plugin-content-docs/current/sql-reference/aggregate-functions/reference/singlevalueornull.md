---
description: 'Агрегатная функция `singleValueOrNull` используется для реализации операторов с подзапросами, таких как `x = ALL (SELECT ...)`. Она проверяет, есть ли в данных ровно одно уникальное значение, отличное от NULL.'
sidebar_position: 184
slug: /sql-reference/aggregate-functions/reference/singlevalueornull
title: 'singleValueOrNull'
doc_type: 'reference'
---

# singleValueOrNull

Агрегатная функция `singleValueOrNull` используется для реализации операторов подзапросов, таких как `x = ALL (SELECT ...)`. Она проверяет, есть ли в данных ровно одно уникальное значение, отличное от NULL.
Если такое единственное уникальное значение есть, функция возвращает его. Если значений нет или есть как минимум два различных значения, функция возвращает NULL.

**Синтаксис**

```sql
singleValueOrNull(x)
```

**Параметры**

* `x` — столбец любого [типа данных](../../data-types/index.md) (кроме [Map](../../data-types/map.md), [Array](../../data-types/array.md) или [Tuple](../../data-types/tuple), которые не могут иметь тип [Nullable](../../data-types/nullable.md)).

**Возвращаемые значения**

* Уникальное значение, если в `x` существует ровно одно уникальное значение, отличное от `NULL`.
* `NULL`, если нет ни одного или существует как минимум два различных значения, отличных от `NULL`.

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
