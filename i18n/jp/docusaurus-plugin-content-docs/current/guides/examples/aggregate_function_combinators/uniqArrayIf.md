---
slug: '/examples/aggregate-function-combinators/uniqArrayIf'
title: 'uniqArrayIf'
description: 'uniqArrayIf コンビネータを使用する例'
keywords: ['uniq', 'array', 'if', 'combinator', 'examples', 'uniqArrayIf']
sidebar_label: 'uniqArrayIf'
doc_type: 'reference'
---

# uniqArrayIf {#uniqarrayif}

## 説明 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) と [`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネーターは、[`uniq`](/sql-reference/aggregate-functions/reference/uniq)
関数に適用して、条件が真である行について配列内の一意な値の数をカウントするための
集約コンビネーター関数 `uniqArrayIf` を使用できます。

:::note
-`If` と -`Array` は組み合わせて使用できますが、`Array` を先に、その後に `If` を指定する必要があります。
:::

これは、`arrayJoin` を使用せずに、特定の条件に基づいて配列内の一意な要素数をカウントしたい場合に有用です。

## 使用例 {#example-usage}

### セグメント種別とエンゲージメントレベルごとのユニークな閲覧商品数を集計する {#count-unique-products}

この例では、ユーザーのショッピングセッションデータを含むテーブルを使用して、
特定のユーザーセグメントに属し、かつセッション内での滞在時間をエンゲージメント指標とする
ユーザーが閲覧したユニークな商品の数を集計します。

```sql title="Query"
CREATE TABLE user_shopping_sessions
(
    session_date Date,
    user_segment String,
    viewed_products Array(String),
    session_duration_minutes Int32
) ENGINE = Memory;

INSERT INTO user_shopping_sessions VALUES
    ('2024-01-01', 'new_customer', ['smartphone_x', 'headphones_y', 'smartphone_x'], 12),
    ('2024-01-01', 'returning', ['laptop_z', 'smartphone_x', 'tablet_a'], 25),
    ('2024-01-01', 'new_customer', ['smartwatch_b', 'headphones_y', 'fitness_tracker'], 8),
    ('2024-01-02', 'returning', ['laptop_z', 'external_drive', 'laptop_z'], 30),
    ('2024-01-02', 'new_customer', ['tablet_a', 'keyboard_c', 'tablet_a'], 15),
    ('2024-01-02', 'premium', ['smartphone_x', 'smartwatch_b', 'headphones_y'], 22);

-- セグメントタイプとエンゲージメントレベル別にユニーク商品閲覧数を集計
SELECT 
    session_date,
    -- 新規顧客の長時間セッションにおけるユニーク商品閲覧数を集計
    uniqArrayIf(viewed_products, user_segment = 'new_customer' AND session_duration_minutes > 10) AS new_customer_engaged_products,
    -- リピーター顧客によるユニーク商品閲覧数を集計
    uniqArrayIf(viewed_products, user_segment = 'returning') AS returning_customer_products,
    -- 全セッションにおけるユニーク商品閲覧数を集計
    uniqArray(viewed_products) AS total_unique_products
FROM user_shopping_sessions
GROUP BY session_date
ORDER BY session_date
FORMAT Vertical;
```

```response title="Response"
Row 1:
──────
session_date:                2024-01-01
new_customer⋯ed_products:    2
returning_customer_products: 3
total_unique_products:       6

Row 2:
──────
session_date:                2024-01-02
new_customer⋯ed_products:    2
returning_customer_products: 2
total_unique_products:       7
```

## 関連項目 {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
