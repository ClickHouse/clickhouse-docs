---
description: 'Возвращает массив приблизительно наиболее частых значений и количества их вхождений в указанном столбце.'
sidebar_position: 107
slug: /sql-reference/aggregate-functions/reference/approxtopk
title: 'approx_top_k'
doc_type: 'reference'
---

# approx&#95;top&#95;k {#approx&#95;top&#95;k}

Возвращает массив приблизительно наиболее часто встречающихся значений и количества их вхождений в указанном столбце. Результирующий массив отсортирован по убыванию приблизительной частоты значений (а не по самим значениям).

```sql
approx_top_k(N)(column)
approx_top_k(N, reserved)(column)
```

Эта функция не даёт гарантированного результата. В отдельных случаях возможны ошибки, и она может возвращать часто встречающиеся значения, которые на самом деле не являются самыми частотными.

Максимальное значение `N = 65536`.

**Параметры**

* `N` — количество возвращаемых элементов. Необязательный параметр. Значение по умолчанию: 10.
* `reserved` — определяет, сколько ячеек зарезервировать под значения. Если uniq(column) &gt; reserved, результат работы функции topK будет приблизительным. Необязательный параметр. Значение по умолчанию: N * 3.

**Аргументы**

* `column` — значение, для которого вычисляется частота.

**Пример**

Запрос:

```sql
SELECT approx_top_k(2)(k)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10));
```

Результат:

```text
┌─approx_top_k(2)(k)────┐
│ [('y',3,0),('x',1,0)] │
└───────────────────────┘
```

# approx&#95;top&#95;count {#approx&#95;top&#95;count}

Является синонимом функции `approx_top_k`

**См. также**

* [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
* [topKWeighted](../../../sql-reference/aggregate-functions/reference/topkweighted.md)
* [approx&#95;top&#95;sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)