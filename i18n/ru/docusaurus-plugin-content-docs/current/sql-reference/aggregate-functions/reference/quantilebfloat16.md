---
slug: '/sql-reference/aggregate-functions/reference/quantilebfloat16'
sidebar_position: 171
description: 'Вычисляет приблизительный квантиль выборки, состоящей из bfloat16'
title: quantileBFloat16
doc_type: reference
---
# quantileBFloat16Weighted

Как и `quantileBFloat16`, но учитывает вес каждого элемента последовательности.

Вычисляет приближенный [квантиль](https://en.wikipedia.org/wiki/Quantile) выборки, состоящей из [bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) чисел. `bfloat16` — это тип данных с плавающей запятой с 1 битом знака, 8 битами экспоненты и 7 битами дробной части. Функция преобразует входные значения в 32-битные числа с плавающей запятой и берет 16 наиболее значащих бит. Затем она вычисляет значение квантиля `bfloat16` и преобразует результат в 64-битное число с плавающей запятой, добавляя нулевые биты. Функция является быстрым оценщиком квантили с относительной ошибкой не более 0.390625%.

**Синтаксис**

```sql
quantileBFloat16[(level)](expr)
```

Псевдоним: `medianBFloat16`

**Аргументы**

- `expr` — Колонка с числовыми данными. [Целое](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md).

**Параметры**

- `level` — Уровень квантиля. Необязательный. Возможные значения находятся в диапазоне от 0 до 1. Значение по умолчанию: 0.5. [Float](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

- Приблизительный квантиль указанного уровня.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

Входная таблица содержит целочисленные и плавающие колонки:

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

Запрос на вычисление 0.75-квантили (третий квартиль):

```sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

Результат:

```text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```
Обратите внимание, что все значения с плавающей запятой в примере обрезаются до 1.0 при преобразовании в `bfloat16`.

**См. Также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)