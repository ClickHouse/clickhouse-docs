---
'slug': '/examples/aggregate-function-combinators/uniqArray'
'title': 'uniqArray'
'description': 'uniqArray 결합기를 사용하는 예시'
'keywords':
- 'uniq'
- 'array'
- 'combinator'
- 'examples'
- 'uniqArray'
'sidebar_label': 'uniqArray'
'doc_type': 'reference'
---


# uniqArray {#uniqarray}

## 설명 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 조합기는 
[`uniq`](/sql-reference/aggregate-functions/reference/uniq) 함수에 적용되어 
모든 배열을 통틀어 고유한 요소의 근사 개수를 계산하는 데 사용되는 
`uniqArray` 집계 조합기 함수입니다.

`uniqArray` 함수는 데이터 세트에서 여러 배열에 걸쳐 고유한 요소를 
세어야 할 때 유용합니다. 이는 먼저 배열을 평탄화하는 `arrayJoin()`을 사용한 
후 `uniq`가 고유한 요소를 세는 것과 같으며, `uniq(arrayJoin())`과 동등합니다.

## 사용 예 {#example-usage}

이 예제에서는 다양한 
카테고리에서 사용자 관심사를 나타내는 샘플 데이터 세트를 사용하여 
`uniqArray`가 작동하는 방식을 보여줍니다. 고유한 요소를 세는 
방식의 차이를 보여주기 위해 `uniq(arrayJoin())`과 비교할 것입니다.

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

`uniqArray` 함수는 결합된 모든 배열에서 고유한 요소를 세며, 이는 
`uniq(arrayJoin())`과 유사합니다. 이 예제에서는:
- `uniqArray`는 5를 반환하며, 이는 모든 사용자에서 5개의 고유한 
관심사 ('reading', 'gaming', 'music', 'sports', 'cooking')가 존재하기 때문입니다.
- `uniq(arrayJoin())`도 5를 반환하여 두 함수가 모든 배열에 걸쳐 
고유한 요소를 세는 것을 보여줍니다.

```response title="Response"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```

## 참조 {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
