---
'description': '配列を集約してそれらの配列の大きな配列にします。'
'keywords':
- 'groupArrayArray'
- 'array_concat_agg'
'sidebar_position': 111
'slug': '/sql-reference/aggregate-functions/reference/grouparrayarray'
'title': 'groupArrayArray'
'doc_type': 'reference'
---


# groupArrayArray

配列をより大きな配列に集約します。
[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 関数と [Array](/sql-reference/aggregate-functions/combinators#-array) コンビネータを組み合わせています。

エイリアス: `array_concat_agg`

**例**

ユーザのブラウジングセッションをキャプチャするデータがあります。各セッションは特定のユーザが訪れたページのシーケンスを記録します。
`groupArrayArray` 関数を使用して各ユーザのページ訪問のパターンを分析することができます。

```sql title="Setup"
CREATE TABLE website_visits (
    user_id UInt32,
    session_id UInt32,
    page_visits Array(String)
) ENGINE = Memory;

INSERT INTO website_visits VALUES
(101, 1, ['homepage', 'products', 'checkout']),
(101, 2, ['search', 'product_details', 'contact']),
(102, 1, ['homepage', 'about_us']),
(101, 3, ['blog', 'homepage']),
(102, 2, ['products', 'product_details', 'add_to_cart', 'checkout']);
```

```sql title="Query"
SELECT
    user_id,
    groupArrayArray(page_visits) AS user_session_page_sequences
FROM website_visits
GROUP BY user_id;
```

```sql title="Response"
   ┌─user_id─┬─user_session_page_sequences───────────────────────────────────────────────────────────────┐
1. │     101 │ ['homepage','products','checkout','search','product_details','contact','blog','homepage'] │
2. │     102 │ ['homepage','about_us','products','product_details','add_to_cart','checkout']             │
   └─────────┴───────────────────────────────────────────────────────────────────────────────────────────┘
```
