
# uniqArrayIf {#uniqarrayif}

## Description {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 和 [`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`uniq`](/sql-reference/aggregate-functions/reference/uniq) 函数，以计算在条件为真的行中数组中唯一值的数量，使用 `uniqArrayIf` 聚合组合器函数。

:::note
- `If` 和 `Array` 可以组合使用。然而，`Array` 必须放在前面，然后是 `If`。
:::

当你想根据特定条件计算数组中的唯一元素而不需要使用 `arrayJoin` 时，这非常有用。

## Example Usage {#example-usage}

### Count unique products viewed by segment type and engagement level {#count-unique-products}

在这个示例中，我们将使用一张包含用户购物会话数据的表，计算特定用户细分和在会话中花费时间的参与度指标的用户所查看的唯一产品数量。

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
