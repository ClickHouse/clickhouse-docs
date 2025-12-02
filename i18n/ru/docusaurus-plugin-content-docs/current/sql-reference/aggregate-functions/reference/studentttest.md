---
description: 'Применяет t-критерий Стьюдента к выборкам из двух генеральных совокупностей.'
sidebar_label: 'studentTTest'
sidebar_position: 194
slug: /sql-reference/aggregate-functions/reference/studentttest
title: 'studentTTest'
doc_type: 'reference'
---

# studentTTest {#studentttest}

Применяет t-критерий Стьюдента к выборкам из двух генеральных совокупностей.

**Синтаксис**

```sql
studentTTest([confidence_level])(sample_data, sample_index)
```

Значения обеих выборок находятся в столбце `sample_data`. Если `sample_index` равен 0, то значение в этой строке относится к выборке из первой генеральной совокупности. В противном случае оно относится к выборке из второй генеральной совокупности.
Нулевая гипотеза заключается в том, что средние значения генеральных совокупностей равны. Предполагается нормальное распределение с одинаковыми дисперсиями.

**Аргументы**

* `sample_data` — Данные выборки. [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).
* `sample_index` — Индекс выборки. [Integer](../../../sql-reference/data-types/int-uint.md).

**Параметры**

* `confidence_level` — Уровень доверия для вычисления доверительных интервалов. [Float](../../../sql-reference/data-types/float.md).

**Возвращаемые значения**

[Tuple](../../../sql-reference/data-types/tuple.md) с двумя или четырьмя элементами (если указан необязательный параметр `confidence_level`):

* вычисленная t-статистика. [Float64](../../../sql-reference/data-types/float.md).
* вычисленное p-значение. [Float64](../../../sql-reference/data-types/float.md).
* [вычисленная нижняя граница доверительного интервала. [Float64](../../../sql-reference/data-types/float.md).]
* [вычисленная верхняя граница доверительного интервала. [Float64](../../../sql-reference/data-types/float.md).]

**Пример**

Входная таблица:

```text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        21.1 │            0 │
│        21.9 │            1 │
│        21.7 │            0 │
│        19.9 │            1 │
│        21.8 │            1 │
└─────────────┴──────────────┘
```

Запрос:

```sql
SELECT studentTTest(sample_data, sample_index) FROM student_ttest;
```

Результат:

```text
┌─studentTTest(sample_data, sample_index)───┐
│ (-0.21739130434783777,0.8385421208415731) │
└───────────────────────────────────────────┘
```

**См. также**

* [t-критерий Стьюдента](https://en.wikipedia.org/wiki/Student%27s_t-test)
* [функция welchTTest](/sql-reference/aggregate-functions/reference/welchttest)
