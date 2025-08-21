---
slug: '/examples/aggregate-function-combinators/avgIf'
title: 'avgIf'
description: 'Example of using the avgIf combinator'
keywords: ['avg', 'if', 'combinator', 'examples', 'avgIf']
sidebar_label: 'avgIf'
doc_type: how-to
---

# avgIf {#avgif}

## Description {#description}

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`avg`](/sql-reference/aggregate-functions/reference/avg)
function to calculate the arithmetic mean of values for rows where the condition is true,
using the `avgIf` aggregate combinator function.

## Example usage {#example-usage}

In this example, we'll create a table that stores sales data with success flags,
and we'll use `avgIf` to calculate the average sale amount for successful transactions.

```sql title="Query"
CREATE TABLE sales(
    transaction_id UInt32,
    amount Decimal(10,2),
    is_successful UInt8
) ENGINE = Log;

INSERT INTO sales VALUES
    (1, 100.50, 1),
    (2, 200.75, 1),
    (3, 150.25, 0),
    (4, 300.00, 1),
    (5, 250.50, 0),
    (6, 175.25, 1);

SELECT
    avgIf(amount, is_successful = 1) AS avg_successful_sale
FROM sales;
```

The `avgIf` function will calculate the average amount only for rows where `is_successful = 1`.
In this case, it will average the amounts: 100.50, 200.75, 300.00, and 175.25.

```response title="Response"
   ┌─avg_successful_sale─┐
1. │              193.88 │
   └─────────────────────┘
```

## See also {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
