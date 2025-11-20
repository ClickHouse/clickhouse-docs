---
slug: '/examples/aggregate-function-combinators/uniqArray'
title: 'uniqArray'
description: 'uniqArray コンビネーターの使用例'
keywords: ['uniq', 'array', 'combinator', 'examples', 'uniqArray']
sidebar_label: 'uniqArray'
doc_type: 'reference'
---



# uniqArray {#uniqarray}


## 説明 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array)コンビネータを[`uniq`](/sql-reference/aggregate-functions/reference/uniq)関数に適用することで、`uniqArray`集約コンビネータ関数を使用して、すべての配列における一意な要素の概算数を計算できます。

`uniqArray`関数は、データセット内の複数の配列にわたって一意な要素をカウントする必要がある場合に便利です。これは`uniq(arrayJoin())`を使用するのと同等であり、`arrayJoin`がまず配列を平坦化し、その後`uniq`が一意な要素をカウントします。


## 使用例 {#example-usage}

この例では、異なるカテゴリにわたるユーザーの興味のサンプルデータセットを使用して、`uniqArray`の動作を実証します。一意の要素をカウントする際の違いを示すため、`uniq(arrayJoin())`と比較します。

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
    uniqArray(interests) AS unique_interests_total,
    uniq(arrayJoin(interests)) AS unique_interests_arrayJoin
FROM user_interests;
```

`uniqArray`関数は、`uniq(arrayJoin())`と同様に、すべての配列を結合した一意の要素をカウントします。
この例では:

- `uniqArray`は5を返します。これは、すべてのユーザーにわたって5つの一意の興味('reading'、'gaming'、'music'、'sports'、'cooking')が存在するためです
- `uniq(arrayJoin())`も5を返し、両方の関数がすべての配列にわたって一意の要素をカウントすることを示しています

```response title="レスポンス"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```


## 関連項目 {#see-also}

- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
