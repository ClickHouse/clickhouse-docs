---
description: 'Вычисляет приближённую квантиль числовой последовательности данных с использованием алгоритма t-digest.'
sidebar_position: 179
slug: /sql-reference/aggregate-functions/reference/quantiletdigestweighted
title: 'quantileTDigestWeighted'
doc_type: 'reference'
---

# quantileTDigestWeighted

Вычисляет приближённый [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных с использованием алгоритма [t-digest](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf). Функция учитывает вес каждого элемента последовательности. Максимальная погрешность составляет 1%. Потребление памяти — `log(n)`, где `n` — количество значений.

Производительность функции ниже, чем у [quantile](/sql-reference/aggregate-functions/reference/quantile) или [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming). С точки зрения соотношения размера состояния и точности эта функция значительно лучше, чем `quantile`.

Результат зависит от порядка выполнения запроса и является недетерминированным.

При использовании в одном запросе нескольких функций `quantile*` с разными уровнями квантилей их внутренние состояния не объединяются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

:::note\
Использование `quantileTDigestWeighted` [не рекомендуется для очень маленьких наборов данных](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275) и может приводить к значительной погрешности. В этом случае рассмотрите возможность использования [`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md).
:::

**Синтаксис**

```sql
quantileTDigestWeighted(level)(expr, weight)
```

Псевдоним: `medianTDigestWeighted`.

**Аргументы**

* `level` — уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
* `expr` — выражение над значениями столбца, результатом которого является числовой [тип данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
* `weight` — столбец с весами элементов последовательности. Вес — это количество вхождений значения.

**Возвращаемое значение**

* Приближённый квантиль указанного уровня.

Тип результата:

* [Float64](../../../sql-reference/data-types/float.md) для числового типа данных на входе.
* [Date](../../../sql-reference/data-types/date.md), если входные значения имеют тип `Date`.
* [DateTime](../../../sql-reference/data-types/datetime.md), если входные значения имеют тип `DateTime`.

**Пример**

Запрос:

```sql
SELECT quantileTDigestWeighted(number, 1) FROM numbers(10)
```

Результат:

```text
┌─quantileTDigestWeighted(number, 1)─┐
│                                4.5 │
└────────────────────────────────────┘
```

**См. также**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
