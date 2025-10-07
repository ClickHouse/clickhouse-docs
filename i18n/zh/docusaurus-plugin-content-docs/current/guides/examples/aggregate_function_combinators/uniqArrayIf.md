---
'slug': '/examples/aggregate-function-combinators/uniqArrayIf'
'title': 'uniqArrayIf'
'description': '使用 uniqArrayIf 组合器的示例'
'keywords':
- 'uniq'
- 'array'
- 'if'
- 'combinator'
- 'examples'
- 'uniqArrayIf'
'sidebar_label': 'uniqArrayIf'
'doc_type': 'reference'
---


# uniqArrayIf {#uniqarrayif}

## 描述 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 和 [`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`uniq`](/sql-reference/aggregate-functions/reference/uniq) 函数，以使用 `uniqArrayIf` 聚合组合器函数计算在条件为真时数组中唯一值的数量。

:::note
- `If` 和 `Array` 可以结合使用。然而，`Array` 必须放在前面，然后是 `If`。
:::

当您想要根据特定条件计算数组中的唯一元素而不必使用 `arrayJoin` 时，这非常有用。

## 示例用法 {#example-usage}

### 按段类型和参与度级别计算唯一浏览产品数 {#count-unique-products}

在此示例中，我们将使用一个包含用户购物会话数据的表来计算在特定用户段的用户和参与度指标为会话中花费的时间的情况下浏览的唯一产品数。

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

## 另请参见 {#see-also}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
