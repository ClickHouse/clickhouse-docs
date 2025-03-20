---
slug: /sql-reference/aggregate-functions/reference/grouparraymovingavg
sidebar_position: 144
title: 'groupArrayMovingAvg'
description: 'Calculates the moving average of input values.'
---


# groupArrayMovingAvg

Вычисляет скользящее среднее входных значений.

``` sql
groupArrayMovingAvg(numbers_for_summing)
groupArrayMovingAvg(window_size)(numbers_for_summing)
```

Функция может принимать размер окна в качестве параметра. Если он не указан, функция принимает размер окна, равный количеству строк в колонке.

**Аргументы**

- `numbers_for_summing` — [Выражение](/sql-reference/syntax#expressions), возвращающее значение числового типа данных.
- `window_size` — Размер окна для вычисления.

**Возвращаемые значения**

- Массив такого же размера и типа, что и входные данные.

Функция использует [округление к нулю](https://en.wikipedia.org/wiki/Rounding#Rounding_towards_zero). Она отсекает дробные знаки, незначащие для результирующего типа данных.

**Пример**

Таблица `b`:

``` sql
CREATE TABLE t
(
    `int` UInt8,
    `float` Float32,
    `dec` Decimal32(2)
)
ENGINE = TinyLog
```

``` text
┌─int─┬─float─┬──dec─┐
│   1 │   1.1 │ 1.10 │
│   2 │   2.2 │ 2.20 │
│   4 │   4.4 │ 4.40 │
│   7 │  7.77 │ 7.77 │
└─────┴───────┴──────┘
```

Запросы:

``` sql
SELECT
    groupArrayMovingAvg(int) AS I,
    groupArrayMovingAvg(float) AS F,
    groupArrayMovingAvg(dec) AS D
FROM t
```

``` text
┌─I─────────┬─F───────────────────────────────────┬─D─────────────────────┐
│ [0,0,1,3] │ [0.275,0.82500005,1.9250001,3.8675] │ [0.27,0.82,1.92,3.86] │
└───────────┴─────────────────────────────────────┴───────────────────────┘
```

``` sql
SELECT
    groupArrayMovingAvg(2)(int) AS I,
    groupArrayMovingAvg(2)(float) AS F,
    groupArrayMovingAvg(2)(dec) AS D
FROM t
```

``` text
┌─I─────────┬─F────────────────────────────────┬─D─────────────────────┐
│ [0,1,3,5] │ [0.55,1.6500001,3.3000002,6.085] │ [0.55,1.65,3.30,6.08] │
└───────────┴──────────────────────────────────┴───────────────────────┘
```
