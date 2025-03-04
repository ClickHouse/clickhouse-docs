---
slug: '/examples/aggregate-function-combinators/uniqArray'
description: 'Example of using the uniqArray combinator'
keywords: ['uniq', 'array', 'combinator', 'examples', 'uniqArray']
sidebar_label: 'uniqArray'
---

# uniqArray

The [`Array`](/sql-reference/aggregate-functions/combinators#-array) combinator can be applied to the [`uniq`](/sql-reference/aggregate-functions/reference/uniq) function to count the number of unique elements in an array using the `uniqArray` function.

This is useful when you want to count unique elements in an array without having to use `arrayJoin`.

## Example Usage

### Count unique product views per user across sessions

In this example we'll use a table containing user shopping session data to count the number of unique products viewed by users across sessions.

```sql
CREATE TABLE user_interactions
(
    user_id String,
    session_id String,
    viewed_products Array(String)
) ENGINE = Memory;

INSERT INTO user_interactions VALUES
    ('john_doe', 'session_1234', ['iphone_13', 'airpods_pro', 'iphone_13']),
    ('john_doe', 'session_5678', ['macbook_air', 'ipad_mini', 'macbook_air']),
    ('sarah_smith', 'session_9012', ['samsung_s22', 'macbook_air', 'sony_headphones']),
    ('sarah_smith', 'session_3456', ['airpods_pro', 'ipad_mini', 'apple_watch']);

-- Count unique product views per user across all sessions
SELECT 
    user_id,
    uniqArray(viewed_products) AS unique_product_count
FROM user_interactions
GROUP BY user_id
ORDER BY user_id;
```

```response
   ┌─user_id─────┬─unique_product_count─┐
1. │ john_doe    │                    4 │
2. │ sarah_smith │                    6 │
   └─────────────┴──────────────────────┘
```