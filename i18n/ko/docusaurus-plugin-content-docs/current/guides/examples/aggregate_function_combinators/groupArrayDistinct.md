---
slug: '/examples/aggregate-function-combinators/groupArrayDistinct'
title: 'groupArrayDistinct'
description: 'groupArrayDistinct 조합자(combinator) 사용 예제'
keywords: ['groupArray', 'Distinct', '조합자', '예제', 'groupArrayDistinct']
sidebar_label: 'groupArrayDistinct'
doc_type: 'reference'
---



# groupArrayDistinct \{#sumdistinct\}



## 설명 \{#description\}

[`groupArrayDistinct`](/sql-reference/aggregate-functions/combinators#-foreach) 조합자는
[`groupArray`](/sql-reference/aggregate-functions/reference/sum) 집계 함수에 적용하여
서로 다른 인자 값으로 구성된 배열을 생성합니다.



## 사용 예시 \{#example-usage\}

이 예시에서는 [SQL playground](https://sql.clickhouse.com/)에서 제공되는 `hits` 데이터셋을 사용합니다.

웹사이트에서 각 고유한 랜딩 페이지 도메인(`URLDomain`)별로, 해당 도메인에 방문한 사용자에 대해 기록된 모든 고유한 User Agent OS 코드(`OS`)를 알아내려 한다고 가정해 보십시오. 이는 사이트의 서로 다른 부분과 상호 작용하는 운영 체제의 분포와 다양성을 파악하는 데 도움이 됩니다.

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


## 같이 보기 \{#see-also\}
- [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray)
- [`Distinct combinator`](/sql-reference/aggregate-functions/combinators#-distinct)
