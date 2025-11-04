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
'doc_type': 'reference'
---


# argMaxIf {#argmaxif}

## 描述 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可以应用于 [`argMax`](/sql-reference/aggregate-functions/reference/argmax) 函数，以查找满足条件为真的行中，与 `val` 的最大值对应的 `arg` 值，使用 `argMaxIf` 聚合组合函数。

当需要查找与数据集中最大值相关的值，但仅限于满足特定条件的行时，`argMaxIf` 函数非常有用。

## 示例用法 {#example-usage}

在此示例中，我们将使用一个产品销售的示例数据集来演示 `argMaxIf` 的工作原理。我们将找到价格最高的产品名称，但仅限于销售次数至少为 10 次的产品。

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
    ('Watch', 1199.99, 5),
    ('Headphones', 79.99, 20);

SELECT argMaxIf(product_name, price, sales_count >= 10) AS most_expensive_popular_product
FROM product_sales;
```

`argMaxIf` 函数将返回销售次数至少为 10 次的所有产品中价格最高的产品名称（sales_count >= 10）。在这种情况下，它将返回 'Laptop'，因为在热门产品中它的价格最高（999.99）。

```response title="Response"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```

## 另请参见 {#see-also}
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If 组合器`](/sql-reference/aggregate-functions/combinators#-if)
