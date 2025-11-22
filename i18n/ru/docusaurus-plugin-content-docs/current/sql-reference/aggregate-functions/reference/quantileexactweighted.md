---
description: 'Точно вычисляет квантиль числовой последовательности данных с учётом веса каждого элемента.'
sidebar_position: 174
slug: /sql-reference/aggregate-functions/reference/quantileexactweighted
title: 'quantileExactWeighted'
doc_type: 'reference'
---

# quantileExactWeighted

Точно вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных с учётом веса каждого элемента.

Для получения точного значения все переданные значения объединяются в массив, который затем частично сортируется. Каждое значение учитывается с его весом так, как если бы оно присутствовало `weight` раз. В алгоритме используется хеш-таблица. Благодаря этому, если переданные значения часто повторяются, функция потребляет меньше оперативной памяти, чем [quantileExact](/sql-reference/aggregate-functions/reference/quantileexact#quantileexact). Вы можете использовать эту функцию вместо `quantileExact`, указав вес 1.

При использовании в запросе нескольких функций `quantile*` с разными уровнями квантилей их внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

**Синтаксис**

```sql
quantileExactWeighted(level)(expr, weight)
```

Псевдоним: `medianExactWeighted`.

**Аргументы**

* `level` — уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
* `expr` — выражение над значениями столбца, результатом которого являются числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
* `weight` — столбец с весами элементов последовательности. Вес — это количество вхождений значения, задаваемое [целочисленными беззнаковыми типами](../../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

* Квантиль указанного уровня.

Тип результата:

* [Float64](../../../sql-reference/data-types/float.md) для числового типа данных на входе.
* [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
* [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

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

**См. также**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](/sql-reference/aggregate-functions/reference/quantiles)
