---
description: 'Применяет t-тест Стьюдента к выборкам из двух популяций.'
sidebar_label: 'studentTTest'
sidebar_position: 194
slug: /sql-reference/aggregate-functions/reference/studentttest
title: 'studentTTest'
---


# studentTTest

Применяет t-тест Стьюдента к выборкам из двух популяций.

**Синтаксис**

```sql
studentTTest([confidence_level])(sample_data, sample_index)
```

Значения обеих выборок находятся в столбце `sample_data`. Если `sample_index` равен 0, то значение в этой строке принадлежит выборке из первой популяции. В противном случае, оно принадлежит выборке из второй популяции. Нулевая гипотеза состоит в том, что средние значения популяций равны. Предполагается нормальное распределение с равными дисперсиями.

**Аргументы**

- `sample_data` — Выборка данных. [Целое](../../../sql-reference/data-types/int-uint.md), [Число с плавающей запятой](../../../sql-reference/data-types/float.md) или [Десятичное число](../../../sql-reference/data-types/decimal.md).
- `sample_index` — Индекс выборки. [Целое](../../../sql-reference/data-types/int-uint.md).

**Параметры**

- `confidence_level` — Уровень доверия для расчета доверительных интервалов. [Число с плавающей запятой](../../../sql-reference/data-types/float.md).

**Возвращаемые значения**

[Кортеж](../../../sql-reference/data-types/tuple.md) с двумя или четырьмя элементами (если указан необязательный `confidence_level`):

- рассчитанное t-статистическое значение. [Float64](../../../sql-reference/data-types/float.md).
- рассчитанное p-значение. [Float64](../../../sql-reference/data-types/float.md).
- [рассчитанный нижний предел доверительного интервала. [Float64](../../../sql-reference/data-types/float.md).]
- [рассчитанный верхний предел доверительного интервала. [Float64](../../../sql-reference/data-types/float.md).]

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

**Смотрите также**

- [t-тест Стьюдента](https://en.wikipedia.org/wiki/Student%27s_t-test)
- [функция welchTTest](/sql-reference/aggregate-functions/reference/welchttest)
