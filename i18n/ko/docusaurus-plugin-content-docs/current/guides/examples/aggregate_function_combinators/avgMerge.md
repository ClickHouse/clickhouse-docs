---
slug: '/examples/aggregate-function-combinators/avgMerge'
title: 'avgMerge'
description: 'avgMerge 조합자(combinator) 사용 예제'
keywords: ['avg', 'merge', 'combinator', 'examples', 'avgMerge']
sidebar_label: 'avgMerge'
doc_type: 'reference'
---



# avgMerge \{#avgMerge\}



## 설명 \{#description\}

[`Merge`](/sql-reference/aggregate-functions/combinators#-state) 조합자는
[`avg`](/sql-reference/aggregate-functions/reference/avg) 함수에 적용하여
부분 집계 상태를 결합해 최종 결과를 계산합니다.



## 사용 예시 \{#example-usage\}

`Merge` 결합자(combinator)는 `State` 결합자와 밀접하게 관련되어 있습니다. 
`avgMerge`와 `avgState`에 대한 예시는 
["avgState example usage"](/examples/aggregate-function-combinators/avgState/#example-usage)를 참고하십시오.



## 참고 항목 \{#see-also\}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
