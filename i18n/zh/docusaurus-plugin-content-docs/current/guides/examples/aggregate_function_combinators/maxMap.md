---
'slug': '/examples/aggregate-function-combinators/maxMap'
'title': 'maxMap'
'description': '使用 maxMap 组合器的示例'
'keywords':
- 'max'
- 'map'
- 'combinator'
- 'examples'
- 'maxMap'
'sidebar_label': 'maxMap'
---


# maxMap {#maxmap}

## 描述 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 组合器可以应用于 [`max`](/sql-reference/aggregate-functions/reference/max) 函数，以根据每个键来计算 Map 中的最大值，使用 `maxMap` 聚合组合器函数。

## 示例用法 {#example-usage}

在这个例子中，我们将创建一个表，用于存储不同时间段的状态码及其计数，其中每一行包含一个状态码到其对应计数的 Map。我们将使用 `maxMap` 来找出每个时间段内每个状态码的最大计数。

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

`maxMap` 函数将找到每个时间段内每个状态码的最大计数。例如：
- 在时间段 '2000-01-01 00:00:00'：
  - 状态 'a': 15
  - 状态 'b': 25
  - 状态 'c': max(35, 45) = 45
  - 状态 'd': 55
  - 状态 'e': 65
- 在时间段 '2000-01-01 00:01:00'：
  - 状态 'd': 75
  - 状态 'e': 85
  - 状态 'f': max(95, 105) = 105
  - 状态 'g': max(115, 125) = 125

```response title="Response"
   ┌────────────timeslot─┬─maxMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':105,'g':125}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':45,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 另见 {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`Map 组合器`](/sql-reference/aggregate-functions/combinators#-map)
