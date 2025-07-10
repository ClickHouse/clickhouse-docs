---
slug: '/examples/aggregate-function-combinators/argMinIf'
title: 'argMinIf'
description: 'Example of using the argMinIf combinator'
keywords: ['argMin', 'if', 'combinator', 'examples', 'argMinIf']
sidebar_label: 'argMinIf'
---

# argMinIf {#argminif}

## Description {#description}

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
function to find the value of `arg` that corresponds to the minimum value of `val` for rows where the condition is true,
using the `argMinIf` aggregate combinator function.

The `argMinIf` function is useful when you need to find the value associated 
with the minimum value in a dataset, but only for rows that satisfy a specific 
condition.

## Example Usage {#example-usage}

In this example, we'll create a table that stores product prices and their timestamps,
and we'll use `argMinIf` to find the lowest price for each product when it's in stock.

```sql title="Query"
CREATE TABLE product_prices(
    product_id UInt32,
    price Decimal(10,2),
    timestamp DateTime,
    in_stock UInt8
) ENGINE = Log;

INSERT INTO product_prices VALUES
    (1, 10.99, '2024-01-01 10:00:00', 1),
    (1, 9.99, '2024-01-01 10:05:00', 1),
    (1, 11.99, '2024-01-01 10:10:00', 0),
    (2, 20.99, '2024-01-01 11:00:00', 1),
    (2, 19.99, '2024-01-01 11:05:00', 1),
    (2, 21.99, '2024-01-01 11:10:00', 1);

SELECT
    product_id,
    argMinIf(price, timestamp, in_stock = 1) AS lowest_price_when_in_stock
FROM product_prices
GROUP BY product_id;
```

The `argMinIf` function will find the price that corresponds to the earliest timestamp for each product,
but only considering rows where `in_stock = 1`. For example:
- Product 1: Among in-stock rows, 10.99 has the earliest timestamp (10:00:00)
- Product 2: Among in-stock rows, 20.99 has the earliest timestamp (11:00:00)

```response title="Response"
   ┌─product_id─┬─lowest_price_when_in_stock─┐
1. │          1 │                      10.99 │
2. │          2 │                      20.99 │
   └────────────┴────────────────────────────┘
```

## See also {#see-also}
- [`argMin`](/sql-reference/aggregate-functions/reference/argmin)
- [`argMax`](/sql-reference/aggregate-functions/reference/argmax)
- [`argMaxIf`](/examples/aggregate-function-combinators/argMaxIf)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
