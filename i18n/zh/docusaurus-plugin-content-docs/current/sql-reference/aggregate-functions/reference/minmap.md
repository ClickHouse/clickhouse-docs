---
description: '根据 `key` 数组中指定的键，从 `value` 数组中计算对应的最小值。'
sidebar_position: 169
slug: /sql-reference/aggregate-functions/reference/minmap
title: 'minMap'
doc_type: 'reference'
---

# minMap {#minmap}

根据 `key` 数组中指定的键，从 `value` 数组中计算最小值。

**语法**

```sql
`minMap(键, 值)`
```

或者

```sql
minMap(元组(键, 值))
```

Alias: `minMappedArrays`

:::note

* 传递一个由键数组和值数组组成的元组，与分别传递键数组和值数组是等价的。
* 对于每一行聚合数据，`key` 与 `value` 中的元素数量必须相同。
  :::

**参数**

* `key` — 键的数组。[Array](../../data-types/array.md)。
* `value` — 值的数组。[Array](../../data-types/array.md)。

**返回值**

* 返回一个包含两个数组的元组：按排序顺序排列的键，以及为相应键计算得到的值。[Tuple](../../data-types/tuple.md)([Array](../../data-types/array.md), [Array](../../data-types/array.md))。

**示例**

查询：

```sql
SELECT minMap(a, b)
FROM VALUES('a Array(Int32), b Array(Int64)', ([1, 2], [2, 2]), ([2, 3], [1, 1]))
```

结果：

```text
┌─minMap(a, b)──────┐
│ ([1,2,3],[2,1,1]) │
└───────────────────┘
```
