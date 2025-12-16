---
slug: '/examples/aggregate-function-combinators/sumArray'
title: 'sumArray'
description: 'sumArray 组合器使用示例'
keywords: ['sum', 'array', 'combinator', 'examples', 'sumArray']
sidebar_label: 'sumArray'
doc_type: 'reference'
---

# sumArray {#sumarray}

## 描述 {#description}

可以将 [`Array`](/sql-reference/aggregate-functions/combinators#-array) 组合器
应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum)
函数，从而通过 `sumArray` 聚合组合器函数计算数组中所有元素的总和。

当需要计算数据集中多个数组中所有元素的总和时，`sumArray` 函数非常有用。

## 示例用法 {#example-usage}

在这个示例中，我们将使用一个包含不同产品类别每日销售额的示例数据集，来演示 `sumArray` 的工作原理。我们将计算每天所有类别的总销售额。

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

`sumArray` 函数会将每个 `category_sales` 数组中的所有元素相加。
例如，在 `2024-01-01` 这一天，它将 `100 + 200 + 150` 相加得到 `450`。这与使用 `arraySum`
得到的结果相同。

## 另请参阅 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`arraySum`](/sql-reference/functions/array-functions#arraySum)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`sumMap`](/examples/aggregate-function-combinators/sumMap)
