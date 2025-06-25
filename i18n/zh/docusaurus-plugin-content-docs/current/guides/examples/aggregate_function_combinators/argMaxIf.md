---
'slug': '/examples/aggregate-function-combinators/argMaxIf'
'title': 'argMaxIf'
'description': '使用 argMaxIf 组合器的示例'
'keywords':
- 'argMax'
- 'if'
- 'combinator'
- 'examples'
- 'argMaxIf'
'sidebar_label': 'argMaxIf'
---


# argMaxIf {#argmaxif}

## 描述 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`argMax`](/sql-reference/aggregate-functions/reference/argmax) 函数，以查找与 `val` 的最大值对应的 `arg` 值，仅针对满足条件的行，使用 `argMaxIf` 聚合组合器函数。

当您需要找到数据集中与最大值关联的值时，`argMaxIf` 函数非常有用，但仅适用于满足特定条件的行。

## 示例用法 {#example-usage}

在这个示例中，我们将使用产品销售的示例数据集来演示 `argMaxIf` 的工作原理。我们将找到价格最高的产品名称，但仅针对售出至少 10 次的产品。

```sql title="Query"
CREATE TABLE product_sales
(
    product_name String,
    price Decimal32(2),
    sales_count UInt32
) ENGINE = Memory;

INSERT INTO product_sales VALUES
    ('Laptop', 999.99, 10),
    ('Phone', 499.99, 15),
    ('Tablet', 299.99, 0),
    ('Watch', 199.99, 5),
    ('Headphones', 79.99, 20);

SELECT argMaxIf(product_name, price, sales_count >= 10) as most_expensive_popular_product
FROM product_sales;
```

`argMaxIf` 函数将返回所有售出至少 10 次的产品中价格最高的产品名称 (sales_count >= 10)。在这种情况下，它将返回 'Laptop'，因为它在热门产品中具有最高价格 (999.99)。

```response title="Response"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```

## 另请参阅 {#see-also}
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If 组合器`](/sql-reference/aggregate-functions/combinators#-if)
