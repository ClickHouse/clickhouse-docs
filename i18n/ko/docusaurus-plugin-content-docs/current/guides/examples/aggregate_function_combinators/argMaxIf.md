---
'slug': '/examples/aggregate-function-combinators/argMaxIf'
'title': 'argMaxIf'
'description': 'argMaxIf 조합기를 사용하는 예시'
'keywords':
- 'argMax'
- 'if'
- 'combinator'
- 'examples'
- 'argMaxIf'
'sidebar_label': 'argMaxIf'
'doc_type': 'reference'
---


# argMaxIf {#argmaxif}

## 설명 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 조합자는 [`argMax`](/sql-reference/aggregate-functions/reference/argmax) 함수에 적용되어 조건이 참인 행에 대해 `val`의 최대값에 해당하는 `arg`의 값을 찾는 데 사용됩니다. 이를 위해 `argMaxIf` 집계 조합자 함수를 사용합니다.

`argMaxIf` 함수는 특정 조건을 만족하는 행에 대해서만 데이터 세트의 최대값과 연결된 값을 찾아야 할 때 유용합니다.

## 사용 예제 {#example-usage}

이번 예제에서는 제품 판매의 샘플 데이터 세트를 사용하여 `argMaxIf`가 어떻게 작동하는지 보여주겠습니다. 우리는 최소 10회 이상 판매된 제품 중에서 가장 높은 가격을 가진 제품 이름을 찾을 것입니다.

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

`argMaxIf` 함수는 최소 10회 이상 판매된 모든 제품 중에서 가장 높은 가격을 가진 제품 이름을 반환합니다 (sales_count >= 10). 이 경우, 가장 높은 가격(999.99)을 가진 인기 제품인 'Laptop'을 반환하게 됩니다.

```response title="Response"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```

## 추가 자료 {#see-also}
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If 조합자`](/sql-reference/aggregate-functions/combinators#-if)
