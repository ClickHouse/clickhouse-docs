---
slug: '/examples/aggregate-function-combinators/sumMap'
title: 'sumMap'
description: 'sumMap 组合器使用示例'
keywords: ['sum', 'map', 'combinator', 'examples', 'sumMap']
sidebar_label: 'sumMap'
doc_type: 'reference'
---

# sumMap {#summap}

## 描述 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 组合器可以应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum)
函数，此时会使用 `sumMap` 聚合组合器函数，根据每个键计算 Map 中对应值的总和。

## 示例用法 {#example-usage}

在本示例中，我们将创建一张表，用于存储不同时间段内的状态码及其计数，其中每一行都包含一个 Map，用于将状态码映射到其对应的计数。我们将使用
`sumMap` 来计算每个时间段内各状态码的总计数。

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
    sumMap(status),
FROM metrics
GROUP BY timeslot;
```

`sumMap` 函数会计算每个时间段内各状态码的总数。例如：

* 在时间段 &#39;2000-01-01 00:00:00&#39; 内：
  * 状态 &#39;a&#39;：15
  * 状态 &#39;b&#39;：25
  * 状态 &#39;c&#39;：35 + 45 = 80
  * 状态 &#39;d&#39;：55
  * 状态 &#39;e&#39;：65
* 在时间段 &#39;2000-01-01 00:01:00&#39; 内：
  * 状态 &#39;d&#39;：75
  * 状态 &#39;e&#39;：85
  * 状态 &#39;f&#39;：95 + 105 = 200
  * 状态 &#39;g&#39;：115 + 125 = 240

```response title="Response"
   ┌────────────timeslot─┬─sumMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':200,'g':240}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':80,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 另请参阅 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`Map 组合器`](/sql-reference/aggregate-functions/combinators#-map)
