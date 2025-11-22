---
description: 'Применяет ранговый критерий Манна–Уитни к выборкам из двух генеральных совокупностей.'
sidebar_label: 'mannWhitneyUTest'
sidebar_position: 161
slug: /sql-reference/aggregate-functions/reference/mannwhitneyutest
title: 'mannWhitneyUTest'
doc_type: 'reference'
---

# mannWhitneyUTest

Применяет ранговый критерий Манна–Уитни к выборкам из двух генеральных совокупностей.

**Синтаксис**

```sql
mannWhitneyUTest[(alternative[, continuity_correction])](sample_data, sample_index)
```

Значения обеих выборок находятся в столбце `sample_data`. Если `sample_index` равен 0, то значение в этой строке относится к выборке из первой генеральной совокупности. В противном случае оно относится к выборке из второй генеральной совокупности.
Нулевая гипотеза заключается в том, что две генеральные совокупности стохастически равны. Также могут проверяться односторонние гипотезы. Для этого теста не предполагается, что данные имеют нормальное распределение.

**Аргументы**

* `sample_data` — выборочные данные. [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).
* `sample_index` — индекс выборки. [Integer](../../../sql-reference/data-types/int-uint.md).

**Параметры**

* `alternative` — альтернативная гипотеза. (Необязательный, по умолчанию: `'two-sided'`.) [String](../../../sql-reference/data-types/string.md).
  * `'two-sided'`;
  * `'greater'`;
  * `'less'`.
* `continuity_correction` — если не равен 0, то применяется поправка на непрерывность в нормальной аппроксимации для p-значения. (Необязательный, по умолчанию: 1.) [UInt64](../../../sql-reference/data-types/int-uint.md).

**Возвращаемые значения**

[Tuple](../../../sql-reference/data-types/tuple.md) из двух элементов:

* вычисленная U-статистика. [Float64](../../../sql-reference/data-types/float.md).
* вычисленное p-значение. [Float64](../../../sql-reference/data-types/float.md).

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

* [Критерий Манна — Уитни](https://en.wikipedia.org/wiki/Mann%E2%80%93Whitney_U_test)
* [Стохастический порядок](https://en.wikipedia.org/wiki/Stochastic_ordering)
