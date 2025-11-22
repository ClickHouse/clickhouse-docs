---
description: '根据 `key` 数组中指定的键，从 `value` 数组中计算最大值。'
sidebar_position: 165
slug: /sql-reference/aggregate-functions/reference/maxmap
title: 'maxMap'
doc_type: 'reference'
---

# maxMap

根据 `key` 数组中指定的键，求出 `value` 数组中的最大值。

**语法**

```sql
maxMap(key, value)
```

或

```sql
maxMap(Tuple(key, value))
```

Alias: `maxMappedArrays`

:::note

* 传入一个由键数组和值数组组成的元组，与分别传入两个数组（键数组和值数组）是等价的。
* 对于每一行参与汇总的记录，`key` 和 `value` 中的元素数量必须相同。
  :::

**参数**

* `key` — 键的数组。[Array](../../data-types/array.md)。
* `value` — 值的数组。[Array](../../data-types/array.md)。

**返回值**

* 返回一个由两个数组组成的元组：按排序顺序排列的键，以及对应键计算得到的值。[Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md))。

**示例**

查询：

```sql
SELECT maxMap(a, b)
FROM VALUES('a Array(Char), b Array(Int64)', (['x', 'y'], [2, 2]), (['y', 'z'], [3, 1]))
```

结果：

```text
┌─maxMap(a, b)───────────┐
│ [['x','y','z'],[2,3,1]]│
└────────────────────────┘
```
