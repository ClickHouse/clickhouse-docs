---
slug: '/examples/aggregate-function-combinators/sumMap'
title: 'sumMap'
description: 'sumMap 콤비네이터 사용 예'
keywords: ['sum', '맵', '콤비네이터', '예제', 'sumMap']
sidebar_label: 'sumMap'
doc_type: 'reference'
---



# sumMap \{#summap\}



## 설명 \{#description\}

[`Map`](/sql-reference/aggregate-functions/combinators#-map) 조합자는 [`sum`](/sql-reference/aggregate-functions/reference/sum)
함수에 적용하여 `sumMap` 
집계 조합자 함수를 사용해 각 키별로 맵 안의 값들의 합을 계산할 수 있습니다.



## 사용 예시 \{#example-usage\}

이 예시에서는 서로 다른 시간 구간별 상태 코드와 해당 개수를 저장하는 테이블을 생성합니다.
각 행에는 상태 코드를 해당 개수에 매핑한 맵(Map)이 포함됩니다. 각 시간 구간 내에서
`sumMap`을 사용하여 상태 코드별 총 개수를 계산합니다.

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

`sumMap` 함수는 각 타임슬롯 내에서 상태 코드별 총 개수를 계산합니다. 예를 들면 다음과 같습니다:

* 타임슬롯 &#39;2000-01-01 00:00:00&#39;:
  * 상태 &#39;a&#39;: 15
  * 상태 &#39;b&#39;: 25
  * 상태 &#39;c&#39;: 35 + 45 = 80
  * 상태 &#39;d&#39;: 55
  * 상태 &#39;e&#39;: 65
* 타임슬롯 &#39;2000-01-01 00:01:00&#39;:
  * 상태 &#39;d&#39;: 75
  * 상태 &#39;e&#39;: 85
  * 상태 &#39;f&#39;: 95 + 105 = 200
  * 상태 &#39;g&#39;: 115 + 125 = 240

```response title="Response"
   ┌────────────timeslot─┬─sumMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':200,'g':240}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':80,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```


## 함께 보기 \{#see-also\}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
