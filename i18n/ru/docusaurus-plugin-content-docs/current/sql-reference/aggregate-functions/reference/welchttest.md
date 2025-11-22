---
description: 'Применяет t-критерий Уэлча к выборкам из двух генеральных совокупностей.'
sidebar_label: 'welchTTest'
sidebar_position: 214
slug: /sql-reference/aggregate-functions/reference/welchttest
title: 'welchTTest'
doc_type: 'reference'
---

# welchTTest

Применяет t-критерий Уэлча к выборкам из двух генеральных совокупностей.

**Синтаксис**

```sql
welchTTest([confidence_level])(sample_data, sample_index)
```

Значения обеих выборок содержатся в столбце `sample_data`. Если `sample_index` равен 0, значение в этой строке относится к выборке из первой генеральной совокупности. В противном случае оно относится к выборке из второй генеральной совокупности.\
Нулевая гипотеза состоит в том, что средние значения генеральных совокупностей равны. Предполагается нормальное распределение. Генеральные совокупности могут иметь неравные дисперсии.

**Аргументы**

* `sample_data` — данные выборки. [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).
* `sample_index` — индекс выборки. [Integer](../../../sql-reference/data-types/int-uint.md).

**Параметры**

* `confidence_level` — уровень доверия для вычисления доверительных интервалов. [Float](../../../sql-reference/data-types/float.md).

**Возвращаемые значения**

[Tuple](../../../sql-reference/data-types/tuple.md) с двумя или четырьмя элементами (если указан необязательный параметр `confidence_level`):

* вычисленная t-статистика. [Float64](../../../sql-reference/data-types/float.md).
* вычисленное p-значение. [Float64](../../../sql-reference/data-types/float.md).
* вычисленная нижняя граница доверительного интервала. [Float64](../../../sql-reference/data-types/float.md).
* вычисленная верхняя граница доверительного интервала. [Float64](../../../sql-reference/data-types/float.md).

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

**См. также**

* [t-критерий Уэлча](https://en.wikipedia.org/wiki/Welch%27s_t-test)
* [функция studentTTest](/sql-reference/aggregate-functions/reference/studentttest)
