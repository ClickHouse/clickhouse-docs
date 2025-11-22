---
description: '根据 `key` 数组中指定的键对 `value` 数组求合计。返回一个包含两个数组的元组：按排序顺序排列的键，以及对应键的值之和。与 sumMap 函数不同，它在求和时允许发生溢出。'
sidebar_position: 199
slug: /sql-reference/aggregate-functions/reference/summapwithoverflow
title: 'sumMapWithOverflow'
doc_type: 'reference'
---

# sumMapWithOverflow

根据 `key` 数组中指定的键对 `value` 数组进行求和。返回一个包含两个数组的元组：按排序顺序排列的键，以及对应键的求和值。\
它与 [sumMap](../reference/summap.md) 函数的不同之处在于，它执行的是可能产生溢出的求和运算——即求和结果的数据类型与参数的数据类型相同。

**语法**

* `sumMapWithOverflow(key <Array>, value <Array>)` [Array 类型](../../data-types/array.md)。
* `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [Tuple 类型](../../data-types/tuple.md)。

**参数**

* `key`：键的 [Array](../../data-types/array.md)。
* `value`：值的 [Array](../../data-types/array.md)。

传入一个由键数组和值数组组成的 Tuple 等价于分别传入一个键数组和一个值数组。

:::note
对于参与汇总的每一行，`key` 和 `value` 中的元素数量必须相同。
:::

**返回值**

* 返回一个包含两个数组的元组：按排序顺序排列的键，以及对应键的求和值。

**示例**

首先我们创建一个名为 `sum_map` 的表，并向其中插入一些数据。键和值的数组分别作为类型为 [Nested](../../data-types/nested-data-structures/index.md) 的 `statusMap` 列存储，同时也组合在一起作为类型为 [Tuple](../../data-types/tuple.md) 的 `statusMapTuple` 列存储，用于演示上文中描述的此函数的两种不同语法用法。

查询：

```sql
CREATE TABLE sum_map(
    date Date,
    timeslot DateTime,
    statusMap Nested(
        status UInt8,
        requests UInt8
    ),
    statusMapTuple Tuple(Array(Int8), Array(Int8))
) ENGINE = Log;
```

```sql
INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10], ([1, 2, 3], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10], ([3, 4, 5], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10], ([4, 5, 6], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10], ([6, 7, 8], [10, 10, 10]));
```

如果我们使用 `sumMap`、使用数组类型语法的 `sumMapWithOverflow` 以及 `toTypeName` 函数来查询该表，那么可以看到，
对于 `sumMapWithOverflow` 函数，求和后的值数组的数据类型与参数类型相同，都是 `UInt8`（即按会发生溢出的方式进行求和）。而对于 `sumMap`，求和后的值数组的数据类型则从 `UInt8` 变为 `UInt64`，从而避免溢出。

查询：

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

同样地，我们也可以使用 tuple 语法来实现同样的结果。

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMapTuple)),
    toTypeName(sumMapWithOverflow(statusMapTuple)),
FROM sum_map
GROUP BY timeslot
```

结果：


```text
   ┌────────────timeslot─┬─toTypeName(sumMap(statusMap.status, statusMap.requests))─┬─toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests))─┐
1. │ 2000-01-01 00:01:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
2. │ 2000-01-01 00:00:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
   └─────────────────────┴──────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘
```

**另请参阅**

* [sumMap](../reference/summap.md)
