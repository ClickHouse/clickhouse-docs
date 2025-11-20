---
'slug': '/examples/aggregate-function-combinators/avgMap'
'title': 'avgMap'
'description': 'avgMap 조합기를 사용하는 예제'
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

## 설명 {#description}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 조합자는 [`avg`](/sql-reference/aggregate-functions/reference/avg) 
함수에 적용되어 각 키에 따라 Map의 값의 산술 평균을 계산하는 `avgMap` 집계 조합자 함수를 사용할 수 있습니다.

## 사용 예 {#example-usage}

이 예제에서는 서로 다른 시간 슬롯의 상태 코드와 해당 카운트를 저장하는 테이블을 생성합니다. 
각 행에는 상태 코드와 해당 카운트를 포함하는 Map이 포함됩니다. 우리는 `avgMap`을 사용하여 
각 시간 슬롯 내의 각 상태 코드에 대한 평균 카운트를 계산할 것입니다.

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

`avgMap` 함수는 각 시간 슬롯 내의 각 상태 코드에 대한 평균 카운트를 계산합니다. 예를 들어:
- 시간 슬롯 '2000-01-01 00:00:00':
  - 상태 'a': 15
  - 상태 'b': 25
  - 상태 'c': (35 + 45) / 2 = 40
  - 상태 'd': 55
  - 상태 'e': 65
- 시간 슬롯 '2000-01-01 00:01:00':
  - 상태 'd': 75
  - 상태 'e': 85
  - 상태 'f': (95 + 105) / 2 = 100
  - 상태 'g': (115 + 125) / 2 = 120

```response title="Response"
   ┌────────────timeslot─┬─avgMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':100,'g':120}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':40,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## 추가 참조 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Map 조합자`](/sql-reference/aggregate-functions/combinators#-map)
