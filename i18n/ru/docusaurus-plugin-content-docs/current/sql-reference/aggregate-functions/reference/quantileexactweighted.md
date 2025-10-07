---
slug: '/sql-reference/aggregate-functions/reference/quantileexactweighted'
sidebar_position: 174
description: 'Точно вычисляет квантиль числовой последовательности данных, учитывая'
title: quantileExactWeighted
doc_type: reference
---
# quantileExactWeighted

Точно вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных с учетом веса каждого элемента.

Для получения точного значения все переданные значения объединяются в массив, который затем частично сортируется. Каждое значение учитывается с его весом, как если бы оно присутствовало `weight` раз. В алгоритме используется хеш-таблица. Из-за этого, если переданные значения часто повторяются, функция потребляет меньше ОЗУ, чем [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact). Вы можете использовать эту функцию вместо `quantileExact` и указать вес 1.

При использовании нескольких функции `quantile*` с разными уровнями в запросе внутренние состояния не комбинируются (это означает, что запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileExactWeighted(level)(expr, weight)
```

Псевдоним: `medianExactWeighted`.

**Аргументы**

- `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей точкой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
- `expr` — Выражение по значениям столбца, дающее числовые [тип данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
- `weight` — Столбец с весами членов последовательности. Вес — это число вхождений значения с [Беззнаковыми целочисленными типами](../../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

- Квантиль указанного уровня.

Тип:

- [Float64](../../../sql-reference/data-types/float.md) для числового типа данных на входе.
- [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Входная таблица:

```text
┌─n─┬─val─┐
│ 0 │   3 │
│ 1 │   2 │
│ 2 │   1 │
│ 5 │   4 │
└───┴─────┘
```

Запрос:

```sql
SELECT quantileExactWeighted(n, val) FROM t
```

Результат:

```text
┌─quantileExactWeighted(n, val)─┐
│                             1 │
└───────────────────────────────┘
```

**См. Также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](/sql-reference/aggregate-functions/reference/quantiles)