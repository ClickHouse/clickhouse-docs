---
slug: /sql-reference/aggregate-functions/reference/quantilebfloat16
sidebar_position: 171
title: quantileBFloat16
description: "Вычисляет приблизительный квантиль выборки, состоящей из чисел bfloat16."
---

Вычисляет приблизительный [квантиль](https://ru.wikipedia.org/wiki/Квантиль) выборки, состоящей из [bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format) чисел. `bfloat16` — это тип данных с плавающей запятой, содержащий 1 бит знака, 8 бит экспоненты и 7 бит мантиссы.  
Функция преобразует входные значения в 32-битные числа с плавающей запятой и берет 16 самых значащих бит. Затем рассчитывает значение квантиля `bfloat16` и преобразует результат в 64-битное число с плавающей запятой, добавляя нулевые биты.  
Эта функция является быстрым оценщиком квантиля с относительной ошибкой не более 0.390625%.

**Синтаксис**

``` sql
quantileBFloat16[(level)](expr)
```

Псевдоним: `medianBFloat16`

**Аргументы**

- `expr` — Колонка с числовыми данными. [Целое](../../../sql-reference/data-types/int-uint.md), [Число с плавающей запятой](../../../sql-reference/data-types/float.md).

**Параметры**

- `level` — Уровень квантиля. Необязательный. Возможные значения находятся в диапазоне от 0 до 1. Значение по умолчанию: 0.5. [Число с плавающей запятой](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

- Приблизительный квантиль указанного уровня.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

Входная таблица содержит целые и вещественные колонки:

``` text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

Запрос для вычисления 0.75-квантили (третьего квартиля):

``` sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

Результат:

``` text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```
Обратите внимание, что все значения с плавающей точкой в примере округлены до 1.0 при преобразовании в `bfloat16`.


# quantileBFloat16Weighted

Как `quantileBFloat16`, но учитывает вес каждого члена последовательности.

**См. также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
