---
'slug': '/examples/aggregate-function-combinators/argMinIf'
'title': 'argMinIf'
'description': 'argMinIf 조합기를 사용하는 예제'
'keywords':
- 'argMin'
- 'if'
- 'combinator'
- 'examples'
- 'argMinIf'
'sidebar_label': 'argMinIf'
'doc_type': 'reference'
---


# argMinIf {#argminif}

## 설명 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 조합기는 [`argMin`](/sql-reference/aggregate-functions/reference/argmin) 함수에 적용되어, 조건이 참인 행에서 `val`의 최소값에 해당하는 `arg` 값을 찾기 위해 `argMinIf` 집계 조합기 함수를 사용합니다.

`argMinIf` 함수는 특정 조건을 만족하는 행에 대해 데이터 집합에서 최소값에 연관된 값을 찾아야 할 때 유용합니다.

## 예제 사용법 {#example-usage}

이 예제에서는 제품 가격과 해당 타임스탬프를 저장하는 테이블을 생성하고, 재고가 있는 각 제품에 대해 최저 가격을 찾기 위해 `argMinIf`를 사용할 것입니다.

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

`argMinIf` 함수는 각 제품에 대해 가장 이른 타임스탬프에 해당하는 가격을 찾으나, `in_stock = 1`인 행만 고려합니다. 예를 들어:
- 제품 1: 재고가 있는 행 중에서 10.99가 가장 이른 타임스탬프(10:00:00)를 가집니다.
- 제품 2: 재고가 있는 행 중에서 20.99가 가장 이른 타임스탬프(11:00:00)를 가집니다.

```response title="Response"
   ┌─product_id─┬─lowest_price_when_in_stock─┐
1. │          1 │                      10.99 │
2. │          2 │                      20.99 │
   └────────────┴────────────────────────────┘
```

## 참조 {#see-also}
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`If 조합기`](/sql-reference/aggregate-functions/combinators#-if)
