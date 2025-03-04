---
slug: '/examples/aggregate-function-combinators/Distinct/approx_top_kDistinct'
description: 'Example of using the approx_top_kDistinct combinator'
keywords: ['approxtopk', 'distinct', 'combinator', 'examples', 'approx_top_kDistinct']
sidebar_label: 'approx_top_kDistinct'
---

# approx_top_kDistinct example

The [`Distinct`](/sql-reference/aggregate-functions/combinators#-distinct) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return approximate top K values only for distinct values using the `approx_top_kDistinct` function.

## Example Usage

```sql
SELECT approx_top_kDistinct(value, k) FROM table;
``` 