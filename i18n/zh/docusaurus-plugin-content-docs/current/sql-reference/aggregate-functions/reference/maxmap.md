---
slug: /sql-reference/aggregate-functions/reference/maxmap
sidebar_position: 165
title: 'maxMap'
description: '根据 `key` 数组中指定的键计算 `value` 数组中的最大值。'
---


# maxMap

根据 `key` 数组中指定的键计算 `value` 数组中的最大值。

**语法**

```sql
maxMap(key, value)
```
或者
```sql
maxMap(Tuple(key, value))
```

别名: `maxMappedArrays`

:::note
- 传递一个键和值数组的元组与传递两个键和值数组是相同的。
- 对于每一行的总和，`key` 和 `value` 中的元素数量必须相同。
:::

**参数**

- `key` — 键的数组。 [数组](../../data-types/array.md)。
- `value` — 值的数组。 [数组](../../data-types/array.md)。

**返回值**

- 返回一个包含两个数组的元组：排序后的键和为对应键计算的值。 [元组](../../data-types/tuple.md)([数组](../../data-types/array.md), [数组](../../data-types/array.md))。

**示例**

查询:

``` sql
SELECT maxMap(a, b)
FROM values('a Array(Char), b Array(Int64)', (['x', 'y'], [2, 2]), (['y', 'z'], [3, 1]))
```

结果:

``` text
┌─maxMap(a, b)───────────┐
│ [['x','y','z'],[2,3,1]]│
└────────────────────────┘
```
