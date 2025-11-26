---
description: 'Возвращает пересечение переданных массивов (все элементы массивов,
  которые присутствуют во всех переданных массивах).'
sidebar_position: 141
slug: /sql-reference/aggregate-functions/reference/grouparrayintersect
title: 'groupArrayIntersect'
doc_type: 'reference'
---

# groupArrayIntersect

Возвращает пересечение заданных массивов (все элементы, которые присутствуют во всех указанных массивах).

**Синтаксис**

```sql
groupArrayIntersect(x)
```

**Аргументы**

* `x` — аргумент (имя столбца или выражение).

**Возвращаемые значения**

* Массив, содержащий элементы, присутствующие во всех массивах.

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

Запрос, в котором имя столбца передаётся в качестве аргумента:

```sql
SELECT groupArrayIntersect(a) AS intersection FROM numbers;
```

Результат:

```text
┌─intersection──────┐
│ [1, 2]            │
└───────────────────┘
```
