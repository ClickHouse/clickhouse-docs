---
description: '여러 배열을 해당 배열들의 배열인 더 큰 하나의 배열로 집계합니다.'
keywords: ['groupArrayArray', 'array_concat_agg']
slug: /sql-reference/aggregate-functions/reference/grouparrayarray
title: 'groupArrayArray'
doc_type: 'reference'
---

# groupArrayArray \{#grouparrayarray\}

배열들을 하나의 더 큰 배열로 집계합니다.
[`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) 함수와 [Array](/sql-reference/aggregate-functions/combinators#-array) 조합자를 결합합니다.

별칭: `array_concat_agg`

**예시**

사용자 브라우징 세션을 포착한 데이터가 있다고 가정합니다. 각 세션은 특정 사용자가 방문한 페이지의 순서를 기록합니다.
`groupArrayArray` 함수를 사용하여 사용자별 페이지 방문 패턴을 분석할 수 있습니다.

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
