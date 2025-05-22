
# sumMap

根据 `key` 数组中指定的键对 `value` 数组进行求和。返回两个数组的元组：按照顺序排列的键，以及对应键的和值，不会出现溢出。

**语法**

- `sumMap(key <Array>, value <Array>)` [Array type](../../data-types/array.md)。
- `sumMap(Tuple(key <Array>, value <Array>))` [Tuple type](../../data-types/tuple.md)。

别名：`sumMappedArrays`。

**参数**

- `key`：键的 [Array](../../data-types/array.md)。
- `value`：值的 [Array](../../data-types/array.md)。

传递键和值数组的元组与分别传递键数组和值数组是同义的。

:::note 
`key` 和 `value` 中的元素数量对于每一行都必须相同，以便进行求和。
:::

**返回值**

- 返回两个数组的元组：按照顺序排列的键，以及对应键的和值。

**示例**

首先创建一个名为 `sum_map` 的表，并插入一些数据。键和值的数组分别存储为一个名为 `statusMap` 的 [Nested](../../data-types/nested-data-structures/index.md) 类型的列，以及作为一个名为 `statusMapTuple` 的 [tuple](../../data-types/tuple.md) 类型的列，以说明上述两种不同语法的用法。

查询：

```sql
CREATE TABLE sum_map(
    date Date,
    timeslot DateTime,
    statusMap Nested(
        status UInt16,
        requests UInt64
    ),
    statusMapTuple Tuple(Array(Int32), Array(Int32))
) ENGINE = Log;
```
```sql
INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10], ([1, 2, 3], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10], ([3, 4, 5], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10], ([4, 5, 6], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10], ([6, 7, 8], [10, 10, 10]));
```

接下来，我们使用 `sumMap` 函数查询该表，利用数组和元组类型语法：

查询：

```sql
SELECT
    timeslot,
    sumMap(statusMap.status, statusMap.requests),
    sumMap(statusMapTuple)
FROM sum_map
GROUP BY timeslot
```

结果：

```text
┌────────────timeslot─┬─sumMap(statusMap.status, statusMap.requests)─┬─sumMap(statusMapTuple)─────────┐
│ 2000-01-01 00:00:00 │ ([1,2,3,4,5],[10,10,20,10,10])               │ ([1,2,3,4,5],[10,10,20,10,10]) │
│ 2000-01-01 00:01:00 │ ([4,5,6,7,8],[10,10,20,10,10])               │ ([4,5,6,7,8],[10,10,20,10,10]) │
└─────────────────────┴──────────────────────────────────────────────┴────────────────────────────────┘
```

**另请参阅**

- [Map combinator for Map datatype](../combinators.md#-map)
- [sumMapWithOverflow](../reference/summapwithoverflow.md)
