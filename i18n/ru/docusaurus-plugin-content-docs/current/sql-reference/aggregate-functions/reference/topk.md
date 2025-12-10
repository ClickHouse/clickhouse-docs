---
description: 'Возвращает массив значений, которые приблизительно чаще всего встречаются в указанном столбце. Результирующий массив отсортирован по убыванию оценочной частоты значений (а не по самим значениям).'
sidebar_position: 202
slug: /sql-reference/aggregate-functions/reference/topk
title: 'topK'
doc_type: 'reference'
---

# topK {#topk}

Возвращает массив приблизительно наиболее часто встречающихся значений в указанном столбце. Полученный массив отсортирован по убыванию приблизительной частоты значений (а не по самим значениям).

Реализует алгоритм [Filtered Space-Saving](https://doi.org/10.1016/j.ins.2010.08.024) для анализа topK, основанный на алгоритме reduce-and-combine из работы [Parallel Space Saving](https://doi.org/10.1016/j.ins.2015.09.003).

```sql
topK(N)(column)
topK(N, load_factor)(column)
topK(N, load_factor, 'counts')(column)
```

Эта функция не гарантирует точный результат. В некоторых случаях могут возникать ошибки, и она может возвращать часто встречающиеся значения, которые при этом не являются самыми частыми.

Максимальное значение `N = 65536`.

**Параметры**

* `N` — количество элементов для возврата. Необязательный параметр. Значение по умолчанию: 10.
* `load_factor` — определяет, сколько ячеек будет зарезервировано для значений. Если uniq(column) &gt; N * load&#95;factor, результат функции topK будет приблизительным. Необязательный параметр. Значение по умолчанию: 3.
* `counts` — определяет, должен ли результат содержать приблизительное количество и значение ошибки.

**Аргументы**

* `column` — значение, для которого рассчитывается частота.

**Пример**

Возьмем набор данных [OnTime](../../../getting-started/example-datasets/ontime.md) и выберем три наиболее часто встречающихся значения в столбце `AirlineID`.

```sql
SELECT topK(3)(AirlineID) AS res
FROM ontime
```

```text
┌─res─────────────────┐
│ [19393,19790,19805] │
└─────────────────────┘
```

**См. также**

* [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
* [approx&#95;top&#95;k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
* [approx&#95;top&#95;sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)
