---
'slug': '/examples/aggregate-function-combinators/uniqArray'
'title': 'uniqArray'
'description': 'uniqArray コンビネーターの使用例'
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

## 説明 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) コンビネータは、[`uniq`](/sql-reference/aggregate-functions/reference/uniq) 関数に適用して、すべての配列にわたるおおよその一意の要素数を計算するための `uniqArray` 集約コンビネータ関数を使用します。

`uniqArray` 関数は、データセット内の複数の配列にわたる一意の要素をカウントする必要があるときに便利です。これは `uniq(arrayJoin())` を使用するのと同等で、ここで `arrayJoin` は最初に配列をフラット化し、その後 `uniq` が一意の要素をカウントします。

## 使用例 {#example-usage}

この例では、異なるカテゴリにわたるユーザーの興味のサンプルデータセットを使用して、`uniqArray` の動作を示します。`uniq(arrayJoin())` と比較して、一意の要素をカウントする違いを示します。

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

`uniqArray` 関数は、すべての配列を合わせた一意の要素をカウントし、`uniq(arrayJoin())` に似ています。この例では：
- `uniqArray` は 5 を返します。これは、すべてのユーザーにわたる一意の興味が 5 つあるためです：'reading', 'gaming', 'music', 'sports', 'cooking'
- `uniq(arrayJoin())` も 5 を返し、両方の関数がすべての配列にわたり一意の要素をカウントしていることを示しています。

```response title="Response"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```

## その他の情報 {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
