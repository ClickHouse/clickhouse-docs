---
slug: '/sql-reference/aggregate-functions/reference/mannwhitneyutest'
sidebar_label: mannWhitneyUTest
sidebar_position: 161
description: 'Применяет тест рангов Манна-Уитни к образцам из двух популяций.'
title: mannWhitneyUTest
doc_type: reference
---
# mannWhitneyUTest

Применяет ранговый тест Манна-Уитни к выборкам из двух популяций.

**Синтаксис**

```sql
mannWhitneyUTest[(alternative[, continuity_correction])](sample_data, sample_index)
```

Значения обеих выборок находятся в колонке `sample_data`. Если `sample_index` равно 0, то значение в этой строке принадлежит выборке из первой популяции. В противном случае оно принадлежит выборке из второй популяции. Нулевая гипотеза состоит в том, что две популяции стохастически равны. Также могут тестироваться односторонние гипотезы. Этот тест не предполагает, что данные имеют нормальное распределение.

**Аргументы**

- `sample_data` — выборочные данные. [Целое число](../../../sql-reference/data-types/int-uint.md), [число с плавающей запятой](../../../sql-reference/data-types/float.md) или [десятичное число](../../../sql-reference/data-types/decimal.md).
- `sample_index` — индекс выборки. [Целое число](../../../sql-reference/data-types/int-uint.md).

**Параметры**

- `alternative` — альтернативная гипотеза. (Опционально, по умолчанию: `'two-sided'`.) [Строка](../../../sql-reference/data-types/string.md).
  - `'two-sided'`;
  - `'greater'`;
  - `'less'`.
- `continuity_correction` — если не 0, то применяется коррекция непрерывности в нормальном приближении для p-значения. (Опционально, по умолчанию: 1.) [UInt64](../../../sql-reference/data-types/int-uint.md).

**Возвращаемые значения**

[Кортеж](../../../sql-reference/data-types/tuple.md) с двумя элементами:

- рассчитанный U-статистик. [Float64](../../../sql-reference/data-types/float.md).
- рассчитанное p-значение. [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Входная таблица:

```text
┌─sample_data─┬─sample_index─┐
│          10 │            0 │
│          11 │            0 │
│          12 │            0 │
│           1 │            1 │
│           2 │            1 │
│           3 │            1 │
└─────────────┴──────────────┘
```

Запрос:

```sql
SELECT mannWhitneyUTest('greater')(sample_data, sample_index) FROM mww_ttest;
```

Результат:

```text
┌─mannWhitneyUTest('greater')(sample_data, sample_index)─┐
│ (9,0.04042779918503192)                                │
└────────────────────────────────────────────────────────┘
```

**Смотрите также**

- [Тест U Манна-Уитни](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)
- [Стохастический порядок](https://en.wikipedia.org/wiki/Stochastic_ordering)