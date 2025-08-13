---
slug: '/examples/aggregate-function-combinators/argMaxIf'
title: 'argMaxIf'
description: 'Example of using the argMaxIf combinator'
keywords: ['argMax', 'if', 'combinator', 'examples', 'argMaxIf']
sidebar_label: 'argMaxIf'
doc_type: 'reference'
---

# argMaxIf {#argmaxif}

## Description {#description}

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
function to find the value of `arg` that corresponds to the maximum value of `val` for rows where the condition is true,
using the `argMaxIf` aggregate combinator function.

The `argMaxIf` function is useful when you need to find the value associated with
the maximum value in a dataset, but only for rows that satisfy a specific 
condition.

## Example usage {#example-usage}

In this example, we'll use a sample dataset of product sales to demonstrate how 
`argMaxIf` works. We'll find the product name that has the highest price, but 
only for products that have been sold at least 10 times.

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

The `argMaxIf` function will return the product name that has the highest price 
among all products that have been sold at least 10 times (sales_count >= 10). 
In this case, it will return 'Laptop' since it has the highest price (999.99) 
among the popular products.

```response title="Response"
   ┌─most_expensi⋯lar_product─┐
1. │ Laptop                   │
   └──────────────────────────┘
```

## See also {#see-also}
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMinIf`](/examples/aggregate-function-combinators/argMinIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
