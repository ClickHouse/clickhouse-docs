---
slug: /sql-reference/aggregate-functions/reference/maxmap
sidebar_position: 165
title: 'maxMap'
description: 'Calculates the maximum from `value` array according to the keys specified in the `key` array.'
---


# maxMap

Calculates the maximum from `value` array according to the keys specified in the `key` array.

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
- Передача кортежа массивов ключей и значений эквивалентна передаче двух массивов ключей и значений.
- Количество элементов в `key` и `value` должно быть одинаковым для каждой строки, которая суммируется.
:::

**Параметры**

- `key` — Массив ключей. [Array](../../data-types/array.md).
- `value` — Массив значений. [Array](../../data-types/array.md).

**Возвращаемое значение**

- Возвращает кортеж из двух массивов: ключи в отсортированном порядке и значения, рассчитанные для соответствующих ключей. [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md)).

**Пример**

Запрос:

``` sql
SELECT maxMap(a, b)
FROM values('a Array(Char), b Array(Int64)', (['x', 'y'], [2, 2]), (['y', 'z'], [3, 1]))
```

Результат:

``` text
┌─maxMap(a, b)───────────┐
│ [['x','y','z'],[2,3,1]]│
└────────────────────────┘
```
