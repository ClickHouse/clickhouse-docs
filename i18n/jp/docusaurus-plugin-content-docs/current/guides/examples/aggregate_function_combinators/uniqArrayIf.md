---
'slug': '/examples/aggregate-function-combinators/uniqArrayIf'
'title': 'uniqArrayIf'
'description': 'uniqArrayIfコンビネータの使用例'
'keywords':
- 'uniq'
- 'array'
- 'if'
- 'combinator'
- 'examples'
- 'uniqArrayIf'
'sidebar_label': 'uniqArrayIf'
---




# uniqArrayIf {#uniqarrayif}

## 説明 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) および [`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネータは、`uniq` 関数に適用して、条件が真である行の配列のユニークな値の数をカウントするために、`uniqArrayIf` 集約コンビネータ関数を使用できます。

:::note
- `If` と `Array` は組み合わせることができます。ただし、`Array` が先に来て、その後に `If` が続かなければなりません。
:::

これは、`arrayJoin` を使用せずに特定の条件に基づいて配列内のユニークな要素をカウントしたい場合に便利です。

## 使用例 {#example-usage}

### セグメントタイプおよびエンゲージメントレベルによるユニーク商品のカウント {#count-unique-products}

この例では、ユーザーのショッピングセッションデータを含むテーブルを使用して、特定のユーセグメントのユーザーによって表示されたユニーク商品の数を、セッション内でのエンゲージメント指標を用いてカウントします。

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

-- セグメントタイプおよびエンゲージメントレベルによるユニーク商品のカウント
SELECT 
    session_date,
    -- 新規顧客による長いセッションで表示されたユニーク商品のカウント
    uniqArrayIf(viewed_products, user_segment = 'new_customer' AND session_duration_minutes > 10) AS new_customer_engaged_products,
    -- リピーターによる表示されたユニーク商品のカウント
    uniqArrayIf(viewed_products, user_segment = 'returning') AS returning_customer_products,
    -- すべてのセッションで表示されたユニーク商品のカウント
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

## 参考 {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
