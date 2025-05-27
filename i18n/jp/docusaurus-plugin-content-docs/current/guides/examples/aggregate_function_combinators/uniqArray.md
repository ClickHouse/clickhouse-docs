---
'slug': '/examples/aggregate-function-combinators/uniqArray'
'title': 'uniqArray'
'description': 'uniqArray combinator の使用例'
'keywords':
- 'uniq'
- 'array'
- 'combinator'
- 'examples'
- 'uniqArray'
'sidebar_label': 'uniqArray'
---




# uniqArray {#uniqarray}

## Description {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) コンビネーターを 
[`uniq`](/sql-reference/aggregate-functions/reference/uniq) 関数に適用することで、 
`uniqArray` 集約コンビネーター関数を使用して、すべての配列にわたるユニークな要素の近似数を計算できます。

`uniqArray` 関数は、データセット内の複数の配列にまたがるユニークな要素をカウントする必要があるときに役立ちます。これは `uniq(arrayJoin())` を使用することと同等であり、`arrayJoin` は最初に配列をフラット化し、その後 `uniq` がユニークな要素をカウントします。

## Example Usage {#example-usage}

この例では、異なるカテゴリーにおけるユーザーの興味に関するサンプルデータセットを使用して、`uniqArray` の動作を示します。ユニークな要素のカウントの違いを示すために、`uniq(arrayJoin())` と比較します。

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
    uniqArray(interests) as unique_interests_total,
    uniq(arrayJoin(interests)) as unique_interests_arrayJoin
FROM user_interests;
```

`uniqArray` 関数は、すべての配列を合わせたユニークな要素をカウントします。これは `uniq(arrayJoin())` と似ています。この例では：
- `uniqArray` は 5 を返します。これはすべてのユーザーにわたるユニークな興味が 5 つあるためです： 'reading', 'gaming', 'music', 'sports', 'cooking'
- `uniq(arrayJoin())` も 5 を返し、両方の関数がすべての配列にわたるユニークな要素をカウントしていることを示しています。

```response title="Response"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```

## See also {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
