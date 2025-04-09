---
description: 'Применяет средний z-тест к выборкам из двух популяций.'
sidebar_label: 'meanZTest'
sidebar_position: 166
slug: /sql-reference/aggregate-functions/reference/meanztest
title: 'meanZTest'
---


# meanZTest

Применяет средний z-тест к выборкам из двух популяций.

**Синтаксис**

```sql
meanZTest(population_variance_x, population_variance_y, confidence_level)(sample_data, sample_index)
```

Значения обеих выборок находятся в колонке `sample_data`. Если `sample_index` равен 0, то значение в этой строке принадлежит выборке из первой популяции. В противном случае оно принадлежит выборке из второй популяции. Нулевая гипотеза состоит в том, что средние значения популяций равны. Предполагается нормальное распределение. Популяции могут иметь неравные дисперсии, и дисперсии известны.

**Аргументы**

- `sample_data` — Данные выборки. [Целое число](../../../sql-reference/data-types/int-uint.md), [Число с плавающей точкой](../../../sql-reference/data-types/float.md) или [Десятичное число](../../../sql-reference/data-types/decimal.md).
- `sample_index` — Индекс выборки. [Целое число](../../../sql-reference/data-types/int-uint.md).

**Параметры**

- `population_variance_x` — Дисперсия для популяции x. [Число с плавающей точкой](../../../sql-reference/data-types/float.md).
- `population_variance_y` — Дисперсия для популяции y. [Число с плавающей точкой](../../../sql-reference/data-types/float.md).
- `confidence_level` — Уровень доверия для расчета доверительных интервалов. [Число с плавающей точкой](../../../sql-reference/data-types/float.md).

**Возвращаемые значения**

[Кортеж](../../../sql-reference/data-types/tuple.md) с четырьмя элементами:

- рассчитанная t-статистика. [Float64](../../../sql-reference/data-types/float.md).
- рассчитанное p-значение. [Float64](../../../sql-reference/data-types/float.md).
- рассчитанный нижний предел доверительного интервала. [Float64](../../../sql-reference/data-types/float.md).
- рассчитанный верхний предел доверительного интервала. [Float64](../../../sql-reference/data-types/float.md).


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
