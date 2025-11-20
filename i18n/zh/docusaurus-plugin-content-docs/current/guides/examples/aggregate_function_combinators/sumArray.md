---
slug: '/examples/aggregate-function-combinators/sumArray'
title: 'sumArray'
description: 'sumArray 组合器的使用示例'
keywords: ['sum', 'array', 'combinator', 'examples', 'sumArray']
sidebar_label: 'sumArray'
doc_type: 'reference'
---



# sumArray {#sumarray}


## 描述 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 组合器可应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum) 函数，使用 `sumArray` 聚合组合器函数计算数组中所有元素的总和。

当需要计算数据集中多个数组所有元素的总和时，`sumArray` 函数非常有用。


## 使用示例 {#example-usage}

在本示例中,我们将使用一个包含不同产品类别每日销售数据的样本数据集来演示 `sumArray` 的工作原理。我们将计算每天所有类别的销售总额。

```sql title="查询"
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

`sumArray` 函数会对每个 `category_sales` 数组中的所有元素求和。例如,在 `2024-01-01` 这一天,它计算 `100 + 200 + 150 = 450`。这与 `arraySum` 的结果相同。


## 另请参阅 {#see-also}

- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`arraySum`](/sql-reference/functions/array-functions#arraySum)
- [`Array 组合器`](/sql-reference/aggregate-functions/combinators#-array)
- [`sumMap`](/examples/aggregate-function-combinators/sumMap)
