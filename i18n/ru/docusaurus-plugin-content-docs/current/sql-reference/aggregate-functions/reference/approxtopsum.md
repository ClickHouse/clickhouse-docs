---
slug: '/sql-reference/aggregate-functions/reference/approxtopsum'
sidebar_position: 108
description: 'Возвращает массив приблизительно самых частых значений и их количество'
title: approx_top_sum
doc_type: reference
---
# approx_top_sum

Возвращает массив приблизительно самых частых значений и их подсчетов в указанной колонке. Результирующий массив отсортирован в порядке убывания приблизительной частоты значений (не по самим значениям). Дополнительно учитывается вес значения.

```sql
approx_top_sum(N)(column, weight)
approx_top_sum(N, reserved)(column, weight)
```

Эта функция не предоставляет гарантированный результат. В некоторых случаях могут возникать ошибки, и она может возвращать частые значения, которые не являются наиболее частыми.

Рекомендуем использовать значение `N < 10`; производительность снижается с увеличением значений `N`. Максимальное значение `N = 65536`.

**Параметры**

- `N` — Количество элементов для возврата. Необязательный. Значение по умолчанию: 10.
- `reserved` — Определяет, сколько ячеек зарезервировано для значений. Если uniq(column) > reserved, результат функции topK будет приблизительным. Необязательный. Значение по умолчанию: N * 3.
 
**Аргументы**

- `column` — Значение для расчета частоты.
- `weight` — Вес. Каждое значение учитывается `weight` раз для расчета частоты. [UInt64](../../../sql-reference/data-types/int-uint.md).

**Пример**

Запрос:

```sql
SELECT approx_top_sum(2)(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

Результат:

```text
┌─approx_top_sum(2)(k, w)─┐
│ [('z',10,0),('x',5,0)]  │
└─────────────────────────┘
```

**См. также**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)