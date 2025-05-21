---
'slug': '/examples/aggregate-function-combinators/sumMap'
'title': 'sumMap'
'description': '使用sumMap组合器的示例'
'keywords':
- 'sum'
- 'map'
- 'combinator'
- 'examples'
- 'sumMap'
'sidebar_label': 'sumMap'
---




# sumMap {#summap}

## 描述 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 组合器可以应用于[`sum`](/sql-reference/aggregate-functions/reference/sum)
函数，以根据每个键计算 Map 中值的总和，使用 `sumMap` 
聚合组合函数。

## 示例用法 {#example-usage}

在这个例子中，我们将创建一个表，用于存储不同时间段的状态码及其计数，
每一行包含一个状态码到其对应计数的 Map。我们将使用 
`sumMap` 来计算每个时间段内每个状态码的总计数。

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

`sumMap` 函数将计算每个时间段内每个状态码的总计数。例如：
- 在时间段 '2000-01-01 00:00:00':
  - 状态 'a': 15
  - 状态 'b': 25
  - 状态 'c': 35 + 45 = 80
  - 状态 'd': 55
  - 状态 'e': 65
- 在时间段 '2000-01-01 00:01:00':
  - 状态 'd': 75
  - 状态 'e': 85
  - 状态 'f': 95 + 105 = 200
  - 状态 'g': 115 + 125 = 240

```response title="Response"
   ┌────────────timeslot─┬─sumMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':200,'g':240}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':80,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 另见 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`Map 组合器`](/sql-reference/aggregate-functions/combinators#-map)
