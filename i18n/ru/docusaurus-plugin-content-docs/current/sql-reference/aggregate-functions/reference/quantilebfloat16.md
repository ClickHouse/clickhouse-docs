---
description: 'Вычисляет приблизительный квантиль выборки, состоящей из чисел bfloat16.'
sidebar_position: 171
slug: /sql-reference/aggregate-functions/reference/quantilebfloat16
title: 'quantileBFloat16'
---


# quantileBFloat16Weighted

Как и `quantileBFloat16`, но учитывает вес каждого элемента последовательности.

Вычисляет приблизительный [квантиль](https://en.wikipedia.org/wiki/Quantile) выборки, состоящей из чисел [bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format). `bfloat16` — это формат чисел с плавающей запятой с 1 битом знака, 8 битами порядка и 7 битами мантиссы. 
Функция преобразует входные значения в 32-битные числа с плавающей запятой и принимает 16 наиболее значащих бит. Затем она вычисляет значение квантиля `bfloat16` и преобразует результат в 64-битное число с плавающей запятой, добавляя нулевые биты. 
Эта функция является быстрым оценщиком квантили с относительной ошибкой не более 0.390625%.

**Синтаксис**

```sql
quantileBFloat16[(level)](expr)
```

Псевдоним: `medianBFloat16`

**Аргументы**

- `expr` — Столбец с числовыми данными. [Целые числа](../../../sql-reference/data-types/int-uint.md), [Числа с плавающей запятой](../../../sql-reference/data-types/float.md).

**Параметры**

- `level` — Уровень квантиля. Необязательный. Допустимые значения в диапазоне от 0 до 1. Значение по умолчанию: 0.5. [Числа с плавающей запятой](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

- Приблизительный квантиль указанного уровня.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

Входная таблица имеет столбцы с целыми и вещественными числами:

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
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

Результат:

```text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```
Обратите внимание, что все значения с плавающей запятой в примере округляются до 1.0 при преобразовании в `bfloat16`.

**См. также**

- [median](/sql-reference/aggregate-functions/reference/median)
- [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
