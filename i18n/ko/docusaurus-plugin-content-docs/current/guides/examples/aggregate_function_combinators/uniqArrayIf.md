---
slug: '/examples/aggregate-function-combinators/uniqArrayIf'
title: 'uniqArrayIf'
description: 'uniqArrayIf 조합자(combinator)를 사용하는 예제'
keywords: ['uniq', 'array', 'if', 'combinator', 'examples', 'uniqArrayIf']
sidebar_label: 'uniqArrayIf'
doc_type: 'reference'
---



# uniqArrayIf \{#uniqarrayif\}



## 설명 \{#description\}

[`uniq`](/sql-reference/aggregate-functions/reference/uniq) 함수에 [`Array`](/sql-reference/aggregate-functions/combinators#-array) 및 [`If`](/sql-reference/aggregate-functions/combinators#-if) 조합자를 적용하면, 조건이 참인 행에 대해 `uniqArrayIf` 집계 조합자 함수를 사용하여 배열 내 고유 값의 개수를 계산할 수 있습니다.

:::note
-`If`와 -`Array`는 함께 사용할 수 있습니다. 단, 순서는 반드시 먼저 `Array`, 그다음 `If`여야 합니다.
:::

이는 특정 조건을 기준으로 `arrayJoin`을 사용하지 않고 배열의 고유 요소 개수를 계산하려는 경우에 유용합니다.



## 사용 예시 \{#example-usage\}

### 세그먼트 유형과 참여 수준별 고유 상품 조회 수 계산 \{#count-unique-products\}

이 예제에서는 사용자 쇼핑 세션 데이터가 포함된 테이블을 사용하여,
특정 사용자 세그먼트에 속하고 세션에서 소비한 시간을 참여 지표로 갖는
사용자가 조회한 고유 상품 개수를 계산합니다.

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


## 참고 \{#see-also\}
- [`uniq`](/sql-reference/aggregate-functions/reference/uniq)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
