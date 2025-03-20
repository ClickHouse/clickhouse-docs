---
slug: '/examples/aggregate-function-combinators/countIf'
description: 'Example of using the countIf combinator'
keywords: ['count', 'if', 'combinator', 'examples', 'countIf']
sidebar_label: 'countIf'
---

# countIf

## Description

The [`If`](/sql-reference/aggregate-functions/combinators#-if) combinator can be applied to the [`count`](/sql-reference/aggregate-functions/reference/count) function to count
only the rows that match the given condition using the `countIf` function.

This is useful when you want to count rows based on specific conditions without 
having to use a subquery or `CASE` statements.

## Example Usage

In this example we'll use the [UK price paid](/getting-started/example-datasets/uk-price-paid) 
dataset and the `countIf` aggregate combinator function to figure out what 
percentage of properties are detached properties versus flats for the top 10
largest cities in the UK.

```sql title="Query"
SELECT
    town,
    count(*) AS total_properties,
    round((countIf(type = 'detached') / count(*)) * 100, 2) AS detached_percentage,
    round((countIf(type = 'flat') / count(*)) * 100, 2) AS flat_percentage
FROM uk_price_paid
WHERE date >= '2023-01-01'
GROUP BY town
ORDER BY total_properties DESC
LIMIT 10
```

```response title="Response"
    ┌─town───────┬─total_properties─┬─detached_percentage─┬─flat_percentage─┐
 1. │ LONDON     │           103519 │                1.81 │           62.42 │
 2. │ MANCHESTER │            25210 │                8.01 │           22.21 │
 3. │ BRISTOL    │            23265 │               15.07 │           23.59 │
 4. │ BIRMINGHAM │            20934 │                7.66 │           17.64 │
 5. │ NOTTINGHAM │            20841 │               28.45 │            9.28 │
 6. │ LIVERPOOL  │            18845 │                9.17 │           20.04 │
 7. │ LEEDS      │            17496 │               13.92 │           14.71 │
 8. │ SHEFFIELD  │            15534 │               16.37 │            13.5 │
 9. │ LEICESTER  │            12340 │               25.41 │            8.15 │
10. │ NORWICH    │            11469 │               32.97 │           12.38 │
    └────────────┴──────────────────┴─────────────────────┴─────────────────┘
```