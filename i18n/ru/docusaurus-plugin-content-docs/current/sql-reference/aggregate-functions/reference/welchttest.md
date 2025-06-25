---
description: 'Применяет t-тест Уэлча к выборкам из двух популяций.'
sidebar_label: 'welchTTest'
sidebar_position: 214
slug: /sql-reference/aggregate-functions/reference/welchttest
title: 'welchTTest'
---


# welchTTest

Применяет t-тест Уэлча к выборкам из двух популяций.

**Синтаксис**

```sql
welchTTest([confidence_level])(sample_data, sample_index)
```

Значения обеих выборок находятся в колонке `sample_data`. Если `sample_index` равен 0, то значение в этой строке принадлежит выборке из первой популяции. В противном случае оно принадлежит выборке из второй популяции. Нулевая гипотеза заключается в том, что средние значения популяций равны. Предполагается нормальное распределение. Популяции могут иметь неравные дисперсии.

**Аргументы**

- `sample_data` — Данные выборки. [Целое число](../../../sql-reference/data-types/int-uint.md), [С плавающей запятой](../../../sql-reference/data-types/float.md) или [Десятичное число](../../../sql-reference/data-types/decimal.md).
- `sample_index` — Индекс выборки. [Целое число](../../../sql-reference/data-types/int-uint.md).

**Параметры**

- `confidence_level` — Уровень доверия для расчета доверительных интервалов. [Число с плавающей запятой](../../../sql-reference/data-types/float.md).

**Возвращаемые значения**

[Кортеж](../../../sql-reference/data-types/tuple.md) с двумя или четырьмя элементами (если указан необязательный `confidence_level`)

- рассчитанное t-значение. [Float64](../../../sql-reference/data-types/float.md).
- рассчитанное p-значение. [Float64](../../../sql-reference/data-types/float.md).
- рассчитанный нижний предел доверительного интервала. [Float64](../../../sql-reference/data-types/float.md).
- рассчитанный верхний предел доверительного интервала. [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Входная таблица:

```text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        22.1 │            0 │
│        21.9 │            0 │
│        18.9 │            1 │
│        20.3 │            1 │
│          19 │            1 │
└─────────────┴──────────────┘
```

Запрос:

```sql
SELECT welchTTest(sample_data, sample_index) FROM welch_ttest;
```

Результат:

```text
┌─welchTTest(sample_data, sample_index)─────┐
│ (2.7988719532211235,0.051807360348581945) │
└───────────────────────────────────────────┘
```

**Смотрите также**

- [t-тест Уэлча](https://en.wikipedia.org/wiki/Welch%27s_t-test)
- [функция studentTTest](/sql-reference/aggregate-functions/reference/studentttest)
