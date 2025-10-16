---
slug: '/sql-reference/aggregate-functions/reference/minmap'
sidebar_position: 169
description: 'Выясняет минимальное значение из массива `value` в соответствии с'
title: minMap
doc_type: reference
---
# minMap

Вызывает минимальное значение из массива `value` в соответствии с ключами, указанными в массиве `key`.

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
- Передача кортежа ключей и массивов значений идентична передаче массива ключей и массива значений.
- Число элементов в `key` и `value` должно быть одинаковым для каждой строки, которая суммируется.
:::

**Параметры**

- `key` — Массив ключей. [Array](../../data-types/array.md).
- `value` — Массив значений. [Array](../../data-types/array.md).

**Возвращаемое значение**

- Возвращает кортеж из двух массивов: ключи в отсортированном порядке и значения, вычисленные для соответствующих ключей. [Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md)).

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