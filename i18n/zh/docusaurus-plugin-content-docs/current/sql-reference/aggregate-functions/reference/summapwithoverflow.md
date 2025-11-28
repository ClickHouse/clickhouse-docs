---
description: '根据 `key` 数组中指定的键，对 `value` 数组进行求和。返回一个包含两个数组的元组：按排序顺序排列的键数组，以及对应键的求和值数组。与 sumMap 函数不同之处在于，它执行的是允许溢出的求和。'
sidebar_position: 199
slug: /sql-reference/aggregate-functions/reference/summapwithoverflow
title: 'sumMapWithOverflow'
doc_type: 'reference'
---

# sumMapWithOverflow

根据 `key` 数组中指定的键，对 `value` 数组进行求和。返回一个由两个数组组成的元组：排好序的键数组，以及对应键的求和值数组。
它与 [sumMap](../reference/summap.md) 函数的区别在于，它执行的是允许溢出的求和——即求和结果的数据类型与参数的数据类型相同。

**语法**

* `sumMapWithOverflow(key <Array>, value <Array>)` [Array 类型](../../data-types/array.md)。
* `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [Tuple 类型](../../data-types/tuple.md)。

**参数**

* `key`：键的 [Array](../../data-types/array.md)。
* `value`：值的 [Array](../../data-types/array.md)。

将由键数组和值数组组成的元组作为参数，与分别传入键数组和值数组是等价的。

:::note
对每一行进行汇总时，`key` 和 `value` 中的元素数量必须相同。
:::

**返回值**

* 返回一个由两个数组组成的元组：排好序的键数组，以及对应键的求和值数组。

**示例**

首先，我们创建一张名为 `sum_map` 的表，并向其中插入一些数据。键数组和值数组分别存储在 [Nested](../../data-types/nested-data-structures/index.md) 类型的 `statusMap` 列中，同时也以 [tuple](../../data-types/tuple.md) 类型组合存储在 `statusMapTuple` 列中，以说明上文所述的此函数两种不同语法的用法。

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

如果我们使用数组类型语法配合 `sumMap`、`sumMapWithOverflow` 以及 `toTypeName` 函数来查询该表，可以看到，
对于 `sumMapWithOverflow` 函数，累加值数组的数据类型与参数类型相同，都是 `UInt8`（即求和是按可能发生溢出的方式进行的）。对于 `sumMap`，累加值数组的数据类型则从 `UInt8` 变为 `UInt64`，从而避免了溢出。

查询：

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

同样地，我们可以使用 `tuple` 语法来得到相同的结果。

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
