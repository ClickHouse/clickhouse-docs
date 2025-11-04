---
slug: '/sql-reference/aggregate-functions/reference/deltasumtimestamp'
sidebar_position: 130
description: 'Добавляет разницу между последовательными строками. Если разница отрицательная,'
title: deltaSumTimestamp
doc_type: reference
---
Добавляет разницу между последовательными строками. Если разница отрицательная, она игнорируется.

Эта функция предназначена в первую очередь для [материализованных представлений](/sql-reference/statements/create/view#materialized-view), которые хранят данные, упорядоченные по какому-либо временно выровненному значению временной метки, например, по `toStartOfMinute`. Поскольку строки в таком материалиованном представлении будут иметь одну и ту же временную метку, их невозможно объединить в правильном порядке без хранения исходного, округленного значения временной метки. Функция `deltaSumTimestamp` отслеживает оригинальную `timestamp` значений, которые она видела, так что значения (состояния) функции корректно вычисляются во время слияния частей.

Чтобы рассчитать дельта-сумму в упорядоченной коллекции, вы можете просто использовать функцию [deltaSum](/sql-reference/aggregate-functions/reference/deltasum).

**Синтаксис**

```sql
deltaSumTimestamp(value, timestamp)
```

**Аргументы**

- `value` — Входные значения, должны быть какого-либо типа [Integer](../../data-types/int-uint.md) или [Float](../../data-types/float.md) или [Date](../../data-types/date.md) или [DateTime](../../data-types/datetime.md).
- `timestamp` — Параметр для упорядочивания значений, должен быть какого-либо типа [Integer](../../data-types/int-uint.md) или [Float](../../data-types/float.md) или [Date](../../data-types/date.md) или [DateTime](../../data-types/datetime.md).

**Возвращаемое значение**

- Накопленные разницы между последовательными значениями, упорядоченные по параметру `timestamp`.

Тип: [Integer](../../data-types/int-uint.md) или [Float](../../data-types/float.md) или [Date](../../data-types/date.md) или [DateTime](../../data-types/datetime.md).

**Пример**

Запрос:

```sql
SELECT deltaSumTimestamp(value, timestamp)
FROM (SELECT number AS timestamp, [0, 4, 8, 3, 0, 0, 0, 1, 3, 5][number] AS value FROM numbers(1, 10));
```

Результат:

```text
┌─deltaSumTimestamp(value, timestamp)─┐
│                                  13 │
└─────────────────────────────────────┘
```