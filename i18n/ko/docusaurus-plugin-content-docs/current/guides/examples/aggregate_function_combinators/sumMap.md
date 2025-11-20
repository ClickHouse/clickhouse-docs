---
'slug': '/examples/aggregate-function-combinators/sumMap'
'title': 'sumMap'
'description': 'sumMap 조합기를 사용하는 예제'
'keywords':
- 'sum'
- 'map'
- 'combinator'
- 'examples'
- 'sumMap'
'sidebar_label': 'sumMap'
'doc_type': 'reference'
---


# sumMap {#summap}

## 설명 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 조합자는 [`sum`](/sql-reference/aggregate-functions/reference/sum) 함수에 적용되어 각 키에 따라 맵의 값의 합계를 계산합니다. 이때 `sumMap` 집계 조합자 함수를 사용합니다.

## 사용 예시 {#example-usage}

이 예제에서는 서로 다른 시간대에 대한 상태 코드와 해당 카운트를 저장하는 테이블을 생성합니다. 각 행은 상태 코드와 해당 카운트를 맵으로 포함합니다. 우리는 `sumMap`을 사용하여 각 시간대 내에서 각 상태 코드의 총 카운트를 계산합니다.

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

`sumMap` 함수는 각 시간대 내에서 각 상태 코드에 대한 총 카운트를 계산합니다. 예를 들어:
- 시간대 '2000-01-01 00:00:00':
  - 상태 'a': 15
  - 상태 'b': 25
  - 상태 'c': 35 + 45 = 80
  - 상태 'd': 55
  - 상태 'e': 65
- 시간대 '2000-01-01 00:01:00':
  - 상태 'd': 75
  - 상태 'e': 85
  - 상태 'f': 95 + 105 = 200
  - 상태 'g': 115 + 125 = 240

```response title="Response"
   ┌────────────timeslot─┬─sumMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':200,'g':240}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':80,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 참조 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`Map 조합자`](/sql-reference/aggregate-functions/combinators#-map)
