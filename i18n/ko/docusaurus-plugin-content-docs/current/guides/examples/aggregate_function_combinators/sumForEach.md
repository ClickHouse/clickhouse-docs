---
slug: '/examples/aggregate-function-combinators/sumForEach'
title: 'sumForEach'
description: 'sumForEach 집계 함수 사용 예제'
keywords: ['sum', 'ForEach', 'combinator', 'examples', 'sumForEach']
sidebar_label: 'sumForEach'
doc_type: 'reference'
---



# sumForEach \{#sumforeach\}



## 설명 \{#description\}

[`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) 콤비네이터(combinator)는
집계 함수인 [`sum`](/sql-reference/aggregate-functions/reference/sum)에 적용하여,
행 값에 대해 동작하는 집계 함수를
배열 컬럼에 대해 동작하는 집계 함수로 변경합니다. 이때 배열의 각 요소에 대해,
여러 행에 걸쳐 집계를 수행합니다.



## 사용 예시 \{#example-usage\}

이 예제에서는 [SQL playground](https://sql.clickhouse.com/)에서 제공하는 `hits` 데이터셋을 사용합니다.

`hits` 테이블에는 UInt8 타입의 `isMobile` 컬럼이 있으며,
데스크톱인 경우 `0`, 모바일인 경우 `1`입니다:

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

`sumForEach` 집계 조합자 함수(aggregate combinator function)를 사용하여
하루 중 시간대별로 데스크톱과 모바일 트래픽이 어떻게 달라지는지 분석합니다. 아래 재생 버튼을 클릭하여
쿼리를 대화형으로 실행하십시오.

```sql runnable
SELECT
    toHour(EventTime) AS hour_of_day,
    -- Use sumForEach to count desktop and mobile visits in one pass
    sumForEach([
        IsMobile = 0, -- Desktop visits (IsMobile = 0)
        IsMobile = 1  -- Mobile visits (IsMobile = 1)
    ]) AS device_counts
FROM metrica.hits
GROUP BY hour_of_day
ORDER BY hour_of_day;
```


## 같이 보기 \{#see-also\}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach` 조합자](/sql-reference/aggregate-functions/combinators#-foreach)
