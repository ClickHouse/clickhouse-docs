---
'description': '根据 `key` 数组中指定的键，总计一个或多个 `value` 数组。返回一个数组的元组：按排序顺序排列的键，后面是相应键的总值，且没有溢出。'
'sidebar_position': 198
'slug': '/sql-reference/aggregate-functions/reference/summap'
'title': 'sumMap'
'doc_type': 'reference'
---


# sumMap

根据在 `key` 数组中指定的键，对一个或多个 `value` 数组进行汇总，返回一个元组数组：按排序顺序排列的键，后跟对应键的值总和且没有溢出。

**语法**

- `sumMap(key <Array>, value1 <Array>[, value2 <Array>, ...])` [Array type](../../data-types/array.md).
- `sumMap(Tuple(key <Array>[, value1 <Array>, value2 <Array>, ...]))` [Tuple type](../../data-types/tuple.md).

别名: `sumMappedArrays`。

**参数**

- `key`： [Array](../../data-types/array.md) 类型的键数组。
- `value1`, `value2`, ...： [Array](../../data-types/array.md) 类型的值数组，用于按键汇总。

传递键和值数组的元组是单独传递键数组和值数组的同义词。

:::note 
`key` 和所有 `value` 数组中的元素数量必须在每个被汇总的行中相同。
:::

**返回值**

- 返回一个元组数组：第一个数组包含按排序顺序排列的键，后跟对应键的值总和的数组。

**示例**

首先，我们创建一个名为 `sum_map` 的表，并插入一些数据。键和值的数组分别存储为名为 `statusMap` 的 [Nested](../../data-types/nested-data-structures/index.md) 类型列，并作为名为 `statusMapTuple` 的 [tuple](../../data-types/tuple.md) 类型列一起存储，以展示上述两种不同语法的使用。

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

**带多个值数组的示例**

`sumMap` 还支持同时聚合多个值数组。 当你有共享相同键的相关指标时，这非常有用。

```sql title="Query"
CREATE TABLE multi_metrics(
    date Date,
    browser_metrics Nested(
        browser String,
        impressions UInt32,
        clicks UInt32
    )
)
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO multi_metrics VALUES
    ('2000-01-01', ['Firefox', 'Chrome'], [100, 200], [10, 25]),
    ('2000-01-01', ['Chrome', 'Safari'], [150, 50], [20, 5]),
    ('2000-01-01', ['Firefox', 'Edge'], [80, 40], [8, 4]);

SELECT 
    sumMap(browser_metrics.browser, browser_metrics.impressions, browser_metrics.clicks) AS result
FROM multi_metrics;
```

```text title="Response"
┌─result────────────────────────────────────────────────────────────────────────┐
│ (['Chrome', 'Edge', 'Firefox', 'Safari'], [350, 40, 180, 50], [45, 4, 18, 5]) │
└───────────────────────────────────────────────────────────────────────────────┘
```

在此示例中：
- 结果元组包含三个数组
- 第一个数组：按排序顺序排列的键（浏览器名称）
- 第二个数组：每个浏览器的总展示次数
- 第三个数组：每个浏览器的总点击次数

**另见**

- [Map combinator for Map datatype](../combinators.md#-map)
- [sumMapWithOverflow](../reference/summapwithoverflow.md)
