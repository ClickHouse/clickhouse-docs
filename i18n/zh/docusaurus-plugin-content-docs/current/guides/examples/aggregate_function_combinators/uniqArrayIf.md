---
slug: '/examples/aggregate-function-combinators/uniqArrayIf'
title: 'uniqArrayIf'
description: 'uniqArrayIf 组合器用法示例'
keywords: ['uniq', 'array', 'if', 'combinator', 'examples', 'uniqArrayIf']
sidebar_label: 'uniqArrayIf'
doc_type: 'reference'
---

# uniqArrayIf {#uniqarrayif}

## 描述 {#description}

可以将 [`Array`](/sql-reference/aggregate-functions/combinators#-array) 和 [`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器应用于 [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
函数，通过 `uniqArrayIf` 聚合组合器函数，在条件为 true 的行中统计数组中唯一值的数量。

:::note
-`If` 和 -`Array` 可以组合使用，但必须先使用 `Array`，再使用 `If`。
:::

当需要根据特定条件统计数组中的唯一元素且不想使用 `arrayJoin` 时，此函数非常有用。

## 使用示例 {#example-usage}

### 按用户分群类型和参与度等级统计浏览过的唯一产品数量 {#count-unique-products}

在本示例中，我们将使用一张包含用户购物会话数据的表，来统计属于特定用户分群、且其参与度以会话停留时间度量的用户所浏览的唯一产品数量。

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

-- 按用户细分类型和参与度统计浏览的不同产品数量
SELECT 
    session_date,
    -- 统计新客户在长时间会话中浏览的不同产品数量
    uniqArrayIf(viewed_products, user_segment = 'new_customer' AND session_duration_minutes > 10) AS new_customer_engaged_products,
    -- 统计回访客户浏览的不同产品数量
    uniqArrayIf(viewed_products, user_segment = 'returning') AS returning_customer_products,
    -- 统计所有会话中浏览的不同产品总数
    uniqArray(viewed_products) AS total_unique_products
FROM user_shopping_sessions
GROUP BY session_date
ORDER BY session_date
FORMAT Vertical;
```

```response title="Response"
第 1 行:
──────
session_date:                2024-01-01
new_customer⋯ed_products:    2
returning_customer_products: 3
total_unique_products:       6

第 2 行:
──────
session_date:                2024-01-02
new_customer⋯ed_products:    2
returning_customer_products: 2
total_unique_products:       7
```

## 另请参阅 {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
