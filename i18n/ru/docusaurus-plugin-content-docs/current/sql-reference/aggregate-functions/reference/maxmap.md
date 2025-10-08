---
slug: '/sql-reference/aggregate-functions/reference/maxmap'
sidebar_position: 165
description: 'Вычисляет максимальное значение из массива `value` в соответствии'
title: maxMap
doc_type: reference
---
# maxMap

Вычисляет максимум из массива `value` в соответствии с ключами, указанными в массиве `key`.

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
- Передача кортежа ключей и массивов значений идентична передаче двух массивов ключей и значений.
- Число элементов в `key` и `value` должно быть одинаковым для каждой строки, которая подводится в итог.
:::

**Параметры**

- `key` — Массив ключей. [Array](../../data-types/array.md).
- `value` — Массив значений. [Array](../../data-types/array.md).

**Возвращаемое значение**

- Возвращает кортеж из двух массивов: ключи в отсортированном порядке и значения, рассчитанные для соответствующих ключей. [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md)).

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