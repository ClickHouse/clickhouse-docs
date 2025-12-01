---
description: 'Агрегатная функция `singleValueOrNull` используется для реализации операторов подзапросов, таких как `x = ALL (SELECT ...)`. Она проверяет, есть ли в данных ровно одно уникальное значение, отличное от NULL.'
sidebar_position: 184
slug: /sql-reference/aggregate-functions/reference/singlevalueornull
title: 'singleValueOrNull'
doc_type: 'reference'
---

# singleValueOrNull {#singlevalueornull}

Агрегатная функция `singleValueOrNull` используется для реализации операторов с подзапросами, таких как `x = ALL (SELECT ...)`. Она проверяет, есть ли в наборе данных только одно уникальное значение, отличное от NULL.
Если есть ровно одно уникальное значение, функция возвращает его. Если уникальных значений ноль или как минимум два, функция возвращает NULL.

**Синтаксис**

```sql
singleValueOrNull(x)
```

**Параметры**

* `x` — столбец любого [типа данных](../../data-types/index.md) (кроме [Map](../../data-types/map.md), [Array](../../data-types/array.md) или [Tuple](../../data-types/tuple), которые не могут иметь тип [Nullable](../../data-types/nullable.md)).

**Возвращаемые значения**

* Уникальное значение, если в `x` есть ровно одно уникальное значение, отличное от `NULL`.
* `NULL`, если нет ни одного значения или имеется как минимум два различных значения.

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
