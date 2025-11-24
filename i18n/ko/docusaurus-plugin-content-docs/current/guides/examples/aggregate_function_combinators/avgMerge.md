---
'slug': '/examples/aggregate-function-combinators/avgMerge'
'title': 'avgMerge'
'description': 'avgMerge 결합기를 사용하는 예'
'keywords':
- 'avg'
- 'merge'
- 'combinator'
- 'examples'
- 'avgMerge'
'sidebar_label': 'avgMerge'
'doc_type': 'reference'
---


# avgMerge {#avgMerge}

## 설명 {#description}

[`Merge`](/sql-reference/aggregate-functions/combinators#-state) 조합자는 
[`avg`](/sql-reference/aggregate-functions/reference/avg) 함수에 적용되어 부분 집계 상태를 결합하여 최종 결과를 생성할 수 있습니다.

## 사용 예시 {#example-usage}

`Merge` 조합자는 `State` 조합자와 밀접한 관련이 있습니다. 
`avgMerge`와 `avgState`의 예시는 ["avgState 사용 예시"](/examples/aggregate-function-combinators/avgState/#example-usage)를 참조하십시오.

## 참조 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Merge`](/sql-reference/aggregate-functions/combinators#-merge)
- [`MergeState`](/sql-reference/aggregate-functions/combinators#-mergestate)
