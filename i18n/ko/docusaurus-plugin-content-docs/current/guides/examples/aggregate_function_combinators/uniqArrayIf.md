---
'slug': '/examples/aggregate-function-combinators/uniqArrayIf'
'title': 'uniqArrayIf'
'description': 'uniqArrayIf 조합기를 사용하는 예'
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

## Description {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 및 [`If`](/sql-reference/aggregate-functions/combinators#-if) 조합자를 [`uniq`](/sql-reference/aggregate-functions/reference/uniq) 함수에 적용하여 조건이 참인 행의 배열에서 고유값의 수를 계산하는 `uniqArrayIf` 집계 조합자 함수를 사용할 수 있습니다.

:::note
-`If`와 `Array`를 조합할 수 있습니다. 그러나 `Array`가 먼저 와야 하고, 그 다음에 `If`가 와야 합니다.
:::

이는 특정 조건을 바탕으로 `arrayJoin`을 사용하지 않고 배열에서 고유한 요소를 세고자 할 때 유용합니다.

## Example usage {#example-usage}

### Count unique products viewed by segment type and engagement level {#count-unique-products}

이 예제에서는 사용자 쇼핑 세션 데이터가 포함된 테이블을 사용하여 특정 사용자 세그먼트의 사용자와 세션에서 소요된 시간이라는 참여 메트릭을 기준으로 본 고유 제품 수를 셉니다.

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
