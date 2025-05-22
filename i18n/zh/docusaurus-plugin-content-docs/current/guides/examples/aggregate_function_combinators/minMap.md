
# minMap {#minmap}

## 描述 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 组合器可以应用于 [`min`](/sql-reference/aggregate-functions/reference/min) 函数，以根据每个键计算 Map 中的最小值，使用 `minMap` 聚合组合器函数。

## 示例用法 {#example-usage}

在这个示例中，我们将创建一个表，存储不同时间段的状态码及其计数，其中每一行包含一个状态码到其对应计数的 Map。我们将使用 `minMap` 找出每个时间段内每个状态码的最小计数。

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

`minMap` 函数将在每个时间段内找到每个状态码的最小计数。例如：
- 在时间段 '2000-01-01 00:00:00'：
  - 状态 'a': 15
  - 状态 'b': 25
  - 状态 'c': min(35, 45) = 35
  - 状态 'd': 55
  - 状态 'e': 65
- 在时间段 '2000-01-01 00:01:00'：
  - 状态 'd': 75
  - 状态 'e': 85
  - 状态 'f': min(95, 105) = 95
  - 状态 'g': min(115, 125) = 115

```response title="Response"
   ┌────────────timeslot─┬─minMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':95,'g':115}       │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':35,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 另见 {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`Map 组合器`](/sql-reference/aggregate-functions/combinators#-map)
