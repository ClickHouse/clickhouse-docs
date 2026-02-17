---
slug: '/examples/aggregate-function-combinators/argMaxIf'
title: 'argMaxIf'
description: 'argMaxIf 결합자를 사용하는 예제'
keywords: ['argMax', 'if', 'combinator', 'examples', 'argMaxIf']
sidebar_label: 'argMaxIf'
doc_type: 'reference'
---



# argMaxIf \{#argmaxif\}



## 설명 \{#description\}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 결합자는 [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
함수에 적용할 수 있으며, 이를 통해 조건이 참인 행들 중에서 `val`의 최댓값에 해당하는 `arg` 값을
`argMaxIf` 집계 결합자 함수를 사용해 찾을 수 있습니다.

`argMaxIf` 함수는 데이터셋에서 최댓값에 대응하는 값을 찾아야 하지만,
그중에서도 특정 조건을 만족하는 행에 대해서만 이를 수행해야 할 때 유용합니다.



## 사용 예시 \{#example-usage\}

이 예시에서는 제품 판매 샘플 데이터셋을 사용하여 `argMaxIf`가 어떻게 동작하는지 설명합니다.
최소 10회 이상 판매된 제품 가운데, 가격이 가장 높은 제품 이름을 찾습니다.

```sql title="Query"
CREATE TABLE product_sales
(
    product_name String,
    price Decimal32(2),
    sales_count UInt32
) ENGINE = Memory;

INSERT INTO product_sales VALUES
    ('Laptop', 999.99, 10),
    ('Phone', 499.99, 15),
    ('Tablet', 299.99, 0),
    ('Watch', 1199.99, 5),
    ('Headphones', 79.99, 20);

SELECT argMaxIf(product_name, price, sales_count >= 10) AS most_expensive_popular_product
FROM product_sales;
```

`argMaxIf` FUNCTION은 최소 10번 이상 판매된(sales&#95;count &gt;= 10) 모든 상품 중에서
가장 높은 가격의 상품명을 반환합니다.
이 경우, 인기 있는 상품들 가운데 가격이 가장 높은(999.99) &#39;Laptop&#39;을 반환합니다.

```response title="Response"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```


## 함께 보기 \{#see-also\}
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
