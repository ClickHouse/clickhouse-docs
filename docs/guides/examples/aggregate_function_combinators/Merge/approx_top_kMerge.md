---
slug: '/examples/aggregate-function-combinators/Merge/approx_top_kMerge'
description: 'Example of using the approx_top_kMerge combinator'
keywords: ['approxtopk', 'merge', 'combinator', 'examples', 'approx_top_kMerge']
sidebar_label: 'approx_top_kMerge'
---

# approx_top_kMerge example

The [`Merge`](/sql-reference/aggregate-functions/combinators#-merge) combinator can be applied to the [`approx_top_k`](/sql-reference/aggregate-functions/reference/approxtopk) function to combine intermediate states to get the final approximate top K values using the `approx_top_kMerge` function.

## Example Usage

```sql
SELECT approx_top_kMerge(state) FROM table;
``` 