---
slug: /sql-reference/functions/time-series-functions
sidebar_position: 172
sidebar_label: Временные ряды
---


# Временные функции

Ниже представленные функции используются для анализа рядов данных.

## seriesOutliersDetectTukey {#seriesoutliersdetecttukey}

Выявляет выбросы в рядах данных с использованием [высот Тьюки](https://en.wikipedia.org/wiki/Outlier#Tukey%27s_fences).

**Синтаксис**

``` sql
seriesOutliersDetectTukey(series);
seriesOutliersDetectTukey(series, min_percentile, max_percentile, K);
```

**Аргументы**

- `series` - Массив числовых значений.
- `min_percentile` - Минимальный процентиль, используемый для вычисления межквартильного размаха [(IQR)](https://en.wikipedia.org/wiki/Interquartile_range). Значение должно быть в диапазоне [0.02,0.98]. По умолчанию 0.25.
- `max_percentile` - Максимальный процентиль, используемый для вычисления межквартильного размаха (IQR). Значение должно быть в диапазоне [0.02,0.98]. По умолчанию 0.75.
- `K` - Ненегативное постоянное значение для выявления более слабых или более сильных выбросов. Значение по умолчанию 1.5.

Для выявления выбросов требуется минимум четыре точки данных в `series`.

**Возвращаемое значение**

- Возвращает массив такой же длины, как и входной массив, где каждое значение представляет собой оценку возможной аномалии соответствующего элемента в ряду. Ненулевое значение указывает на возможную аномалию. [Array](../data-types/array.md).

**Примеры**

Запрос:

``` sql
SELECT seriesOutliersDetectTukey([-3, 2, 15, 3, 5, 6, 4, 5, 12, 45, 12, 3, 3, 4, 5, 6]) AS print_0;
```

Результат:

``` text
┌───────────print_0─────────────────┐
│[0,0,0,0,0,0,0,0,0,27,0,0,0,0,0,0] │
└───────────────────────────────────┘
```

Запрос:

``` sql
SELECT seriesOutliersDetectTukey([-3, 2, 15, 3, 5, 6, 4.50, 5, 12, 45, 12, 3.40, 3, 4, 5, 6], 0.2, 0.8, 1.5) AS print_0;
```

Результат:

``` text
┌─print_0──────────────────────────────┐
│ [0,0,0,0,0,0,0,0,0,19.5,0,0,0,0,0,0] │
└──────────────────────────────────────┘
```

## seriesPeriodDetectFFT {#seriesperioddetectfft}

Находит период данных в заданном ряду, используя FFT
FFT - [Быстрое преобразование Фурье](https://en.wikipedia.org/wiki/Fast_Fourier_transform)

**Синтаксис**

``` sql
seriesPeriodDetectFFT(series);
```

**Аргументы**

- `series` - Массив числовых значений

**Возвращаемое значение**

- Реальное значение, равное периоду ряда данных. NaN, если количество точек данных меньше четырех. [Float64](../data-types/float.md).

**Примеры**

Запрос:

``` sql
SELECT seriesPeriodDetectFFT([1, 4, 6, 1, 4, 6, 1, 4, 6, 1, 4, 6, 1, 4, 6, 1, 4, 6, 1, 4, 6]) AS print_0;
```

Результат:

``` text
┌───────────print_0──────┐
│                      3 │
└────────────────────────┘
```

``` sql
SELECT seriesPeriodDetectFFT(arrayMap(x -> abs((x % 6) - 3), range(1000))) AS print_0;
```

Результат:

``` text
┌─print_0─┐
│       6 │
└─────────┘
```

## seriesDecomposeSTL {#seriesdecomposestl}

Разлагает ряд данных с использованием STL [(Процедура разложения сезонного тренда на основе Loess)](https://www.wessa.net/download/stl.pdf) на сезонный, трендовый и остаточный компоненты.

**Синтаксис**

``` sql
seriesDecomposeSTL(series, period);
```

**Аргументы**

- `series` - Массив числовых значений
- `period` - Положительное целое число

Количество точек данных в `series` должно быть как минимум в два раза больше значения `period`.

**Возвращаемое значение**

- Массив из четырех массивов, где первый массив содержит сезонные компоненты, второй массив - тренд, третий массив - остаточный компонент, а четвертый массив - базовый компонент (сезонный + тренд). [Array](../data-types/array.md).

**Примеры**

Запрос:

``` sql
SELECT seriesDecomposeSTL([10.1, 20.45, 40.34, 10.1, 20.45, 40.34, 10.1, 20.45, 40.34, 10.1, 20.45, 40.34, 10.1, 20.45, 40.34, 10.1, 20.45, 40.34, 10.1, 20.45, 40.34, 10.1, 20.45, 40.34], 3) AS print_0;
```

Результат:

``` text
┌───────────print_0──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [[
        -13.529999, -3.1799996, 16.71,      -13.53,     -3.1799996, 16.71,      -13.53,     -3.1799996,
        16.71,      -13.530001, -3.18,      16.710001,  -13.530001, -3.1800003, 16.710001,  -13.530001,
        -3.1800003, 16.710001,  -13.530001, -3.1799994, 16.71,      -13.529999, -3.1799994, 16.709997
    ],
    [
        23.63,     23.63,     23.630003, 23.630001, 23.630001, 23.630001, 23.630001, 23.630001,
        23.630001, 23.630001, 23.630001, 23.63,     23.630001, 23.630001, 23.63,     23.630001,
        23.630001, 23.63,     23.630001, 23.630001, 23.630001, 23.630001, 23.630001, 23.630003
    ],
    [
        0, 0.0000019073486, -0.0000019073486, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.0000019073486, 0,
        0
    ],
    [
        10.1, 20.449999, 40.340004, 10.100001, 20.45, 40.34, 10.100001, 20.45, 40.34, 10.1, 20.45, 40.34,
        10.1, 20.45, 40.34, 10.1, 20.45, 40.34, 10.1, 20.45, 40.34, 10.100002, 20.45, 40.34
    ]]                                                                                                                   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
