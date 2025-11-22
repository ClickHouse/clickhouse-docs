---
description: '根据 `key` 数组中指定的键，对一个或多个 `value` 数组求和。返回一个数组元组：首先是按排序后的顺序排列的键数组，然后是对应键的求和值数组，且不会发生溢出。'
sidebar_position: 198
slug: /sql-reference/aggregate-functions/reference/summap
title: 'sumMap'
doc_type: 'reference'
---

# sumMap

根据 `key` 数组中指定的键，对一个或多个 `value` 数组进行求和。返回一个由数组组成的元组：第一个数组为按排序后的顺序排列的键，后面是针对相应键汇总求和后的值数组，且不会产生溢出。

**语法**

* `sumMap(key <Array>, value1 <Array>[, value2 <Array>, ...])` [Array 类型](../../data-types/array.md)。
* `sumMap(Tuple(key <Array>[, value1 <Array>, value2 <Array>, ...]))` [Tuple 类型](../../data-types/tuple.md)。

别名：`sumMappedArrays`。

**参数**

* `key`：[Array](../../data-types/array.md) 类型的键数组。
* `value1`、`value2`、...：对每个键进行求和的[Array](../../data-types/array.md) 类型的值数组。

以包含键数组和值数组的 tuple 形式传递参数，与分别传递键数组和值数组是等价的。

:::note
对每一行进行汇总时，`key` 和所有 `value` 数组中的元素数量必须相同。
:::

**返回值**

* 返回一个由数组组成的元组：第一个数组包含按排序后的顺序排列的键，后续数组包含对应键的求和值。

**示例**

首先我们创建一张名为 `sum_map` 的表，并向其中插入一些数据。键数组和值数组以分开的形式存储在名为 `statusMap` 的 [Nested](../../data-types/nested-data-structures/index.md) 类型列中，同时又以组合在一起的形式存储在名为 `statusMapTuple` 的 [tuple](../../data-types/tuple.md) 类型列中，以展示上述该函数两种不同语法用法的示例。

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

接下来，我们使用 `sumMap` 函数查询该表，同时使用数组类型语法和元组类型语法：

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

**包含多个值数组的示例**

`sumMap` 还支持同时对多个值数组进行聚合。
当多项相关指标共享相同键时，这非常有用。


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

* 结果元组包含三个数组
* 第一个数组：按排序顺序排列的键（浏览器名称）
* 第二个数组：每个浏览器的总展示次数
* 第三个数组：每个浏览器的总点击次数

**另请参阅**

* [Map 数据类型的 Map 组合器](../combinators.md#-map)
* [sumMapWithOverflow](../reference/summapwithoverflow.md)
