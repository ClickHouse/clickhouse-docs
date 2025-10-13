---
slug: '/sql-reference/aggregate-functions/reference/topkweighted'
sidebar_position: 203
description: 'Возвращает массив примеров наиболее частых значений в указанной колонке.'
title: topKWeighted
doc_type: reference
---
# topKWeighted

Возвращает массив примерно самых частых значений в указанной колонке. Результирующий массив отсортирован в порядке убывания приблизительной частоты значений (а не по самим значениям). Дополнительно учитывается вес значения.

**Синтаксис**

```sql
topKWeighted(N)(column, weight)
topKWeighted(N, load_factor)(column, weight)
topKWeighted(N, load_factor, 'counts')(column, weight)
```

**Параметры**

- `N` — Количество элементов для возврата. Необязательный. Значение по умолчанию: 10.
- `load_factor` — Определяет, сколько ячеек зарезервировано для значений. Если uniq(column) > N * load_factor, результат функции topK будет приблизительным. Необязательный. Значение по умолчанию: 3.
- `counts` — Определяет, должен ли результат содержать приблизительное количество и значение ошибки.

**Аргументы**

- `column` — Значение.
- `weight` — Вес. Каждое значение учитывается `weight` раз при расчете частоты. [UInt64](../../../sql-reference/data-types/int-uint.md).

**Возвращаемое значение**

Возвращает массив значений с максимальной приблизительной суммой весов.

**Пример**

Запрос:

```sql
SELECT topKWeighted(2)(k, w) FROM
VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

Результат:

```text
┌─topKWeighted(2)(k, w)──┐
│ ['z','x']              │
└────────────────────────┘
```

Запрос:

```sql
SELECT topKWeighted(2, 10, 'counts')(k, w)
FROM VALUES('k Char, w UInt64', ('y', 1), ('y', 1), ('x', 5), ('y', 1), ('z', 10))
```

Результат:

```text
┌─topKWeighted(2, 10, 'counts')(k, w)─┐
│ [('z',10,0),('x',5,0)]              │
└─────────────────────────────────────┘
```

**См. также**

- [topK](../../../sql-reference/aggregate-functions/reference/topk.md)
- [approx_top_k](../../../sql-reference/aggregate-functions/reference/approxtopk.md)
- [approx_top_sum](../../../sql-reference/aggregate-functions/reference/approxtopsum.md)