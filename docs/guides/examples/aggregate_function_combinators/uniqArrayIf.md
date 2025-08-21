---
slug: '/examples/aggregate-function-combinators/uniqArrayIf'
title: 'uniqArrayIf'
description: 'Example of using the uniqArrayIf combinator'
keywords: ['uniq', 'array', 'if', 'combinator', 'examples', 'uniqArrayIf']
sidebar_label: 'uniqArrayIf'
doc_type: 'how-to'
---

# uniqArrayIf {#uniqarrayif}

## Description {#description}

The [`Array`](/sql-reference/aggregate-functions/combinators#-array) and [`If`](/sql-reference/aggregate-functions/combinators#-if) combinators can be applied to the [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
function to count the number of unique values in arrays for rows where the 
condition is true, using the `uniqArrayIf` aggregate combinator function.

:::note
-`If` and -`Array` can be combined. However, `Array` must come first, then `If`.
:::

This is useful when you want to count unique elements in an array based on 
specific conditions without having to use `arrayJoin`.

## Example usage {#example-usage}

### Count unique products viewed by segment type and engagement level {#count-unique-products}

In this example, we'll use a table with user shopping session data to count the 
number of unique products viewed by users of a specific user segment and with 
an engagement metric of time spent in the session.

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

-- Count unique products viewed by segment type and engagement level
SELECT 
    session_date,
    -- Count unique products viewed in long sessions by new customers
    uniqArrayIf(viewed_products, user_segment = 'new_customer' AND session_duration_minutes > 10) AS new_customer_engaged_products,
    -- Count unique products viewed by returning customers
    uniqArrayIf(viewed_products, user_segment = 'returning') AS returning_customer_products,
    -- Count unique products viewed across all sessions
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

## See also {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
