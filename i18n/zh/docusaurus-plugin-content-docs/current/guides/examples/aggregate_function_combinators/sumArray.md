---
'slug': '/examples/aggregate-function-combinators/sumArray'
'title': 'sumArray'
'description': '使用sumArray组合器的示例'
'keywords':
- 'sum'
- 'array'
- 'combinator'
- 'examples'
- 'sumArray'
'sidebar_label': 'sumArray'
---




# sumArray {#sumarray}

## 描述 {#description}

[`Array`](/sql-reference/aggregate-functions/combinators#-array) 组合器 
可以应用于 [`sum`](/sql-reference/aggregate-functions/reference/sum)
函数以计算数组中所有元素的总和，使用 `sumArray` 
聚合组合器函数。

当您需要计算数据集中多个数组中所有元素的总和时，`sumArray` 函数非常有用。

## 示例用法 {#example-usage}

在这个例子中，我们将使用一个关于不同产品类别的每日销售的示例数据集来演示 `sumArray` 的工作原理。我们将计算每一天所有类别的总销售额。

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
    sumArray(category_sales) as total_sales_sumArray,
    sum(arraySum(category_sales)) as total_sales_arraySum
FROM daily_category_sales
GROUP BY date, category_sales;
```

`sumArray` 函数将对每个 `category_sales` 数组中的所有元素进行求和。 
例如，在 `2024-01-01`，它计算 `100 + 200 + 150 = 450`。 这与 `arraySum` 得到的结果相同。

## 另请参见 {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`arraySum`](/sql-reference/functions/array-functions#arraysum)
- [`Array combinator`](/sql-reference/aggregate-functions/combinators#-array)
- [`sumMap`](/examples/aggregate-function-combinators/sumMap)
