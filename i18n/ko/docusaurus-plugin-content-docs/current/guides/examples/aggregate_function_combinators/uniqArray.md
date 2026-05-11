---
slug: '/examples/aggregate-function-combinators/uniqArray'
title: 'uniqArray'
description: 'uniqArray 조합자(combinator)를 사용하는 예제'
keywords: ['uniq', 'array', 'combinator', 'examples', 'uniqArray']
sidebar_label: 'uniqArray'
doc_type: 'reference'
---



# uniqArray \{#uniqarray\}



## 설명 \{#description\}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 조합자는 
[`uniq`](/sql-reference/aggregate-functions/reference/uniq)
함수에 적용하여 `uniqArray` 집계 조합자 함수를 사용해 모든 배열에 걸친 
고유 요소 개수를 근사하게 계산합니다.

`uniqArray` 함수는 데이터셋에서 여러 배열 전반에 걸쳐 고유 요소 개수를 
집계해야 할 때 유용합니다. 이 함수는 먼저 `arrayJoin`으로 배열을 평탄화한 뒤 
`uniq`로 고유 요소를 세는 `uniq(arrayJoin())`을 사용하는 것과 동일합니다.



## 사용 예시 \{#example-usage\}

이 예제에서는 다양한 카테고리별 사용자 관심사에 대한 샘플 데이터셋을 사용하여 `uniqArray`가 어떻게 동작하는지 보여줍니다. 또한 `uniq(arrayJoin())`과 비교하여 유일한 요소 개수를 세는 방식의 차이를 설명합니다.

```sql title="Query"
CREATE TABLE user_interests
(
    user_id UInt32,
    interests Array(String)
) ENGINE = Memory;

INSERT INTO user_interests VALUES
    (1, ['reading', 'gaming', 'music']),
    (2, ['gaming', 'sports', 'music']),
    (3, ['reading', 'cooking']);

SELECT 
    uniqArray(interests) AS unique_interests_total,
    uniq(arrayJoin(interests)) AS unique_interests_arrayJoin
FROM user_interests;
```

`uniqArray` 함수는 모든 배열을 합쳤을 때의 고유 요소 수를 계산하며, `uniq(arrayJoin())`와 유사하게 동작합니다.
이 예시에서:

* `uniqArray`는 5를 반환합니다. 모든 사용자 전체에서 고유한 관심사는 &quot;reading&quot;, &quot;gaming&quot;, &quot;music&quot;, &quot;sports&quot;, &quot;cooking&quot;의 5개이기 때문입니다.
* `uniq(arrayJoin())`도 5를 반환하여, 두 함수 모두 모든 배열에서 고유 요소를 계산한다는 것을 보여 줍니다.

```response title="Response"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```


## 함께 보기 \{#see-also\}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
