---
slug: '/sql-reference/aggregate-functions/reference/grouparrayintersect'
sidebar_position: 141
description: 'Вернуть пересечение заданных массивов (Вернуть все элементы массивов,'
title: groupArrayIntersect
doc_type: reference
---
# groupArrayIntersect

Возвращает пересечение заданных массивов (Возвращает все элементы массивов, которые присутствуют во всех заданных массивах).

**Синтаксис**

```sql
groupArrayIntersect(x)
```

**Аргументы**

- `x` — Аргумент (имя столбца или выражение).

**Возвращаемые значения**

- Массив, содержащий элементы, которые есть во всех массивах.

Тип: [Array](../../data-types/array.md).

**Примеры**

Рассмотрим таблицу `numbers`:

```text
┌─a──────────────┐
│ [1,2,4]        │
│ [1,5,2,8,-1,0] │
│ [1,5,7,5,8,2]  │
└────────────────┘
```

Запрос с именем столбца в качестве аргумента:

```sql
SELECT groupArrayIntersect(a) AS intersection FROM numbers;
```

Результат:

```text
┌─intersection──────┐
│ [1, 2]            │
└───────────────────┘
```