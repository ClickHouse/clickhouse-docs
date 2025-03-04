---
slug: '/examples/aggregate-function-combinators/ArgMax/aggThrowArgMax'
description: 'Example of using the aggThrowArgMax combinator'
keywords: ['aggthrow', 'argmax', 'combinator', 'examples', 'aggThrowArgMax']
sidebar_label: aggThrowArgMax
---

# aggThrowArgMax example

The [`ArgMax`](/sql-reference/aggregate-functions/combinators#-argmax) combinator can be applied to the [`aggThrow`](/sql-reference/aggregate-functions/reference/aggthrow) function to throw an exception with the specified probability only for rows that have the maximum value for the specified expression using the `aggThrowArgMax` function.

## Example Usage

```sql
SELECT aggThrowArgMax(probability, value, expr) FROM table;
``` 