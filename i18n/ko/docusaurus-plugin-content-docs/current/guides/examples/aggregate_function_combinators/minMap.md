---
slug: '/examples/aggregate-function-combinators/minMap'
title: 'minMap'
description: 'minMap 조합자 사용 예제'
keywords: ['min', '맵', 'combinator', '예제', 'minMap']
sidebar_label: 'minMap'
doc_type: 'reference'
---



# minMap \{#minmap\}



## 설명 \{#description\}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 결합자(combinator)는 `minMap` 
집계 결합자 함수(aggregate combinator function)를 사용하여 [`min`](/sql-reference/aggregate-functions/reference/min)
함수를 Map(맵)에 적용함으로써, 각 키별로 Map 안의 최소값을 계산하는 데 사용할 수 있습니다.



## 사용 예시 \{#example-usage\}

이 예에서는 타임슬롯마다 상태 코드와 해당 개수를 저장하는 테이블을 생성합니다.
각 행에는 상태 코드별 개수를 나타내는 맵(Map)이 포함됩니다. `minMap`을 사용하여
각 타임슬롯 내에서 상태 코드별 최소 개수를 구합니다.

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

`minMap` 함수는 각 타임슬롯에서 상태 코드별 최소 카운트를 계산합니다. 예를 들어:

* 타임슬롯 &#39;2000-01-01 00:00:00&#39;:
  * 상태 &#39;a&#39;: 15
  * 상태 &#39;b&#39;: 25
  * 상태 &#39;c&#39;: min(35, 45) = 35
  * 상태 &#39;d&#39;: 55
  * 상태 &#39;e&#39;: 65
* 타임슬롯 &#39;2000-01-01 00:01:00&#39;:
  * 상태 &#39;d&#39;: 75
  * 상태 &#39;e&#39;: 85
  * 상태 &#39;f&#39;: min(95, 105) = 95
  * 상태 &#39;g&#39;: min(115, 125) = 115

```response title="Response"
   ┌────────────timeslot─┬─minMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':95,'g':115}       │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':35,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## 같이 보기 \{#see-also\}
- [`min`](/sql-reference/aggregate-functions/reference/min)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
