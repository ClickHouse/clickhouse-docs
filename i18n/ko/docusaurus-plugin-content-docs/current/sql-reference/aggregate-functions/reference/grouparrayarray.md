---
'description': '배열을 그 배열들의 더 큰 배열로 집계합니다.'
'keywords':
- 'groupArrayArray'
- 'array_concat_agg'
'sidebar_position': 111
'slug': '/sql-reference/aggregate-functions/reference/grouparrayarray'
'title': 'groupArrayArray'
'doc_type': 'reference'
---


# groupArrayArray

배열을 더 큰 배열로 집계합니다.  
[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 함수와 [Array](/sql-reference/aggregate-functions/combinators#-array) 조합기를 결합합니다.

별칭: `array_concat_agg`

**예제**

우리는 사용자 브라우징 세션을 기록하는 데이터를 가지고 있습니다. 각 세션은 특정 사용자가 방문한 페이지의 순서를 기록합니다.  
`groupArrayArray` 함수를 사용하여 각 사용자에 대한 페이지 방문 패턴을 분석할 수 있습니다.

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
