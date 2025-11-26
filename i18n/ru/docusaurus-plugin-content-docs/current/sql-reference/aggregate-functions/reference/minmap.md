---
description: 'Вычисляет минимальное значение из массива `value` в соответствии с ключами, указанными в массиве `key`.'
sidebar_position: 169
slug: /sql-reference/aggregate-functions/reference/minmap
title: 'minMap'
doc_type: 'reference'
---

# minMap

Вычисляет минимум по массиву `value` в соответствии с ключами из массива `key`.

**Синтаксис**

```sql
`minMap(key, value)`
```

или

```sql
minMap(Tuple(key, value))
```

Псевдоним: `minMappedArrays`

:::note

* Передача кортежа, содержащего массивы ключей и значений, эквивалентна передаче массива ключей и массива значений.
* Количество элементов в `key` и `value` должно совпадать для каждой строки, для которой вычисляется итог.
  :::

**Параметры**

* `key` — массив ключей. [Array](../../data-types/array.md).
* `value` — массив значений. [Array](../../data-types/array.md).

**Возвращаемое значение**

* Возвращает кортеж из двух массивов: массив ключей в отсортированном порядке и массив значений, вычисленных для соответствующих ключей. [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md)).

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
