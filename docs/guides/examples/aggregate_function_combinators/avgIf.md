---
slug: '/examples/aggregate-function-combinators/avgIf'
description: 'Example of using the avgIf combinator'
keywords: ['avg', 'if', 'combinator', 'examples', 'avgIf']
sidebar_label: 'avgIf'
---

# avgIf

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`avg`](/sql-reference/aggregate-functions/reference/avg) function to 
calculate the average only for rows that match the given condition using the 
`avgIf` function.

This is useful when you want to calculate conditional averages without having to
use a subquery or `CASE` statements.

## Example Usage

In this example we'll use the [UK price paid](/getting-started/example-datasets/uk-price-paid)
dataset and the `avgIf` aggregate combinator function to figure out what the 
average price is, of the ten most expensive districts in the UK.

```sql
WITH price_stats AS (
    SELECT
        district,
        avgIf(price, type = 'flat') AS avg_price_raw,
        formatReadableQuantity(avgIf(price, type = 'flat')) AS avg_flat_price
    FROM uk_price_paid
    WHERE date BETWEEN '2022-01-01' AND '2022-12-31'
    GROUP BY district
)
SELECT
    district,
    avg_flat_price
FROM price_stats
ORDER BY avg_price_raw DESC
LIMIT 10;
```