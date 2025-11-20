---
'slug': '/examples/aggregate-function-combinators/sumArray'
'title': 'sumArray'
'description': 'sumArray 조합자를 사용하는 예제'
'keywords':
- 'sum'
- 'array'
- 'combinator'
- 'examples'
- 'sumArray'
'sidebar_label': 'sumArray'
'doc_type': 'reference'
---


# sumArray {#sumarray}

## Description {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 조합기는 
[`sum`](/sql-reference/aggregate-functions/reference/sum) 함수에 적용되어, 
`sumArray` 집계 조합기 함수를 사용하여 배열의 모든 요소의 합을 계산할 수 있습니다.

`sumArray` 함수는 데이터셋의 여러 배열에 걸쳐 모든 요소의 총합을 계산해야 할 때 유용합니다.

## Example usage {#example-usage}

이 예제에서는 다양한 제품 카테고리에 대한 일일 판매량 샘플 데이터셋을 사용하여 `sumArray`가 어떻게 작동하는지 설명합니다. 우리는 각 날의 모든 카테고리에 대한 총 판매량을 계산할 것입니다.

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

`sumArray` 함수는 각 `category_sales` 배열의 모든 요소를 더합니다. 예를 들어, `2024-01-01`에 `100 + 200 + 150 = 450`입니다. 이는 `arraySum`과 동일한 결과를 제공합니다.

## See also {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`arraySum`](/sql-reference/functions/array-functions#arraySum)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`sumMap`](/examples/aggregate-function-combinators/sumMap)
