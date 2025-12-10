---
description: 'Возвращает массив приближённо самых частых значений и числа их вхождений в указанном столбце.'
sidebar_position: 108
slug: /sql-reference/aggregate-functions/reference/approxtopsum
title: 'approx_top_sum'
doc_type: 'reference'
---

# approx&#95;top&#95;sum {#approx&#95;top&#95;sum}

Возвращает массив приблизительно самых частых значений и количества их вхождений в указанном столбце. Полученный массив сортируется в порядке убывания приблизительной частоты значений (не по самим значениям). Дополнительно учитывается вес значения.

```sql
approx_top_sum(N)(column, weight)
approx_top_sum(N, reserved)(column, weight)
```

Эта функция не гарантирует точный результат. В некоторых ситуациях возможны ошибки, и она может возвращать часто встречающиеся значения, которые не являются самыми частыми.

Максимальное значение параметра `N` — 65536.

**Параметры**

* `N` — количество элементов для возврата. Необязательный параметр. Значение по умолчанию: 10.
* `reserved` — определяет, сколько ячеек зарезервировать для значений. Если uniq(column) &gt; reserved, результат функции topK будет приближённым. Необязательный параметр. Значение по умолчанию: N * 3.

**Аргументы**

* `column` — значение, для которого вычисляется частота.
* `weight` — вес. Каждое значение учитывается `weight` раз при вычислении частоты. [UInt64](../../../sql-reference/data-types/int-uint.md).

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

**Смотрите также**

* [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
* [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
* [approx&#95;top&#95;k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
