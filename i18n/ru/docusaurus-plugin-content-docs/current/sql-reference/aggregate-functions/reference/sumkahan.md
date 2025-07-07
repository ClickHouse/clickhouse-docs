---
description: 'Вычисляет сумму чисел с использованием алгоритма компенсированной суммирования Кахана'
sidebar_position: 197
slug: /sql-reference/aggregate-functions/reference/sumkahan
title: 'sumKahan'
---

Вычисляет сумму чисел с использованием [алгоритма компенсированной суммирования Кахана](https://en.wikipedia.org/wiki/Kahan_summation_algorithm). 
Медленнее, чем функция [sum](./sum.md).
Компенсация работает только для типов [Float](../../../sql-reference/data-types/float.md).


**Синтаксис**

```sql
sumKahan(x)
```

**Аргументы**

- `x` — Входное значение, должно быть [Целым числом](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).

**Возвращаемое значение**

- сумма чисел, тип [Целого числа](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md) зависит от типа входных аргументов.

**Пример**

Запрос:

```sql
SELECT sum(0.1), sumKahan(0.1) FROM numbers(10);
```

Результат:

```text
┌───────────sum(0.1)─┬─sumKahan(0.1)─┐
│ 0.9999999999999999 │             1 │
└────────────────────┴───────────────┘
```
