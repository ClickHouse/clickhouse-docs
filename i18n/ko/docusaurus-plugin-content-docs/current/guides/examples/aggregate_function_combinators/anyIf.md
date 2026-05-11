---
slug: '/examples/aggregate-function-combinators/anyIf'
title: 'anyIf'
description: 'anyIf 조합자(combinator) 사용 예제'
keywords: ['any', 'if', 'combinator', 'examples', 'anyIf']
sidebar_label: 'anyIf'
doc_type: 'reference'
---



# anyIf \{#avgif\}



## 설명 \{#description\}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 결합자는 [`any`](/sql-reference/aggregate-functions/reference/any)
집계 함수에 적용하여 지정된 컬럼에서 주어진 조건을 만족하는 첫 번째 요소를 선택할 수 있습니다.



## 사용 예시 \{#example-usage\}

이 예제에서는 성공 플래그와 함께 판매 데이터를 저장하는 테이블을 생성하고,
`anyIf`를 사용하여 금액 200 이상과 200 미만인 경우의 첫 번째 `transaction_id`를 선택합니다.

먼저 테이블을 생성하고 데이터를 삽입합니다:

```sql title="Query"
CREATE TABLE sales(
    transaction_id UInt32,
    amount Decimal(10,2),
    is_successful UInt8
) 
ENGINE = MergeTree()
ORDER BY tuple();

INSERT INTO sales VALUES
    (1, 100.00, 1),
    (2, 150.00, 1),
    (3, 155.00, 0),
    (4, 300.00, 1),
    (5, 250.50, 0),
    (6, 175.25, 1);
```

```sql
SELECT
    anyIf(transaction_id, amount < 200) AS tid_lt_200,
    anyIf(transaction_id, amount > 200) AS tid_gt_200
FROM sales;
```

```response title="Response"
┌─tid_lt_200─┬─tid_gt_200─┐
│          1 │          4 │
└────────────┴────────────┘
```


## 함께 보기 \{#see-also\}
- [`any`](/sql-reference/aggregate-functions/reference/any)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
