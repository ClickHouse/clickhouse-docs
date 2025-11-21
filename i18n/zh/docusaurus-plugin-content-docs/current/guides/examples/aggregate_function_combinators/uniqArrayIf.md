---
slug: '/examples/aggregate-function-combinators/uniqArrayIf'
title: 'uniqArrayIf'
description: 'uniqArrayIf 组合器使用示例'
keywords: ['uniq', 'array', 'if', 'combinator', 'examples', 'uniqArrayIf']
sidebar_label: 'uniqArrayIf'
doc_type: 'reference'
---



# uniqArrayIf {#uniqarrayif}


## 描述 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 和 [`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可应用于 [`uniq`](/sql-reference/aggregate-functions/reference/uniq) 函数，使用 `uniqArrayIf` 聚合组合器函数来统计满足条件的行中数组的唯一值数量。

:::note `-If` 和 `-Array` 可以组合使用。但是，`Array` 必须在前，`If` 在后。
:::

当您需要基于特定条件统计数组中的唯一元素，而无需使用 `arrayJoin` 时，此功能非常有用。


## 使用示例 {#example-usage}

### 按细分类型和参与度级别统计查看的唯一产品数 {#count-unique-products}

在此示例中,我们将使用包含用户购物会话数据的表来统计特定用户细分中的用户查看的唯一产品数量,并结合会话时长这一参与度指标。

```sql title="查询"
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

-- 按细分类型和参与度级别统计查看的唯一产品数
SELECT
    session_date,
    -- 统计新客户在长时间会话中查看的唯一产品数
    uniqArrayIf(viewed_products, user_segment = 'new_customer' AND session_duration_minutes > 10) AS new_customer_engaged_products,
    -- 统计回访客户查看的唯一产品数
    uniqArrayIf(viewed_products, user_segment = 'returning') AS returning_customer_products,
    -- 统计所有会话中查看的唯一产品数
    uniqArray(viewed_products) AS total_unique_products
FROM user_shopping_sessions
GROUP BY session_date
ORDER BY session_date
FORMAT Vertical;
```

```response title="响应"
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


## 另请参阅 {#see-also}

- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`Array 组合器`](/sql-reference/aggregate-functions/combinators#-array)
- [`If 组合器`](/sql-reference/aggregate-functions/combinators#-if)
