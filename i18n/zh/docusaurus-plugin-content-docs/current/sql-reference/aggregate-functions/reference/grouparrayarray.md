---
'description': '将数组聚合成一个更大的数组，这些数组。'
'keywords':
- 'groupArrayArray'
- 'array_concat_agg'
'sidebar_position': 111
'slug': '/sql-reference/aggregate-functions/reference/grouparrayarray'
'title': 'groupArrayArray'
'doc_type': 'reference'
---


# groupArrayArray

将数组聚合为一个更大的数组。
将 [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 函数与 [Array](/sql-reference/aggregate-functions/combinators#-array) 合并器结合使用。

别名: `array_concat_agg`

**示例**

我们有捕捉用户浏览会话的数据。每个会话记录特定用户访问的页面序列。 
我们可以使用 `groupArrayArray` 函数分析每个用户的页面访问模式。

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
