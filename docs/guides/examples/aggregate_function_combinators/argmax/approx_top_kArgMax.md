---
slug: '/examples/aggregate-function-combinators/ArgMax/approx_top_kArgMax'
description: 'Example of using the approx_top_kArgMax combinator'
keywords: ['approxtopk', 'argmax', 'combinator', 'examples', 'approx_top_kArgMax']
sidebar_label: 'approx_top_kArgMax'
---

# approx_top_kArgMax example

The [`ArgMax`](/sql-reference/aggregate-functions/combinators#-argmax) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return approximate top K values only for rows that have the maximum value for the specified expression using the `approx_top_kArgMax` function.

## Example Usage

```sql
SELECT approx_top_kArgMax(value, expr, k) FROM table;
``` 