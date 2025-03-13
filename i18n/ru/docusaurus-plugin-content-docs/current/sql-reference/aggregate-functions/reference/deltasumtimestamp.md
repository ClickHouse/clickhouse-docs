---
slug: /sql-reference/aggregate-functions/reference/deltasumtimestamp
sidebar_position: 130
title: 'deltaSumTimestamp'
description: 'Добавляет разницу между последовательными строками. Если разница отрицательная, она игнорируется.'
---

Добавляет разницу между последовательными строками. Если разница отрицательная, она игнорируется.

Эта функция предназначена в первую очередь для [материализованных представлений](/sql-reference/statements/create/view#materialized-view), которые хранят данные, упорядоченные по определенному временно́му метке, выровненной по какому-то временно́му интервалу, например, по ведру `toStartOfMinute`. Поскольку строки в таком материализованном представлении будут все иметь одинаковую временно́й метку, невозможно объединить их в правильном порядке, не сохраняя оригинальное, неокругленное значение временно́й метки. Функция `deltaSumTimestamp` отслеживает оригинальную `timestamp` значений, которые она видела, так что значения (состояния) функции правильно вычисляются во время объединения частей.

Чтобы вычислить дельта-сумму по упорядоченной коллекции, вы можете просто использовать функцию [deltaSum](/sql-reference/aggregate-functions/reference/deltasum).

**Синтаксис**

``` sql
deltaSumTimestamp(value, timestamp)
```

**Аргументы**

- `value` — Входные значения, должны быть какого-то типа [Integer](../../data-types/int-uint.md) или [Float](../../data-types/float.md) или [Date](../../data-types/date.md) или [DateTime](../../data-types/datetime.md).
- `timestamp` — Параметр для упорядочивания значений, должен быть какого-то типа [Integer](../../data-types/int-uint.md) или [Float](../../data-types/float.md) или [Date](../../data-types/date.md) или [DateTime](../../data-types/datetime.md).

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

``` text
┌─deltaSumTimestamp(value, timestamp)─┐
│                                  13 │
└─────────────────────────────────────┘
```
