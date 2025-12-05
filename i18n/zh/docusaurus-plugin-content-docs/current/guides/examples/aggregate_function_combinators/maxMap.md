---
slug: '/examples/aggregate-function-combinators/maxMap'
title: 'maxMap'
description: '使用 maxMap 组合器的示例'
keywords: ['max', 'map', 'combinator', 'examples', 'maxMap']
sidebar_label: 'maxMap'
doc_type: 'reference'
---



# maxMap {#maxmap}



## 描述 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 组合器可以应用于 [`max`](/sql-reference/aggregate-functions/reference/max)
函数，使用 `maxMap` 聚合函数组合器按键计算 Map 中每个键对应的最大值。



## 示例用法 {#example-usage}

在这个示例中，我们将创建一个表，用于存储不同时间段的状态码及其计数，
其中每一行都包含一个 Map，用于将状态码映射到其对应的计数。我们将使用
`maxMap` 来在每个时间段内计算每个状态码的最大计数值。

```sql title="Query"
CREATE TABLE metrics(
    date Date,
    timeslot DateTime,
    status Map(String, UInt64)
) ENGINE = Log;

INSERT INTO metrics VALUES
    ('2000-01-01', '2000-01-01 00:00:00', (['a', 'b', 'c'], [15, 25, 35])),
    ('2000-01-01', '2000-01-01 00:00:00', (['c', 'd', 'e'], [45, 55, 65])),
    ('2000-01-01', '2000-01-01 00:01:00', (['d', 'e', 'f'], [75, 85, 95])),
    ('2000-01-01', '2000-01-01 00:01:00', (['f', 'g', 'g'], [105, 115, 125]));

SELECT
    timeslot,
    maxMap(status),
FROM metrics
GROUP BY timeslot;
```

`maxMap` 函数会在每个时间段内，为每个状态码找到最大计数值。例如：

* 在时间段 &#39;2000-01-01 00:00:00&#39; 中：
  * 状态 &#39;a&#39;：15
  * 状态 &#39;b&#39;：25
  * 状态 &#39;c&#39;：max(35, 45) = 45
  * 状态 &#39;d&#39;：55
  * 状态 &#39;e&#39;：65
* 在时间段 &#39;2000-01-01 00:01:00&#39; 中：
  * 状态 &#39;d&#39;：75
  * 状态 &#39;e&#39;：85
  * 状态 &#39;f&#39;：max(95, 105) = 105
  * 状态 &#39;g&#39;：max(115, 125) = 125

```response title="Response"
   ┌────────────timeslot─┬─maxMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':105,'g':125}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':45,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## 另请参阅 {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
