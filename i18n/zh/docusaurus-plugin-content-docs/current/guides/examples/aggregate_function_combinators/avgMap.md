---
slug: '/examples/aggregate-function-combinators/avgMap'
title: 'avgMap'
description: '使用 avgMap 组合器的示例'
keywords: ['avg', 'map', '组合器', '示例', 'avgMap']
sidebar_label: 'avgMap'
doc_type: 'reference'
---

# avgMap \\{#avgmap\\}

## 描述 \\{#description\\}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 组合器可以应用于 [`avg`](/sql-reference/aggregate-functions/reference/avg)
函数，使用 `avgMap` 聚合组合器，根据每个键计算 Map 中值的算术平均值。

## 示例用法 \\{#example-usage\\}

在这个示例中，我们将创建一张表，用于存储不同时间段的状态码及其计数，每一行都包含一个将状态码映射到其对应计数的 `Map`。我们将使用 `avgMap` 来计算每个时间段内各个状态码的平均计数。

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
    avgMap(status),
FROM metrics
GROUP BY timeslot;
```

`avgMap` 函数会计算每个时间段内每个状态码的平均计数。例如：

* 在时间段 &#39;2000-01-01 00:00:00&#39; 中：
  * 状态 &#39;a&#39;：15
  * 状态 &#39;b&#39;：25
  * 状态 &#39;c&#39;：(35 + 45) / 2 = 40
  * 状态 &#39;d&#39;：55
  * 状态 &#39;e&#39;：65
* 在时间段 &#39;2000-01-01 00:01:00&#39; 中：
  * 状态 &#39;d&#39;：75
  * 状态 &#39;e&#39;：85
  * 状态 &#39;f&#39;：(95 + 105) / 2 = 100
  * 状态 &#39;g&#39;：(115 + 125) / 2 = 120

```response title="Response"
   ┌────────────timeslot─┬─avgMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':100,'g':120}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':40,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 另请参阅 \\{#see-also\\}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Map 组合器`](/sql-reference/aggregate-functions/combinators#-map)
