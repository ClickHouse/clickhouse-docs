---
'slug': '/examples/aggregate-function-combinators/minMap'
'title': 'minMap'
'description': 'minMap 조합기를 사용하는 예시'
'keywords':
- 'min'
- 'map'
- 'combinator'
- 'examples'
- 'minMap'
'sidebar_label': 'minMap'
'doc_type': 'reference'
---


# minMap {#minmap}

## 설명 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 조합기는 `min` 함수에 적용되어, `minMap` 집계 조합기 함수를 사용하여 각 키에 따라 Map에서 최소 값을 계산할 수 있습니다.

## 예제 사용법 {#example-usage}

이 예제에서는 상태 코드와 다양한 시간대에 대한 해당 수를 저장하는 테이블을 생성합니다. 각 행은 상태 코드와 해당 수를 매핑한 Map을 포함합니다. 우리는 각 시간대 내에서 각 상태 코드에 대한 최소 수를 찾기 위해 `minMap`을 사용할 것입니다.

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

`minMap` 함수는 각 시간대 내에서 각 상태 코드에 대한 최소 수를 찾습니다. 예를 들어:
- 시간대 '2000-01-01 00:00:00':
  - 상태 'a': 15
  - 상태 'b': 25
  - 상태 'c': min(35, 45) = 35
  - 상태 'd': 55
  - 상태 'e': 65
- 시간대 '2000-01-01 00:01:00':
  - 상태 'd': 75
  - 상태 'e': 85
  - 상태 'f': min(95, 105) = 95
  - 상태 'g': min(115, 125) = 115

```response title="Response"
   ┌────────────timeslot─┬─minMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':95,'g':115}       │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':35,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 추가 정보 {#see-also}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`Map 조합기`](/sql-reference/aggregate-functions/combinators#-map)
