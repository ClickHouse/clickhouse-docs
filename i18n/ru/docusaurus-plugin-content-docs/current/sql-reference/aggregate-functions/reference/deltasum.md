---
description: 'Суммирует арифметическую разность между последовательными строками.'
sidebar_position: 129
slug: /sql-reference/aggregate-functions/reference/deltasum
title: 'deltaSum'
doc_type: 'reference'
---



# deltaSum {#deltasum}

Суммирует арифметическую разность между последовательными строками. Если разность отрицательная, она не учитывается.

:::note
Исходные данные должны быть отсортированы, чтобы эта функция работала корректно. Если вы хотите использовать эту функцию в [материализованном представлении](/sql-reference/statements/create/view#materialized-view), вам, скорее всего, следует использовать метод [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp) вместо неё.
:::

**Синтаксис**

```sql
deltaSum(value)
```

**Аргументы**

* `value` — Входное значение, должно быть типа [Integer](../../data-types/int-uint.md) или [Float](../../data-types/float.md).

**Возвращаемое значение**

* Полученная арифметическая разность типа `Integer` или `Float`.

**Примеры**

Запрос:

```sql
SELECT deltaSum(arrayJoin([1, 2, 3]));
```

Результат:

```text
┌─deltaSum(arrayJoin([1, 2, 3]))─┐
│                              2 │
└────────────────────────────────┘
```

Запрос:

```sql
SELECT deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]));
```

Результат:

```text
┌─deltaSum(arrayJoin([1, 2, 3, 0, 3, 4, 2, 3]))─┐
│                                             7 │
└───────────────────────────────────────────────┘
```

Запрос:

```sql
SELECT deltaSum(arrayJoin([2.25, 3, 4.5]));
```

Результат:

```text
┌─deltaSum(arrayJoin([2.25, 3, 4.5]))─┐
│                                2.25 │
└─────────────────────────────────────┘
```


## См. также {#see-also}

- [runningDifference](/sql-reference/functions/other-functions#runningDifference)
