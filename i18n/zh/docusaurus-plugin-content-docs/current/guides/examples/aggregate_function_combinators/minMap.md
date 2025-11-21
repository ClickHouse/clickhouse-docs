---
slug: '/examples/aggregate-function-combinators/minMap'
title: 'minMap'
description: 'minMap 组合器用法示例'
keywords: ['min', 'map', '组合器', '示例', 'minMap']
sidebar_label: 'minMap'
doc_type: 'reference'
---



# minMap {#minmap}


## 描述 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 组合器可应用于 [`min`](/sql-reference/aggregate-functions/reference/min) 函数，使用 `minMap` 聚合组合器函数计算 Map 中每个键对应的最小值。


## 使用示例 {#example-usage}

在此示例中,我们将创建一个表来存储不同时间槽的状态码及其计数,
其中每行包含一个状态码到其对应计数的 Map。我们将使用
`minMap` 来查找每个时间槽内各状态码的最小计数。

```sql title="查询"
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

`minMap` 函数将查找每个时间槽内各状态码的最小计数。例如:

- 在时间槽 '2000-01-01 00:00:00' 中:
  - 状态 'a': 15
  - 状态 'b': 25
  - 状态 'c': min(35, 45) = 35
  - 状态 'd': 55
  - 状态 'e': 65
- 在时间槽 '2000-01-01 00:01:00' 中:
  - 状态 'd': 75
  - 状态 'e': 85
  - 状态 'f': min(95, 105) = 95
  - 状态 'g': min(115, 125) = 115

```response title="响应"
   ┌────────────timeslot─┬─minMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':95,'g':115}       │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':35,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## 另请参阅 {#see-also}

- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
