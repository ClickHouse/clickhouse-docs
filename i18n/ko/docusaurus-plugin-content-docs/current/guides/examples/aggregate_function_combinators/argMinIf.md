---
slug: '/examples/aggregate-function-combinators/argMinIf'
title: 'argMinIf'
description: 'argMinIf 결합자(combinator) 사용 예제'
keywords: ['argMin', 'if', 'combinator', 'examples', 'argMinIf']
sidebar_label: 'argMinIf'
doc_type: 'reference'
---



# argMinIf \{#argminif\}



## 설명 \{#description\}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 결합자를 [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
함수에 적용하면, `argMinIf` 집계 결합자 함수를 사용해 조건이 참인 행에서
`val`의 최소값에 대응하는 `arg` 값을 찾을 수 있습니다.

`argMinIf` 함수는 데이터셋에서 최소값과 연관된 값을 찾아야 하지만,
특정 조건을 만족하는 행에만 이 작업을 수행해야 할 때 유용합니다.



## 예시 사용법 \{#example-usage\}

이 예시에서는 상품 가격과 해당 시점의 타임스탬프를 저장하는 테이블을 CREATE한 다음,
`argMinIf`를 사용하여 각 상품이 재고가 있을 때의 최저 가격을 찾습니다.

```sql title="Query"
CREATE TABLE product_prices(
    product_id UInt32,
    price Decimal(10,2),
    timestamp DateTime,
    in_stock UInt8
) ENGINE = Log;

INSERT INTO product_prices VALUES
    (1, 10.99, '2024-01-01 10:00:00', 1),
    (1, 9.99, '2024-01-01 10:05:00', 1),
    (1, 11.99, '2024-01-01 10:10:00', 0),
    (2, 20.99, '2024-01-01 11:00:00', 1),
    (2, 19.99, '2024-01-01 11:05:00', 1),
    (2, 21.99, '2024-01-01 11:10:00', 1);

SELECT
    product_id,
    argMinIf(price, timestamp, in_stock = 1) AS lowest_price_when_in_stock
FROM product_prices
GROUP BY product_id;
```

`argMinIf` 함수는 각 product에 대해 가장 이른 timestamp에 대응하는 price를 찾되,
`in_stock = 1`인 행만 고려합니다. 예시는 다음과 같습니다.

* Product 1: 재고가 있는 행 중에서 10.99가 가장 이른 timestamp(10:00:00)에 해당합니다.
* Product 2: 재고가 있는 행 중에서 20.99가 가장 이른 timestamp(11:00:00)에 해당합니다.

```response title="Response"
   ┌─product_id─┬─lowest_price_when_in_stock─┐
1. │          1 │                      10.99 │
2. │          2 │                      20.99 │
   └────────────┴────────────────────────────┘
```


## 참고 \{#see-also\}
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
