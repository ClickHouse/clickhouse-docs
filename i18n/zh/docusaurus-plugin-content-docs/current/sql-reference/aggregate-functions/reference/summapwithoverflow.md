---
'description': 'Totals a `value` array according to the keys specified in the `key`
  array. Returns a tuple of two arrays: keys in sorted order, and values summed for
  the corresponding keys. Differs from the sumMap function in that it does summation
  with overflow.'
'sidebar_position': 199
'slug': '/sql-reference/aggregate-functions/reference/summapwithoverflow'
'title': 'sumMapWithOverflow'
---




# sumMapWithOverflow

根据 `key` 数组中指定的键对 `value` 数组进行总计。返回两个数组的元组：按排序顺序排列的键，以及对应键的总和值。
它与 [sumMap](../reference/summap.md) 函数的不同之处在于，它进行溢出加法——即返回的求和数据类型与参数数据类型相同。

**语法**

- `sumMapWithOverflow(key <Array>, value <Array>)` [Array type](../../data-types/array.md).
- `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [Tuple type](../../data-types/tuple.md).

**参数**

- `key`: [Array](../../data-types/array.md) 类型的键数组。
- `value`: [Array](../../data-types/array.md) 类型的值数组。

传递一个键和值数组的元组与分别传递键数组和值数组是同义的。

:::note 
`key` 和 `value` 中的元素数量必须相同，以便每一行进行总计。
:::

**返回值**

- 返回两个数组的元组：按排序顺序排列的键，以及对应键的总和值。

**示例**

首先，我们创建一个名为 `sum_map` 的表，并向其中插入一些数据。键和值数组分别存储为名为 `statusMap` 的 [Nested](../../data-types/nested-data-structures/index.md) 类型列，并一起存储为名为 `statusMapTuple` 的 [tuple](../../data-types/tuple.md) 类型列，以说明上述函数的两种不同语法的使用。

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

如果我们使用 `sumMap`、`sumMapWithOverflow` 的数组类型语法和 `toTypeName` 函数查询该表，那么我们可以看到，对于 `sumMapWithOverflow` 函数，求和值数组的数据类型与参数类型相同，均为 `UInt8`（即求和时发生了溢出）。对于 `sumMap`，求和值数组的数据类型从 `UInt8` 变为 `UInt64`，以避免发生溢出。

查询：

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

同样，我们也可以使用元组语法以获得相同的结果。

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

**另请参见**

- [sumMap](../reference/summap.md)
