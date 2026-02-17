---
slug: '/examples/aggregate-function-combinators/avgMap'
title: 'avgMap'
description: 'avgMap 콤비네이터 사용 예제'
keywords: ['avg', '맵', '콤비네이터', '예제', 'avgMap']
sidebar_label: 'avgMap'
doc_type: 'reference'
---



# avgMap \{#avgmap\}



## 설명 \{#description\}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 결합자는 [`avg`](/sql-reference/aggregate-functions/reference/avg)
함수에 적용하여, `avgMap` 
집계 결합자 함수를 사용해 각 키별로 맵(Map) 내부 값들의 산술 평균을 계산합니다.



## 사용 예시 \{#example-usage\}

이 예시에서는 서로 다른 타임슬롯에 대해 상태 코드와 해당 개수를 저장하는 테이블을 생성합니다.
각 행에는 상태 코드를 해당 개수에 매핑한 맵(Map)이 포함됩니다. 각 타임슬롯 내에서
각 상태 코드의 평균 개수를 계산하기 위해 `avgMap`을 사용합니다.

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

`avgMap` 함수는 각 타임슬롯에서 각 상태 코드의 평균 개수를 계산합니다. 예를 들어:

* 타임슬롯 &#39;2000-01-01 00:00:00&#39;:
  * 상태 &#39;a&#39;: 15
  * 상태 &#39;b&#39;: 25
  * 상태 &#39;c&#39;: (35 + 45) / 2 = 40
  * 상태 &#39;d&#39;: 55
  * 상태 &#39;e&#39;: 65
* 타임슬롯 &#39;2000-01-01 00:01:00&#39;:
  * 상태 &#39;d&#39;: 75
  * 상태 &#39;e&#39;: 85
  * 상태 &#39;f&#39;: (95 + 105) / 2 = 100
  * 상태 &#39;g&#39;: (115 + 125) / 2 = 120

```response title="Response"
   ┌────────────timeslot─┬─avgMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':100,'g':120}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':40,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## 참고 \{#see-also\}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
