---
description: 'Вычисляет приблизительный квантиль числовой последовательности данных с помощью алгоритма t-дискрета.'
sidebar_position: 179
slug: /sql-reference/aggregate-functions/reference/quantiletdigestweighted
title: 'quantileTDigestWeighted'
---


# quantileTDigestWeighted

Вычисляет приблизительный [квантиль](https://en.wikipedia.org/wiki/Quantile) числовой последовательности данных с помощью [t-дискрета](https://github.com/tdunning/t-digest/blob/master/docs/t-digest-paper/histo.pdf). Функция учитывает вес каждого элемента последовательности. Максимальная ошибка составляет 1%. Потребление памяти равно `log(n)`, где `n` — это количество значений.

Производительность функции ниже, чем у [quantile](/sql-reference/aggregate-functions/reference/quantile) или [quantileTiming](/sql-reference/aggregate-functions/reference/quantiletiming). В отношении соотношения размера состояния к точности эта функция значительно лучше, чем `quantile`.

Результат зависит от порядка выполнения запроса и является недетерминированным.

При использовании нескольких функций `quantile*` с разными уровнями в одном запросе внутренние состояния не комбинируются (то есть запрос работает менее эффективно, чем мог бы). В этом случае используйте функцию [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles).

:::note    
Использование `quantileTDigestWeighted` [не рекомендуется для маленьких наборов данных](https://github.com/tdunning/t-digest/issues/167#issuecomment-828650275) и может приводить к значительным ошибкам. В этом случае рассмотрите возможность использования [`quantileTDigest`](../../../sql-reference/aggregate-functions/reference/quantiletdigest.md) вместо.
:::

**Синтаксис**

```sql
quantileTDigestWeighted(level)(expr, weight)
```

Псевдоним: `medianTDigestWeighted`.

**Аргументы**

- `level` — Уровень квантиля. Необязательный параметр. Константа с плавающей запятой от 0 до 1. Мы рекомендуем использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: 0.5. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).
- `expr` — Выражение по значениям колонки, результатом которого являются числовые [типы данных](/sql-reference/data-types), [Date](../../../sql-reference/data-types/date.md) или [DateTime](../../../sql-reference/data-types/datetime.md).
- `weight` — Колонка с весами элементов последовательности. Вес — это количество вхождений значения.

**Возвращаемое значение**

- Приблизительный квантиль указанного уровня.

Тип:

- [Float64](../../../sql-reference/data-types/float.md) для входных данных числового типа.
- [Date](../../../sql-reference/data-types/date.md) если входные значения имеют тип `Date`.
- [DateTime](../../../sql-reference/data-types/datetime.md) если входные значения имеют тип `DateTime`.

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

**Смотрите также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
