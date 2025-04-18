---
slug: '/examples/aggregate-function-combinators/argMinIf'
description: 'Example of using the argMinIf combinator'
keywords: ['argMin', 'if', 'combinator', 'examples', 'argMinIf']
sidebar_label: 'argMinIf'
---

# argMinIf

## Description

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
function to find the value of the first argument that corresponds to the minimum
value of the second argument, only for rows that match the given condition, 
using the `argMinIf` aggregate combinator function.

The `argMinIf` function is useful when you need to find the value associated 
with the minimum value in a dataset, but only for rows that satisfy a specific 
condition.

## Example Usage

In this example, we'll use a sample dataset of product sales to demonstrate how 
`argMinIf` works. We'll find the product name that has the lowest price, but only
for products that have been sold at least once.

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

SELECT argMinIf(product_name, price, sales_count > 0) as cheapest_sold_product
FROM product_sales;
```

The `argMinIf` function will return the product name that has the lowest price 
among all products that have been sold (sales_count > 0). In this case, it will 
return 'Headphones' since it has the lowest price (79.99) among the sold products.

```response title="Response"
   ┌─cheapest_sold_product─┐
1. │ Headphones            │
   └───────────────────────┘
```

## See also
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if) 