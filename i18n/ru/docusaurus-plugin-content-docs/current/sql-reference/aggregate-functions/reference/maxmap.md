---
description: 'Вычисляет максимальное значение из массива `value` в соответствии с ключами, заданными в массиве `key`.'
sidebar_position: 165
slug: /sql-reference/aggregate-functions/reference/maxmap
title: 'maxMap'
doc_type: 'reference'
---

# maxMap

Вычисляет максимальное значение из массива `value` по ключам, указанным в массиве `key`.

**Синтаксис**

```sql
maxMap(key, value)
```

или

```sql
maxMap(Tuple(key, value))
```

Псевдоним: `maxMappedArrays`

:::note

* Передача кортежа из массива ключей и массива значений эквивалентна передаче двух отдельных массивов ключей и значений.
* Количество элементов в `key` и `value` должно быть одинаковым для каждой агрегируемой строки.
  :::

**Параметры**

* `key` — массив ключей. [Array](../../data-types/array.md).
* `value` — массив значений. [Array](../../data-types/array.md).

**Возвращаемое значение**

* Возвращает кортеж из двух массивов: ключи в отсортированном порядке и значения, вычисленные для соответствующих ключей. [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md)).

**Пример**

Запрос:

```sql
SELECT maxMap(a, b)
FROM VALUES('a Array(Char), b Array(Int64)', (['x', 'y'], [2, 2]), (['y', 'z'], [3, 1]))
```

Результат:

```text
┌─maxMap(a, b)───────────┐
│ [['x','y','z'],[2,3,1]]│
└────────────────────────┘
```
