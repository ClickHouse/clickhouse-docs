---
slug: '/examples/aggregate-function-combinators/minMap'
title: 'minMap'
description: 'minMap 组合子使用示例'
keywords: ['min', 'map', 'combinator', 'examples', 'minMap']
sidebar_label: 'minMap'
doc_type: 'reference'
---



# minMap {#minmap}



## 描述 {#description}

可以将 [`Map`](/sql-reference/aggregate-functions/combinators#-map) 组合器应用于 [`min`](/sql-reference/aggregate-functions/reference/min)
函数，从而使用 `minMap` 聚合函数组合器按键计算 Map 中的最小值。



## 使用示例 {#example-usage}

在本示例中，我们将创建一张表，用于存储不同时段的状态码及其计数，
其中每一行都包含一个将状态码映射到其对应计数的 Map。我们将使用
`minMap` 来求出每个时间段内各状态码的最小计数。

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
    minMap(status),
FROM metrics
GROUP BY timeslot;
```

`minMap` 函数会在每个时间段内，为每个状态码找出其最小计数值。例如：

* 在时间段 &#39;2000-01-01 00:00:00&#39; 中：
  * 状态 &#39;a&#39;：15
  * 状态 &#39;b&#39;：25
  * 状态 &#39;c&#39;：min(35, 45) = 35
  * 状态 &#39;d&#39;：55
  * 状态 &#39;e&#39;：65
* 在时间段 &#39;2000-01-01 00:01:00&#39; 中：
  * 状态 &#39;d&#39;：75
  * 状态 &#39;e&#39;：85
  * 状态 &#39;f&#39;：min(95, 105) = 95
  * 状态 &#39;g&#39;：min(115, 125) = 115

```response title="Response"
   ┌────────────timeslot─┬─minMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':95,'g':115}       │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':35,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## 另请参阅 {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`Map 组合器`](/sql-reference/aggregate-functions/combinators#-map)
