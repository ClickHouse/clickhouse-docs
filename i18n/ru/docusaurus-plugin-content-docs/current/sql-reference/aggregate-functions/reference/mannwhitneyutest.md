---
description: 'Применяет rank-тест Манна-Уитни к выборкам из двух популяций.'
sidebar_label: 'mannWhitneyUTest'
sidebar_position: 161
slug: /sql-reference/aggregate-functions/reference/mannwhitneyutest
title: 'mannWhitneyUTest'
---


# mannWhitneyUTest

Применяет rank-тест Манна-Уитни к выборкам из двух популяций.

**Синтаксис**

```sql
mannWhitneyUTest[(alternative[, continuity_correction])](sample_data, sample_index)
```

Значения обеих выборок находятся в колонке `sample_data`. Если `sample_index` равен 0, то значение в этой строке принадлежит выборке из первой популяции. В противном случае оно принадлежит выборке из второй популяции. Нулевая гипотеза заключается в том, что две популяции статистически равны. Также могут быть проверены односторонние гипотезы. Этот тест не предполагает, что данные имеют нормальное распределение.

**Аргументы**

- `sample_data` — данные выборки. [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).
- `sample_index` — индекс выборки. [Integer](../../../sql-reference/data-types/int-uint.md).

**Параметры**

- `alternative` — альтернативная гипотеза. (Необязательный, по умолчанию: `'two-sided'`.) [String](../../../sql-reference/data-types/string.md).
    - `'two-sided'`;
    - `'greater'`;
    - `'less'`.
- `continuity_correction` — если не 0, то применяется корректировка непрерывности в нормальном приближении для p-значения. (Необязательный, по умолчанию: 1.) [UInt64](../../../sql-reference/data-types/int-uint.md).

**Возвращаемые значения**

[Tuple](../../../sql-reference/data-types/tuple.md) с двумя элементами:

- вычисленный U-статистик. [Float64](../../../sql-reference/data-types/float.md).
- вычисленное p-значение. [Float64](../../../sql-reference/data-types/float.md).


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

**См. также**

- [Mann–Whitney U test](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)
- [Stochastic ordering](https://en.wikipedia.org/wiki/Stochastic_ordering)
