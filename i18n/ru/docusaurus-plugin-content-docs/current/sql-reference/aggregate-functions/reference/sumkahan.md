---
description: 'Вычисляет сумму чисел по алгоритму компенсированного суммирования Кэхэна'
sidebar_position: 197
slug: /sql-reference/aggregate-functions/reference/sumkahan
title: 'sumKahan'
doc_type: 'reference'
---

Вычисляет сумму чисел по [алгоритму компенсированного суммирования Кэхэна](https://en.wikipedia.org/wiki/Kahan_summation_algorithm).
Работает медленнее, чем функция [sum](./sum.md).
Компенсация применяется только для типов [Float](../../../sql-reference/data-types/float.md).

**Синтаксис**

```sql
sumKahan(x)
```

**Аргументы**

* `x` — входное значение, должно иметь тип [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).

**Возвращаемое значение**

* сумма чисел; тип [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md) зависит от типа входных аргументов.

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
