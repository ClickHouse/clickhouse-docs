---
slug: '/examples/aggregate-function-combinators/sumArray'
title: 'sumArray'
description: 'sumArray 결합자(combinator) 사용 예제'
keywords: ['sum', 'array', 'combinator', 'examples', 'sumArray']
sidebar_label: 'sumArray'
doc_type: 'reference'
---



# sumArray \{#sumarray\}



## 설명 \{#description\}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 조합자는 
`sumArray` 집계 조합자 함수를 사용하여 [`sum`](/sql-reference/aggregate-functions/reference/sum)
함수에 적용함으로써 배열의 모든 요소의 합을 계산할 수 있습니다.

`sumArray` 함수는 데이터셋에서 여러 배열에 포함된 모든 요소의 총합을 
계산해야 할 때 유용합니다.



## 사용 예시 \{#example-usage\}

이 예시에서는 서로 다른 상품 카테고리의 일별 매출 샘플 데이터셋을 사용하여 `sumArray`가 어떻게 동작하는지 보여줍니다. 각 일자별로 모든 카테고리의 총 매출을 계산합니다.

```sql title="Query"
CREATE TABLE daily_category_sales
(
    date Date,
    category_sales Array(UInt32)
) ENGINE = Memory;

INSERT INTO daily_category_sales VALUES
    ('2024-01-01', [100, 200, 150]),
    ('2024-01-02', [120, 180, 160]),
    ('2024-01-03', [90, 220, 140]);

SELECT 
    date,
    category_sales,
    sumArray(category_sales) AS total_sales_sumArray,
    sum(arraySum(category_sales)) AS total_sales_arraySum
FROM daily_category_sales
GROUP BY date, category_sales;
```

`sumArray` 함수는 각 `category_sales` 배열의 모든 요소를 합산합니다.
예를 들어 `2024-01-01`에는 `100 + 200 + 150 = 450`이 됩니다. 이는
`arraySum`과 동일한 결과를 제공합니다.


## 함께 보기 \{#see-also\}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`arraySum`](/sql-reference/functions/array-functions#arraySum)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`sumMap`](/examples/aggregate-function-combinators/sumMap)
