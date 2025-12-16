---
description: 'Добавляет разность между последовательными строками. Если разность отрицательная,
  она игнорируется.'
sidebar_position: 130
slug: /sql-reference/aggregate-functions/reference/deltasumtimestamp
title: 'deltaSumTimestamp'
doc_type: 'reference'
---

Добавляет разность между последовательными строками. Если разность отрицательная, она игнорируется.

Эта функция в первую очередь предназначена для [материализованных представлений](/sql-reference/statements/create/view#materialized-view), которые хранят данные, упорядоченные по некоторому временному интервалу (time bucket), выровненному по метке времени, например, по интервалу `toStartOfMinute`. Поскольку строки в таком материализованном представлении будут иметь одинаковую метку времени, их невозможно объединить в правильном порядке без сохранения исходного, неокруглённого значения метки времени. Функция `deltaSumTimestamp` отслеживает исходный `timestamp` значений, которые она обработала, поэтому значения (состояния) функции корректно вычисляются во время слияния частей.

Чтобы вычислить сумму дельт по упорядоченной коллекции, вы можете просто использовать функцию [deltaSum](/sql-reference/aggregate-functions/reference/deltasum).

**Синтаксис**

```sql
deltaSumTimestamp(value, timestamp)
```

**Аргументы**

* `value` — Входные значения; должны иметь тип [Integer](../../data-types/int-uint.md) или [Float](../../data-types/float.md), либо тип [Date](../../data-types/date.md) или [DateTime](../../data-types/datetime.md).
* `timestamp` — Параметр упорядочивания значений; должен иметь тип [Integer](../../data-types/int-uint.md) или [Float](../../data-types/float.md), либо тип [Date](../../data-types/date.md) или [DateTime](../../data-types/datetime.md).

**Возвращаемое значение**

* Накопленные разности между последовательными значениями, упорядоченными по параметру `timestamp`.

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
