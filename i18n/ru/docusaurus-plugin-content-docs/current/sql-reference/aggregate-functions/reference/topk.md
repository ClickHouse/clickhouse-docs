---
slug: '/sql-reference/aggregate-functions/reference/topk'
sidebar_position: 202
description: 'Возвращает массив приблизительно самых частых значений в указанной'
title: topK
doc_type: reference
---
# topK

Возвращает массив приблизительно самых частых значений в указанной колонке. Результирующий массив отсортирован по убыванию приблизительной частоты значений (не по самим значениям).

Реализует алгоритм [Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) для анализа TopK, основанный на алгоритме reduce-and-combine из [Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003).

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

Эта функция не гарантирует точный результат. В некоторых ситуациях могут возникнуть ошибки, и она может вернуть частые значения, которые не являются самыми частыми.

Рекомендуем использовать значение `N < 10`; производительность снижается с большими значениями `N`. Максимальное значение `N = 65536`.

**Параметры**

- `N` — Количество элементов для возвращения. Необязательный. Значение по умолчанию: 10.
- `load_factor` — Определяет, сколько ячеек зарезервировано для значений. Если uniq(column) > N * load_factor, результат функции topK будет приблизительным. Необязательный. Значение по умолчанию: 3.
- `counts` — Определяет, должен ли результат содержать приблизительное количество и значение ошибки.

**Аргументы**

- `column` — Значение для вычисления частоты.

**Пример**

Возьмите набор данных [OnTime](../../../getting-started/example-datasets/ontime.md) и выберите три наиболее часто встречающихся значения в колонке `AirlineID`.

```sql
SELECT topK(3)(AirlineID) AS res
FROM ontime
```

```text
┌─res─────────────────┐
│ [19393,19790,19805] │
└─────────────────────┘
```

**Смотрите также**

- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)