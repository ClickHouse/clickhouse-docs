---
'slug': '/examples/aggregate-function-combinators/groupArrayDistinct'
'title': 'groupArrayDistinct'
'description': 'groupArrayDistinct 결합기를 사용하는 예제'
'keywords':
- 'groupArray'
- 'Distinct'
- 'combinator'
- 'examples'
- 'groupArrayDistinct'
'sidebar_label': 'groupArrayDistinct'
'doc_type': 'reference'
---


# groupArrayDistinct {#sumdistinct}

## Description {#description}

[`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) 조합자는 [`groupArray`](/sql-reference/aggregate-functions/reference/sum) 집계 함수에 적용되어
고유한 인수 값의 배열을 생성합니다.

## Example usage {#example-usage}

이 예제에서는 우리의 [SQL playground](https://sql.clickhouse.com/)에서 사용할 수 있는 `hits` 데이터 세트를 활용하겠습니다.

각 고유한 랜딩 페이지 도메인 (`URLDomain`)에 대해,
해당 도메인에 방문한 방문객들에 대해 기록된 고유한 User Agent OS 코드들 (`OS`)이 무엇인지 알아보려고 합니다. 이는 서로 다른 사이트의 
구성 요소와 상호작용하는 다양한 운영 체제를 이해하는 데 도움이 될 수 있습니다.

```sql runnable
SELECT
    URLDomain,
    groupArrayDistinct(OS) AS distinct_os_codes
FROM metrica.hits_v1
WHERE URLDomain != '' -- Consider only hits with a recorded domain
GROUP BY URLDomain
ORDER BY URLDomain ASC
LIMIT 20;
```

## See also {#see-also}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct combinator`](/sql-reference/aggregate-functions/combinators#-distinct)
