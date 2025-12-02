---
description: 'Вычисляет приближённый квантиль выборки, состоящей из чисел в формате bfloat16.'
sidebar_position: 171
slug: /sql-reference/aggregate-functions/reference/quantilebfloat16
title: 'quantileBFloat16'
doc_type: 'reference'
---

# quantileBFloat16Weighted {#quantilebfloat16weighted}

Как `quantileBFloat16`, но с учётом веса каждого элемента последовательности.

Вычисляет приближённый [квантиль](https://en.wikipedia.org/wiki/Quantile) выборки, состоящей из чисел в формате [bfloat16](https://en.wikipedia.org/wiki/Bfloat16_floating-point_format). `bfloat16` — это тип чисел с плавающей запятой с 1 битом знака, 8 битами порядка и 7 битами мантиссы.
Функция преобразует входные значения в 32-битные числа с плавающей запятой и берёт 16 наиболее значимых битов. Затем она вычисляет значение квантиля в формате `bfloat16` и преобразует результат в 64-битное число с плавающей запятой путём добавления нулевых битов.
Функция является быстрым оценивателем квантиля с относительной погрешностью не более 0,390625%.

**Синтаксис**

```sql
quantileBFloat16[(level)](expr)
```

Псевдоним: `medianBFloat16`

**Аргументы**

* `expr` — столбец с числовыми данными. [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md).

**Параметры**

* `level` — уровень квантиля. Необязательный параметр. Возможные значения находятся в диапазоне от 0 до 1. Значение по умолчанию: 0.5. [Float](../../../sql-reference/data-types/float.md).

**Возвращаемое значение**

* Приближённый квантиль указанного уровня.

Тип: [Float64](/sql-reference/data-types/float).

**Пример**

Входная таблица содержит целочисленный столбец и столбец с плавающей запятой:

```text
┌─a─┬─────b─┐
│ 1 │ 1.001 │
│ 2 │ 1.002 │
│ 3 │ 1.003 │
│ 4 │ 1.004 │
└───┴───────┘
```

Запрос для вычисления 0,75-квантили (третьего квартиля):

```sql
SELECT quantileBFloat16(0.75)(a), quantileBFloat16(0.75)(b) FROM example_table;
```

Результат:

```text
┌─quantileBFloat16(0.75)(a)─┬─quantileBFloat16(0.75)(b)─┐
│                         3 │                         1 │
└───────────────────────────┴───────────────────────────┘
```

Обратите внимание, что все числа с плавающей запятой в примере усекаются до 1.0 при преобразовании в `bfloat16`.

**См. также**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
