---
slug: /sql-reference/aggregate-functions/reference/summapwithoverflow
sidebar_position: 199
title: 'sumMapWithOverflow'
description: '根据`key`数组中指定的键对`value`数组进行求和。返回一个包含两个数组的元组：按顺序排列的键和对应键的求和值。与sumMap函数的不同之处在于，它会处理溢出情况。'
---


# sumMapWithOverflow

根据`key`数组中指定的键对`value`数组进行求和。返回一个包含两个数组的元组：按顺序排列的键和对应键的求和值。它与[sumMap](../reference/summap.md)函数的不同之处在于，它会处理溢出情况——即对求和返回与参数数据类型相同的数据类型。

**语法**

- `sumMapWithOverflow(key <Array>, value <Array>)` [Array type](../../data-types/array.md).
- `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [Tuple type](../../data-types/tuple.md).

**参数** 

- `key`: [Array](../../data-types/array.md) 类型的键。
- `value`: [Array](../../data-types/array.md) 类型的值。

传递键和值数组的元组与单独传递键数组和值数组是同义的。

:::note 
对于每个需要求和的行，`key`和`value`中的元素数量必须相同。
:::

**返回值** 

- 返回一个包含两个数组的元组：按顺序排列的键和对应键的求和值。

**示例**

首先我们创建一个名为`sum_map`的表，并插入一些数据。键和值的数组分别存储在名为`statusMap`的[Nested](../../data-types/nested-data-structures/index.md)类型的列中，以及共同存储在名为`statusMapTuple`的[tuple](../../data-types/tuple.md)类型的列中，以说明上述两种不同语法的使用。

查询：

``` sql
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

如果我们使用`sumMap`、`sumMapWithOverflow`以及`toTypeName`函数查询表格，我们可以看到对于`sumMapWithOverflow`函数，求和值数组的数据类型与参数类型相同，均为`UInt8`（即进行了溢出的求和）。而对于`sumMap`，求和值数组的数据类型已从`UInt8`更改为`UInt64`，以防止出现溢出。

查询：

``` sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

同样，我们也可以使用元组语法得到相同的结果。

``` sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMapTuple)),
    toTypeName(sumMapWithOverflow(statusMapTuple)),
FROM sum_map
GROUP BY timeslot
```

结果：

``` text
   ┌────────────timeslot─┬─toTypeName(sumMap(statusMap.status, statusMap.requests))─┬─toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests))─┐
1. │ 2000-01-01 00:01:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
2. │ 2000-01-01 00:00:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
   └─────────────────────┴──────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘
```

**另请参见**
    
- [sumMap](../reference/summap.md)
