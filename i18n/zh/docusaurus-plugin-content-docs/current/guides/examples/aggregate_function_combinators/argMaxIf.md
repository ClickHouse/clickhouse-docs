---
slug: '/examples/aggregate-function-combinators/argMaxIf'
title: 'argMaxIf'
description: '使用 argMaxIf 聚合函数组合器的示例'
keywords: ['argMax', 'if', 'combinator', '示例', 'argMaxIf']
sidebar_label: 'argMaxIf'
doc_type: 'reference'
---

# argMaxIf {#argmaxif}

## 描述 {#description}

可以将 [`If`](/sql-reference/aggregate-functions/combinators#-if) 组合器应用于 [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
函数，从而在条件为真的行中，找到对应于 `val` 最大值的 `arg` 值，
这可以通过使用 `argMaxIf` 聚合组合器函数来实现。

当需要在数据集中查找与最大值关联的值，但只针对满足特定
条件的行时，`argMaxIf` 函数非常有用。

## 使用示例 {#example-usage}

在本示例中，我们将使用一个产品销售示例数据集来演示 `argMaxIf` 的工作方式。我们将查找价格最高的产品名称，但仅限于销售次数至少为 10 次的产品。

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

`argMaxIf` 函数会在所有销量至少为 10 次（sales&#95;count &gt;= 10）的商品中，
返回价格最高的产品名称。
在这个例子中，它将返回 &#39;Laptop&#39;，因为在这些热门商品中，它的价格最高（999.99）。

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
