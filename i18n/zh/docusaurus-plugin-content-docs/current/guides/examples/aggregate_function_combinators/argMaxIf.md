---
slug: '/examples/aggregate-function-combinators/argMaxIf'
title: 'argMaxIf'
description: 'argMaxIf 组合器的使用示例'
keywords: ['argMax', 'if', 'combinator', 'examples', 'argMaxIf']
sidebar_label: 'argMaxIf'
doc_type: 'reference'
---



# argMaxIf {#argmaxif}


## 描述 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器可应用于 [`argMax`](/sql-reference/aggregate-functions/reference/argmax) 函数，通过 `argMaxIf` 聚合组合器函数，在满足条件的行中查找与 `val` 最大值对应的 `arg` 值。

当需要在数据集中查找与最大值关联的值，但仅限于满足特定条件的行时，`argMaxIf` 函数非常有用。


## 使用示例 {#example-usage}

在此示例中,我们将使用产品销售的示例数据集来演示 `argMaxIf` 的工作原理。我们将查找价格最高的产品名称,但仅限于销售次数至少达到 10 次的产品。

```sql title="查询"
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

`argMaxIf` 函数将返回所有销售次数至少达到 10 次(sales_count >= 10)的产品中价格最高的产品名称。在本例中,它将返回 'Laptop',因为它在热门产品中价格最高(999.99)。

```response title="响应"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```


## 另请参阅 {#see-also}

- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
