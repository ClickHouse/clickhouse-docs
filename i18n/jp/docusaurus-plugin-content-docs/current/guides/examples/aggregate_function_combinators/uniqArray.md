---
slug: '/examples/aggregate-function-combinators/uniqArray'
title: 'uniqArray'
description: 'uniqArray コビネータの使用例'
keywords: ['uniq', 'array', 'combinator', 'examples', 'uniqArray']
sidebar_label: 'uniqArray'
---


# uniqArray {#uniqarray}

## 説明 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) コビネータは、 
[`uniq`](/sql-reference/aggregate-functions/reference/uniq) 関数に適用して、すべての配列にわたるユニークな要素の近似数を計算するための 
`uniqArray` 集約コビネータ関数です。

`uniqArray` 関数は、データセット内の複数の配列にわたってユニークな要素をカウントする際に便利です。これは 
`uniq(arrayJoin())` を使用するのと同等であり、`arrayJoin` が最初に配列をフラット化し、その後 `uniq` がユニークな要素をカウントします。

## 使用例 {#example-usage}

この例では、異なるカテゴリーにおけるユーザーの興味のサンプルデータセットを使用して、`uniqArray` がどのように機能するかを示します。 
`uniq(arrayJoin())` と比較して、ユニークな要素のカウントにおける違いを示します。

```sql title="クエリ"
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

`uniqArray` 関数は、すべての配列を組み合わせた中でユニークな要素をカウントします。これは、`uniq(arrayJoin())` と似ています。 
この例では：
- `uniqArray` は 5 を返します。これは、すべてのユーザーにわたってユニークな興味が 5 つあるためです： 'reading', 'gaming', 'music', 'sports', 'cooking'
- `uniq(arrayJoin())` も 5 を返し、両方の関数がすべての配列にわたるユニークな要素をカウントすることを示しています。

```response title="レスポンス"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```

## 他の情報 {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array コビネータ`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
