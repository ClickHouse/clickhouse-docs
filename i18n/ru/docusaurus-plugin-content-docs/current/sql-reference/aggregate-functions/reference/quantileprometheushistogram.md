---
'description': 'Вычисляет квантиль гистограммы, используя линейную интерполяцию.'
'sidebar_position': 364
'slug': '/sql-reference/aggregate-functions/reference/quantilePrometheusHistogram'
'title': 'quantilePrometheusHistogram'
'doc_type': 'reference'
---
# quantilePrometheusHistogram

Вычисляет [квантиль](https://en.wikipedia.org/wiki/Quantile) гистограммы с использованием линейной интерполяции, учитывая кумулятивное значение и верхние границы каждого ведра гистограммы.

Чтобы получить интерполированное значение, все переданные значения объединяются в массив, который затем сортируется по соответствующим значениям верхней границы ведра. Интерполяция квантиля выполняется аналогично функции PromQL [histogram_quantile()](https://prometheus.io/docs/prometheus/latest/querying/functions/#histogram_quantile) на классической гистограмме, выполняя линейную интерполяцию с использованием нижней и верхней границы ведра, в котором находится позиция квантиля.

**Синтаксис**

```sql
quantilePrometheusHistogram(level)(bucket_upper_bound, cumulative_bucket_value)
```

**Аргументы**

- `level` — Уровень квантиля. Необязательный параметр. Константное число с плавающей точкой от 0 до 1. Рекомендуется использовать значение `level` в диапазоне `[0.01, 0.99]`. Значение по умолчанию: `0.5`. При `level=0.5` функция вычисляет [медиану](https://en.wikipedia.org/wiki/Median).

- `bucket_upper_bound` — Верхние границы ведер гистограммы.

  - У самого высокого ведра должна быть верхняя граница `+Inf`.

- `cumulative_bucket_value` — Кумулятивные [UInt](../../../sql-reference/data-types/int-uint) или [Float64](../../../sql-reference/data-types/float.md) значения ведер гистограммы.

  - Значения должны возрастать монотонно по мере увеличения верхней границы ведра.

**Возвращаемое значение**

- Квантиль заданного уровня.

Тип:

- `Float64`.

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

- [медиана](/sql-reference/aggregate-functions/reference/median)
- [квантили](../../../sql-reference/aggregate-functions/reference/quantiles.md#quantiles)