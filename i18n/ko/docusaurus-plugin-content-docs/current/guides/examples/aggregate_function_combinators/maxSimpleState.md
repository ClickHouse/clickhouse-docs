---
slug: '/examples/aggregate-function-combinators/maxSimpleState'
title: 'maxSimpleState'
description: 'maxSimpleState 조합자(combinator)를 사용하는 예제'
keywords: ['max', 'state', 'simple', 'combinator', 'examples', 'maxSimpleState']
sidebar_label: 'maxSimpleState'
doc_type: 'reference'
---



# maxSimpleState \{#maxsimplestate\}



## 설명 \{#description\}

[`SimpleState`](/sql-reference/aggregate-functions/combinators#-simplestate) 조합자는 [`max`](/sql-reference/aggregate-functions/reference/max)
함수에 적용하여 모든 입력 값에 대한 최댓값을 반환합니다. 결과는
`SimpleAggregateState` 타입으로 반환됩니다.



## 사용 예시 \{#example-usage\}

[`minSimpleState`](/examples/aggregate-function-combinators/minSimpleState/#example-usage)에 제시된 예시는
`maxSimpleState`와 `minSimpleState`를 모두 사용하는 방법을 보여줍니다.



## 함께 보기 \{#see-also\}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`SimpleState combinator`](/sql-reference/aggregate-functions/combinators#-simplestate)
- [`SimpleAggregateFunction type`](/sql-reference/data-types/simpleaggregatefunction)
