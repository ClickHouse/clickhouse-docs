---
slug: '/sql-reference/aggregate-functions/reference/deltasum'
sidebar_position: 129
description: 'Суммирует арифметическую разницу между последовательноми строками.'
title: deltaSum
doc_type: reference
---
# deltaSum

Суммирует арифметическую разницу между последовательными строками. Если разница отрицательная, она игнорируется.

:::note
Исходные данные должны быть отсортированы для правильной работы этой функции. Если вы хотите использовать эту функцию в [материализованном представлении](/sql-reference/statements/create/view#materialized-view), вам, скорее всего, следует использовать метод [deltaSumTimestamp](/sql-reference/aggregate-functions/reference/deltasumtimestamp).
:::

**Синтаксис**

```sql
deltaSum(value)
```

**Аргументы**

- `value` — Входные значения, должны быть типа [Integer](../../data-types/int-uint.md) или [Float](../../data-types/float.md).

**Возвращаемое значение**

- Полученная арифметическая разница типа `Integer` или `Float`.

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