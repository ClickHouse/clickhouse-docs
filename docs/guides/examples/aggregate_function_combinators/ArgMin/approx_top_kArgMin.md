---
slug: '/examples/aggregate-function-combinators/ArgMin/approx_top_kArgMin'
description: 'Example of using the approx_top_kArgMin combinator'
keywords: ['approxtopk', 'argmin', 'combinator', 'examples', 'approx_top_kArgMin']
sidebar_label: 'approx_top_kArgMin'
---

# approx_top_kArgMin example

The [`ArgMin`](/sql-reference/aggregate-functions/combinators#-argmin) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return approximate top K values only for rows that have the minimum value for the specified expression using the `approx_top_kArgMin` function.

## Example Usage

```sql
SELECT approx_top_kArgMin(value, expr, k) FROM table;
``` 