---
'slug': '/examples/aggregate-function-combinators/avgIf'
'title': 'avgIf'
'description': 'avgIf 조합기를 사용하는 예'
'keywords':
- 'avg'
- 'if'
- 'combinator'
- 'examples'
- 'avgIf'
'sidebar_label': 'avgIf'
'doc_type': 'reference'
---


# avgIf {#avgif}

## 설명 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 조합자는 [`avg`](/sql-reference/aggregate-functions/reference/avg) 함수에 적용되어 조건이 참인 행의 값에 대한 산술 평균을 계산할 수 있습니다. `avgIf` 집계 조합자 함수를 사용합니다.

## 사용 예시 {#example-usage}

이 예시에서는 성공 플래그가 있는 판매 데이터를 저장하는 테이블을 생성하고, 성공적인 거래의 평균 판매 금액을 계산하기 위해 `avgIf`를 사용합니다.

```sql title="Query"
CREATE TABLE sales(
    transaction_id UInt32,
    amount Decimal(10,2),
    is_successful UInt8
) ENGINE = Log;

INSERT INTO sales VALUES
    (1, 100.50, 1),
    (2, 200.75, 1),
    (3, 150.25, 0),
    (4, 300.00, 1),
    (5, 250.50, 0),
    (6, 175.25, 1);

SELECT
    avgIf(amount, is_successful = 1) AS avg_successful_sale
FROM sales;
```

`avgIf` 함수는 `is_successful = 1`인 행에 대해서만 평균 금액을 계산합니다. 이 경우, 금액들은 100.50, 200.75, 300.00 및 175.25의 평균을 구합니다.

```response title="Response"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```

## 참조 {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If 조합자`](/sql-reference/aggregate-functions/combinators#-if)
