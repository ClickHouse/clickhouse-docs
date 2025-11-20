---
'slug': '/examples/aggregate-function-combinators/sumForEach'
'title': 'sumForEach'
'description': 'sumForEach 집계 함수 사용 예제'
'keywords':
- 'sum'
- 'ForEach'
- 'combinator'
- 'examples'
- 'sumForEach'
'sidebar_label': 'sumForEach'
'doc_type': 'reference'
---


# sumForEach {#sumforeach}

## 설명 {#description}

[`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) 조합자는 
[`sum`](/sql-reference/aggregate-functions/reference/sum) 집계 함수에 적용할 수 있으며, 
이는 행 값에서 작동하는 집계 함수에서 배열 컬럼에서 작동하는 집계 함수로 변환됩니다. 
이렇게 하면 각 행의 배열 내 요소에 집계를 적용할 수 있습니다.

## 예제 사용법 {#example-usage}

이번 예제에서는 [SQL playground](https://sql.clickhouse.com/)에서 사용 가능한 `hits` 데이터 세트를 이용할 것입니다.

`hits` 테이블에는 `isMobile`이라는 UInt8 타입의 컬럼이 있으며, 이는 
데스크톱의 경우 `0`, 모바일의 경우 `1`일 수 있습니다:

```sql runnable
SELECT EventTime, IsMobile FROM metrica.hits ORDER BY rand() LIMIT 10
```

우리는 `sumForEach` 집계 조합자 함수를 사용하여 
시간대별로 데스크톱과 모바일 트래픽이 어떻게 다른지를 분석할 것입니다. 
아래의 실행 버튼을 클릭하여 쿼리를 인터랙티브하게 실행해 보세요:

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

## 참고 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`ForEach` 조합자](/sql-reference/aggregate-functions/combinators#-foreach)
