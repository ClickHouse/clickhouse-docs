---
slug: '/examples/aggregate-function-combinators/uniqArrayIf'
title: 'uniqArrayIf'
description: 'uniqArrayIfコンビネータの使用例'
keywords: ['uniq', 'array', 'if', 'combinator', 'examples', 'uniqArrayIf']
sidebar_label: 'uniqArrayIf'
doc_type: 'reference'
---



# uniqArrayIf {#uniqarrayif}


## 説明 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array)および[`If`](/sql-reference/aggregate-functions/combinators#-if)コンビネータを[`uniq`](/sql-reference/aggregate-functions/reference/uniq)関数に適用することで、条件が真である行の配列内の一意な値の数を`uniqArrayIf`集約コンビネータ関数を使用してカウントできます。

:::note `-If`と`-Array`は組み合わせることができます。ただし、`Array`を先に記述し、その後に`If`を記述する必要があります。
:::

これは、`arrayJoin`を使用せずに特定の条件に基づいて配列内の一意な要素をカウントしたい場合に便利です。


## 使用例 {#example-usage}

### セグメントタイプとエンゲージメントレベル別のユニーク商品閲覧数をカウントする {#count-unique-products}

この例では、ユーザーのショッピングセッションデータを含むテーブルを使用して、特定のユーザーセグメントに属し、セッション滞在時間というエンゲージメント指標を持つユーザーが閲覧したユニーク商品数をカウントします。

```sql title="クエリ"
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

-- セグメントタイプとエンゲージメントレベル別のユニーク商品閲覧数をカウント
SELECT
    session_date,
    -- 新規顧客による長時間セッションで閲覧されたユニーク商品数をカウント
    uniqArrayIf(viewed_products, user_segment = 'new_customer' AND session_duration_minutes > 10) AS new_customer_engaged_products,
    -- リピーター顧客が閲覧したユニーク商品数をカウント
    uniqArrayIf(viewed_products, user_segment = 'returning') AS returning_customer_products,
    -- 全セッションで閲覧されたユニーク商品数をカウント
    uniqArray(viewed_products) AS total_unique_products
FROM user_shopping_sessions
GROUP BY session_date
ORDER BY session_date
FORMAT Vertical;
```

```response title="レスポンス"
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
