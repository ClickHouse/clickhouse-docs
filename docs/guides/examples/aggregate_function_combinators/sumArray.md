---
slug: '/examples/aggregate-function-combinators/sumArray'
title: 'sumArray'
description: 'Example of using the sumArray combinator'
keywords: ['sum', 'array', 'combinator', 'examples', 'sumArray']
sidebar_label: 'sumArray'
doc_type: 'reference'
---

# sumArray {#sumarray}

## Description {#description}

The [`Array`](/sql-reference/aggregate-functions/combinators#-array) combinator 
can be applied to the [`sum`](/sql-reference/aggregate-functions/reference/sum)
function to calculate the sum of all elements in an array, using the `sumArray` 
aggregate combinator function.

The `sumArray` function is useful when you need to calculate the total sum of 
all elements across multiple arrays in a dataset.

## Example usage {#example-usage}

In this example, we'll use a sample dataset of daily sales across different 
product categories to demonstrate how `sumArray` works. We'll calculate the total
sales across all categories for each day.

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

The `sumArray` function will sum up all elements in each `category_sales` array. 
For example, on `2024-01-01`, it sums `100 + 200 + 150 = 450`. This gives the 
same result as `arraySum`.

## See also {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`arraySum`](/sql-reference/functions/array-functions#arraySum)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`sumMap`](/examples/aggregate-function-combinators/sumMap)
