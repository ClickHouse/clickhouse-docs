---
slug: '/sql-reference/aggregate-functions/reference/sumkahan'
sidebar_position: 197
description: 'Вычесляет сумму чисел с использованием алгоритма компакации суммы'
title: sumKahan
doc_type: reference
---
Вычисляет сумму чисел с помощью [алгоритма компенсации Kahan](https://en.wikipedia.org/wiki/Kahan_summation_algorithm)  
Медленнее, чем функция [sum](./sum.md).  
Компенсация работает только для типов [Float](../../../sql-reference/data-types/float.md).

**Синтаксис**

```sql
sumKahan(x)
```

**Аргументы**

- `x` — Входное значение, должно быть [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).

**Возвращаемое значение**

- сумма чисел, тип [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md) зависит от типа входных аргументов

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