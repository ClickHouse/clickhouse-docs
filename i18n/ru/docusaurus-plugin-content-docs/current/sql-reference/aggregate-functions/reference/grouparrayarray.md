---
slug: '/sql-reference/aggregate-functions/reference/grouparrayarray'
sidebar_position: 111
description: 'Агрегирует массивы в большой массив из этих массивов.'
title: groupArrayArray
keywords: ['groupArrayArray', 'array_concat_agg']
doc_type: reference
---
# groupArrayArray

Агрегирует массивы в больший массив этих массивов.  
Совмещает функцию [`groupArray`](/sql-reference/aggregate-functions/reference/grouparray) с комбинатором [Array](/sql-reference/aggregate-functions/combinators#-array).

Псевдоним: `array_concat_agg`

**Пример**

У нас есть данные, которые фиксируют сессии просмотра пользователей. Каждая сессия записывает последовательность страниц, которые посетил конкретный пользователь.  
Мы можем использовать функцию `groupArrayArray`, чтобы проанализировать паттерны посещения страниц для каждого пользователя.

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