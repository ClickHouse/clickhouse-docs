---
slug: '/examples/aggregate-function-combinators/uniqArray'
title: 'uniqArray'
description: 'uniqArray コンビネータの使用例'
keywords: ['uniq', 'array', 'combinator', 'examples', 'uniqArray']
sidebar_label: 'uniqArray'
doc_type: 'reference'
---

# uniqArray {#uniqarray}

## 説明 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) コンビネータは、
[`uniq`](/sql-reference/aggregate-functions/reference/uniq)
関数に適用でき、`uniqArray` 集約コンビネータ関数を使用して、
すべての配列を通して一意な要素のおおよその数を計算します。

`uniqArray` 関数は、データセット内の複数の配列にまたがる一意な要素を数える必要がある場合に有用です。これは `uniq(arrayJoin())` を使用するのと等価であり、`arrayJoin` が先に配列をフラット化し、その後に `uniq` が一意な要素を数えます。

## 使用例 {#example-usage}

この例では、さまざまなカテゴリにわたるユーザーの興味関心を表すサンプルデータセットを使用して、`uniqArray` がどのように動作するかを示します。`uniq(arrayJoin())` と比較しながら、一意な要素の数え方の違いを示します。

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

`uniqArray` 関数は、`uniq(arrayJoin())` と同様に、すべての配列をまとめて一意な要素の数を数えます。
この例では:

* `uniqArray` は 5 を返します。これは、すべてのユーザーにわたって一意な興味（&#39;reading&#39;, &#39;gaming&#39;, &#39;music&#39;, &#39;sports&#39;, &#39;cooking&#39;）が 5 つあるためです
* `uniq(arrayJoin())` も 5 を返し、どちらの関数もすべての配列にわたる一意な要素数を数えることを示しています

```response title="Response"
   ┌─unique_interests_total─┬─unique_interests_arrayJoin─┐
1. │                      5 │                          5 │
   └────────────────────────┴────────────────────────────┘
```

## 関連項目 {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`arrayJoin`](/sql-reference/functions/array-join)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`uniqCombined`](/sql-reference/aggregate-functions/reference/uniqcombined)
