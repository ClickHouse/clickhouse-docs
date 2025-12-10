---
description: 'Вычисляет квантиль гистограммы с использованием линейной интерполяции.'
sidebar_position: 364
slug: /sql-reference/aggregate-functions/reference/quantilePrometheusHistogram
title: 'quantilePrometheusHistogram'
doc_type: 'reference'
---

# quantilePrometheusHistogram {#quantileprometheushistogram}

Вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) гистограммы с использованием линейной интерполяции с учётом накопленного значения и верхних границ каждого интервала (бакета) гистограммы.

Для получения интерполированного значения все переданные значения объединяются в массив, который затем сортируется по соответствующим верхним границам бакетов. После этого интерполяция квантили выполняется аналогично функции PromQL [histogram&#95;quantile()](https://prometheus.io/docs/prometheus/latest/querying/functions/#histogram_quantile) для классической гистограммы: выполняется линейная интерполяция, используя нижнюю и верхнюю границы бакета, в котором находится позиция квантили.

**Синтаксис**

```sql
quantilePrometheusHistogram(level)(bucket_upper_bound, cumulative_bucket_value)
```

**Аргументы**

* `level` — уровень квантиля. Необязательный параметр. Константное число с плавающей запятой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: `0.5`. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).

* `bucket_upper_bound` — верхние границы бакетов гистограммы.

  * Верхний (последний) бакет должен иметь верхнюю границу `+Inf`.

* `cumulative_bucket_value` — накопительные значения типа [UInt](../../../sql-reference/data-types/int-uint) или [Float64](../../../sql-reference/data-types/float.md) для бакетов гистограммы.

  * Значения должны монотонно возрастать по мере увеличения верхней границы бакета.

**Возвращаемое значение**

* Квантиль заданного уровня.

Тип:

* `Float64`.

**Пример**

Входная таблица:

```text
   ┌─bucket_upper_bound─┬─cumulative_bucket_value─┐
1. │                  0 │                       6 │
2. │                0.5 │                      11 │
3. │                  1 │                      14 │
4. │                inf │                      19 │
   └────────────────────┴─────────────────────────┘
```

Результат:

```text
   ┌─quantilePrometheusHistogram(bucket_upper_bound, cumulative_bucket_value)─┐
1. │                                                                     0.35 │
   └──────────────────────────────────────────────────────────────────────────┘
```

**См. также**

* [median](/sql-reference/aggregate-functions/reference/median)
* [quantiles](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)
