---
slug: '/examples/aggregate-function-combinators/maxMap'
title: 'maxMap'
description: 'maxMap 조합자 사용 예제'
keywords: ['max', 'map', 'combinator', 'examples', 'maxMap']
sidebar_label: 'maxMap'
doc_type: 'reference'
---



# maxMap \{#maxmap\}



## 설명 \{#description\}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 조합자는 [`max`](/sql-reference/aggregate-functions/reference/max)
함수에 적용하여, `maxMap` 
집계 조합자 함수를 사용해 각 키별로 맵에서 최대값을 계산합니다.



## 사용 예시 \{#example-usage\}

이 예제에서는 서로 다른 시간대에 대해 상태 코드와 해당 개수를 저장하는 테이블을 생성합니다.
각 행에는 상태 코드와 그에 해당하는 개수로 이루어진 맵(Map)이 포함됩니다. 각 시간대마다
`maxMap`을 사용해 상태 코드별 최대 개수를 찾습니다.

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

`maxMap` 함수는 각 타임슬롯마다 각 상태 코드의 최대 개수를 찾습니다. 예를 들어:

* 타임슬롯 &#39;2000-01-01 00:00:00&#39;:
  * 상태 &#39;a&#39;: 15
  * 상태 &#39;b&#39;: 25
  * 상태 &#39;c&#39;: max(35, 45) = 45
  * 상태 &#39;d&#39;: 55
  * 상태 &#39;e&#39;: 65
* 타임슬롯 &#39;2000-01-01 00:01:00&#39;:
  * 상태 &#39;d&#39;: 75
  * 상태 &#39;e&#39;: 85
  * 상태 &#39;f&#39;: max(95, 105) = 105
  * 상태 &#39;g&#39;: max(115, 125) = 125

```response title="Response"
   ┌────────────timeslot─┬─maxMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':105,'g':125}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':45,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## 함께 보기 \{#see-also\}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
