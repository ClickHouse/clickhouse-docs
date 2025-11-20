---
'slug': '/examples/aggregate-function-combinators/maxMap'
'title': 'maxMap'
'description': 'maxMap 조합기를 사용하는 예제'
'keywords':
- 'max'
- 'map'
- 'combinator'
- 'examples'
- 'maxMap'
'sidebar_label': 'maxMap'
'doc_type': 'reference'
---


# maxMap {#maxmap}

## 설명 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 조합자는 [`max`](/sql-reference/aggregate-functions/reference/max) 함수에 적용되어 각 키에 따라 맵에서 최대 값을 계산하는 `maxMap` 집계 조합자 함수를 사용할 수 있습니다.

## 예제 사용법 {#example-usage}

이번 예제에서는 서로 다른 시간 슬롯에 대한 상태 코드와 해당 카운트를 저장하는 테이블을 생성합니다. 각 행에는 상태 코드와 해당 카운트를 나타내는 맵이 포함됩니다. 우리는 각 시간 슬롯 내에서 각 상태 코드에 대한 최대 카운트를 찾기 위해 `maxMap`을 사용할 것입니다.

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

`maxMap` 함수는 각 시간 슬롯 내에서 각 상태 코드에 대한 최대 카운트를 찾습니다. 예를 들어:
- 시간 슬롯 '2000-01-01 00:00:00':
  - 상태 'a': 15
  - 상태 'b': 25
  - 상태 'c': max(35, 45) = 45
  - 상태 'd': 55
  - 상태 'e': 65
- 시간 슬롯 '2000-01-01 00:01:00':
  - 상태 'd': 75
  - 상태 'e': 85
  - 상태 'f': max(95, 105) = 105
  - 상태 'g': max(115, 125) = 125

```response title="Response"
   ┌────────────timeslot─┬─maxMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':105,'g':125}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':45,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 참조 {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`Map 조합자`](/sql-reference/aggregate-functions/combinators#-map)
