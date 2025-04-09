---
description: 'Вычисляет приблизительный квантиль выборки с гарантией относительной ошибки.'
sidebar_position: 171
slug: /sql-reference/aggregate-functions/reference/quantileddsketch
title: 'quantileDD'
---

Вычисляет приблизительный [квантиль](https://en.wikipedia.org/wiki/Quantile) выборки с гарантией относительной ошибки. Это достигается путем построения [DD](https://www.vldb.org/pvldb/vol12/p2195-masson.pdf).

**Синтаксис**

```sql
quantileDD(relative_accuracy, [level])(expr)
```

**Аргументы**

- `expr` — Колонка с числовыми данными. [Целое число](../../../sql-reference/data-types/int-uint.md), [Число с плавающей точкой](../../../sql-reference/data-types/float.md).

**Параметры**

- `relative_accuracy` — Относительная точность квантиля. Возможные значения находятся в диапазоне от 0 до 1. [Число с плавающей точкой](../../../sql-reference/data-types/float.md). Размер зарисовки зависит от диапазона данных и относительной точности. Чем больше диапазон и меньше относительная точность, тем больше зарисовка. Приблизительный размер памяти для зарисовки составляет `log(max_value/min_value)/relative_accuracy`. Рекомендуемое значение — 0.001 или выше.

- `level` — Уровень квантиля. Необязательный параметр. Возможные значения находятся в диапазоне от 0 до 1. Значение по умолчанию: 0.5. [Число с плавающей точкой](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

- Приблизительный квантиль указанного уровня.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

Входная таблица имеет целочисленную и плавающую колонки:

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

Запрос для вычисления 0.75-квантили (третий квартиль):

```sql
SELECT quantileDD(0.01, 0.75)(a), quantileDD(0.01, 0.75)(b) FROM example_table;
```

Результат:

```text
┌─quantileDD(0.01, 0.75)(a)─┬─quantileDD(0.01, 0.75)(b)─┐
│               2.974233423476717 │                            1.01 │
└─────────────────────────────────┴─────────────────────────────────┘
```

**См. Также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
