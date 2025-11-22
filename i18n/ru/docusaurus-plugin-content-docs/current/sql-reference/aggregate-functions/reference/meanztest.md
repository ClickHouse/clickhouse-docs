---
description: 'Применяет z‑критерий для сравнения средних по выборкам из двух генеральных совокупностей.'
sidebar_label: 'meanZTest'
sidebar_position: 166
slug: /sql-reference/aggregate-functions/reference/meanztest
title: 'meanZTest'
doc_type: 'reference'
---

# meanZTest

Применяет z‑критерий для сравнения средних по выборкам из двух генеральных совокупностей.

**Синтаксис**

```sql
meanZTest(population_variance_x, population_variance_y, confidence_level)(sample_data, sample_index)
```

Значения обеих выборок находятся в столбце `sample_data`. Если `sample_index` равен 0, то значение в этой строке относится к выборке из первой генеральной совокупности. В противном случае оно относится к выборке из второй генеральной совокупности.
Нулевая гипотеза состоит в том, что средние значения генеральных совокупностей равны. Предполагается нормальное распределение. Генеральные совокупности могут иметь различную дисперсию, и эти дисперсии считаются известными.

**Аргументы**

* `sample_data` — Данные выборки. [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).
* `sample_index` — Индекс выборки. [Integer](../../../sql-reference/data-types/int-uint.md).

**Параметры**

* `population_variance_x` — Дисперсия для генеральной совокупности x. [Float](../../../sql-reference/data-types/float.md).
* `population_variance_y` — Дисперсия для генеральной совокупности y. [Float](../../../sql-reference/data-types/float.md).
* `confidence_level` — Уровень доверия для вычисления доверительных интервалов. [Float](../../../sql-reference/data-types/float.md).

**Возвращаемые значения**

[Tuple](../../../sql-reference/data-types/tuple.md), содержащий четыре элемента:

* вычисленная t-статистика. [Float64](../../../sql-reference/data-types/float.md).
* вычисленное p-значение. [Float64](../../../sql-reference/data-types/float.md).
* нижняя граница доверительного интервала. [Float64](../../../sql-reference/data-types/float.md).
* верхняя граница доверительного интервала. [Float64](../../../sql-reference/data-types/float.md).

**Пример**

Входная таблица:

```text
┌─sample_data─┬─sample_index─┐
│        20.3 │            0 │
│        21.9 │            0 │
│        22.1 │            0 │
│        18.9 │            1 │
│          19 │            1 │
│        20.3 │            1 │
└─────────────┴──────────────┘
```

Запрос:

```sql
SELECT meanZTest(0.7, 0.45, 0.95)(sample_data, sample_index) FROM mean_ztest
```

Результат:

```text
┌─meanZTest(0.7, 0.45, 0.95)(sample_data, sample_index)────────────────────────────┐
│ (3.2841296025548123,0.0010229786769086013,0.8198428246768334,3.2468238419898365) │
└──────────────────────────────────────────────────────────────────────────────────┘
```
