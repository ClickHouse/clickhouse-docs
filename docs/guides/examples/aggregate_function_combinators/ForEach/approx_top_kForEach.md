---
slug: '/examples/aggregate-function-combinators/ForEach/approx_top_kForEach'
description: 'Example of using the approx_top_kForEach combinator'
keywords: ['approxtopk', 'foreach', 'combinator', 'examples', 'approx_top_kForEach']
sidebar_label: 'approx_top_kForEach'
---

# approx_top_kForEach example

The [`ForEach`](/sql-reference/aggregate-functions/combinators#-foreach) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to return approximate top K values for corresponding elements in multiple arrays using the `approx_top_kForEach` function.

## Example Usage

```sql
SELECT approx_top_kForEach(array1, array2, k) FROM table;
``` 