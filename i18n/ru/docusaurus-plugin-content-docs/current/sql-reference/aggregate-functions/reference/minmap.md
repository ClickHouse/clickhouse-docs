---
description: 'Вычисляет минимальное значение массива `value` с учётом ключей, указанных
  в массиве `key`.'
sidebar_position: 169
slug: /sql-reference/aggregate-functions/reference/minmap
title: 'minMap'
doc_type: 'reference'
---

# minMap

Вычисляет минимальное значение элементов массива `value` по ключам, указанным в массиве `key`.

**Синтаксис**

```sql
`minMap(key, value)`
```

или

```sql
minMap(Tuple(key, value))
```

Alias: `minMappedArrays`

:::note

* Передача кортежа из массивов ключей и значений эквивалентна передаче массива ключей и массива значений.
* Число элементов в `key` и `value` должно совпадать для каждой агрегируемой строки.
  :::

**Параметры**

* `key` — массив ключей. [Array](../../data-types/array.md).
* `value` — массив значений. [Array](../../data-types/array.md).

**Возвращаемое значение**

* Возвращает кортеж из двух массивов: ключи в отсортированном порядке и значения, вычисленные для соответствующих ключей. [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md)).

**Пример**

Запрос:

```sql
SELECT minMap(a, b)
FROM VALUES('a Array(Int32), b Array(Int64)', ([1, 2], [2, 2]), ([2, 3], [1, 1]))
```

Результат:

```text
┌─minMap(a, b)──────┐
│ ([1,2,3],[2,1,1]) │
└───────────────────┘
```
