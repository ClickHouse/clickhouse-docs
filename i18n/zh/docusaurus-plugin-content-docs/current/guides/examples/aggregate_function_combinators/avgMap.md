---
'slug': '/examples/aggregate-function-combinators/avgMap'
'title': 'avgMap'
'description': '使用 avgMap 组合器的示例'
'keywords':
- 'avg'
- 'map'
- 'combinator'
- 'examples'
- 'avgMap'
'sidebar_label': 'avgMap'
'doc_type': 'reference'
---


# avgMap {#avgmap}

## 描述 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 组合器可以应用于 [`avg`](/sql-reference/aggregate-functions/reference/avg) 函数，以根据每个键计算 Map 中值的算术平均值，使用 `avgMap` 聚合组合器函数。

## 示例用法 {#example-usage}

在这个例子中，我们将创建一个表，该表存储不同时间段的状态代码及其计数，其中每行包含一个状态代码到其对应计数的 Map。我们将使用 `avgMap` 计算每个时间段内每个状态代码的平均计数。

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

`avgMap` 函数将计算每个时间段内每个状态代码的平均计数。例如：
- 在时间段 '2000-01-01 00:00:00'：
  - 状态 'a': 15
  - 状态 'b': 25
  - 状态 'c': (35 + 45) / 2 = 40
  - 状态 'd': 55
  - 状态 'e': 65
- 在时间段 '2000-01-01 00:01:00'：
  - 状态 'd': 75
  - 状态 'e': 85
  - 状态 'f': (95 + 105) / 2 = 100
  - 状态 'g': (115 + 125) / 2 = 120

```response title="Response"
   ┌────────────timeslot─┬─avgMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':100,'g':120}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':40,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 另请参阅 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Map 组合器`](/sql-reference/aggregate-functions/combinators#-map)
