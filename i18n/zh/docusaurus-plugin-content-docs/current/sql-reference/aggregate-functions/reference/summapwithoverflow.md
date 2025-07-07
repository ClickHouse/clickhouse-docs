---
'description': '根据 `key` 数组中指定的键，总计 `value` 数组。返回两个数组的元组：按排序顺序排列的键，以及为对应键汇总的值。与 sumMap
  函数的不同之处在于它可以进行带溢出的求和。'
'sidebar_position': 199
'slug': '/sql-reference/aggregate-functions/reference/summapwithoverflow'
'title': 'sumMapWithOverflow'
---


# sumMapWithOverflow

根据 `key` 数组中指定的键对 `value` 数组进行求和。返回一个包含两个数组的元组：按排序顺序排列的键和对应键的求和值。它与 [sumMap](../reference/summap.md) 函数的不同之处在于，它进行溢出求和——即针对求和返回与参数数据类型相同的数据类型。

**语法**

- `sumMapWithOverflow(key <Array>, value <Array>)` [数组类型](../../data-types/array.md)。
- `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [元组类型](../../data-types/tuple.md)。

**参数**

- `key`: [数组](../../data-types/array.md) 键。
- `value`: [数组](../../data-types/array.md) 值。

传递键值数组的元组相当于分别传递键数组和值数组。

:::note 
`key` 和 `value` 中的元素数量必须对于每一行都是相同的以进行求和。
:::

**返回值**

- 返回一个包含两个数组的元组：按排序顺序排列的键和对应键的求和值。

**示例**

首先，我们创建一个名为 `sum_map` 的表，并插入一些数据。键和值的数组分别存储在名为 `statusMap` 的列中，类型为 [Nested](../../data-types/nested-data-structures/index.md)，并作为名为 `statusMapTuple` 的列一起存储，类型为 [tuple](../../data-types/tuple.md)，以说明上述函数的两种不同语法的用法。

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

如果我们使用 `sumMap`、`sumMapWithOverflow` 的数组类型语法和 `toTypeName` 函数查询该表，则可以看到，对于 `sumMapWithOverflow` 函数，求和值数组的数据类型与参数类型相同，都是 `UInt8`（即求和是有溢出的）。对于 `sumMap`，求和值数组的数据类型已经从 `UInt8` 变为 `UInt64`，以确保不发生溢出。

查询：

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

同样，我们可以使用元组语法得到相同的结果。

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

**另见**

- [sumMap](../reference/summap.md)
